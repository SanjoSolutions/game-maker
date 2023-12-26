import {
  Assets,
  CompositeTilemap,
  Database,
  Game,
  PIXI,
  TILE_HEIGHT,
  TILE_WIDTH,
  adjustXToStep,
  adjustYToStep,
  makeMountain,
  makeRivers,
  mapHeight,
  mapWidth,
} from "@sanjo/game-engine"
import { TileMap } from "../../tilemap-editor/src/TileMap.js"

if (window.IS_DEVELOPMENT) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}

async function main() {
  const database = new Database()
  await database.open()
  const game = new Game(database)
  document.body.appendChild(game.app.view as any)

  const map = await loadMap("maps/map.json.gz")

  const tileSetToTexture = new Map<number, PIXI.Texture>()

  const tileSets = []

  for (const [index, tileSet] of Object.entries(map.tileSets)) {
    const image = await createImage(tileSet.content)
    const baseTexture = new PIXI.BaseTexture(image)
    const texture = new PIXI.Texture(baseTexture)
    tileSets.push(texture)
    tileSetToTexture.set(parseInt(index, 10), texture)
  }

  for (const level of map.tiles) {
    const tileMap = new CompositeTilemap()
    tileMap.tileset(tileSets)
    game.app.stage.addChild(tileMap)
    for (const [position, tile] of level.entries()) {
      if (tile) {
        const texture = tileSetToTexture.get(tile.tileSet)
        const x = Number(position.column) * map.tileSize.width
        const y = Number(position.row) * map.tileSize.height
        const options = {
          u: tile.x,
          v: tile.y,
          tileWidth: map.tileSize.width,
          tileHeight: map.tileSize.height,
        }
        tileMap.tile(texture, x, y, options)
      }
    }
  }

  await game.load()

  window.addEventListener("keydown", function (event) {
    if (event.code === "Escape") {
      event.preventDefault()
      toggleMenu()
    }
  })

  let isMenuShown = false

  function toggleMenu(): void {
    if (isMenuShown) {
      hideMenu()
    } else {
      showMenu()
    }
  }

  function showMenu(): void {
    const menuFragment = (
      document.querySelector("#menu") as HTMLTemplateElement
    ).content.cloneNode(true) as DocumentFragment

    const menu = menuFragment.querySelector(".menu")!
    const menuContainer = menuFragment.querySelector(".menu-container")!

    menuContainer.addEventListener("click", function () {
      hideMenu()
    })

    menu.addEventListener("click", function (event) {
      event.stopPropagation()
    })

    document.body.appendChild(menuFragment)

    isMenuShown = true
  }

  function hideMenu(): void {
    document.querySelector(".menu-container")?.remove()
    isMenuShown = false
  }
}

async function loadMap(path: string) {
  const response = await fetch(path)
  const stream = createDecompressedStream(response.body)
  const content = await readReadableStreamAsUTF8(stream)
  return parseJSONTileMap(content)
}

function createDecompressedStream(stream: ReadableStream): ReadableStream {
  return stream.pipeThrough(new DecompressionStream("gzip"))
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

function parseJSONTileMap(content: string): TileMap {
  const rawObjectTileMap = JSON.parse(content)
  return TileMap.fromRawObject(rawObjectTileMap)
}

function createImage(content: string) {
  return new Promise((resolve, onError) => {
    const image = new Image()
    image.src = content
    image.onload = function () {
      resolve(image)
    }
    image.onerror = onError
  })
}

main()
