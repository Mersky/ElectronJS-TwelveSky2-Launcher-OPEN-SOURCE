const electron = require('electron');
const { getSetting } = require('./Options.js');
const functions = require('../Shared/Functions.js');
functions.createOption();
const path = require('path');
const url = require('url');
const { app, ipcMain, BrowserWindow, shell, Menu, Tray } = electron;
const { spawn } = require('child_process');
const iconPath = path.join(__dirname, '../Assets/' + getSetting('launcherIcon'));
const launcherUrl = getSetting('launcherUrl');
const homeUrl = getSetting('homeUrl');

global.firstMessage = functions.translate('updateChecking');

const folderPath = path.dirname(process.execPath);

let gotTheLock;
if(getSetting('clientMultiple')){
  gotTheLock = true;
}else {
  gotTheLock = app.requestSingleInstanceLock();
}

if (!gotTheLock) {
  app.quit();
} else {

  async function createWindow(icon) {

    const win = new BrowserWindow({
      width: getSetting('windowWidth'),
      height: getSetting('windowHeight'),
      title: getSetting('windowTitle'),
      icon: icon,
      transparent: true,
      frame: false,
      draggable: true,
      resizable: false,
      webPreferences: {
        contextIsolation: true,
        enableRemoteModule: true,
        nodeIntegration: true,
        preload: path.join(__dirname, './Preload.js')
      }
    });
    
    win.loadURL(launcherUrl, {cache: false});

    setTimeout(async () => {
      await functions.clientUpdate();
    }, getSetting('updateCheckingMS'));

    setTimeout(async () => {
      await functions.clientUpdate();
    }, getSetting('updateCheckingMS'));

    ipcMain.on('mainProgressData', (event) => {
      win.webContents.send('mainProgress', global.mainProgress);
    });
    ipcMain.on('secondProgressData', (event) => {
      win.webContents.send('secondProgress', global.secondProgress);
    });
    ipcMain.on('firstMessageData', (event) => {
      win.webContents.send('firstMessage', global.firstMessage);
    });
    ipcMain.on('secondMessageData', (event) => {
      win.webContents.send('secondMessage', global.secondMessage);
    });
    ipcMain.on('updateFinishData', (event) => {
      win.webContents.send('updateFinish', global.updateFinish);
    });

    let optionWindow = null;

    ipcMain.on('optionButton', (event) => {

        if (optionWindow == null){

            optionWindow = new BrowserWindow({
                width: getSetting('optionWindowWidth'),
                height: getSetting('optionWindowHeight'),
                title: getSetting('optionWindowTitle'),
                icon: icon,
                frame: true,
                resizable: false,
                minimizable: false,
                maximizable: false,
                titleBarStyle: 'hiddenInset',
                webPreferences: {
                  nodeIntegration: true,
                  contextIsolation: true,
                  enableRemoteModule: true,
                  preload: path.join(__dirname, './Preload.js')
                }
            });
            
            optionWindow.setMenu(null);

            optionWindow.loadURL(
                url.format({
                pathname: path.join(__dirname, '../Renderer/Options.html'),
                protocol: 'file:',
                slashes: true
                }, {cache: false})
            );

            optionWindow.on('closed', () => {
              optionWindow = null;
            });

        }else {
            optionWindow.show();
        }

    });

    ipcMain.on('saveOption', (event) => {
      optionWindow.close();
      optionWindow = null;
    });

    let trayIcon = null;

    let exeIsRunning = false;

    ipcMain.on('startButton', (event) => {

      trayIcon = new Tray(iconPath);

      win.hide();
      trayIcon.setToolTip(getSetting('windowTitle'))
      trayIcon.on('click', () => {
        // When tray icon is clicked, show the main window again
        win.show();
      })
    
      const exe = path.join(folderPath, getSetting('clientExe'));
      const resolution = functions.getOption('resolution').split('x');
      const parameters = getSetting('clientParameters') + '/' + functions.getOption('fullscreen') + '/' + resolution[0] + '/' + resolution[1];
    
      if (!exeIsRunning) {
        const child = spawn(exe, [parameters]);
        child.on('exit', (event) => {
          app.quit();
        });
        exeIsRunning = true;
      }
    
    });

    ipcMain.handle('exeIsRunning', (event) => {
      return exeIsRunning;
    });

  }

  ipcMain.handle('defaultLanguage', (event) => {
    return getSetting('activeLanguage');
  });

  ipcMain.handle('translate', (event, key) => {
    return functions.translate(key);
  });

  ipcMain.on('homeButton', (event) => {
    shell.openExternal(homeUrl);
  });

  ipcMain.on('exitButton', (event) => {
    app.quit();
  });

  ipcMain.on('clearMenu', (event) => {
    const menu = new Menu();
    Menu.setApplicationMenu(menu);
  });

  ipcMain.handle('popup', (event) => {
    const returnObj = [getSetting('popupWidth'), getSetting('popupHeight'), iconPath];
    return returnObj;
  });

  app.setAppUserModelId(getSetting('appUserModelId'));

  app.whenReady().then(() => {
    createWindow(iconPath);
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

}