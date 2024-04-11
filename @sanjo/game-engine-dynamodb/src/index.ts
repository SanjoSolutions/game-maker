export class Database {
  async open(): Promise<void> {}

  async saveState(app: Application): Promise<void> {}

  async loadState(game: Game): Promise<boolean> {}

  async saveObject(
    object: SpriteWithId,
    transaction?: IDBTransaction,
  ): Promise<void> {}
}
