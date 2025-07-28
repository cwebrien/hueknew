import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { randomBytes } from "crypto";


const client = new DynamoDBClient({});
const tableName = process.env.GAME_TABLE_NAME;

export const handler: APIGatewayProxyHandler = async (event) => {
    const gameId = event.pathParameters?.gameId;
    const body = event.body ? JSON.parse(event.body) : null;

    if (!gameId || !body?.name) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Missing gameId or player name" }),
        };
    }

    const playerId = randomBytes(4).toString("hex");

    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: { gameId: { S: gameId } },
        UpdateExpression: "SET players.#pid = :player",
        ExpressionAttributeNames: {
            "#pid": playerId,
        },
        ExpressionAttributeValues: {
            ":player": {
                M: {
                    name: { S: body.name },
                    score: { N: "0" },
                },
            },
        },
    });

    console.log("JOIN LAMBDA INVOKED");
    console.log("Player ID:", playerId);
    console.log("Command:", JSON.stringify(command));    


    try {
        await client.send(command);
        console.log(`✅ Added player ${body.name} with ID ${playerId} to game ${gameId}`);
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ playerId }),
        };
    } catch (err) {
        console.error("❌ DynamoDB error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to join game" }),
        };
    }
};