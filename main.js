import { Application, Assets, Sprite } from 'pixi.js'
import { CompositeTilemap } from '@pixi/tilemap'
import { makeRiver } from './makeRiver'
import { TILE_WIDTH, TILE_HEIGHT } from './config.js'
import { saveState, loadState, saveObject } from './persistence.js'

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
Assets.add('branch', 'sprites/branch.png')
await Assets.load(['tileset', 'man', 'tree', 'branch'])

const hasStateBeenLoaded = await loadState(app)

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

makeRivers()

let man
let objectInHand = null

if (hasStateBeenLoaded) {
  man = app.stage.children.find(object =>
    object.texture?.textureCacheIds.includes('man')
  )
} else {
  plantTrees()

  man = Sprite.from('man')
  man.anchor.set(0.5, 1)
  man.x = 0.5 * man.width + 0.5 * TILE_WIDTH
  man.y = man.height + 0.5 * TILE_HEIGHT
  app.stage.addChild(man)

  await saveState(app)
}

updateViewport()
updateManAndObjectInHandIndex()

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

window.addEventListener('keypress', function (event) {
  if (event.code === 'Space') {
    event.preventDefault()
    if (objectInHand) {
      objectInHand = null
    } else {
      const branch = findCloseByBranch()
      if (branch) {
        setObjectInHand(branch)
      }
    }
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
    updateManAndObjectInHandIndex()
  } else if (down && !up) {
    man.y += delta
    hasPositionChanged = true
    updateManAndObjectInHandIndex()
  }
  if (hasPositionChanged) {
    updateObjectInHandPosition()
    updateViewport()
    saveObject(man)
  }
})

function makeRivers() {
  for (let i = 1; i <= 10; i++) {
    makeRiver(tileMap, {
      width: generateRandomInteger(64, 128),
      from: {
        x: generateRandomInteger(0, mapWidth),
        y: generateRandomInteger(0, mapHeight),
      },
      to: {
        x: generateRandomInteger(0, mapWidth),
        y: generateRandomInteger(0, mapHeight),
      },
    })
  }
}

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
    if (Math.random() < 0.5) {
      const branch = Sprite.from('branch')
      branch.x = tree.x + 10
      branch.y = tree.y - 70
      app.stage.addChild(branch)
    }
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

function updateViewport() {
  app.stage.x = 0.5 * app.view.width - man.x
  app.stage.y = 0.5 * app.view.height - man.y
}

function updateManAndObjectInHandIndex() {
  let index = 0
  while (
    index < app.stage.children.length - 1 &&
    (app.stage.getChildAt(index) === man ||
      (objectInHand && app.stage.getChildAt(index) === objectInHand) ||
      app.stage.getChildAt(index).y <= man.y)
  ) {
    index++
  }
  app.stage.setChildIndex(man, index)
  if (objectInHand) {
    app.stage.setChildIndex(objectInHand, index + 1)
  }
}

function findCloseByBranch() {
  const close = 50
  let closestBranch = null
  let closestDistanceSoFar = null
  const manPoint = {
    x: man.x,
    y: man.y - 50,
  }
  for (const object of app.stage.children) {
    if (object.texture?.textureCacheIds?.includes('branch')) {
      const distance = calculateDistance(object, manPoint)
      if (
        (!closestBranch || distance < closestDistanceSoFar) &&
        distance <= close
      ) {
        closestDistanceSoFar = distance
        closestBranch = object
      }
    }
  }
  return closestBranch
}

function calculateDistance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function setObjectInHand(object) {
  objectInHand = object
  updateObjectInHandPosition()
}

function updateObjectInHandPosition() {
  if (objectInHand) {
    objectInHand.x = man.x + 5
    objectInHand.y = man.y - 50
    saveObject(objectInHand)
  }
}
