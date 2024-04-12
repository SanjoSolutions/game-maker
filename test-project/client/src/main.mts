import { Database, Direction, Game as GameBase } from "@sanjo/game-engine"
import { Location } from "@sanjo/game-engine/Location.js"
import { CharacterWithOpenRTPSpriteSheet } from "@sanjo/game-engine/CharacterWithOpenRTPSpriteSheet.js"
import {
  width as characterWidth,
  height as characterHeight,
} from "@sanjo/game-engine/createOpenRTPSpriteSheet.js"
import { TextMessage } from "@sanjo/game-engine/TextMessage.js"
import { Option } from "@sanjo/game-engine/Dialog.js"
import "@sanjo/game-engine/TextMessage.css"
import "@sanjo/game-engine/Dialog.css"
import { Any } from "test-project-shared/protos/google/protobuf/any.js"
import { RequestMoneyFromMentor } from "test-project-shared/protos/RequestMoneyFromMentor.js"
import { RequestMoneyFromMentorResponse } from "test-project-shared/protos/RequestMoneyFromMentorResponse.js"
import { Error as ErrorMessage } from "test-project-shared/protos/Error.js"
import { Subject, find, firstValueFrom } from "rxjs"
import { SynchronizedState } from "test-project/shared/protos/SynchronizedState.js"
import { IGameServer } from "@sanjo/game-engine/IGameServer.js"

if (window.IS_DEVELOPMENT) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}

class GameServer implements IGameServer {
  #webSocket: WebSocket | null = null
  stream: Subject<any> = new Subject<any>()

  async connect(): Promise<void> {
    return new Promise((resolve) => {
      this.#webSocket = new WebSocket("ws://localhost:8080")

      this.#webSocket.onerror = console.error

      this.#webSocket.onopen = () => {
        resolve()
      }

      this.#webSocket.onmessage = async (event) => {
        const arrayBuffer = await event.data.arrayBuffer()
        const deserialized = Any.fromBinary(new Uint8Array(arrayBuffer))
        this.stream.next(deserialized)
      }
    })
  }

  async requestMoneyFromMentor(): Promise<
    RequestMoneyFromMentorResponse | ErrorMessage
  > {
    const message = RequestMoneyFromMentor.create()
    this.#webSocket!.send(
      Any.toBinary(Any.pack(message, RequestMoneyFromMentor)),
    )
    const response = await firstValueFrom(
      this.stream.pipe(
        find(
          (message) =>
            Any.contains(message, RequestMoneyFromMentorResponse) ||
            Any.contains(message, ErrorMessage),
        ),
      ),
    )
    return response
  }
}

class Game<T extends IGameServer>
  extends GameBase<T>
  implements SynchronizedState
{
  money: number = 0
  hasMentorGivenMoney: boolean = false

  constructor(server: T, database: Database) {
    super(server, database)
    server.stream.subscribe((message) => {
      if (Any.contains(message, SynchronizedState)) {
        const stateFromServer = Any.unpack(message, SynchronizedState)
        Object.assign(this, stateFromServer)
        console.log("Money: " + this.money)
        console.log("hasMentorGivenMoney", this.hasMentorGivenMoney)
      }
    })
  }

  async requestMoneyFromMentor(): Promise<boolean> {
    const response = await this.server.requestMoneyFromMentor()
    if (Any.contains(response, ErrorMessage)) {
      const error = Any.unpack(response, ErrorMessage)
      console.error(error.message)
      return false
    } else if (Any.contains(response, RequestMoneyFromMentorResponse)) {
      const updatedState = Any.unpack(response, RequestMoneyFromMentorResponse)
      this.money = updatedState.money
      this.hasMentorGivenMoney = updatedState.hasMentorGivenMoney
      return true
    } else {
      // For TypeScript
      return false
    }
  }
}

