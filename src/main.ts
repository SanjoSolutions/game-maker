import { CompositeTilemap } from "@pixi/tilemap"
import { Assets } from "pixi.js"
import { Game, mapHeight, mapWidth } from "./game-engine/Game.js"
import { adjustXToStep } from "./game-engine/adjustXToStep.js"
import { adjustYToStep } from "./game-engine/adjustYToStep.js"
import { TILE_HEIGHT, TILE_WIDTH } from "./game-engine/config.js"
import { makeMountain } from "./game-engine/makeMountain.js"
import { makeRiver } from "./game-engine/makeRiver.js"
import { makeRivers } from "./game-engine/makeRivers.js"
import { Database } from "./game-engine/persistence.js"

async function main() {
  const database = new Database()
  await database.open()
  const game = new Game(database)
  document.body.appendChild(game.app.view as any)

  const tileMap = new CompositeTilemap()
  game.app.stage.addChild(tileMap)

  Assets.add("tileset", "tileset.json")
  Assets.add("man", "sprites/man.png")
  Assets.add("tree", "sprites/tree.png")
  Assets.add("branch", "sprites/branch.png")
  await Assets.load(["tileset", "man", "tree", "branch"])

  for (let y = 0; y < 64 * TILE_HEIGHT; y += TILE_HEIGHT) {
    for (let x = 0; x < 64 * TILE_WIDTH; x += TILE_WIDTH) {
      tileMap.tile("grass.png", x, y)
    }
  }

  makeRiver(tileMap, {
    width: 64,
    from: { x: 0.6 * mapWidth, y: 0 },
    to: { x: 0.7 * mapWidth, y: mapHeight },
  })

  makeMountain(tileMap, {
    from: {
      x: adjustXToStep(1 * TILE_WIDTH),
      y: adjustYToStep(0.6 * mapHeight),
    },
    to: {
      x: adjustXToStep(0.45 * mapWidth),
      y: adjustYToStep(0.9 * mapHeight),
    },
  })

  makeRivers(tileMap, { width: mapWidth, height: mapHeight })

  await game.load()
}

main()
