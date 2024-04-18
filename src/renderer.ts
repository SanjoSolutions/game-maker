/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./MaterialSymbolsOutlined.css"
import "./index.css"

import * as bootstrap from "bootstrap"
import { BehaviorSubject } from "rxjs"
import { addPositions } from "./addPositions.js"
import { App } from "./App.js"
import type { Area } from "./Area.js"
import { areCellAreasDifferent } from "./areCellAreasDifferent.js"
// import "./authentication/logIn.js"
// import "./authentication/logOut.js"
// import "./authentication/register.js"
// import "./authentication/user.js"
import type { CellArea } from "./CellArea.js"
import type { CellAreaFromTo } from "@sanjo/game-engine/TileMap/CellAreaFromTo.js"
import type { CellFromToArea } from "./CellFromToArea.js"
import type { CellPosition } from "@sanjo/game-engine/TileMap/CellPosition.js"
import { createCellPositionKey } from "@sanjo/game-engine/TileMap/CellPosition.js"
import type { FromToArea } from "./FromToArea.js"
import type { MultiLayerTile } from "@sanjo/game-engine/TileMap/MultiLayerTile.js"
import { Database } from "./persistence.js"
import type { Point } from "./Point.js"
import type { Position } from "./Position.js"
import type { Size } from "@sanjo/game-engine/TileMap/Size.js"
import type { Tile } from "@sanjo/game-engine/TileMap/Tile.js"
import { TileLayer } from "@sanjo/game-engine/TileMap/TileLayer.js"
import { TileMap } from "@sanjo/game-engine/TileMap/TileMap.js"
import type { TileSet } from "@sanjo/game-engine/TileMap/TileSet.js"
import { Tool } from "./Tool.js"
import { Entity } from "@sanjo/game-engine/TileMap/Entity.js"

interface FileType {
  description: string
  accept: Record<string, string[]>
}

declare global {
  interface Window {
    IS_DEVELOPMENT: boolean
    showOpenFilePicker(options?: {
      multiple?: boolean
      excludeAcceptAllOption?: boolean
      types?: FileType[]
    }): Promise<FileSystemFileHandle[]>
    showSaveFilePicker(options?: {
      excludeAcceptAllOption?: boolean
      suggestedName?: string
      types?: FileType[]
    }): Promise<FileSystemFileHandle>
  }
}

if (window.IS_DEVELOPMENT) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}

const tileCache = {
  _cache: new Map<string, OffscreenCanvas>(),
  retrieveTile(tile: Tile): OffscreenCanvas | null {
    const key = `${tile.tileSet}_${tile.x}_${tile.y}`
    const cachedTile = this._cache.get(key)
    if (cachedTile) {
      return cachedTile
    } else {
      const tileSet = tileSets[tile.tileSet]
      if (tileSet) {
        const offscreenCanvas = new OffscreenCanvas(
          app.tileMap.value.tileSize.width,
          app.tileMap.value.tileSize.height,
        )
        const context = offscreenCanvas.getContext("2d")!
        context.drawImage(
          tileSet,
          tile.x,
          tile.y,
          app.tileMap.value.tileSize.width,
          app.tileMap.value.tileSize.height,
          0,
          0,
          app.tileMap.value.tileSize.width,
          app.tileMap.value.tileSize.height,
        )
        this._cache.set(key, offscreenCanvas)
        return offscreenCanvas
      } else {
        return null
      }
    }
  },
}

const $tileMap = document.querySelector(".tile-map") as HTMLCanvasElement
const context = $tileMap.getContext("2d")!

const database = new Database()
const app = new App()
const tileMapViewport = new BehaviorSubject<Position>({
  x: 0,
  y: 0,
})
let tileSets: Record<number, HTMLImageElement> = {}
const $level = document.querySelector(".level") as HTMLInputElement
const $entities = document.querySelector<HTMLDivElement>(".entities")!
const $entityPreview =
  document.querySelector<HTMLDivElement>(".entity-preview")!
let areShortcutsEnabled = true
const $tileSetSelect = document.getElementById(
  "tileSetSelect",
) as HTMLSelectElement
const $sidebar2 = document.querySelectorAll<HTMLDivElement>(".sidebar")[1]!
const $slider2 = document.querySelectorAll<HTMLDivElement>(".slider")[1]!
let renderOnlyCurrentLevel: boolean = false
const isGridShownSerialized = localStorage.getItem("isGridShown")
let isModalOpen: boolean = false
const menuIconBar = document.querySelector(
  ".menu-icon-bar-main",
) as HTMLDivElement
const penToolButton = menuIconBar.querySelector(
  ".pen-tool-button",
) as HTMLButtonElement
const areaToolButton = menuIconBar.querySelector(
  ".area-tool-button",
) as HTMLButtonElement
const fillToolButton = menuIconBar.querySelector(
  ".fill-tool-button",
) as HTMLButtonElement
const placeNPCToolButton = menuIconBar.querySelector(
  ".place-npc-button",
) as HTMLButtonElement
const selectionToolButton = menuIconBar.querySelector(
  ".selection-tool-button",
) as HTMLButtonElement
const $selectedArea = document.querySelector(".selected-area") as HTMLDivElement
let isGridShown: boolean = isGridShownSerialized
  ? JSON.parse(isGridShownSerialized)
  : true
const $tileMapContainer = document.querySelector(".tile-map-container")!

const $ID = $sidebar2.querySelector("#ID") as HTMLInputElement
$ID?.addEventListener("keyup", function () {
  app.selectedEntity.value.id = $ID.value
  saveTileMap()
})

{
  const levelSerialized = localStorage.getItem("level")
  if (levelSerialized) {
    const level = parseInt(levelSerialized, 10)
    if (level) {
      app.level = level
    }
  }
}

const $tileSelected = document.querySelector(".tile-selected") as HTMLDivElement

let firstPoint: Point | null = null

{
  const selectedTileSetTilesSerialized = localStorage.getItem(
    "selectedTileSetTiles",
  )
  if (selectedTileSetTilesSerialized) {
    selectTileSetTiles(JSON.parse(selectedTileSetTilesSerialized))
  }
}

changeTool(Tool.Pen)

const saveTileMap = debounce(async function () {
  database.save(
    "tileMap",
    await readReadableStreamAsGzipBlob(createCompressedTileMapStream()),
  )
})

$level.addEventListener("change", function (event) {
  app.level = Number((event.target as HTMLInputElement).value)
})

function initializeSidebar(
  sidebar: HTMLDivElement,
  slider: HTMLDivElement,
  id: string,
  calculateWidth,
) {
  const localStorageKey = `sidebar${id}Width`
  const sideBarWidth = localStorage.getItem(localStorageKey)
  if (sideBarWidth) {
    sidebar.style.flexBasis = sideBarWidth
  }

  let offset: number | null = null
  const $sliderDragArea = slider.querySelector(
    ".slider__drag-area",
  ) as HTMLDivElement
  let isSliding = false
  $sliderDragArea.addEventListener("pointerdown", function (event) {
    event.preventDefault()
    isSliding = true
    offset = event.offsetX - (17 - 1) / 2
  })
  window.addEventListener("pointermove", function (event) {
    if (isSliding) {
      event.preventDefault()
      sidebar.style.flexBasis = calculateWidth(offset!, event.clientX)
    }
  })
  window.addEventListener("pointerup", function () {
    isSliding = false
    offset = null
    localStorage.setItem(localStorageKey, sidebar.style.flexBasis)
    updateTileMap()
  })
}

initializeSidebar(
  document.querySelector<HTMLDivElement>(".sidebar")!,
  document.querySelector<HTMLDivElement>(".slider")!,
  "1",
  (offset, clientX) => clientX - offset + "px",
)

initializeSidebar(
  $sidebar2,
  $slider2,
  "2",
  (offset, clientX) => window.innerWidth - clientX + offset + "px",
)

function showSidebar2() {
  $sidebar2.style.display = "block"
  $slider2.style.display = "block"
}

function hideSidebar2() {
  $sidebar2.style.display = "none"
  $slider2.style.display = "none"
  updateTileMap()
}

const $tileHover = document.querySelector(".tile-hover") as HTMLDivElement
const $tileSet = document.querySelector(".tile-set") as HTMLImageElement
$tileSet.addEventListener("pointermove", function (event) {
  $tileHover.style.display = "block"
  $tileHover.style.left =
    adjustToStep(event.offsetX, app.tileMap.value.tileSize.width) + "px"
  $tileHover.style.top =
    adjustToStep(event.offsetY, app.tileMap.value.tileSize.height) + "px"
})

let isPointerDownInTileSet = false

$tileSet.addEventListener("pointerdown", function (event) {
  event.preventDefault()
  isPointerDownInTileSet = true
  selectTileSetTile(convertEventToPosition(event))
})

$tileSet.addEventListener("pointermove", function (event) {
  if (isPointerDownInTileSet) {
    expandSelectTilesInTileSet(event)
  }
})

$tileSet.addEventListener("mouseleave", function () {
  $tileHover.style.display = "none"
})

export function selectTileSetTile(position: Position): void {
  selectTileSetTiles({
    x: position.x,
    y: position.y,
    width: app.tileMap.value.tileSize.width,
    height: app.tileMap.value.tileSize.height,
  })
}

