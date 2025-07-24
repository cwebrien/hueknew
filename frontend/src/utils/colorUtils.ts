export function generateColorGrid(rows: number, cols: number): string[][] {
  const grid: string[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    for (let x = 0; x < cols; x++) {
      const r = Math.round(255 * (1 - x / cols));
      const b = Math.round(255 * (x / cols));
      const g = Math.round(255 * (1 - y / rows) * 0.6);
      row.push(`rgb(${r}, ${g}, ${b})`);
    }
    grid.push(row);
  }
  return grid;
}
