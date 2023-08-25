import { intersect, polygonArea } from './polygonIntersection'
import { TILE_WIDTH, TILE_HEIGHT } from './config.js'

const TILE_AREA = TILE_WIDTH * TILE_HEIGHT

export function makeRiver(tileMap, river) {
  const riverPolygon = makeRiverPolygon(river)
  for (let y = 0; y < 16 * TILE_HEIGHT; y += TILE_HEIGHT) {
    for (let x = 0; x < 16 * TILE_WIDTH; x += TILE_WIDTH) {
      const tile = { x, y }
      if (doesIntersect50PercentOrMore(tile, riverPolygon)) {
        tileMap.tile('water.png', x, y)
      }
    }
  }
}

function makeRiverPolygon(river) {
  const angle = Math.atan2(river.to.y - river.from.y, river.to.x - river.from.x)
  const riverPolygon = [
    {
      x:
        river.from.x +
        0.5 * river.width * Math.cos(angle + convertDegreeToRadian(90)),
      y:
        river.from.y +
        0.5 * river.width * Math.sin(angle + convertDegreeToRadian(90)),
    },
    {
      x:
        river.from.x +
        0.5 * river.width * Math.cos(angle - convertDegreeToRadian(90)),
      y:
        river.from.y +
        0.5 * river.width * Math.sin(angle - convertDegreeToRadian(90)),
    },
    {
      x:
        river.to.x +
        0.5 * river.width * Math.cos(angle - convertDegreeToRadian(90)),
      y:
        river.to.y +
        0.5 * river.width * Math.sin(angle - convertDegreeToRadian(90)),
    },
    {
      x:
        river.to.x +
        0.5 * river.width * Math.cos(angle + convertDegreeToRadian(90)),
      y:
        river.to.y +
        0.5 * river.width * Math.sin(angle + convertDegreeToRadian(90)),
    },
  ]
  return riverPolygon
}

function doesIntersect50PercentOrMore(tile, riverPolygon) {
  const tilePolygon = [
    {
      x: tile.x,
      y: tile.y,
    },
    {
      x: tile.x + TILE_WIDTH,
      y: tile.y,
    },
    {
      x: tile.x + TILE_WIDTH,
      y: tile.y + TILE_HEIGHT,
    },
    {
      x: tile.x,
      y: tile.y + TILE_HEIGHT,
    },
  ]
  const intersectionPolygons = intersect(tilePolygon, riverPolygon)
  return sum(intersectionPolygons.map(polygonArea)) >= 0.5 * TILE_AREA
}

function sum(values) {
  return values.reduce(add, 0)
}

function add(a, b) {
  return a + b
}

function convertDegreeToRadian(value) {
  return ((Math.PI * 2) / 360) * value
}