function expandSelectTilesInTileSet(event: PointerEvent): void {
  if (firstPoint) {
    const x = adjustToStep(event.offsetX, app.tileMap.value.tileSize.width)
    const y = adjustToStep(event.offsetY, app.tileMap.value.tileSize.height)
    const selectedTileSetTiles = {
      x: Math.min(firstPoint.x, x),
      y: Math.min(firstPoint.y, y),
      width: Math.abs(x - firstPoint.x) + app.tileMap.value.tileSize.width,
      height: Math.abs(y - firstPoint.y) + app.tileMap.value.tileSize.height,
    }
    selectTileSetTiles(selectedTileSetTiles)
  } else {
    throw new Error("firstPoint is null.")
  }
}

export function selectTileSetTiles(area: Area | null): void {
  if (area) {
    let { x, y, width, height } = area
    x = adjustToStep(x, app.tileMap.value.tileSize.width)
    y = adjustToStep(y, app.tileMap.value.tileSize.height)
    width = adjustToStep(width, app.tileMap.value.tileSize.width)
    height = adjustToStep(height, app.tileMap.value.tileSize.height)
    firstPoint = {
      x,
      y,
    }
    const selectedTileSetTiles = {
      x,
      y,
      width,
      height,
    }
    app.selectedTileSetTiles.next(selectedTileSetTiles)
    $tileSelected.style.display = "block"
    $tileSelected.style.left = selectedTileSetTiles.x + "px"
    $tileSelected.style.top = selectedTileSetTiles.y + "px"
    $tileSelected.style.width = selectedTileSetTiles.width + "px"
    $tileSelected.style.height = selectedTileSetTiles.height + "px"
  } else {
    firstPoint = null
    app.selectedTileSetTiles.next(null)
    $tileSelected.style.display = "none"
  }
}

window.addEventListener("pointerup", function () {
  isPointerDownInTileSet = false
})

function adjustToStep(value: number, step: number): number {
  return Math.floor(value / step) * step
}

const DEFAULT_TILE_WIDTH = 32
const DEFAULT_TILE_HEIGHT = 32
await database.open()
const tileMapFromDatabase = await database.load("tileMap")
loadMap(
  tileMapFromDatabase
    ? TileMap.fromRawObject(
        JSON.parse(await decompressBlob(tileMapFromDatabase)),
      )
    : await createTileMap(),
)

app.level.subscribe(function (level) {
  $level.value = String(level)
  localStorage.setItem("level", String(level))
  saveTileMap()
  renderTileMap()
})

async function loadTileSetAsImage(id: number, tileSet: TileSet): Promise<void> {
  tileSets[id] = await createImageFromDataURL(tileSet.content)
}

function addOptionToTileSetSelect(id: number, tileSet: TileSet): void {
  const option = document.createElement("option")
  option.value = String(id)
  option.textContent = tileSet.name
  $tileSetSelect.appendChild(option)
}

{
  const selectedTileSetSerialized = localStorage.getItem("selectedTileSet")
  const selectedTileSetID = selectedTileSetSerialized
    ? parseInt(selectedTileSetSerialized, 10)
    : 0
  if (app.tileMap.value.tileSets[selectedTileSetID]) {
    selectTileSet(selectedTileSetID)
  }
}

{
  $tileMap.width = $tileMapContainer.clientWidth
  $tileMap.height = $tileMapContainer.clientHeight

  window.addEventListener("resize", debounce(updateTileMap, 300))
}

function updateTileMap() {
  $tileMap.width = $tileMapContainer.clientWidth
  $tileMap.height = $tileMapContainer.clientHeight
  renderTileMap()
}

$tileHover.style.width = app.tileMap.value.tileSize.width + "px"
$tileHover.style.height = app.tileMap.value.tileSize.height + "px"

if ($tileSet.complete) {
  renderTileMap()
} else {
  $tileSet.addEventListener("load", function () {
    renderTileMap()
  })
}

function retrieveTile(position: CellPosition): MultiLayerTile {
  return retrieveTile2(position)
}

function retrieveTile2(position: CellPosition): MultiLayerTile {
  return app.tileMap.value.tiles.map((tileLayer) =>
    tileLayer ? tileLayer.retrieveTile(position) : null,
  )
}

let firstPositionTileMap: CellPosition | null = null
let selectedTilesInTileMap: CellArea | null = null
let isPointerDownInTileMap: boolean = false

$tileMap.addEventListener("pointerdown", function (event) {
  event.preventDefault()
  doPointerDownOnTileMap(convertEventToCellPosition(event))
})

function convertEventToCellPosition(event: PointerEvent): CellPosition {
  return convertCanvasPositionToCellPosition(convertEventToPosition(event))
}

function convertCanvasPositionToCellPosition(
  position: Position,
  scale: number = app.scale.value,
): CellPosition {
  const scaledTileSize = determineScaledTileSize(scale)
  return {
    row:
      adjustToStep(
        tileMapViewport.value.y + Math.round(position.y),
        scaledTileSize.height,
      ) / scaledTileSize.height,
    column:
      adjustToStep(
        tileMapViewport.value.x + Math.round(position.x),
        scaledTileSize.width,
      ) / scaledTileSize.width,
  }
}

function convertEventToPosition(event: PointerEvent): Position {
  return {
    x: event.offsetX,
    y: event.offsetY,
  }
}

function doPointerDownOnTileMap(cellPosition: CellPosition): void {
  isPointerDownInTileMap = true

  if (!isInPasteMode && !app.isDragModeEnabled.value) {
    if (app.activeTool.value === "fill") {
      fill(cellPosition)
    } else {
      selectTileInTileMap(cellPosition)

      if (app.selectedTileSetTiles.value) {
        if (app.activeTool.value === "pen") {
          setTiles(cellPosition)
        }
      }
    }
  }
}

function previewFill(position: CellPosition): void {
  doAFillMethod(
    position,
    function (cellPosition, selectedTile) {
      const replacements: MultiLayerTile = []
      replacements[app.level.value] = selectedTile
      renderTile(cellPosition, replacements)
    },
    { onlyVisibleTiles: true },
  )
}

function fill(cellPosition: CellPosition): void {
  app.backUpMap()
  doAFillMethod(cellPosition, function (tile, selectedTile) {
    setTileOnCurrentLevel(tile, selectedTile)
  })
  renderTileMap()
  saveTileMap()
}

function doAFillMethod(
  position: CellPosition,
  fn: (cellPosition: CellPosition, tile: Tile) => void,
  options: { onlyVisibleTiles: boolean } = { onlyVisibleTiles: false },
): void {
  if (app.selectedTileSetTiles.value) {
    const MAX_DISTANCE_FROM_ORIGIN = 250
    const origin = position

    const originTileBeforeFill = retrieveTile2(origin)[app.level.value]

    const selectedTile = {
      x: app.selectedTileSetTiles.value.x,
      y: app.selectedTileSetTiles.value.y,
      tileSet: retrieveSelectedTileSetID(),
    }

    const visitedTiles = new Set()

    function setAsVisited(cellPosition: CellPosition): void {
      const key = createCellPositionKey(cellPosition)
      visitedTiles.add(key)
    }

    function hasNotBeenVisited(cellPosition: CellPosition): boolean {
      const key = createCellPositionKey(cellPosition)
      return !visitedTiles.has(key)
    }

    function isInRange(cellPosition: CellPosition): boolean {
      return (
        Math.abs(Number(cellPosition.row - origin.row)) <=
          MAX_DISTANCE_FROM_ORIGIN &&
        Math.abs(Number(cellPosition.column - origin.column)) <=
          MAX_DISTANCE_FROM_ORIGIN
      )
    }

    let nextCellPositions: CellPosition[] = [origin]

    do {
      const cellPositions: CellPosition[] = nextCellPositions
      nextCellPositions = []
      for (const cellPosition of cellPositions) {
        if (hasNotBeenVisited(cellPosition)) {
          fn(cellPosition, selectedTile)
          setAsVisited(cellPosition)
          let neighbors = retrieveNeighborsWithSetTile(
            cellPosition,
            originTileBeforeFill,
          )
            .filter(hasNotBeenVisited)
            .filter(isInRange)
          if (options.onlyVisibleTiles) {
            neighbors = neighbors.filter(isCellPositionVisibleOnCanvas)
          }
          nextCellPositions.push(...neighbors)
        }
      }
    } while (nextCellPositions.length >= 1)
  }
}

function isCellPositionVisibleOnCanvas(cellPosition: CellPosition): boolean {
  const canvasPosition = convertCellPositionToCanvasPosition(cellPosition)
  return (
    canvasPosition.x >= 0 &&
    canvasPosition.x < $tileMap.width &&
    canvasPosition.y >= 0 &&
    canvasPosition.y < $tileMap.height
  )
}

function retrieveNeighborsWithSetTile(
  cellPosition: CellPosition,
  setTile: Tile | null,
) {
  return retrieveNeighbors(cellPosition).filter((tile) =>
    isTileSetTo(tile, setTile),
  )
}

