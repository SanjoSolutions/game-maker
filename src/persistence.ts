import { Sprite } from 'pixi.js'
import { deserializeSprite, serializeSprite } from './serialization.js'
import type { Application } from 'pixi.js'

export async function saveState(app: Application): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction('objects', 'readwrite')
  const objectStore = transaction.objectStore('objects')
  await Promise.all(
    app.stage.children
      .filter(object => object instanceof Sprite)
      .map(object =>
        convertRequestToPromise(objectStore.add(serializeSprite(object)))
      )
  )
}

export async function loadState(app: Application) {
  const database = await openDatabase()
  const transaction = database.transaction('objects', 'readonly')
  const objectStore = transaction.objectStore('objects')
  const objects = await convertRequestToPromise(objectStore.getAll())
  for (const object of objects) {
    app.stage.addChild(deserializeSprite(object))
  }
  return objects.length >= 1
}

export async function saveObject(object: Sprite): Promise<void> {
  const database = await openDatabase()
  const transaction = database.transaction('objects', 'readwrite')
  const objectStore = transaction.objectStore('objects')
  await convertRequestToPromise(objectStore.put(serializeSprite(object)))
}

async function convertRequestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', function (event) {
      resolve(event.target!.result)
    })
    request.addEventListener('error', function () {
      reject()
    })
  })
}

async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('generative-game')
    request.onupgradeneeded = function (event) {
      const database = event.target!.result
      const objectStore = database.createObjectStore('objects', {
        keyPath: 'id',
        autoIncrement: true,
      })
    }
    request.onerror = function (event) {
      console.error(event)
      reject(event)
    }
    request.onsuccess = function (event) {
      const database = event.target!.result
      resolve(database)
    }
  })
}
