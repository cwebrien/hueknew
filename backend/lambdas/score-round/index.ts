import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { randomInt } from "crypto";

const client = new DynamoDBClient({});
const tableName = process.env.GAME_TABLE_NAME;

function scoreGuess(targetX: number, targetY: number, guess: { x: number, y: number }): number {
    if (guess.x === targetX && guess.y === targetY) return 3;
    if ((Math.abs(guess.x - targetX) === 1 && guess.y === targetY) ||
        (Math.abs(guess.y - targetY) === 1 && guess.x === targetX)) return 2;
    if (Math.abs(guess.x - targetX) === 1 && Math.abs(guess.y - targetY) === 1) return 1;
    return 0;
}

export const handler: APIGatewayProxyHandler = async (event) => {
    const gameId = event.pathParameters?.gameId;
    if (!gameId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing gameId" })
        };
    }

    try {
        const result = await client.send(new GetItemCommand({
            TableName: tableName,
            Key: { gameId: { S: gameId } }
        }));

        if (!result.Item) {
            return { statusCode: 404, body: JSON.stringify({ error: "Game not found" }) };
        }

        const game = result.Item;
        const targetX = parseInt(game.targetX.N!);
        const targetY = parseInt(game.targetY.N!);
        const leaderId = game.leaderId.S!;
        const leaderIndex = parseInt(game.leaderIndex.N!);
        const players = game.players.M!;

        let totalPoints = 0;
        const updatedScores: Record<string, number> = {};

        for (const [pid, pdata] of Object.entries(players)) {
            const player = pdata.M!;
            if (pid === leaderId) continue;

            const guess2 = player.guess2?.M;
            if (!guess2) continue;

            const guessX = parseInt(guess2.x.N!);
            const guessY = parseInt(guess2.y.N!);
            const score = scoreGuess(targetX, targetY, { x: guessX, y: guessY });

            const currentScore = parseInt(player.score.N!);
            updatedScores[pid] = currentScore + score;
            totalPoints += score;
        }

        const currentLeaderScore = parseInt(players[leaderId].M!.score.N!);
        updatedScores[leaderId] = currentLeaderScore + totalPoints;

        const playerIds = Object.keys(players);
        const nextLeaderIndex = (leaderIndex + 1) % playerIds.length;
        const nextLeaderId = playerIds[nextLeaderIndex];

        const newTargetX = randomInt(0, 50);
        const newTargetY = randomInt(0, 20);

        const setExpressions: string[] = [
            "phase = :phase",
            "leaderId = :nextLeaderId",
            "leaderIndex = :nextLeaderIndex",
            "targetX = :targetX",
            "targetY = :targetY"
        ];
        const removeExpressions: string[] = [];

        // Update state by moving to next leader and next round
        const attributeValues: any = {
            ":phase": { S: "waiting_for_clue" },
            ":nextLeaderId": { S: nextLeaderId },
            ":nextLeaderIndex": { N: nextLeaderIndex.toString() },
            ":targetX": { N: newTargetX.toString() },
            ":targetY": { N: newTargetY.toString() }
        };

        // Update score and remove stale guesses
        for (const [pid, newScore] of Object.entries(updatedScores)) {
            setExpressions.push(`players.#${pid}.score = :score_${pid}`);
            attributeValues[`:score_${pid}`] = { N: newScore.toString() };

            removeExpressions.push(`players.#${pid}.guess1`);
            removeExpressions.push(`players.#${pid}.guess2`);
        }

        // Remove stale hints
        removeExpressions.push("hint1");
        removeExpressions.push("hint2");

        const expressionNames = Object.fromEntries(
            Object.keys(players).map(pid => [`#${pid}`, pid])
        );

        const updateParts = [`SET ${setExpressions.join(", ")}`];
        if (removeExpressions.length > 0) {
            updateParts.push(`REMOVE ${removeExpressions.join(", ")}`);
        }
        const updateExpression = updateParts.join(" ");

        await client.send(new UpdateItemCommand({
            TableName: tableName,
            Key: { gameId: { S: gameId } },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionNames,
            ExpressionAttributeValues: attributeValues
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
                message: "Round scored",
                totalPoints,
                newLeaderId: nextLeaderId,
                newTargetSquare: { x: newTargetX, y: newTargetY }
            })
        };
    } catch (err) {
        console.error("❌ Score error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to score round" })
        };
    }
};