function retrieveNeighbors(cellPosition: CellPosition): CellPosition[] {
  const neighbors: CellPosition[] = []
  neighbors.push({
    row: cellPosition.row - 1,
    column: cellPosition.column,
  })
  neighbors.push({
    row: cellPosition.row,
    column: cellPosition.column + 1,
  })
  neighbors.push({
    row: cellPosition.row + 1,
    column: cellPosition.column,
  })
  neighbors.push({
    row: cellPosition.row,
    column: cellPosition.column - 1,
  })
  return neighbors
}

function isTileSetTo(
  cellPosition: CellPosition,
  setTile: Tile | null,
): boolean {
  const a = retrieveTile2(cellPosition)
  const b = a ? a[app.level.value] ?? null : null
  return Boolean(
    (!b && !setTile) ||
      (b && setTile && b.x === setTile.x && b.y === setTile.y),
  )
}

function selectTileInTileMap(position: CellPosition): void {
  firstPositionTileMap = position

  selectedTilesInTileMap = {
    row: position.row,
    column: position.column,
    width: 1,
    height: 1,
  }

  if (app.activeTool.value === "selection") {
    updateSelectedArea()
  }
}

function updateSelectedArea() {
  if (selectedTilesInTileMap) {
    $selectedArea.style.display = "block"
    const { x, y } = convertCellPositionToCanvasPosition(selectedTilesInTileMap)
    $selectedArea.style.left = x + "px"
    $selectedArea.style.top = y + "px"
    const scaledTileSize = determineScaledTileSize(app.scale.value)
    $selectedArea.style.width =
      selectedTilesInTileMap.width * scaledTileSize.width + "px"
    $selectedArea.style.height =
      selectedTilesInTileMap.height * scaledTileSize.height + "px"
  }
}

function preview9SliceMade() {
  renderCurrentPreview(function ({ currentlySelectedTilesInTileMap }) {
    do9SliceMethodWithSelectedTiles(function ({ row, column }, tile) {
      const replacements = []
      replacements[app.level.value] = tile
      renderTile(
        {
          row: row + currentlySelectedTilesInTileMap.row,
          column: column + currentlySelectedTilesInTileMap.column,
        },
        replacements,
      )
    })
  })
}

function previewArea() {
  renderCurrentPreview(function ({
    currentlySelectedTilesInTileMap,
    selectedTileSetTiles,
  }) {
    doSomethingWithSelectedTilesInTileMap(function ({ row, column }) {
      const replacements = []
      const tile = determineTileForArea(
        { row, column },
        currentlySelectedTilesInTileMap,
        selectedTileSetTiles,
      )
      replacements[app.level.value] = tile

      renderTile(
        {
          row: currentlySelectedTilesInTileMap.row + row,
          column: currentlySelectedTilesInTileMap.column + column,
        },
        replacements,
      )
    })
  })
}

function determineTileForArea(
  { row, column }: CellPosition,
  selectedTilesInTileMap: CellArea,
  selectedTileSetTiles: Area,
): Tile {
  const numberOfRowsSelectedInTileSet = Math.floor(
    selectedTileSetTiles.height / app.tileMap.value.tileSize.height,
  )

  const numberOfColumnsSelectedInTileSet = Math.floor(
    selectedTileSetTiles.width / app.tileMap.value.tileSize.width,
  )

  const tile = {
    x:
      selectedTileSetTiles.x +
      Number(
        numberOfColumnsSelectedInTileSet === 3
          ? column === 0
            ? 0
            : column === selectedTilesInTileMap.width - 1
            ? numberOfColumnsSelectedInTileSet - 1
            : 1
          : column % numberOfColumnsSelectedInTileSet,
      ) *
        app.tileMap.value.tileSize.width,
    y:
      selectedTileSetTiles.y +
      Number(row % numberOfRowsSelectedInTileSet) *
        app.tileMap.value.tileSize.height,
    tileSet: retrieveSelectedTileSetID(),
  }
  return tile
}

function renderCurrentPreview(
  fn: (things: {
    currentlySelectedTilesInTileMap: CellArea
    selectedTileSetTiles: Area
  }) => void,
): void {
  const selectedTileSetTiles = app.selectedTileSetTiles.value
  const currentlySelectedTilesInTileMap = selectedTilesInTileMap
  if (selectedTileSetTiles && currentlySelectedTilesInTileMap) {
    const previousPreviewTiles = app.previewTiles.value
    app.previewTiles.next(currentlySelectedTilesInTileMap)
    if (
      !previousPreviewTiles ||
      areCellAreasDifferent(
        previousPreviewTiles,
        currentlySelectedTilesInTileMap,
      )
    ) {
      fn({
        currentlySelectedTilesInTileMap,
        selectedTileSetTiles,
      })
    }
  }
}

let lastPointerPosition: Point | null = null

$tileMap.addEventListener("pointermove", function (event) {
  lastPointerPosition = convertEventToPosition(event)

  if (app.isDragModeEnabled.value) {
    const newTileMapViewport = {
      x: tileMapViewport.value.x - event.movementX,
      y: tileMapViewport.value.y - event.movementY,
    }
    tileMapViewport.next(newTileMapViewport)
  } else if (isPointerDownInTileMap) {
    if (app.activeTool.value === "area") {
      if (app.selectedTileSetTiles.value) {
        expandSelectTilesInTileMap(event)
        if (seemsThat9SliceIsSelected()) {
          preview9SliceMade()
          renderGrid()
        } else {
          previewArea()
          renderGrid()
        }
      }
    } else if (app.activeTool.value === "pen") {
      if (app.selectedTileSetTiles.value) {
        setTiles(convertEventToCellPosition(event))
      }
    } else if (app.activeTool.value === "selection") {
      expandSelectTilesInTileMap(event)
      updateSelectedArea()
    }
  } else if (isInPasteMode) {
    previewPaste()
  } else if (app.activeTool.value === Tool.PlaceNPC) {
    const position = convertCellPositionToCanvasPosition({
      row: determineRowFromCoordinate(lastPointerPosition!.y),
      column: determineColumnFromCoordinate(lastPointerPosition!.x),
    })
    $entityPreview.style.left = `${position.x}px`
    $entityPreview.style.top = `${position.y}px`
  } else if (app.selectedTileSetTiles.value) {
    if (app.activeTool.value === "pen") {
      const previousPreviewTiles = app.previewTiles.value
      const previewTiles = {
        ...convertEventToCellPosition(event),
        width: Math.ceil(
          app.selectedTileSetTiles.value.width /
            app.tileMap.value.tileSize.width,
        ),
        height: Math.ceil(
          app.selectedTileSetTiles.value.height /
            app.tileMap.value.tileSize.height,
        ),
      }
      app.previewTiles.next(previewTiles)
      if (
        !previousPreviewTiles ||
        areCellAreasDifferent(previousPreviewTiles, previewTiles)
      ) {
        renderPreviewTiles()
      }
    } else if (app.activeTool.value === "area") {
      const previousPreviewTiles = app.previewTiles.value
      const previewTiles = {
        ...convertEventToCellPosition(event),
        width: 1,
        height: 1,
      }
      app.previewTiles.next(previewTiles)
      if (
        !previousPreviewTiles ||
        areCellAreasDifferent(previousPreviewTiles, previewTiles)
      ) {
        if (previousPreviewTiles) {
          renderTiles(previousPreviewTiles)
        }
        renderPreviewTiles()
      }
    } else if (app.activeTool.value === "fill") {
      renderTileMap()
      previewFill(convertEventToCellPosition(event))
      renderGrid()
    }
  }
})

function expandSelectTilesInTileMap(event: PointerEvent): void {
  if (firstPositionTileMap) {
    const { row, column } = convertCanvasPositionToCellPosition(
      convertEventToPosition(event),
    )
    selectedTilesInTileMap = {
      row: Math.min(firstPositionTileMap.row, row),
      column: Math.min(firstPositionTileMap.column, column),
      width: Math.abs(column - firstPositionTileMap.column) + 1,
      height: Math.abs(row - firstPositionTileMap.row) + 1,
    }
  }
}

function seemsThat9SliceIsSelected(): boolean {
  const selectedTilesSetTiles = app.selectedTileSetTiles.value
  return Boolean(
    selectedTilesSetTiles &&
      selectedTilesSetTiles.width === 3 * app.tileMap.value.tileSize.height &&
      selectedTilesSetTiles.height === 3 * app.tileMap.value.tileSize.height,
  )
}

$tileMap.addEventListener("mouseleave", function () {
  app.previewTiles.next(null)
  renderTileMap()
})

