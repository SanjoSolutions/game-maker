import { Subject } from "rxjs"

export interface IEntity {
  id: string | null
  row: number
  column: number
}

export class Entity {
  id: string | null = null
  row: number
  column: number
  onEnter = new Subject()
  onOver = new Subject()

  constructor(row: number, column: number) {
    this.row = row
    this.column = column
  }
}
