const { contextBridge, ipcRenderer } = require('electron');
const { languages, resolutions } = require('./Options.js');
const functions = require('../Shared/Functions.js');

// Allow renderer to use ipcRenderer to send messages to main process
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  }
});

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

const ts2 = {
  createOption: (selectBox, options, activeOption) => functions.addOption(selectBox, options, activeOption),
  getActive: (key) => functions.getOption(key),
  createOptionFile: (fullscreen, x, y, language) => functions.createOption(fullscreen, x, y, language),
  getLanguages: languages,
  getResolutions: resolutions,
};

contextBridge.exposeInMainWorld('ts2', ts2);