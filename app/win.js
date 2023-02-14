const path = require('path')
const { app, BrowserWindow, ipcMain, Menu, shell, nativeImage } = require('electron')
const { init_win } = require('./app.js')
const { format } = require('url')
const { join } = require('path')
const fs = require('fs')
const { existsSync } = require('fs')

function isPromiseLike (obj) {
  return (obj instanceof Promise) || (
    obj !== undefined && obj !== null && typeof obj.then === 'function' && typeof obj.catch === 'function'
  )
}


class WindowManager {
  constructor () {
    if (WindowManager._instance) {
      throw new Error('Can not create multiple WindowManager instances.')
    }
    this.windows = new Map()
  }

  createWindow (name, browerWindowOptions, url) {
    if (this.windows.has(name)) {
      throw new Error(`The window named "${name}" exists.`)
    }

    if (!('icon' in browerWindowOptions)) {
      if (process.platform === 'linux') {
        const linuxIcon = join(__dirname, '../../icon/app.png')
        if (existsSync(linuxIcon)) {
          browerWindowOptions.icon = nativeImage.createFromPath(linuxIcon)
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          const iconPath = join(__dirname, `../../icon/app.${process.platform === 'win32' ? 'ico' : 'icns'}`)
          if (existsSync(iconPath)) {
            browerWindowOptions.icon = nativeImage.createFromPath(iconPath)
          }
        }
      }
    }

    let win = new BrowserWindow(browerWindowOptions)
    let _session = win.webContents.session;
    _session.clearCache().then(()=>{
        _session.clearStorageData().then(()=>{
            _session.flushStorageData();
        });
    });
    init_win(win);
    win.on("close", async function () {
        await _session.clearCache();
        await _session.clearStorageData();
        _session.flushStorageData();
    })
    win.on("closed", function () {
        app.quit()
    })

    win.on('ready-to-show', function () {
      if (!win) return
      win.show()
      win.focus()
      win.webContents.openDevTools()
    })

    win.on('closed', () => {
      win = null
      this.windows.delete(name)
    })

    this.windows.set(name, win)
  }

  getWindow (name) {
    if (this.windows.has(name)) {
      return this.windows.get(name)
    }
    throw new Error(`The window named "${name} doesn't exists."`)
  }

  removeWindow (name) {
    if (!this.windows.has(name)) {
      throw new Error(`The window named "${name} doesn't exists."`)
    }
    this.windows.get(name).close()
  }

  hasWindow (name) {
    return this.windows.has(name)
  }
}

WindowManager.getInstance = function () {
  if (!WindowManager._instance) {
    WindowManager._instance = new WindowManager()
  }
  return WindowManager._instance
}

WindowManager.ID_MAIN_WINDOW = 'main-window'

WindowManager.__SECRET_KEY__ = []

WindowManager.createMainWindow = function () {
  const windowManager = WindowManager.getInstance()
  if (!windowManager.hasWindow(WindowManager.ID_MAIN_WINDOW)) {
    let debug = !true;
    const browerWindowOptions = {
      width: debug?1600:1000,
      height: 1050,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: false,
        contextIsolation: false,
        devTools: debug
      }
    }

    windowManager.createWindow(
      WindowManager.ID_MAIN_WINDOW,
      browerWindowOptions,
      format({
        pathname: join(__dirname, './index.html'),
        protocol: 'file:',
        slashes: true
      })
    )
  }
}

module.exports = WindowManager
