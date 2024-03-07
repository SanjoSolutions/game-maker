export class Option {
  name: string

  constructor(name: string) {
    this.name = name
  }
}

export class Dialog {
  static selectedOptionIndex: number | null = null
  static options: Option[]
  static #container: HTMLOListElement | null = null
  static #$options: HTMLLIElement[] = []

  static async showOptions(options: Option[]): Promise<Option> {
    return new Promise((resolve) => {
      Dialog.options = options
      const $options = document.createElement("ol")
      Dialog.#container = $options
      $options.className = "dialog-options"
      Dialog.#$options = []
      for (const option of options) {
        const $option = document.createElement("li")
        $option.className = "dialog-option"
        $option.textContent = option.name
        $options.appendChild($option)
        Dialog.#$options.push($option)
      }
      document.body.appendChild($options)

      if (Dialog.#$options.length >= 1) {
        Dialog.selectedOptionIndex = 0
        Dialog.#$options[0].classList.add("dialog-option--selected")
      }

      const eventHandler = function (event) {
        if (event.code === "ArrowUp") {
          Dialog.#selectOption(Math.max(Dialog.selectedOptionIndex - 1, 0))
        } else if (event.code === "ArrowDown") {
          Dialog.#selectOption(
            Math.min(Dialog.selectedOptionIndex + 1, Dialog.options.length - 1),
          )
        } else if (event.code === "Enter") {
          const option = Dialog.options[Dialog.selectedOptionIndex]
          Dialog.#container.remove()
          Dialog.options = []
          Dialog.#container = null
          Dialog.#$options = []
          window.removeEventListener("keydown", eventHandler)
          resolve(option)
        }
      }

      window.addEventListener("keydown", eventHandler)
    })
  }

  static #selectOption(optionIndex: number) {
    Dialog.selectedOptionIndex = optionIndex
    Dialog.#$options.forEach(($option) =>
      $option.classList.remove("dialog-option--selected"),
    )
    Dialog.#$options[optionIndex].classList.add("dialog-option--selected")
  }
}
