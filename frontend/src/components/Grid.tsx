import { generateColorGrid } from '../utils/colorUtils';

export function Grid() {
  const grid = generateColorGrid(20, 50);
  return (
    <div className="grid grid-cols-50 gap-[1px]">
      {grid.flat().map((color, idx) => (
        <div
          key={idx}
          className="w-4 h-4"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}
