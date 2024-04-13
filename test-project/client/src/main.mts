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
import { Subject, find, firstValueFrom } from "rxjs"
import type { SynchronizedState } from "@sanjo/test-project-shared/src/protos/SynchronizedState.js"
import { Message } from "@sanjo/test-project-shared/src/protos/Message.js"
import { MessageType } from "@sanjo/test-project-shared/src/clientServerCommunication/MessageType.js"
import { createRequestMoneyFromMentor } from "@sanjo/test-project-shared/src/clientServerCommunication/messageFactories.js"
import { CharacterWithOneSpriteSheet } from "@sanjo/game-engine/CharacterWithOneSpritesheet.js"
import { GameServerAPI as GameServerAPIBase } from "@sanjo/game-engine/GameServerAPI.js"

if (window.IS_DEVELOPMENT) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}

class GameServerAPI extends GameServerAPIBase<Message> {
  async requestMoneyFromMentor(): Promise<Message | undefined> {
    this.webSocket!.send(Message.toBinary(createRequestMoneyFromMentor()))
    const response = await firstValueFrom(
      this.stream.pipe(
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
  money: number = 0
  hasMentorGivenMoney: boolean = false

  constructor(server: GameServerAPI, database: Database) {
    super(server, database)
    server.stream.subscribe(async (message: Message) => {
      if (message.body.oneofKind === MessageType.SynchronizedState) {
        const stateFromServer = message.body.synchronizedState
        Object.assign(this, stateFromServer)
        console.log("Money: " + this.money)
        console.log("hasMentorGivenMoney", this.hasMentorGivenMoney)
      } else if (message.body.oneofKind === MessageType.Character) {
        const character = new CharacterWithOneSpriteSheet(
          "character.png",
          this.app.stage,
        )
        Object.assign(character, message.body.character)
        await character.loadSpriteSheet()
        this.layers[3].addChild(character.sprite)
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
  const server = new GameServerAPI()
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
