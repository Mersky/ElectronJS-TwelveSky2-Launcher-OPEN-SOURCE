const fs = require('fs');
const settings = require('../Shared/Settings.js');

function getSetting(key){
    return settings[key];
}

const resolutions = getSetting('resolutions');
const languages = getSetting('languages');

module.exports = {
    getSetting,
    languages,
    resolutions
};