window.addEventListener("pointerup", function () {
  const wasPointerDownInTileMap = isPointerDownInTileMap

  isPointerDownInTileMap = false

  if (wasPointerDownInTileMap) {
    if (app.activeTool.value === Tool.Area) {
      if (seemsThat9SliceIsSelected()) {
        setTilesWith9SliceMethod()
      } else {
        area()
      }
    } else if (app.activeTool.value === Tool.PlaceNPC) {
      const cellPosition = {
        row: determineRowFromCoordinate(lastPointerPosition.y),
        column: determineColumnFromCoordinate(lastPointerPosition.x),
      }
      let entity = app.tileMap.value.entities.find(
        (entity: Entity) =>
          entity.row === cellPosition.row &&
          entity.column === cellPosition.column,
      )
      if (!entity) {
        entity = new Entity(cellPosition.row, cellPosition.column)
        app.tileMap.value.entities.push(entity)
        saveTileMap()
        const $entity = createEntity(entity)
        $entities.appendChild($entity)
      }
      app.selectedEntity.next(entity)
      $ID.value = entity.id ?? ""
      showSidebar2()
      $sidebar2.querySelector('input[name="ID"]')!.focus()
    }
  }

  firstPositionTileMap = null
  if (app.activeTool.value !== "selection") {
    selectedTilesInTileMap = null
  }
})

function createEntity(entity: Entity): HTMLDivElement {
  const $entity = document.createElement("div")
  $entity.className = "entity"
  const position = convertCellPositionToCanvasPosition(entity)
  $entity.style.left = `${position.x}px`
  $entity.style.top = `${position.y}px`
  return $entity
}

$tileMap.addEventListener("pointerup", function () {
  if (isInPasteMode) {
    paste()
  }
})

function area() {
  const selectedTileSetTiles = app.selectedTileSetTiles.value
  if (selectedTileSetTiles && selectedTilesInTileMap) {
    app.backUpMap()

    const baseRow = selectedTilesInTileMap.row
    const baseColumn = selectedTilesInTileMap.column
    doSomethingWithSelectedTilesInTileMap(function ({ row, column }) {
      const selectedTile = determineTileForArea(
        { row, column },
        selectedTilesInTileMap!,
        selectedTileSetTiles,
      )
      setTileOnCurrentLevel(
        { row: baseRow + row, column: baseColumn + column },
        selectedTile,
      )
    })
    renderTileMap()
    saveTileMap()
  }
}

function setTilesWith9SliceMethod() {
  if (selectedTilesInTileMap) {
    app.backUpMap()

    const baseRow = selectedTilesInTileMap.row
    const baseColumn = selectedTilesInTileMap.column

    do9SliceMethodWithSelectedTiles(function ({ row, column }, tile) {
      setTileOnCurrentLevel(
        {
          row: baseRow + row,
          column: baseColumn + column,
        },
        tile,
      )
    })

    saveTileMap()
  }
}

function doSomethingWithSelectedTilesInTileMap(
  fn: (position: CellPosition) => void,
) {
  if (selectedTilesInTileMap) {
    for (let row = 0; row < selectedTilesInTileMap.height; row++) {
      for (let column = 0; column < selectedTilesInTileMap.width; column++) {
        fn({ row, column })
      }
    }
  }
}

function do9SliceMethodWithSelectedTiles(
  fn: (position: CellPosition, tile: Tile) => void,
): void {
  const selectedTileSetTiles = app.selectedTileSetTiles.value
  if (selectedTileSetTiles && selectedTilesInTileMap) {
    const numberOfRows = selectedTilesInTileMap.height
    const numberOfColumns = selectedTilesInTileMap.width

    doSomethingWithSelectedTilesInTileMap(function ({ row, column }) {
      let selectedTilesX
      let selectedTilesY

      if (row === 0 && column === 0) {
        selectedTilesX = selectedTileSetTiles.x
        selectedTilesY = selectedTileSetTiles.y
      } else if (row === 0 && column === numberOfColumns - 1) {
        selectedTilesX =
          selectedTileSetTiles.x + 2 * app.tileMap.value.tileSize.width
        selectedTilesY = selectedTileSetTiles.y
      } else if (row === numberOfRows - 1 && column === numberOfColumns - 1) {
        selectedTilesX =
          selectedTileSetTiles.x + 2 * app.tileMap.value.tileSize.width
        selectedTilesY =
          selectedTileSetTiles.y + 2 * app.tileMap.value.tileSize.height
      } else if (row === numberOfRows - 1 && column === 0) {
        selectedTilesX = selectedTileSetTiles.x
        selectedTilesY =
          selectedTileSetTiles.y + 2 * app.tileMap.value.tileSize.height
      } else if (row === 0) {
        selectedTilesX =
          selectedTileSetTiles.x + 1 * app.tileMap.value.tileSize.width
        selectedTilesY = selectedTileSetTiles.y
      } else if (row === numberOfRows - 1) {
        selectedTilesX =
          selectedTileSetTiles.x + 1 * app.tileMap.value.tileSize.width
        selectedTilesY =
          selectedTileSetTiles.y + 2 * app.tileMap.value.tileSize.height
      } else if (column === 0) {
        selectedTilesX = selectedTileSetTiles.x
        selectedTilesY =
          selectedTileSetTiles.y + 1 * app.tileMap.value.tileSize.height
      } else if (column === numberOfColumns - 1) {
        selectedTilesX =
          selectedTileSetTiles.x + 2 * app.tileMap.value.tileSize.width
        selectedTilesY =
          selectedTileSetTiles.y + 1 * app.tileMap.value.tileSize.height
      } else {
        selectedTilesX =
          selectedTileSetTiles.x + 1 * app.tileMap.value.tileSize.width
        selectedTilesY =
          selectedTileSetTiles.y + 1 * app.tileMap.value.tileSize.height
      }

      fn(
        { row, column },
        {
          x: selectedTilesX,
          y: selectedTilesY,
          tileSet: retrieveSelectedTileSetID(),
        },
      )
    })
  }
}

const toggleGridButton = menuIconBar.querySelector(
  ".toggle-grid-button",
) as HTMLButtonElement

function updateToggleGridButton() {
  if (isGridShown) {
    toggleGridButton.classList.add("active")
  } else {
    toggleGridButton.classList.remove("active")
  }
}

updateToggleGridButton()

function toggleGrid(): void {
  isGridShown = !isGridShown
  updateToggleGridButton()
  localStorage.setItem("isGridShown", String(isGridShown))
  renderTileMap()
}

toggleGridButton.addEventListener("click", toggleGrid)

function updateToolButtonStates() {
  updatePenToolButton()
  updateAreaToolButton()
  updateFillToolButton()
  updatePlaceNPCToolButton()
  updateSelectionToolButton()
}

function updateToolButton(button: HTMLButtonElement, tool: string): void {
  if (app.activeTool.value === tool) {
    button.classList.add("active")
  } else {
    button.classList.remove("active")
  }
}

function activatePenTool() {
  changeTool(Tool.Pen)
}

penToolButton.addEventListener("click", activatePenTool)

function updatePenToolButton() {
  updateToolButton(penToolButton, "pen")
}

function activateAreaTool() {
  changeTool(Tool.Area)
}

areaToolButton.addEventListener("click", activateAreaTool)

function updateAreaToolButton() {
  updateToolButton(areaToolButton, "area")
}

function activateFillTool() {
  changeTool(Tool.Fill)
}

fillToolButton.addEventListener("click", activateFillTool)

function updateFillToolButton() {
  updateToolButton(fillToolButton, "fill")
}

function activatePlaceNPCTool() {
  changeTool(Tool.PlaceNPC)
}

placeNPCToolButton.addEventListener("click", activatePlaceNPCTool)

function updatePlaceNPCToolButton() {
  updateToolButton(placeNPCToolButton, "placeNPC")
}

function activateSelectTool() {
  changeTool(Tool.Selection)
}

function changeTool(tool: Tool): void {
  if (tool !== app.activeTool.value) {
    app.activeTool.next(tool)
    updateToolButtonStates()
    $selectedArea.style.display = "none"
    $entityPreview.style.display =
      app.activeTool.value === Tool.PlaceNPC ? "block" : "none"
    if (app.activeTool.value !== Tool.PlaceNPC) {
      hideSidebar2()
    }
  }
}

selectionToolButton.addEventListener("click", activateSelectTool)

function updateSelectionToolButton() {
  updateToolButton(selectionToolButton, "selection")
}

updateToolButtonStates()

const renderOnlyCurrentLevelButton = document.querySelector(
  ".render-only-current-level-button",
)!

function toggleRenderOnlyCurrentLevel() {
  renderOnlyCurrentLevel = !renderOnlyCurrentLevel
  updateRenderOnlyCurrentLevelButton()
  renderTileMap()
}

renderOnlyCurrentLevelButton.addEventListener(
  "click",
  toggleRenderOnlyCurrentLevel,
)

function updateRenderOnlyCurrentLevelButton() {
  if (renderOnlyCurrentLevel) {
    renderOnlyCurrentLevelButton.classList.add("active")
  } else {
    renderOnlyCurrentLevelButton.classList.remove("active")
  }
}

async function createNewTileMap(): Promise<void> {
  loadMap(await createTileMap())
}

function loadMap(map: TileMap) {
  map = migrateMapToLatestVersion(map)

  app.tileMap.next(map)
  localStorage.removeItem("openFileName")

  for (const [id, tileSet] of Object.entries(app.tileMap.value.tileSets)) {
    loadTileSetAsImage(Number(id), tileSet).then(renderTileMap)
  }

  $tileSetSelect.innerHTML = ""
  for (const [id, tileSet] of Object.entries(app.tileMap.value.tileSets)) {
    addOptionToTileSetSelect(Number(id), tileSet)
  }

  $entities.innerHTML = ""
  map.entities.forEach((entity: Entity) => {
    const $entity = createEntity(entity)
    $entities.appendChild($entity)
  })

  $tileHover.style.width = app.tileMap.value.tileSize.width + "px"
  $tileHover.style.height = app.tileMap.value.tileSize.height + "px"

  $tileSelected.style.width = app.tileMap.value.tileSize.width + "px"
  $tileSelected.style.height = app.tileMap.value.tileSize.height + "px"

  selectTileSet(0)

  renderTileMap()
  saveTileMap()
}

