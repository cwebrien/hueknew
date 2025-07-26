import { generateColorHslStringGrid } from "../utils/colorUtils";

interface GridProps {
  targetX: number;
  targetY: number;
}

export function Grid({ targetX, targetY }: GridProps) {
  const rows = 20;
  const cols = 50;
  const grid = generateColorHslStringGrid(rows, cols);

  return (
    <div className="grid" style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "1px" }}>
      {grid.flatMap((row, y) =>
        row.map((color, x) => {
          const isTarget = x === targetX && y === targetY;
          return (
            <div
              key={`${x}-${y}`}
              style={{
                width: 12,
                height: 12,
                backgroundColor: color,
                border: isTarget ? "2px solid black" : "1px solid #ccc",
              }}
              title={`x=${x}, y=${y}`}
            />
          );
        })
      )}
    </div>
  );
}
