const API_BASE_URL = "https://rl191sob9k.execute-api.us-east-1.amazonaws.com/prod/";

export type GameResponse = {
  gameId: string;
  targetSquare: { x: number; y: number };
};

export async function createGame(): Promise<GameResponse> {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error(`Failed to create game: ${res.status}`);
  return await res.json();
}