function migrateMapToLatestVersion(map: any): TileMap {
  if (!map.entities) {
    console.log("migrate entities")
    map.entities = []
  }
  return map
}

window.electronAPI.onNewGame(function newGame() {})
window.electronAPI.onOpenMap(function onOpenMap(map: any) {
  loadMap(TileMap.fromRawObject(map))
})

async function createTileMap() {
  const tileMap = new TileMap()
  tileMap.tileSize = {
    width: DEFAULT_TILE_WIDTH,
    height: DEFAULT_TILE_HEIGHT,
  }
  tileMap.tileSets[0] = {
    name: "world.png",
    content: await loadFileAsDataUrl("world.png"),
  }
  tileMap.tileSets[1] = {
    name: "exterior.png",
    content: await loadFileAsDataUrl("exterior.png"),
  }
  tileMap.tileSets[2] = {
    name: "dungeon.png",
    content: await loadFileAsDataUrl("dungeon.png"),
  }
  tileMap.tileSets[3] = {
    name: "interior.png",
    content: await loadFileAsDataUrl("interior.png"),
  }
  tileMap.tileSets[4] = {
    name: "ship.png",
    content: await loadFileAsDataUrl("ship.png"),
  }

  tileMap.tiles[0] = new TileLayer()
  return tileMap
}

async function loadFileAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  const blob = await response.blob()
  const fileReader = new FileReader()
  return new Promise((resolve, onError) => {
    fileReader.onload = () => {
      resolve(fileReader.result as string)
    }
    fileReader.onerror = onError
    fileReader.readAsDataURL(blob)
  })
}

function setTiles(position: CellPosition): void {
  app.useToolAt(position.row, position.column)
  renderTileMap()
  saveTileMap()
}

function setTileOnCurrentLevel(position: CellPosition, tile: Tile) {
  return app.currentLevelTileLayer.setTile(position, tile)
}

function setTile(position: CellPosition, tile: Tile, level: number) {
  return app.tileMap.value.tiles[level].setTile(position, tile)
}

function renderTiles(area: CellArea): void {
  for (let row = area.row; row < area.row + area.height; row += 1) {
    for (
      let column = area.column;
      column < area.column + area.width;
      column += 1
    ) {
      renderTile({ row, column })
    }
  }
}

function convertCellPositionToCanvasPosition(
  cellPosition: CellPosition,
  scale = app.scale.value,
): Position {
  const scaledTileSize = determineScaledTileSize(scale)
  return {
    x: cellPosition.column * scaledTileSize.width - tileMapViewport.value.x,
    y: cellPosition.row * scaledTileSize.height - tileMapViewport.value.y,
  }
}

function determineScaledTileSize(scale: number): Size {
  return {
    width: Math.round(scale * app.tileMap.value.tileSize.width),
    height: Math.round(scale * app.tileMap.value.tileSize.height),
  }
}

function renderTile(position: CellPosition, replacements?: MultiLayerTile) {
  const tile = retrieveTile(position)
  const renderedAt: Position = convertCellPositionToCanvasPosition(position)
  const scaledTileSize = determineScaledTileSize(app.scale.value)
  context.clearRect(
    renderedAt.x,
    renderedAt.y,
    scaledTileSize.width,
    scaledTileSize.height,
  )
  if (tile) {
    context.save()
    function a(level2: number) {
      const tileOnLayer =
        replacements && replacements[level2]
          ? replacements[level2]
          : tile[level2]
      if (tileOnLayer) {
        context.globalAlpha = level2 > app.level.value ? 0.4 : 1
        const tileSetTile = tileCache.retrieveTile(tileOnLayer)
        if (tileSetTile) {
          context.drawImage(
            tileSetTile,
            0,
            0,
            app.tileMap.value.tileSize.width,
            app.tileMap.value.tileSize.height,
            renderedAt.x,
            renderedAt.y,
            scaledTileSize.width,
            scaledTileSize.height,
          )
        }
      }
    }
    if (renderOnlyCurrentLevel) {
      a(app.level.value)
    } else {
      for (
        let level2 = 0;
        level2 <= Math.max(tile.length - 1, app.level.value);
        level2++
      ) {
        a(level2)
      }
    }
    context.restore()
  } else {
    renderEmptyTile(position)
  }
}

async function createImageFromDataURL(
  dataURL: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = function () {
      resolve(image)
    }
    image.src = dataURL
  })
}

function renderSelectedTiles(area: CellArea, selectedTileSetTiles: Area): void {
  for (let rowOffset = 0; rowOffset < area.height; rowOffset++) {
    for (let columnOffset = 0; columnOffset < area.width; columnOffset++) {
      const replacements: MultiLayerTile = []
      replacements[app.level.value] = {
        x:
          selectedTileSetTiles.x +
          columnOffset * app.tileMap.value.tileSize.width,
        y:
          selectedTileSetTiles.y +
          rowOffset * app.tileMap.value.tileSize.height,
        tileSet: retrieveSelectedTileSetID(),
      }
      renderTile(
        {
          row: area.row + rowOffset,
          column: area.column + columnOffset,
        },
        replacements,
      )
    }
  }

  renderGrid()
}

function renderEmptyTile(position: CellPosition): void {
  context.fillStyle = "white"
  const canvasPosition = convertCellPositionToCanvasPosition(position)
  context.fillRect(
    canvasPosition.x,
    canvasPosition.y,
    app.tileMap.value.tileSize.width,
    app.tileMap.value.tileSize.height,
  )
}

function renderPreviewTiles() {
  if (app.previewTiles.value && app.selectedTileSetTiles.value) {
    renderSelectedTiles(app.previewTiles.value, app.selectedTileSetTiles.value)
    renderGridOnArea(app.previewTiles.value)
  }
}

let previousTileMapViewport: Position | null = null
tileMapViewport.subscribe(function (tileMapViewport: Position) {
  if (previousTileMapViewport) {
    const offsetX = previousTileMapViewport.x - tileMapViewport.x
    const offsetY = previousTileMapViewport.y - tileMapViewport.y
    const width = Math.max($tileMap.width - Math.abs(offsetX), 0)
    const height = Math.max($tileMap.height - Math.abs(offsetY), 0)
    let backup
    if (width > 0 && height > 0) {
      backup = new OffscreenCanvas(width, height)
      const backupContext = backup.getContext("2d")!
      backupContext.drawImage(
        $tileMap,
        offsetX < 0 ? Math.abs(offsetX) : 0,
        offsetY < 0 ? Math.abs(offsetY) : 0,
        width,
        height,
        0,
        0,
        width,
        height,
      )
    }

    context.clearRect(0, 0, $tileMap.width, $tileMap.height)

    if (width > 0 && height > 0) {
      context.drawImage(
        backup!,
        offsetX < 0 ? 0 : offsetX > 0 ? offsetX : 0,
        offsetY < 0 ? 0 : offsetY > 0 ? offsetY : 0,
      )
    }

    if (offsetX > 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: 0,
            y: offsetY,
          },
          to: {
            x: offsetX,
            y: $tileMap.height,
          },
        }),
      )
    } else if (offsetX < 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: $tileMap.width + offsetX,
            y: offsetY,
          },
          to: {
            x: $tileMap.width,
            y: $tileMap.height,
          },
        }),
      )
    }
    if (offsetY > 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: offsetX,
            y: 0,
          },
          to: {
            x: $tileMap.width,
            y: offsetY,
          },
        }),
      )
    } else if (offsetY < 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: offsetX,
            y: $tileMap.height + offsetY,
          },
          to: {
            x: $tileMap.width,
            y: $tileMap.height,
          },
        }),
      )
    }

    if (offsetX > 0 && offsetY > 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: 0,
            y: 0,
          },
          to: {
            x: offsetX,
            y: offsetY,
          },
        }),
      )
    } else if (offsetX < 0 && offsetY < 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: $tileMap.width + offsetX,
            y: $tileMap.height + offsetY,
          },
          to: {
            x: $tileMap.width,
            y: $tileMap.height,
          },
        }),
      )
    } else if (offsetX < 0 && offsetY > 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: $tileMap.width + offsetX,
            y: 0,
          },
          to: {
            x: $tileMap.width,
            y: offsetY,
          },
        }),
      )
    } else if (offsetX > 0 && offsetY < 0) {
      renderArea(
        convertCanvasFromToAreaToCellFromToArea({
          from: {
            x: 0,
            y: $tileMap.height + offsetY,
          },
          to: {
            x: offsetX,
            y: $tileMap.height,
          },
        }),
      )
    }

    updateEntities()
  }
  previousTileMapViewport = tileMapViewport
})

