import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async () => {
  const gameId = uuidv4();
  const targetX = Math.floor(Math.random() * 50);
  const targetY = Math.floor(Math.random() * 20);

  const tableName = process.env.GAME_TABLE_NAME;

  console.log("Writing to table:", tableName);

  const command = new PutItemCommand({
    TableName: tableName,
    Item: {
      gameId: { S: gameId },
      targetX: { N: targetX.toString() },
      targetY: { N: targetY.toString() },
      phase: { S: "waiting_for_clue" }
    }
  });

  try {
    await client.send(command);
    console.log("✅ Game stored");
  } catch (err) {
    console.error("❌ DynamoDB write failed:", err);
  }

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      gameId,
      targetSquare: { x: targetX, y: targetY }
    })
  };
};