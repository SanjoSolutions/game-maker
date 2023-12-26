export class TextMessage {
  static show(text: string) {
    const message = document.createElement("div")
    message.classList.add("text-message")
    message.textContent = text
    document.body.appendChild(message)
    window.addEventListener("keydown", function (event) {
      if (event.code === "Enter") {
        event.preventDefault()
        message.remove()
      }
    })
  }
}
