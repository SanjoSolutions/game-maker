import { BehaviorSubject } from "rxjs"
import type { Area } from "./Area.js"
import { calculateNumberOfColumns } from "./calculateNumberOfColumns.js"
import { calculateNumberOfRows } from "./calculateNumberOfRows.js"
import type { CellArea } from "./CellArea.js"
import type { CellPosition } from "@sanjo/game-engine/TileMap/CellPosition.js"
import { findIndexOfClosestNumber } from "./findIndexOfClosestNumber.js"
import type { Level } from "./Level.js"
import { TileLayer } from "@sanjo/game-engine/TileMap/TileLayer.js"
import type { TileMap } from "@sanjo/game-engine/TileMap/TileMap.js"
import { createTileMapNullObject } from "@sanjo/game-engine/TileMap/TileMap.js"
import { Entity } from "@sanjo/game-engine/TileMap/Entity.js"
import { Tool } from "./Tool.js"

const scales = [
  0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4,
  5,
]

const DEFAULT_SCALE = 1

export class App {
  activeTool = new BehaviorSubject<Tool | null>(null)
  _level = new BehaviorSubject<Level>(0)
  selectedTileSetTiles = new BehaviorSubject<Area | null>(null)
  tileMap = new BehaviorSubject<TileMap>(createTileMapNullObject())
  isDragModeEnabled = new BehaviorSubject<boolean>(false)
  selectedTileSet = new BehaviorSubject<number>(0)
  backups: TileMap[] = []
  scale = new BehaviorSubject<number>(DEFAULT_SCALE)
  previewTiles = new BehaviorSubject<CellArea | null>(null)
  selectedEntity = new BehaviorSubject<Entity | null>(null)

  set level(level: Level) {
    if (level >= 0) {
      this._level.next(level)
      this.ensureTileLayer()
    } else {
      throw new Error("Only levels greater than or equal to 0 are supported.")
    }
  }

  get level(): BehaviorSubject<Level> {
    return this._level
  }

  get currentLevelTileLayer() {
    this.ensureTileLayer()
    return this.tileMap.value.tiles[this._level.value]
  }

  incrementLevel() {
    this.level = this._level.value + 1
  }

  decrementLevel() {
    if (this._level.value > 0) {
      this.level = this._level.value - 1
    }
  }

  selectPenTool(): void {
    this.activeTool.next(Tool.Pen)
  }
  selectTileSetTile(row: number, column: number) {
    this.selectedTileSetTiles.next({
      x: column * this.tileMap.value.tileSize.width,
      y: row * this.tileMap.value.tileSize.height,
      width: this.tileMap.value.tileSize.width,
      height: this.tileMap.value.tileSize.height,
    })
  }
  useToolAt(row: number, column: number) {
    const tool = this.activeTool.value
    if (tool === Tool.Pen) {
      this.usePenToolAt({ row, column })
    }
  }

  backUpMap(): void {
    this.backups.push(this.tileMap.value.copy())
  }

  undo(): TileMap | null {
    const lastBackup = this.backups.pop()
    if (lastBackup) {
      this.tileMap.next(lastBackup)
    }
    return lastBackup ?? null
  }

  zoomOut(): void {
    const index = findIndexOfClosestNumber(scales, this.scale.value)
    this.scale.next(scales[Math.max(index - 1, 0)])
  }

  zoomIn(): void {
    const index = findIndexOfClosestNumber(scales, this.scale.value)
    this.scale.next(scales[Math.min(index + 1, scales.length - 1)])
  }

  resetZoom(): void {
    this.scale.next(DEFAULT_SCALE)
  }

  private usePenToolAt(position: CellPosition): void {
    if (this.selectedTileSetTiles.value) {
      this.backUpMap()

      const baseRow = position.row
      const baseColumn = position.column

      const numberOfSelectedRowsInTileSet = Number(
        calculateNumberOfRows(
          this.selectedTileSetTiles.value.height,
          this.tileMap.value.tileSize.height,
        ),
      )
      const numberOfSelectedColumnsInTileSet = Number(
        calculateNumberOfColumns(
          this.selectedTileSetTiles.value.width,
          this.tileMap.value.tileSize.width,
        ),
      )

      let somethingHasChanged = false
      for (
        let rowOffset = 0;
        rowOffset < numberOfSelectedRowsInTileSet;
        rowOffset++
      ) {
        for (
          let columnOffset = 0;
          columnOffset < numberOfSelectedColumnsInTileSet;
          columnOffset++
        ) {
          const row = baseRow + rowOffset
          const column = baseColumn + columnOffset

          const tile = {
            x:
              this.selectedTileSetTiles.value.x +
              columnOffset * this.tileMap.value.tileSize.width,
            y:
              this.selectedTileSetTiles.value.y +
              rowOffset * this.tileMap.value.tileSize.height,
            tileSet: this.selectedTileSet.value,
          }

          const cellPosition = { row, column }
          const hasTileBeenSet = this.currentLevelTileLayer.setTile(
            cellPosition,
            tile,
          )
          somethingHasChanged = somethingHasChanged || hasTileBeenSet
        }
      }
      if (!somethingHasChanged) {
        this.backups.pop()
      }
    }
  }

  private ensureTileLayer() {
    const level = this._level.value
    if (!this.tileMap.value.tiles[level]) {
      this.tileMap.value.tiles[level] = new TileLayer()
    }
  }
}
