import { Subject } from "rxjs"

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
  onOver = new Subject()

  constructor(row: number, column: number) {
    this.row = row
    this.column = column
  }
}
