export function generateColorHslStringGrid(rows: number, cols: number): string[][] {
  const grid: string[][] = [];

  for (let y = 0; y < rows; y++) {
    const lightness = 80 - (y / rows) * 40; // from 90% (top) to 30% (bottom)
    const row: string[] = [];

    for (let x = 0; x < cols; x++) {
      const baseHue = Math.floor(360 * x / cols);
      row.push(`hsl(${baseHue}, 100%, ${lightness}%)`);
    }

    grid.push(row);
  }

  return grid;
}