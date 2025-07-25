import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

export const handler: APIGatewayProxyHandler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      gameId: uuidv4(),
      targetSquare: { x: 10, y: 7 },
    }),
  };
};
