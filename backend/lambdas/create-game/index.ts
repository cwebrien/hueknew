import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomBytes } from "crypto";

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async () => {
  const gameId = randomBytes(4).toString("hex");
  const leaderId = randomBytes(4).toString("hex");

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
      phase: { S: "waiting_for_clue" },
      leaderId: { S: leaderId },
      leaderIndex: { N: "0" },
      players: {
        M: {
          [leaderId]: {
            M: {
              name: { S: "Leader" },   // You can later prompt for this
              score: { N: "0" }
            }
          }
        }
      }
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
      leaderId,
      targetSquare: { x: targetX, y: targetY }
    })
  };
};