export interface IEntity {
  row: number
  column: number
}

export class Entity {
  row: number
  column: number

  constructor(row: number, column: number) {
    this.row = row
    this.column = column
  }
}
