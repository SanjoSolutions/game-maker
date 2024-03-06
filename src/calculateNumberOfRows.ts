export function calculateNumberOfRows(
  height: number,
  tileHeight: number,
): number {
  return Math.floor(height / tileHeight)
}
