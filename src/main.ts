import { app, BrowserWindow, dialog, Menu, shell, ipcMain } from "electron"
import path from "path"
import fs from "fs/promises"
import { createWriteStream } from "fs"
import { Readable, pipeline } from "node:stream"
import { promisify } from "node:util"
import { createGzip, unzip as unzipWithCallback } from "node:zlib"
const pipe = promisify(pipeline)
const unzip = promisify(unzipWithCallback)

let openedMapPath: string | null = null
let saveAs = false

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit()
}

const isMac = process.platform === "darwin"

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)

    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  const menu = Menu.buildFromTemplate([
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              {
                role: "about",
              },
              { type: "separator" },
              { role: "services" },
              { type: "separator" },
              { role: "hide" },
              { role: "hideOthers" },
              { role: "unhide" },
              { type: "separator" },
              { role: "quit" },
            ],
          },
        ]
      : []),
    {
      label: "File",
      submenu: [
        {
          label: "New game",
          accelerator: "CommandOrControl+Alt+N",
          async click() {
            const result = await dialog.showOpenDialog({
              title: "Select folder for new game",
              buttonLabel: "Create new game in folder",
              properties: [
                "openDirectory",
                "createDirectory",
                "promptToCreate",
              ],
            })
            // mainWindow.webContents.send("new-game")
          },
        },
        {
          label: "New map",
          accelerator: "CommandOrControl+N",
          click() {
            openedMapPath = null
            mainWindow.webContents.send("new-map")
          },
        },
        {
          label: "Open map",
          accelerator: "CommandOrControl+O",
          async click() {
            const result = await dialog.showOpenDialog({
              title: "Open map",
              buttonLabel: "Open map",
              properties: ["openFile"],
            })
            if (!result.canceled) {
              const filePath = result.filePaths[0]
              openedMapPath = filePath
              const contents = await fs.readFile(filePath)
              const buffer = await unzip(contents)
              const map = JSON.parse(buffer.toString())
              mainWindow.webContents.send("open-map", map)
            }
          },
        },
        {
          label: "Save",
          accelerator: "CommandOrControl+S",
          click() {
            saveAs = false
            mainWindow.webContents.send("request-map")
          },
        },
        {
          label: "Save as",
          accelerator: "CommandOrControl+Shift+S",
          click() {
            saveAs = true
            mainWindow.webContents.send("request-map")
          },
        },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        {
          label: "Undo",
          accelerator: "CommandOrControl+Z",
          click() {
            mainWindow.webContents.send("undo")
          },
        },
        // { role: "redo" }, // TODO: Implement
        { type: "separator" },
        {
          label: "Cut",
          accelerator: "CommandOrControl+X",
          registerAccelerator: false,
          click() {
            mainWindow.webContents.send("cut")
          },
        },
        {
          label: "Copy",
          accelerator: "CommandOrControl+C",
          registerAccelerator: false,
          click() {
            mainWindow.webContents.send("copy")
          },
        },
        {
          label: "Paste",
          accelerator: "CommandOrControl+V",
          registerAccelerator: false,
          click() {
            mainWindow.webContents.send("paste")
          },
        },
        // { role: "delete" }, // TODO: Implement
      ],
    },
    ...(MAIN_WINDOW_VITE_DEV_SERVER_URL
      ? [
          {
            label: "View",
            submenu: [
              { role: "reload" },
              { role: "forceReload" },
              { role: "toggleDevTools" },
              { type: "separator" },
              { role: "resetZoom" },
              { role: "zoomIn" },
              { role: "zoomOut" },
              { type: "separator" },
              { role: "togglefullscreen" },
            ],
          },
        ]
      : []),
    { role: "windowMenu" },
    {
      label: "Give feedback",
      async click() {
        await shell.openExternal(
          "https://github.com/SanjoSolutions/tilemap-editor/issues/new",
        )
      },
    },
    {
      label: "Donate",
      async click() {
        await shell.openExternal(
          "https://www.paypal.com/donate/?hosted_button_id=H7Q46GUS9N3NC",
        )
      },
    },
    ...(isMac
      ? []
      : [
          {
            role: "help",
            submenu: [
              {
                role: "about",
              },
            ],
          },
        ]),
  ])
  Menu.setApplicationMenu(menu)

  ipcMain.on("map", async function (event, map) {
    let saveFilePath = null
    if (!saveAs && openedMapPath) {
      saveFilePath = openedMapPath
    } else {
      const result = await dialog.showSaveDialog({
        title: "Choose file to save map to",
        defaultPath: "map1.map.gz",
        buttonLabel: "Save map",
        properties: [
          "createDirectory",
          "treatPackageAsDirectory",
          "showOverwriteConfirmation",
        ],
      })
      if (!result.canceled) {
        saveFilePath = result.filePath
      }
    }

    if (saveFilePath) {
      const gzip = createGzip()
      const source = Readable.from([JSON.stringify(map)])
      const destination = createWriteStream(saveFilePath)
      await pipe(source, gzip, destination)
      openedMapPath = saveFilePath
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
