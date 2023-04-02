const fs = require('fs');
const path = require('path');
const ini = require('ini');
const { getSetting } = require('../Main/Options.js');
const cheerio = require('cheerio');
const axios = require('axios');
const resArr = getSetting('activeResolution').split('x');
const patchUrl = getSetting('patchUrl');
const folderPath = path.dirname(process.execPath);
global.mainProgress = 0;
global.secondProgress = 0;
global.firstMessage = '';
global.secondMessage = '';
global.updateFinish = 0;
  
module.exports = {

    // Create Option Function
    createOption: function(tFullScreen = getSetting('activeFullscreen'), tWidth = resArr[0], tHeight = resArr[1], tLanguage = getSetting('activeLanguage')) {
        const optionFilePath = path.join(folderPath, 'Option.INI');

        const newOptionFileContent = `//all
        [RESOLUTION]
        x = ${tWidth}
        y = ${tHeight}
        fullscreen = ${tFullScreen}
        
        //mayngames
        [EXTRA]
        isptype = 0
        
        //playwith
        [LANGUAGE]
        code = ${tLanguage}
        
        //tw
        [DEFAULT]
        minwidth = ${tWidth}
        minheight = ${tHeight}
        defaultfirst = ${tFullScreen}`;
      
        fs.writeFileSync(optionFilePath, newOptionFileContent, 'utf8');
    },

    // Get Option Functions
    getOption: function(key) {
        const optionFilePath = path.join(folderPath, 'Option.INI');
        const optionFileContent = ini.parse(fs.readFileSync(optionFilePath, 'utf8'));
        const resolution = optionFileContent.x + "x" + optionFileContent.y;
        const fullscreen = optionFileContent.fullscreen;
        const language = optionFileContent.code;
        
        let output = null;
        if (key == "resolution"){
            if (!resolution) {
                output = getSetting('activeResolution');
            }else {
                output = resolution;
            }
        }

        if (key == "fullscreen"){
            if (!fullscreen.toString()) {
                output = getSetting('activeFullscreen');
            }else {
                output = fullscreen.toString();
            }
        }

        if (key == "language"){
            if (!language) {
                output = getSetting('activeLanguage');
            }else {
                output = language;
            }
        }
        
        return output;
    },

    // Add Selectbox Option Functions
    addOption: function(selectBox, options, activeOption) {
        if (Array.isArray(options)) {
            for (const optionText of options) {
              const option = document.createElement('option');
              option.value = optionText;
              option.text = optionText;
              if (optionText === activeOption) {
                option.selected = true;
              }
              selectBox.appendChild(option);
            }
          } else if (typeof options === "object") {
            for (const [key, value] of Object.entries(options)) {
              const option = document.createElement('option');
              option.value = key;
              option.text = value;
              if (key === activeOption) {
                option.selected = true;
              }
              selectBox.appendChild(option);
            }
          } else {
            console.error("Invalid options");
          }
    },

    serverVerGetData: async function(key) {
        const serververPath = patchUrl + '/SERVERVER.DAT';
        try {
            const response = await axios.get(serververPath);
            const data = response.data;
            const regex = new RegExp(`${key} = (\\d+)`);
            const match = data.match(regex);
            const patch = match && match[1];
            return patch;
        } catch (error) {
            throw new Error(error);
        }
    },

    clientUpdate: async function() {

        const preversionFilePath = path.join(folderPath, 'PREVERSION.DAT');
        let preversionFileContent = '';

        if (fs.existsSync(preversionFilePath)) {

            preversionFileContent = parseInt(fs.readFileSync(preversionFilePath, 'utf8'), 10);

        } else {

            const newPreversionFileContent = `00001`;
            fs.writeFileSync(preversionFilePath, newPreversionFileContent, 'utf8');

        }

        const serverVerPatch = await this.serverVerGetData('PATCH');
        const updatesPath = patchUrl + '/Updates';
        const response = await axios.get(updatesPath, { responseType: 'arraybuffer' });
        const $ = cheerio.load(response.data);
        const folders = $('a').filter(function() {
            return $(this).attr('href').match(/\/$/);
        }).map(function() {
            const folder = $(this).text().trim();
            return folder.endsWith('/') ? folder.slice(0, -1) : folder;
        }).get().slice(1);
        const preversionINT = parseInt(preversionFileContent, 10);
        const serverVerPatchINT = parseInt(serverVerPatch, 10);

        const lengths = []; // boş bir dizi oluşturuyoruz
        let downloadedSize = 0; // İndirilen dosya boyutunu izleyin
        let downloadedCount = 0; // İndirilen dosya sayısını izleyin
        let totalDownloadedCount = 0; // İndirilen dosya sayısını izleyin
        if (preversionINT !== serverVerPatchINT) {

            global.updateMessage = this.translate('updateFound');
            const totalUpdates = serverVerPatchINT;
            const currentUpdateIndex = preversionINT + 1;

            for (let i = currentUpdateIndex; i < totalUpdates; i++) {

                const updateFolder = folders[i - 1];
                const updateFolderPath = `${updatesPath}/${updateFolder}`;
                const updateJsonUrl = patchUrl + '/Updates/' + updateFolder + '/update.json';
                const updateJsonResponse = await axios.get(updateJsonUrl);
                const updateJson = updateJsonResponse.data;
                const updateFiles = updateJson.files;
                const totalUpdateFiles = updateFiles.length;
                lengths.push(totalUpdateFiles);
                const totalUpdateFileCount = lengths.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
                const totalUpdateSize = updateFiles.reduce((total, file) => total + file.size, 0);
                
                for (const file of updateFiles) {

                    // Dosya indirme kodunu buraya yerleştirin
                    const updateFile = file.name;
                    const filePath = `${updateFolderPath}/${updateFile}`;
                    const downFile = path.join(folderPath, ...updateFile.split('/'));

                    if (!fs.existsSync(path.dirname(downFile))) {

                        fs.mkdirSync(path.dirname(downFile), { recursive: true });

                    }

                    const response = await axios.get(filePath, { responseType: 'arraybuffer' });
                    fs.writeFileSync(downFile, response.data, 'binary');

                    // Dosya indirildiğinde ilerleme çubuklarını güncelleyin
                    if (downloadedSize >= totalUpdateSize){

                        downloadedSize = file.size;

                    }else {

                        downloadedSize += file.size;

                    }

                    if (downloadedCount >= totalUpdateFiles){

                        downloadedCount = 1;

                    }else {

                        downloadedCount++;

                    }

                    totalDownloadedCount++;
                    const progress = Math.round(downloadedCount / totalUpdateFiles * 100); // Ana ilerleme çubuğu için yüzdeyi hesaplayın
                    global.mainProgress = Math.floor(progress);
                    
                    const secondaryProgress = Math.round(downloadedSize / totalUpdateSize * 100); // İkincil ilerleme çubuğu için yüzdeyi hesaplayın
                    global.secondProgress = Math.floor(secondaryProgress);

                    // İlerleme çubuklarını yazdırın
                    const downloadedKBProgressSize = (downloadedSize / 1024).toFixed(2);
                    const totalKBProgressSize = (totalUpdateSize / 1024).toFixed(2);
                    global.firstMessage = this.translate('updateFirstMessage', {totalDownloadedCount: totalDownloadedCount, totalUpdateFileCount: totalUpdateFileCount});
                    global.secondMessage = this.translate('updateSecondMessage', {downloadedKBProgressSize: downloadedKBProgressSize, totalKBProgressSize: totalKBProgressSize});
                }

                global.firstMessage = this.translate('updateSuccess');
                global.secondMessage = '';
                global.updateFinish = 1;
                const newPreversion = serverVerPatch;
                fs.writeFileSync(preversionFilePath, newPreversion, 'utf8');

            }

        } else {

            global.firstMessage = this.translate('updateNotFound');
            global.updateFinish = 1;

        }

    },

    translate: function(key, variables) {
        let lang = this.getOption('language');
        let langFile;
        try {
            langFile = require(`./Languages/${lang}.js`);
        } catch (err) {
            console.error(`Translation file "${lang}.js" not found.`);
            langFile = require(`./Languages/${getSetting('activeLanguage')}.js`);
        }
        let translation = langFile[key];
        if (variables) {
            for (const [key, value] of Object.entries(variables)) {
            translation = translation.replace(`{${key}}`, value);
            }
        }
        return translation;
      }
    
}