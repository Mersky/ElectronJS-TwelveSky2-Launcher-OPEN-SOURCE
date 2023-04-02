const notice = document.querySelector('.notice');
const iframe = document.querySelector('#iframe');
const copyright = document.querySelector('.copyright');
const version = document.querySelector('.version');
const versionInfo = document.querySelector('#versionInfo');
const versionProgress = document.querySelector('#versionProgress');
const process = document.querySelector('.process');
const processInfo = document.querySelector('#processInfo');
const processProgress = document.querySelector('#processProgress');
const homeButton = document.querySelector('#homeButton');
const optionButton = document.querySelector('#optionButton');
const startButton = document.querySelector('#startButton');
const exitButton = document.querySelector('#exitButton');

homeButton.addEventListener('click', () => {
    electron.send('homeButton');
});

optionButton.addEventListener('click', () => {
    electron.send('optionButton');
});

startButton.addEventListener('click', () => {
    electron.send('startButton');
});

exitButton.addEventListener('click', () => {
    electron.send('exitButton');
});

electron.invoke('defaultLanguage').then((result) => {
    iframe.src = './News/' + result + '/index.html';
});

function translate(key){
    return electron.invoke('translate', key);
}

translate('notice').then((result) => {
    notice.innerHTML = result;
});

translate('copyright').then((result) => {
    copyright.innerHTML = result;
});

translate('version').then((result) => {
    version.innerHTML = result;
});

translate('process').then((result) => {
    process.innerHTML = result;
});

translate('home').then((result) => {
    homeButton.innerHTML = result;
});

translate('settings').then((result) => {
    optionButton.innerHTML = result;
});

translate('start').then((result) => {
    startButton.innerHTML = result;
});

translate('exit').then((result) => {
    exitButton.innerHTML = result;
});

electron.on('mainProgress', (progress) => {
    versionProgress.value = progress;
});

electron.on('secondProgress', (progress) => {
    processProgress.value = progress;
});

electron.on('firstMessage', (message) => {
    versionInfo.innerHTML = message;
});

electron.on('secondMessage', (message) => {
    processInfo.innerHTML = message;
});


electron.on('updateFinish', (finish) => {
    if (finish === 1){
        electron.invoke('exeIsRunning').then((result) => {
            if (result){
                startButton.disabled = true;
            }else {
                startButton.disabled = false;
            }
        });
    }
});

electron.invoke('popup').then((result) => {
    iframe.onload = function() {
        const iframeDocument = iframe.contentDocument;
        const links = iframeDocument.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault(); // Yeni pencere açılmadan önce varsayılan eylemi iptal et

                // Yeni pencere özellikleri
                const width = result[0];
                const height = result[1];
                const icon = result[2];
                const top = window.screen.height / 2 - height / 2;
                const features = `width=${width}, height=${height}, icon=${icon}`;
                electron.send('clear-menu');
                // Yeni pencereyi aç
                window.open(link.href, '_blank', features);
            });
        });
    }    
});

setInterval(() => {
    electron.send('mainProgressData');
    electron.send('secondProgressData');
    electron.send('firstMessageData');
    electron.send('secondMessageData');
    electron.send('updateFinishData');
}, 100);
  