function convertCanvasFromToAreaToCellFromToArea(
  canvasFromToArea: FromToArea,
): CellFromToArea {
  return {
    from: convertCanvasPositionToCellPosition(canvasFromToArea.from),
    to: convertCanvasPositionToCellPosition(canvasFromToArea.to),
  }
}

tileMapViewport.subscribe(updateSelectedArea)
app.scale.subscribe(updateSelectedArea)

function saveSelectedTileSetTiles(selectedTileSetTiles: Area | null): void {
  localStorage.setItem(
    "selectedTileSetTiles",
    JSON.stringify(selectedTileSetTiles),
  )
}

app.selectedTileSetTiles.subscribe(saveSelectedTileSetTiles)

function renderTileMap() {
  const area = {
    from: convertCanvasPositionToCellPosition({ x: 0, y: 0 }),
    to: convertCanvasPositionToCellPosition({
      x: $tileMap.width - 1,
      y: $tileMap.height - 1,
    }),
  }

  renderArea(area)
}

function renderArea(area: CellFromToArea): void {
  const position = convertCellPositionToCanvasPosition(area.from)
  const scaledTileSize = determineScaledTileSize(app.scale.value)
  const width = (area.to.column - area.from.column + 1) * scaledTileSize.width
  const height = (area.to.row - area.from.row + 1) * scaledTileSize.height

  context.clearRect(position.x, position.y, width, height)

  for (let row = area.from.row; row <= area.to.row; row++) {
    for (let column = area.from.column; column <= area.to.column; column++) {
      renderTile({ row, column })
    }
  }

  renderGridOnArea(convertFromToAreaToCellArea(area))
}

function renderGrid() {
  const area = convertFromToAreaToCellArea({
    from: convertCanvasPositionToCellPosition({ x: 0, y: 0 }),
    to: convertCanvasPositionToCellPosition({
      x: $tileMap.width - 1,
      y: $tileMap.height - 1,
    }),
  })
  renderGridOnArea(area)
}

function renderGridOnArea(area: CellArea): void {
  if (isGridShown) {
    const defaultLineWidth = 2
    const veryZoomedOutLineWidth = 1
    context.fillStyle = "black"

    const scaledTileSize = determineScaledTileSize(app.scale.value)
    const { x: fromX, y: fromY } = convertCellPositionToCanvasPosition(area)
    const width = Number(area.width) * scaledTileSize.width
    const height = Number(area.height) * scaledTileSize.height
    const toX = fromX + width - 1
    const toY = fromY + height - 1
    for (let y = fromY; y <= toY + 1; y += scaledTileSize.height) {
      if (scaledTileSize.height < 16) {
        context.fillRect(fromX, y, width, veryZoomedOutLineWidth)
      } else {
        context.fillRect(
          fromX,
          y - defaultLineWidth / 2,
          width,
          defaultLineWidth,
        )
      }
    }
    for (let x = fromX; x <= toX + 1; x += scaledTileSize.width) {
      if (scaledTileSize.width < 16) {
        context.fillRect(x, fromY, veryZoomedOutLineWidth, height)
      } else {
        context.fillRect(
          x - defaultLineWidth / 2,
          fromY,
          defaultLineWidth,
          height,
        )
      }
    }
  }
}

