import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const tableName = process.env.GAME_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
    const gameId = event.pathParameters?.gameId;
    const body = event.body ? JSON.parse(event.body) : null;

    if (!gameId || (!body?.hint1 && !body?.hint2)) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Missing gameId and clue (hint1 or hint2)" }),
        };
    }

    const updateExpressions = [];
    const attributeValues: Record<string, any> = {};

    function countWords(str: string): number {
        return str.trim().split(/\s+/).length;
    }

    if (body.hint1) {
        if (countWords(body.hint1) !== 1) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "hint1 must be exactly 1 word" }),
            };
        }
        updateExpressions.push("hint1 = :hint1");
        attributeValues[":hint1"] = { S: body.hint1 };
        attributeValues[":phase"] = { S: "waiting_for_guesses" };
    }

    if (body.hint2) {
        if (countWords(body.hint2) !== 2) {
            return {
                statusCode: 400,
                headers: { "Access-Control-Allow-Origin": "*" },
                body: JSON.stringify({ error: "hint2 must be exactly 2 words" }),
            };
        }
        updateExpressions.push("hint2 = :hint2");
        attributeValues[":hint2"] = { S: body.hint2 };
        attributeValues[":phase"] = { S: "waiting_for_second_guesses" };
    }

    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: { gameId: { S: gameId } },
        UpdateExpression: `SET ${updateExpressions.join(", ")}, phase = :phase`,
        ExpressionAttributeValues: attributeValues,
    });

    try {
        await client.send(command);
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "clue accepted" }),
        };
    } catch (err) {
        console.error("❌ DynamoDB update failed:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to update game" }),
        };
    }
};