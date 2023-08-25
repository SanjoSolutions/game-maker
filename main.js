import { Application, Assets, Sprite } from 'pixi.js'
import { CompositeTilemap } from '@pixi/tilemap'
import { makeRiver } from './makeRiver'
import { TILE_WIDTH, TILE_HEIGHT } from './config.js'

const mapWidth = 16 * TILE_WIDTH
const mapHeight = 16 * TILE_HEIGHT

const app = new Application({
  width: mapWidth,
  height: mapHeight,
})
export const tileMap = new CompositeTilemap()
document.body.appendChild(app.view)
app.stage.addChild(tileMap)

Assets.add('tileset', 'tileset.json')
Assets.add('man', 'man.png')
await Assets.load(['tileset', 'man'])

for (let y = 0; y < 16 * TILE_HEIGHT; y += TILE_HEIGHT) {
  for (let x = 0; x < 16 * TILE_WIDTH; x += TILE_WIDTH) {
    tileMap.tile('grass.png', x, y)
  }
}

makeRiver(tileMap, {
  width: 64,
  from: { x: 0.6 * mapWidth, y: 0 },
  to: { x: 0.7 * mapWidth, y: mapHeight },
})

const man = Sprite.from('man')
man.anchor.set(0.5, 1)
man.x = app.screen.width / 2
man.y = app.screen.height / 2
app.stage.addChild(man)

const keyStates = new Map([
  ['ArrowLeft', false],
  ['ArrowRight', false],
  ['ArrowUp', false],
  ['ArrowDown', false],
])

window.addEventListener('keydown', function (event) {
  if (keyStates.has(event.code)) {
    event.preventDefault()
    keyStates.set(event.code, true)
  }
})

window.addEventListener('keyup', function (event) {
  if (keyStates.has(event.code)) {
    keyStates.set(event.code, false)
  }
})

app.ticker.add(delta => {
  const left = keyStates.get('ArrowLeft')
  const right = keyStates.get('ArrowRight')
  const up = keyStates.get('ArrowUp')
  const down = keyStates.get('ArrowDown')
  if (left && !right) {
    man.x -= delta
  } else if (right && !left) {
    man.x += delta
  }
  if (up && !down) {
    man.y -= delta
  } else if (down && !up) {
    man.y += delta
  }
})
