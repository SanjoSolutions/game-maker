export function calculateNumberOfColumns(
  width: number,
  tileWidth: number,
): number {
  return Math.floor(width / tileWidth)
}
