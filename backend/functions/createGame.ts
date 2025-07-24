import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

export const handler: APIGatewayProxyHandler = async (event) => {
  const gameId = uuidv4();
  const targetX = Math.floor(Math.random() * 50);
  const targetY = Math.floor(Math.random() * 20);

  // persist to DynamoDB (not implemented here)

  return {
    statusCode: 200,
    body: JSON.stringify({
      gameId,
      targetSquare: { x: targetX, y: targetY },
    }),
  };
};
