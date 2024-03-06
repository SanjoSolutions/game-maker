class Teleporter {
  onOver() {}
}

interface Location {
  map: any
  x: number
  y: number
}

function teleport(entity: any, location: Location): Promise<void> {}
