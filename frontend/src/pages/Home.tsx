import { useEffect, useState } from "react";
import { createGame } from "../api/createGame";
import type { GameResponse } from "../api/createGame";
import { Grid } from "../components/Grid";

export function Home() {
  const [game, setGame] = useState<GameResponse | null>(null);

  useEffect(() => {
    createGame().then(setGame).catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎨 HueKnew</h1>

      {game ? (
        <>
          <p>Game ID: <code>{game.gameId}</code></p>
          <p>Target Square: X={game.targetSquare.x}, Y={game.targetSquare.y}</p>
          <div className="mt-4">
            <Grid targetX={game.targetSquare.x} targetY={game.targetSquare.y} />
          </div>
        </>
      ) : (
        <p>Loading game...</p>
      )}
    </div>
  );
}