function debounce(fn: Function, delay = 1000) {
  let handler: NodeJS.Timeout | null = null
  return function (...args: any[]) {
    if (handler) {
      clearTimeout(handler)
    }
    handler = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

const types: FileType[] = [
  {
    description: "Compressed map",
    accept: {
      "application/gzip": [".json.gz"],
    },
  },
  {
    description: "Map",
    accept: {
      "text/json": [".json"],
    },
  },
]

const ABORT_ERROR = 20

window.electronAPI.onRequestMap(function () {
  window.electronAPI.map(app.tileMap.value)
})

window.electronAPI.onNewMap(function () {
  createNewTileMap()
})

function createReadableTileMapStream(): ReadableStream {
  return createReadableStream(
    JSON.stringify(app.tileMap.value),
    "application/json",
  )
}

function createReadableStream(content: string, type: string): ReadableStream {
  return new Blob([content], {
    type,
  }).stream()
}

function createCompressedTileMapStream(): ReadableStream {
  const contentStream = createReadableTileMapStream()
  const compressedStream = contentStream.pipeThrough(
    new CompressionStream("gzip"),
  )
  return compressedStream
}

function createDecompressedStream(stream: ReadableStream): ReadableStream {
  return stream.pipeThrough(new DecompressionStream("gzip"))
}

async function decompressBlob(compressedContent: Blob): Promise<string> {
  const compressedStream = compressedContent.stream()
  const decompressedStream = createDecompressedStream(compressedStream)
  return await readReadableStreamAsUTF8(decompressedStream)
}

async function readReadableStreamAsUTF8(
  stream: ReadableStream,
): Promise<string> {
  const reader = stream.getReader()
  let content = ""
  let result = await reader.read()
  const textDecoder = new TextDecoder()
  while (!result.done) {
    content += textDecoder.decode(result.value)
    result = await reader.read()
  }
  return content
}

async function readReadableStreamAsGzipBlob(
  stream: ReadableStream,
): Promise<Blob> {
  const reader = stream.getReader()
  let chunks = []
  let result = await reader.read()
  while (!result.done) {
    chunks.push(result.value)
    result = await reader.read()
  }
  return new Blob(chunks, { type: "application/gzip" })
}

window.electronAPI.onUndo(undo)
window.electronAPI.onCut(cut)
window.electronAPI.onCopy(copy)
window.electronAPI.onPaste(startPasting)

window.addEventListener("keydown", function (event) {
  if (areShortcutsEnabled && !isModalOpen) {
    if (isOnlyCtrlOrCmdModifierKeyPressed(event) && event.key === "c") {
      event.preventDefault()
      copy()
    } else if (isOnlyCtrlOrCmdModifierKeyPressed(event) && event.key === "x") {
      event.preventDefault()
      cut()
    } else if (isOnlyCtrlOrCmdModifierKeyPressed(event) && event.key === "v") {
      event.preventDefault()
      startPasting()
    } else if (
      isOnlyCtrlOrCmdModifierKeyPressed(event) &&
      event.code === "ArrowUp"
    ) {
      event.preventDefault()
      app.incrementLevel()
    } else if (
      isOnlyCtrlOrCmdModifierKeyPressed(event) &&
      event.code === "ArrowDown"
    ) {
      event.preventDefault()
      app.decrementLevel()
    } else if (isNoModifierKeyPressed(event) && event.key === "f") {
      event.preventDefault()
      activateFillTool()
    } else if (isNoModifierKeyPressed(event) && event.key === "p") {
      event.preventDefault()
      activatePenTool()
    } else if (isNoModifierKeyPressed(event) && event.key === "a") {
      event.preventDefault()
      activateAreaTool()
    } else if (isNoModifierKeyPressed(event) && event.key === "s") {
      event.preventDefault()
      activateSelectTool()
    } else if (isNoModifierKeyPressed(event) && event.key === "g") {
      event.preventDefault()
      toggleGrid()
    } else if (isNoModifierKeyPressed(event) && event.key === "c") {
      event.preventDefault()
      toggleRenderOnlyCurrentLevel()
    } else if (event.code === "Escape") {
      if (isInPasteMode) {
        event.preventDefault()
        isInPasteMode = false
        renderTileMap()
      }
    } else if (isNoModifierKeyPressed(event) && event.code === "Space") {
      event.preventDefault()
      if (!app.isDragModeEnabled.value) {
        app.isDragModeEnabled.next(true)
      }
    } else if (
      isNoModifierKeyPressed(event) &&
      (event.code === "Backspace" || event.code === "Delete")
    ) {
      removeTiles()
    } else if (
      isCtrlOrCmdModifierKeyPressed(event) &&
      event.code === "Digit0"
    ) {
      event.preventDefault()
      app.resetZoom()
      updateEntityPreview()
    } else if (isCtrlOrCmdModifierKeyPressed(event) && event.key === "+") {
      event.preventDefault()
      app.zoomIn()
      updateEntityPreview()
    } else if (isCtrlOrCmdModifierKeyPressed(event) && event.key === "-") {
      event.preventDefault()
      app.zoomOut()
      updateEntityPreview()
    }
  }
})

$tileMap.addEventListener("wheel", function (event) {
  if (isCtrlOrCmdModifierKeyPressed(event)) {
    const deltaY = event.deltaY
    if (deltaY !== 0) {
      event.preventDefault()
      if (deltaY < 0) {
        app.zoomIn()
      } else {
        app.zoomOut()
      }
      updateEntities()
      updateEntityPreview()
    }
  }
})

function updateEntities() {
  const entities = $entities.children
  for (let index = 0; index < app.tileMap.value.entities.length; index++) {
    const entity = app.tileMap.value.entities[index]
    const $entity = entities[index] as HTMLDivElement

    const scaledTileSize = determineScaledTileSize(app.scale.value)
    const edge = Math.round(app.scale.value * 2)
    $entity.style.width = scaledTileSize.width - 2 * edge + "px"
    $entity.style.height = scaledTileSize.height - 2 * edge + "px"
    $entity.style.transform = `translate(${edge}px, ${edge}px)`

    const position = convertCellPositionToCanvasPosition(entity)
    $entity.style.left = `${position.x}px`
    $entity.style.top = `${position.y}px`
  }
}

function updateEntityPreview() {
  const scaledTileSize = determineScaledTileSize(app.scale.value)
  const edge = Math.round(app.scale.value * 2)
  $entityPreview.style.width = scaledTileSize.width - 2 * edge + "px"
  $entityPreview.style.height = scaledTileSize.height - 2 * edge + "px"
  $entityPreview.style.transform = `translate(${edge}px, ${edge}px)`

  const position = convertCellPositionToCanvasPosition({
    row: determineRowFromCoordinate(lastPointerPosition!.y),
    column: determineColumnFromCoordinate(lastPointerPosition!.x),
  })
  $entityPreview.style.left = `${position.x}px`
  $entityPreview.style.top = `${position.y}px`
}

app.isDragModeEnabled.subscribe((isDragModeEnabled) => {
  if (isDragModeEnabled) {
    $tileMap.classList.add("tile-map--dragging")
    removePreview()
  } else {
    $tileMap.classList.remove("tile-map--dragging")
  }
})

window.addEventListener("keyup", function (event) {
  if (event.code === "Space") {
    event.preventDefault()
    app.isDragModeEnabled.next(false)
  }
})

const isOnMac = navigator.platform.indexOf("Mac") === 0

if (isOnMac) {
  const elementsWithShortcutInText = [
    document.getElementById("showNewTileMapDialogButton") as HTMLAnchorElement,
    document.getElementById("importFromFile") as HTMLAnchorElement,
    document.getElementById("exportToFile") as HTMLAnchorElement,
    document.getElementById("undo") as HTMLAnchorElement,
  ]

  elementsWithShortcutInText.forEach((element) => {
    if (element.textContent) {
      element.textContent = element.textContent.replace(/Ctrl/g, "Cmd")
    }
  })
}

function isOnlyCtrlOrCmdModifierKeyPressed(event: KeyboardEvent) {
  return (
    isCtrlOrCmdModifierKeyPressed(event) && !event.shiftKey && !event.altKey
  )
}

function isOnlyCtrlOrCmdAndAltModifierKeyPressed(event: KeyboardEvent) {
  return isCtrlOrCmdModifierKeyPressed(event) && !event.shiftKey && event.altKey
}

function isCtrlOrCmdModifierKeyPressed(event: KeyboardEvent | WheelEvent) {
  return isOnMac ? event.metaKey : event.ctrlKey
}

function isNoModifierKeyPressed(event: KeyboardEvent) {
  return !event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey
}

function undo() {
  const lastBackup = app.undo()
  if (lastBackup) {
    renderTileMap()
    saveTileMap()
  }
}

let copiedTiles: TileLayer | TileLayer[] | null = null
let copiedArea: CellFromToArea | null = null
let hasBeenCopiedForOneLevel: boolean | null = null
let isInPasteMode: boolean = false

function copy() {
  if (app.activeTool.value === "selection") {
    const selectedArea = retrieveSelectedArea()
    if (selectedArea) {
      copiedArea = selectedArea
      if (renderOnlyCurrentLevel) {
        copiedTiles =
          app.tileMap.value.tiles[app.level.value].retrieveArea(copiedArea)
        hasBeenCopiedForOneLevel = true
      } else {
        copiedTiles = new Array(app.tileMap.value.tiles.length)
        for (let level = 0; level < app.tileMap.value.tiles.length; level++) {
          copiedTiles[level] =
            app.tileMap.value.tiles[level].retrieveArea(copiedArea)
        }
        hasBeenCopiedForOneLevel = false
      }
    }
  }
}

function removeTiles(): void {
  const selectedArea = retrieveSelectedArea()
  if (selectedArea) {
    if (renderOnlyCurrentLevel) {
      removeTilesOnCurrentLevel(
        app.tileMap.value.tiles[app.level.value],
        convertFromToAreaToCellArea(selectedArea),
      )
    } else {
      removeTilesOnAllLevels(
        app.tileMap.value.tiles,
        convertFromToAreaToCellArea(selectedArea),
      )
    }
  }
  renderTileMap()
  saveTileMap()
}

function cut() {
  if (app.activeTool.value === "selection") {
    copy()
    app.backUpMap()
    removeTiles()
  }
}

function convertFromToAreaToCellArea(fromToArea: CellFromToArea): CellArea {
  return {
    row: fromToArea.from.row,
    column: fromToArea.from.column,
    height: fromToArea.to.row - fromToArea.from.row + 1,
    width: fromToArea.to.column - fromToArea.from.column + 1,
  }
}

function retrieveSelectedArea(): CellAreaFromTo | null {
  if (selectedTilesInTileMap) {
    return {
      from: {
        row: selectedTilesInTileMap.row,
        column: selectedTilesInTileMap.column,
      },
      to: {
        row: selectedTilesInTileMap.row + selectedTilesInTileMap.height - 1,
        column:
          selectedTilesInTileMap.column + selectedTilesInTileMap.width - 1,
      },
    }
  } else {
    return null
  }
}

function removeTilesOnAllLevels(tileLayers: TileLayer[], area: CellArea): void {
  for (let level = 0; level < tileLayers.length; level++) {
    removeTilesOnCurrentLevel(tileLayers[level], area)
  }
}

function removeTilesOnCurrentLevel(tileLayer: TileLayer, area: CellArea): void {
  for (let row = area.row; row < area.row + area.height; row++) {
    for (
      let column = area.column;
      column < area.column + area.width;
      column++
    ) {
      tileLayer.removeTile({ row, column })
    }
  }
}

function startPasting() {
  if (copiedTiles && copiedArea) {
    isInPasteMode = true

    previewPaste()
  }
}

function paste(): void {
  app.backUpMap()

  doSomethingWithCopiedTiles(function ({ row, column }, copiedTile) {
    if (hasBeenCopiedForOneLevel) {
      if (copiedTile) {
        setTile({ row, column }, copiedTile as Tile, app.level.value)
      }
    } else {
      app.tileMap.value.setMultiLayerTile(
        { row, column },
        copiedTile as MultiLayerTile,
      )
    }
  })

  isInPasteMode = false
  renderTileMap()
  saveTileMap()
}

function previewPaste() {
  const previousPreviewTiles = app.previewTiles.value
  if (lastPointerPosition) {
    const numberOfRowsCut = copiedArea!.to.row - copiedArea!.from.row + 1
    const numberOfColumnsCut =
      copiedArea!.to.column - copiedArea!.from.column + 1

    const fromRow =
      determineRowFromCoordinate(lastPointerPosition!.y) -
      (Math.ceil(numberOfRowsCut / 2) - 1)
    const fromColumn =
      determineColumnFromCoordinate(lastPointerPosition!.x) -
      (Math.ceil(numberOfColumnsCut / 2) - 1)

    const previewTiles = {
      row: fromRow,
      column: fromColumn,
      width: numberOfColumnsCut,
      height: numberOfRowsCut,
    }
    app.previewTiles.next(previewTiles)
    if (
      !previousPreviewTiles ||
      areCellAreasDifferent(previousPreviewTiles, previewTiles)
    ) {
      doSomethingWithCopiedTiles(function (
        position: CellPosition,
        cutTile: MultiLayerTile | Tile | null,
      ) {
        if (hasBeenCopiedForOneLevel) {
          const replacements: MultiLayerTile = []
          replacements[app.level.value] = cutTile as Tile | null
          renderTile(position, replacements)
        } else {
          renderTile(position, cutTile as MultiLayerTile)
        }
      })

      renderGridOnArea({
        row: fromRow,
        column: fromColumn,
        width: numberOfColumnsCut,
        height: numberOfRowsCut,
      })
    }
  }
}

function removePreview(): void {
  if (app.previewTiles.value) {
    removePreviewTiles(app.previewTiles.value)
    app.previewTiles.next(null)
  }
}

function removePreviewTiles(area: CellArea): void {
  renderTiles(area)
  renderGridOnArea(area)
}

function doSomethingWithCopiedTiles(
  fn: (position: CellPosition, tile: Tile | MultiLayerTile | null) => void,
) {
  const numberOfRowsCut = copiedArea!.to.row - copiedArea!.from.row + 1
  const numberOfColumnsCut = copiedArea!.to.column - copiedArea!.from.column + 1
  const fromRow =
    determineRowFromCoordinate(lastPointerPosition!.y) -
    (Math.ceil(numberOfRowsCut / 2) - 1)
  const fromColumn =
    determineColumnFromCoordinate(lastPointerPosition!.x) -
    (Math.ceil(numberOfColumnsCut / 2) - 1)
  for (let rowOffset = 0; rowOffset < numberOfRowsCut; rowOffset++) {
    for (
      let columnOffset = 0;
      columnOffset < numberOfColumnsCut;
      columnOffset++
    ) {
      let copiedTile
      if (hasBeenCopiedForOneLevel) {
        copiedTile = (copiedTiles as TileLayer).retrieveTile({
          row: rowOffset,
          column: columnOffset,
        })
      } else {
        copiedTile = new Array(
          (copiedTiles as TileLayer[]).length,
        ) as MultiLayerTile
        for (
          let level = 0;
          level < (copiedTiles as TileLayer[]).length;
          level++
        ) {
          copiedTile[level] = (copiedTiles as TileLayer[])[level].retrieveTile({
            row: rowOffset,
            column: columnOffset,
          })
        }
      }

      const row = fromRow + rowOffset
      const column = fromColumn + columnOffset

      fn({ row, column }, copiedTile)
    }
  }
}

function determineRowFromCoordinate(y: number): number {
  const scaledTileHeight = app.scale.value * app.tileMap.value.tileSize.height
  return (
    adjustToStep(tileMapViewport.value.y + Math.round(y), scaledTileHeight) /
    scaledTileHeight
  )
}

function determineColumnFromCoordinate(x: number): number {
  const scaledTileSize = determineScaledTileSize(app.scale.value)
  return (
    adjustToStep(
      tileMapViewport.value.x + Math.round(x),
      scaledTileSize.width,
    ) / scaledTileSize.width
  )
}

async function loadTileSet(): Promise<TileSet> {
  return new Promise(async (resolve) => {
    let fileHandles
    try {
      fileHandles = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        types: [
          {
            description: "Image",
            accept: {
              "image/*": [
                ".apng",
                ".avif",
                ".gif",
                ".jpg",
                ".jpeg",
                ".jfif",
                ".pjpeg",
                ".pjp",
                ".png",
                ".svg",
                ".webp",
                ".bmp",
                ".tif",
                ".tiff",
              ],
            },
          },
        ],
      })
    } catch (error: any) {
      if (error.code !== ABORT_ERROR) {
        throw error
      }
    }
    if (fileHandles) {
      const fileHandle = fileHandles[0]
      const file = await fileHandle.getFile()
      const fileReader = new FileReader()
      fileReader.onloadend = function () {
        const url = fileReader.result as string
        const tileSet = {
          name: fileHandle.name,
          content: url,
        }
        resolve(tileSet)
      }
      fileReader.readAsDataURL(file)
    }
  })
}