async function main() {
  const server = new GameServer()
  const database = new Database()
  await database.open()
  const game = new Game(server, database)
  await server.connect()
  document.body.appendChild(game.app.view as any)

  await game.loadMap("maps/teleporter_test2.map.gz")
  game.map!.findEntityByID("teleporter")!.onOver.subscribe(async function () {
    await game.teleport(
      game.man!,
      new Location("maps/map1.map.gz", 10.5 * 32, 10.5 * 32),
    )
  })
  await game.initialize()
  game.man!.y = 6 * 32
  game.layers[3].sortChildren()
  game.updateViewport()

  {
    const npc = new CharacterWithOpenRTPSpriteSheet(
      "char-sets/People1.png",
      game.app.stage,
      {
        x: 6 * characterWidth,
        y: 4 * characterHeight,
      },
    )
    npc.x = 5 * 32
    npc.y = 5 * 32
    await npc.loadSpriteSheet()
    ;(npc.sprite as any).canInteractWith = function () {
      return true
    }
    ;(npc.sprite as any).interact = async function () {
      const continueDialog = await TextMessage.showMessageFrom("Mentor", "Hi!")
      if (continueDialog) {
        const requireMoneyOption = new Option(
          "I require some money for the restaurant",
        )
        const options = []
        if (!game.hasMentorGivenMoney) {
          options.push(requireMoneyOption)
        }
        options.push(new Option("b"))
        const option = await game.showOptions(options)
        if (option === requireMoneyOption) {
          if (await game.requestMoneyFromMentor()) {
            await TextMessage.showMessageFrom("Mentor", "Here are 50 gold. ;-)")
          }
          console.log("Money: " + game.money)
        }
      }
    }
    game.layers[3].addChild(npc.sprite)
  }

  {
    const npc = new CharacterWithOpenRTPSpriteSheet(
      "char-sets/People1.png",
      game.app.stage,
      {
        x: 3 * characterWidth,
        y: 0 * characterHeight,
      },
    )
    npc.x = 7.5 * 32
    npc.y = 5 * 32
    await npc.loadSpriteSheet()
    ;(npc.sprite as any).canInteractWith = function () {
      return true
    }
    ;(npc.sprite as any).interact = async function () {
      const hasPlayerDoneContinueAction = await TextMessage.showMessageFrom(
        "Vendor",
        "What would you like to buy?",
      )
      if (hasPlayerDoneContinueAction) {
        const flourOption = new Option("Flour")
        const tomatoesOption = new Option("Tomatoes")
        const option = await game.showOptions([flourOption, tomatoesOption])
        if (option) {
          if (option === flourOption) {
            await TextMessage.showMessageFrom("Vendor", "How many packages?")
            const amount = await game.askForNumber({
              minimum: 1,
            })
            if (amount) {
              npc.direction = Direction.Right
              await game.wait(1)
              npc.direction = Direction.Down
              await game.wait(1)
              await TextMessage.showMessageFrom("Vendor", "Here you go. ;-)")
              const prices = new Map([
                [flourOption, 1],
                [tomatoesOption, 1],
              ])
              const pricePerUnit = prices.get(option)!
              const total = amount * pricePerUnit
              await TextMessage.showMessageFrom(
                "Vendor",
                `That makes ${total} €.`,
              )
              const giveMoneyOption = new Option("Give the money.")
              const notEnoughMoneyOption = new Option(
                "Oops, it seems that I don't have enough money with me.",
              )
              const payOptions = []
              if (game.money >= total) {
                payOptions.push(giveMoneyOption)
              } else {
                payOptions.push(notEnoughMoneyOption)
              }
              const payOption = await game.showOptions(payOptions)
              if (payOption === giveMoneyOption) {
                game.lowerMoneyBy(total)
                await TextMessage.showMessageFrom("Vendor", `Thanks.`)
              }
            }
          }
        }
      }
    }
    game.layers[3].addChild(npc.sprite)
  }

  window.addEventListener("keydown", function (event) {
    if (event.code === "Escape") {
      event.preventDefault()
      toggleMenu()
    }
  })

  let isMenuShown = false

  function toggleMenu(): void {
    if (isMenuShown) {
      hideMenu()
    } else {
      showMenu()
    }
  }

  function showMenu(): void {
    const menuFragment = (
      document.querySelector("#menu") as HTMLTemplateElement
    ).content.cloneNode(true) as DocumentFragment

    const menu = menuFragment.querySelector(".menu")!
    const menuContainer = menuFragment.querySelector(".menu-container")!

    menuContainer.addEventListener("click", function () {
      hideMenu()
    })

    menu.addEventListener("click", function (event) {
      event.stopPropagation()
    })

    document.body.appendChild(menuFragment)

    isMenuShown = true
  }

  function hideMenu(): void {
    document.querySelector(".menu-container")?.remove()
    isMenuShown = false
  }
}

main()
