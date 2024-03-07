import { Database, Game } from "@sanjo/game-engine"
import { Location } from "@sanjo/game-engine/Location.js"
import { CharacterWithOpenRTPSpritesheet } from "@sanjo/game-engine/CharacterWithOpenRTPSpritesheet.js"
import {
  width as characterWidth,
  height as characterHeight,
} from "@sanjo/game-engine/createOpenRTPSpritesheet.js"
import { TextMessage } from "@sanjo/game-engine/TextMessage.js"
import { Option } from "@sanjo/game-engine/Dialog.js"
import "@sanjo/game-engine/TextMessage.css"
import "@sanjo/game-engine/Dialog.css"

if (window.IS_DEVELOPMENT) {
  new EventSource("/esbuild").addEventListener("change", () =>
    location.reload(),
  )
}

async function main() {
  const database = new Database()
  await database.open()
  const game = new Game(database)
  document.body.appendChild(game.app.view as any)

  await game.loadMap("maps/teleporter_test2.map.gz")
  game.map!.findEntityByID("teleporter")!.onOver.subscribe(async function () {
    await game.teleport(
      game.man!,
      new Location("maps/map1.map.gz", 10.5 * 32, 10.5 * 32),
    )
  })
  await game.load()
  game.man!.y = 6 * 32
  game.updateViewport()

  const npc = new CharacterWithOpenRTPSpritesheet(
    "char-sets/People1.png",
    game.app.stage,
    {
      x: 6 * characterWidth,
      y: 4 * characterHeight,
    },
  )
  npc.x = 5 * 32
  npc.y = 5 * 32
  await npc.loadSpritesheet()
  npc.sprite.canInteractWith = function () {
    return true
  }
  npc.sprite.interact = async function () {
    await TextMessage.show("Hi!")
    const requireMoneyOption = new Option(
      "I require some money for the restaurant",
    )
    const option = await game.showOptions([requireMoneyOption, new Option("b")])
    if (option === requireMoneyOption) {
      await TextMessage.show("Here are 50 gold. ;-)")
      game.money += 50
      console.log("Money: " + game.money)
    }
  }
  game.layers[3].addChild(npc.sprite)

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
