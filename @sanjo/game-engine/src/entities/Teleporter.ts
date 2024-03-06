class Teleporter {
  onOver() {}
}

interface Location {
  map: any
  x: bigint
  y: bigint
}

function teleport(entity: any, location: Location): Promise<void> {}
