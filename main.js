import { Application, Assets, Sprite } from 'pixi.js'
import { CompositeTilemap } from '@pixi/tilemap'
import { makeRiver } from './makeRiver'
import { TILE_WIDTH, TILE_HEIGHT } from './config.js'

const mapWidth = 64 * TILE_WIDTH
const mapHeight = 64 * TILE_HEIGHT

const app = new Application({
  resizeTo: window,
})
const tileMap = new CompositeTilemap()
document.body.appendChild(app.view)
app.stage.addChild(tileMap)

Assets.add('tileset', 'tileset.json')
Assets.add('man', 'sprites/man.png')
Assets.add('tree', 'sprites/tree.png')
await Assets.load(['tileset', 'man', 'tree'])

for (let y = 0; y < 64 * TILE_HEIGHT; y += TILE_HEIGHT) {
  for (let x = 0; x < 64 * TILE_WIDTH; x += TILE_WIDTH) {
    tileMap.tile('grass.png', x, y)
  }
}

makeRiver(tileMap, {
  width: 64,
  from: { x: 0.6 * mapWidth, y: 0 },
  to: { x: 0.7 * mapWidth, y: mapHeight },
})

makeMountain({
  from: {
    x: adjustXToStep(1 * TILE_WIDTH),
    y: adjustYToStep(0.6 * mapHeight),
  },
  to: {
    x: adjustXToStep(0.45 * mapWidth),
    y: adjustYToStep(0.9 * mapHeight),
  },
})

plantTrees()

function plantTrees() {
  const howMuchOfMapToCoverWithTrees = 0.5
  const mapArea = mapWidth * mapHeight
  const treeForArea = Sprite.from('tree')
  const treeArea = treeForArea.width * treeForArea.height
  const howMany = Math.round(
    (howMuchOfMapToCoverWithTrees * mapArea) / treeArea
  )

  const trees = new Array(howMany)
  for (let i = 1; i <= howMany; i++) {
    const tree = Sprite.from('tree')
    tree.anchor.set(0.5, 1)
    tree.x = generateRandomInteger(
      0.5 * treeForArea.width + 0.5 * TILE_WIDTH,
      mapWidth - 0.5 * treeForArea.width + 0.5 * TILE_WIDTH
    )
    tree.y = generateRandomInteger(
      treeForArea.height + 0.5 * TILE_HEIGHT,
      mapHeight - 0.5 * TILE_HEIGHT
    )
    trees[i - 1] = tree
  }
  trees.sort(compareTrees)
  for (const tree of trees) {
    app.stage.addChild(tree)
  }
}

function compareTrees(a, b) {
  return a.y - b.y
}

function generateRandomInteger(from, to) {
  return Math.floor(from + Math.random() * (to - from))
}

function adjustXToStep(x) {
  return Math.floor(x / TILE_WIDTH) * TILE_WIDTH
}

function adjustYToStep(y) {
  return Math.floor(y / TILE_HEIGHT) * TILE_HEIGHT
}

function makeMountain(mountain) {
  for (let y = mountain.from.y; y <= mountain.to.y; y += TILE_HEIGHT) {
    for (let x = mountain.from.x; x <= mountain.to.x; x += TILE_WIDTH) {
      const tileType = determineTileType(mountain, { x, y })
      tileMap.tile(tileType, x, y)
    }
  }
}

function determineTileType(mountain, { x, y }) {
  return Math.abs(x - mountain.from.x) < 1 * TILE_WIDTH ||
    Math.abs(mountain.to.x - x) < 1 * TILE_WIDTH ||
    Math.abs(mountain.to.y - y) < 1 * TILE_HEIGHT
    ? 'rock.png'
    : 'rock_top.png'
}

const man = Sprite.from('man')
man.anchor.set(0.5, 1)
man.x = 0.5 * man.width + 0.5 * TILE_WIDTH
man.y = man.height + 0.5 * TILE_HEIGHT
app.stage.addChild(man)

function updateViewport() {
  app.stage.x = 0.5 * app.view.width - man.x
  app.stage.y = 0.5 * app.view.height - man.y
}

function updateManIndex() {
  let index = 0
  while (
    index < app.stage.children.length - 1 &&
    (app.stage.getChildAt(index) === man ||
      app.stage.getChildAt(index).y <= man.y)
  ) {
    index++
  }
  app.stage.setChildIndex(man, index)
}

updateViewport()
updateManIndex()

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
  let hasPositionChanged = false
  if (left && !right) {
    man.x -= delta
    hasPositionChanged = true
  } else if (right && !left) {
    man.x += delta
    hasPositionChanged = true
  }
  if (up && !down) {
    man.y -= delta
    hasPositionChanged = true
    updateManIndex()
  } else if (down && !up) {
    man.y += delta
    hasPositionChanged = true
    updateManIndex()
  }
  if (hasPositionChanged) {
    updateViewport()
  }
})
