import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});
const tableName = process.env.GAME_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
    const gameId = event.pathParameters?.gameId;
    const body = event.body ? JSON.parse(event.body) : null;

    if (!gameId || !body?.playerId || body.x === undefined || body.y === undefined) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Missing gameId, playerId, x, or y" }),
        };
    }

    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: { gameId: { S: gameId } },
        UpdateExpression: "SET players.#pid.guess2 = :guess",
        ExpressionAttributeNames: {
            "#pid": body.playerId,
        },
        ExpressionAttributeValues: {
            ":guess": {
                M: {
                    x: { N: body.x.toString() },
                    y: { N: body.y.toString() }
                }
            }
        }
    });

    try {
        await client.send(command);
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "second guess accepted" }),
        };
    } catch (err) {
        console.error("❌ Guess error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to submit guess" }),
        };
    }
};
