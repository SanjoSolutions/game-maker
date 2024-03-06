import type { App } from "../App.js"
import type { CellPosition } from "@sanjo/game-engine/TileMap/CellPosition.js"
import type { Tile } from "@sanjo/game-engine/TileMap/Tile.js"

export function expectTileAt(
  app: App,
  position: CellPosition,
  tile: Tile,
): void {
  expect(app.currentLevelTileLayer.retrieveTile(position)).toEqual(tile)
}
