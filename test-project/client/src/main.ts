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
import { find, firstValueFrom } from "rxjs"
import type { SynchronizedState } from "@sanjo/test-project-shared/protos/SynchronizedState.js"
import { Message } from "@sanjo/test-project-shared/protos/Message.js"
import { createRequestMoneyFromMentor } from "@sanjo/test-project-shared/clientServerCommunication/messageFactories.js"
import { CharacterWithOneSpriteSheet } from "@sanjo/game-engine/CharacterWithOneSpriteSheet.js"
import { GameServerAPI as GameServerAPIBase } from "@sanjo/game-engine/clientServerCommunication/GameServerAPI.js"
import { WebSocketServerConnection } from "@sanjo/game-engine/clientServerCommunication/WebSocketServerConnection.js"
import { MessageType } from "@sanjo/test-project-shared/clientServerCommunication/MessageType.js"
import type { GUID } from "@sanjo/game-engine/GUID.js"

if (window.IS_DEVELOPMENT) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}

class GameServerAPI extends GameServerAPIBase<Message> {
  async requestMoneyFromMentor(): Promise<Message | undefined> {
    this.serverConnection.outStream.next(createRequestMoneyFromMentor())
    const response = await firstValueFrom(
      this.serverConnection.inStream.pipe(
        find(
          (message) =>
            message.body.oneofKind ===
              MessageType.RequestMoneyFromMentorResponse ||
            message.body.oneofKind === MessageType.Error,
        ),
      ),
    )
    return response
  }
}

class Game extends GameBase<GameServerAPI> implements SynchronizedState {
  characterGUID: GUID = ""
  money: number = 0
  hasMentorGivenMoney: boolean = false

  constructor(server: GameServerAPI, database: Database) {
    super(server, database)
    server.serverConnection.inStream.subscribe(async (message: Message) => {
      if (message.body.oneofKind === MessageType.SynchronizedState) {
        const stateFromServer = message.body.synchronizedState
        this.money = stateFromServer.money
        this.hasMentorGivenMoney = stateFromServer.hasMentorGivenMoney
        console.log("Money: " + this.money)
        console.log("hasMentorGivenMoney", this.hasMentorGivenMoney)
      }
    })
  }

  async requestMoneyFromMentor(): Promise<boolean> {
    const response = await this.server.requestMoneyFromMentor()
    if (response) {
      if (response.body.oneofKind === MessageType.Error) {
        const error = response.body.error
        console.error(error.message)
        return false
      } else if (
        response.body.oneofKind === MessageType.RequestMoneyFromMentorResponse
      ) {
        const updatedState = response.body.requestMoneyFromMentorResponse
        this.money = updatedState.money
        this.hasMentorGivenMoney = updatedState.hasMentorGivenMoney
        return true
      } else {
        // For TypeScript
        return false
      }
    } else {
      return false
    }
  }
}

