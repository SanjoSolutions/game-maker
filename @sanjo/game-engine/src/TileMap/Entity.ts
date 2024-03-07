export interface IEntity {
  id: string | null
  row: number
  column: number
}

type OnOverCallback = () => void

export class Entity {
  id: string | null = null
  row: number
  column: number
  #onOverCallbacks: OnOverCallback[] = []

  constructor(row: number, column: number) {
    this.row = row
    this.column = column
  }

  onOver(callback: OnOverCallback): void {
    this.#onOverCallbacks.push(callback)
  }

  triggerOnOver() {
    this.#onOverCallbacks.forEach((callback) => callback())
  }
}