{
  const $addTileSet = document.querySelector("#addTileSet") as HTMLButtonElement
  $addTileSet.addEventListener("click", function () {
    showAddTileSetDialog()
  })
}

async function showAddTileSetDialog() {
  const tileSet = await loadTileSet()
  const id = addTileSet(tileSet)
  selectTileSet(id)
  saveTileMap()
}

function addTileSet(tileSet: TileSet) {
  const id = determineNextID(app.tileMap.value.tileSets)
  loadTileSetAsImage(id, tileSet).then(renderTileMap)
  // TODO: Make tileSets reactive
  app.tileMap.value.tileSets[id] = tileSet
  addOptionToTileSetSelect(id, tileSet)
  return id
}

function determineNextID(tileSets: Record<number, TileSet>) {
  return Math.max(...Object.keys(tileSets).map(Number)) + 1
}

function selectTileSet(id: number): void {
  app.selectedTileSet.next(id)
  $tileSetSelect.value = String(id)
  const tileSet = app.tileMap.value.tileSets[id]
  $tileSet.src = tileSet.content
  localStorage.setItem("selectedTileSet", String(id))
}

function retrieveSelectedTileSetID() {
  return app.selectedTileSet.value
}

$tileSetSelect.addEventListener("change", function () {
  const selectedTileSetID = Number($tileSetSelect.value)
  if (selectedTileSetID !== retrieveSelectedTileSetID()) {
    selectTileSet(selectedTileSetID)
    selectTileSetTiles(null)
  }
})

{
  const $removeTileSet = document.querySelector(
    "#removeTileSet",
  ) as HTMLButtonElement
  $removeTileSet.addEventListener("click", function () {
    removeTileSet(Number($tileSetSelect.value))
  })
}

function removeTileSet(id: number): void {
  delete app.tileMap.value.tileSets[id]
  ;(
    $tileSetSelect.querySelector(`option[value="${id}"]`) as HTMLOptionElement
  ).remove()
  selectTileSet(parseInt($tileSetSelect.value, 10))
  saveTileMap()
}

{
  const $editTileSetModal = document.querySelector(
    "#editTileSetModal",
  ) as HTMLDivElement
  const editTileSetModal = new bootstrap.Modal($editTileSetModal)
  const $showEditTileSetDialogButton = document.querySelector(
    "#showEditTileSetDialogButton",
  ) as HTMLButtonElement
  $showEditTileSetDialogButton.addEventListener("click", function () {
    editTileSetModal.show()
  })
  $editTileSetModal.addEventListener("show.bs.modal", function () {
    const id = Number($tileSetSelect.value)
    const tileSet = app.tileMap.value.tileSets[id]
    ;(
      $editTileSetModal.querySelector("#editTileSetName") as HTMLInputElement
    ).value = tileSet.name
  })

  const $editTileSetForm = $editTileSetModal.querySelector(
    "#editTileSetForm",
  ) as HTMLFormElement
  $editTileSetForm.addEventListener("submit", function (event) {
    event.preventDefault()
    const id = Number($tileSetSelect.value)
    const tileSet = app.tileMap.value.tileSets[id]
    const name = (
      $editTileSetModal.querySelector("#editTileSetName") as HTMLInputElement
    ).value
    tileSet.name = name
    ;(
      $tileSetSelect.querySelector(`option[value="${id}"]`) as HTMLOptionElement
    ).textContent = name
    const fileReader = new FileReader()
    fileReader.onloadend = function () {
      tileSet.content = fileReader.result as string
      $tileSet.src = tileSet.content
      editTileSetModal.hide()
      saveTileMap()
    }
    const file = (
      $editTileSetModal.querySelector("#editTileSetFile") as HTMLInputElement
    ).files![0]
    fileReader.readAsDataURL(file)
  })
}

{
  document.body.addEventListener("shown.bs.modal", function () {
    isModalOpen = true
  })

  document.body.addEventListener("hidden.bs.modal", function () {
    isModalOpen = false
  })
}

let previousScale: number | null = null

app.scale.subscribe(function (scale) {
  if (previousScale) {
    adjustTileMapViewportSoThatTheMousePointerIsOnTheSameTilePositionAsBeforeZooming(
      previousScale,
      scale,
    )
  }
  renderTileMap()
  previousScale = scale
})

function adjustTileMapViewportSoThatTheMousePointerIsOnTheSameTilePositionAsBeforeZooming(
  scaleBeforeZoom: number,
  scaleAfterZoom: number,
): void {
  if (lastPointerPosition) {
    const scaledTileSizeBeforeZoom = determineScaledTileSize(scaleBeforeZoom)
    const x = tileMapViewport.value.x + Math.round(lastPointerPosition.x)
    const y = tileMapViewport.value.y + Math.round(lastPointerPosition.y)
    const offsetBeforeZoom = {
      x: x - adjustToStep(x, scaledTileSizeBeforeZoom.width),
      y: y - adjustToStep(y, scaledTileSizeBeforeZoom.height),
    }
    const offsetBeforeZoomPercentual = {
      x: offsetBeforeZoom.x / scaledTileSizeBeforeZoom.width,
      y: offsetBeforeZoom.y / scaledTileSizeBeforeZoom.height,
    }
    const scaledTileSizeAfterZoom = determineScaledTileSize(scaleAfterZoom)
    const offsetAfterZoom = {
      x: offsetBeforeZoomPercentual.x * scaledTileSizeAfterZoom.width,
      y: offsetBeforeZoomPercentual.y * scaledTileSizeAfterZoom.height,
    }

    const cellPosition = convertCanvasPositionToCellPosition(
      lastPointerPosition,
      scaleBeforeZoom,
    )
    const cellCanvasPositionBeforeZoom = addPositions(
      convertCellPositionToCanvasPosition(cellPosition, scaleBeforeZoom),
      offsetBeforeZoom,
    )
    const cellCanvasPositionAfterZoom = addPositions(
      convertCellPositionToCanvasPosition(cellPosition, scaleAfterZoom),
      offsetAfterZoom,
    )

    tileMapViewport.next({
      x:
        tileMapViewport.value.x +
        Math.round(
          cellCanvasPositionAfterZoom.x - cellCanvasPositionBeforeZoom.x,
        ),
      y:
        tileMapViewport.value.y +
        Math.round(
          cellCanvasPositionAfterZoom.y - cellCanvasPositionBeforeZoom.y,
        ),
    })
  }
}

let previousPreviewTiles: CellArea | null = null
app.previewTiles.subscribe(function (previewTiles) {
  if (previousPreviewTiles) {
    if (
      previousPreviewTiles &&
      (!previewTiles ||
        areCellAreasDifferent(previousPreviewTiles, previewTiles))
    ) {
      removePreviewTiles(previousPreviewTiles)
    }
  }

  previousPreviewTiles = previewTiles
})

{
  const play = document.getElementById("play")
  play.addEventListener("click", function () {
    startGame()
  })
}

function startGame() {}

window.addEventListener("focusin", function (event) {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    areShortcutsEnabled = false
  }
})

window.addEventListener("focusout", function (event) {
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    areShortcutsEnabled = true
  }
})