async function main() {
  const serverConnection = new WebSocketServerConnection(Message)
  const server = new GameServerAPI(serverConnection, Message)
  const database = new Database()
  await database.open()
  const game = new Game(server, database)
  document.body.appendChild(game.app.view as any)

  game.onMapLoaded.subscribe(async function (mapFilePath: string) {
    if (mapFilePath === "maps/starting_map.map.gz") {
      game
        .map!.findEntityByID("shopEntrance1")!
        .onEnter.subscribe(async function () {
          await game.teleport(
            game.man!,
            new Location("maps/grocery_store.map.gz", 32.5 * 32, 23.5 * 32),
          )
        })
      game
        .map!.findEntityByID("shopEntrance2")!
        .onEnter.subscribe(async function () {
          await game.teleport(
            game.man!,
            new Location("maps/grocery_store.map.gz", 33.5 * 32, 23.5 * 32),
          )
        })
      game
        .map!.findEntityByID("shopExit1")!
        .onEnter.subscribe(async function () {
          await game.teleport(
            game.man!,
            new Location("maps/grocery_store.map.gz", 2.5 * 32, 23.5 * 32),
          )
        })
      game
        .map!.findEntityByID("shopExit2")!
        .onEnter.subscribe(async function () {
          await game.teleport(
            game.man!,
            new Location("maps/grocery_store.map.gz", 3.5 * 32, 23.5 * 32),
          )
        })

      {
        const mentor = new CharacterWithOpenRTPSpriteSheet(
          "char-sets/People1.png",
          game.app.stage,
          {
            x: 6 * characterWidth,
            y: 4 * characterHeight,
          },
        )
        mentor.x = 2.5 * 32
        mentor.y = 4 * 32
        await mentor.loadSpriteSheet()
        ;(mentor.sprite as any).canInteractWith = function () {
          return true
        }
        ;(mentor.sprite as any).interact = async function () {
          const continueDialog = await TextMessage.showMessageFrom(
            "Mentor",
            "Hi!",
          )
          if (continueDialog) {
            const requireMoneyOption = new Option(
              "I require some money for the restaurant",
            )
            const options = []
            if (!game.hasMentorGivenMoney) {
              options.push(requireMoneyOption)
            }
            const sayHiBackOption = new Option('Say "Hi" back.')
            options.push(sayHiBackOption)
            const option = await game.showOptions(options)
            if (option === requireMoneyOption) {
              if (await game.requestMoneyFromMentor()) {
                await TextMessage.showMessageFrom(
                  "Mentor",
                  "Here are 50 gold. ;-)",
                )
              }
              console.log("Money: " + game.money)
            } else if (option === sayHiBackOption) {
              await TextMessage.showMessageFrom("Character", "Hi.")
            }
          }
        }
        game.layers[3].addChild(mentor.sprite)
      }
    } else if (mapFilePath === "maps/grocery_store.map.gz") {
      game
        .map!.findEntityByID("entrance1")!
        .onEnter.subscribe(async function () {
          await game.teleport(
            game.man!,
            new Location("maps/starting_map.map.gz", 15.5 * 32, 4.5 * 32),
          )
        })
      game
        .map!.findEntityByID("entrance2")!
        .onEnter.subscribe(async function () {
          await game.teleport(
            game.man!,
            new Location("maps/starting_map.map.gz", 15.5 * 32, 4.5 * 32),
          )
        })
      game.map!.findEntityByID("exit1")!.onEnter.subscribe(async function () {
        await game.teleport(
          game.man!,
          new Location("maps/starting_map.map.gz", 7.5 * 32, 4.5 * 32),
        )
      })
      game.map!.findEntityByID("exit2")!.onEnter.subscribe(async function () {
        await game.teleport(
          game.man!,
          new Location("maps/starting_map.map.gz", 8.5 * 32, 4.5 * 32),
        )
      })

      {
        const groceryStoreLady = new CharacterWithOpenRTPSpriteSheet(
          "char-sets/People1.png",
          game.app.stage,
          {
            x: 3 * characterWidth,
            y: 0 * characterHeight,
          },
        )
        await groceryStoreLady.loadSpriteSheet()
        groceryStoreLady.facingDirection = Direction.Right
        groceryStoreLady.x = 0.5 * 32
        groceryStoreLady.y = 21 * 32
        ;(groceryStoreLady.sprite as any).canInteractWith = function () {
          return true
        }
        async function interact() {
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
                await TextMessage.showMessageFrom(
                  "Vendor",
                  "How many packages?",
                )
                const amount = await game.askForNumber({
                  minimum: 1,
                })
                if (amount) {
                  groceryStoreLady.facingDirection = Direction.Right
                  await game.wait(1)
                  groceryStoreLady.facingDirection = Direction.Down
                  await game.wait(1)
                  await TextMessage.showMessageFrom(
                    "Vendor",
                    "Here you go. ;-)",
                  )
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
        game.layers[3].addChild(groceryStoreLady.sprite)
        ;(groceryStoreLady.sprite as any).interact = interact
        game.map!.findEntityByID("groceryStoreLadyOverBar")!.onInteract =
          interact
      }
    }
  })

  await game.loadMap("maps/starting_map.map.gz")
  await game.initialize()
  await serverConnection.connect("wss://mmo-server.sanjo-solutions.com/")

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
