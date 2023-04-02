# ElectronJS TwelveSky2 Launcher

First make sure you have NodeJS installed on your system.

We need to edit the "Launcher/Src/Shared/Settings.js" file according to our own server.

```javascript
module.exports = {
    "appUserModelId": "com.mersky.12sky2launcher", // APP MODEL ID

    "clientExe": "TwelveSky2.exe", // CLIENT GAME EXE
    "clientParameters": "/2/TH", // CLIENT PARAMETERS 2.5 CLIENT GENERALLY "/99/0"
    "clientMultiple": true, // MULTI CLIENT SETTINGS

    "homeUrl": "http://127.0.0.1", // GAME HOME URL
    "launcherUrl": "http://127.0.0.1/Launcher", // "Hosting/Launcher" DIR
    "patchUrl": "http://127.0.0.1/Patch", // "Hosting/Patch" DIR
    "updateCheckingMS": 3000, // LAUNCHER UPDATE CHECKING WAIT (MS)

    "launcherIcon": "launcher.ico", // "Launcher/Src/Assets" UNDER DIR LAUNCHER ICON NAME
    "windowTitle": "TwelveSky2 Launcher", // LAUNCHER TITLE
    "windowWidth": 714, // LAUNCHER WIDTH (PX)
    "windowHeight": 591, // LAUNCHER HEIGHT (PX)

    "popupWidth": 600, // POPUP WIDTH (PX)
    "popupHeight": 400, // POPUP HEIGHT (PX)

    "optionWindowTitle": "Settings", // SETTINGS WINDOW TITLE
    "optionWindowWidth": 300, // SETTINGS WIDTH TITLE
    "optionWindowHeight": 200, // SETTINGS HEIGHT TITLE
    
    "activeLanguage": "EU", // ACTIVE LANGUAGE (INSIDE THE LANGUAGES OBJECT)
    "activeResolution": "1024x768", // ACTIVE RESOLUTION (INSIDE THE RESOLUTIONS ARRAY)
    "activeFullscreen": "1", // ACTIVE FULLSCREEN (1 = FULLSCREEN / 2 = WINDOW)
    
    "languages": { // LANGUAGES OBJECT (KEYS IN THE OBJECT MUST BE THE SAME AS THE FILE NAMES UNDER THE "Launcher/Src/Shared/Languages" DIR)
        "TR": "Türkçe",
        "EU": "English"
    },

    "resolutions": [ // RESOLUTIONS ARRAY
        "640x480",
        "800x600",
        "960x720",
        "1024x576",
        "1024x768",
        "1152x648",
        "1280x720",
        "1280x800",
        "1280x960",
        "1366x768",
        "1440x900",
        "1400x1050",
        "1440x1080",
        "1600x900",
        "1600x1200",
        "1680x1050",
        "1856x1392",
        "1920x1080",
        "1920x1200",
        "1920x1440",
        "2048x1536",
        "2560x1440",
        "2560x1600"
    ]
} 
```

Run terminal under "Launcher" dir.

```javascript
npm install
```

To compile the project,

```javascript
npx electron-packager . --asar --platform=win32 --arch=x64 --out=release-builds --icon=Src/Assets/launcher.ico --prune --executable-name=Launcher
```

Launcher.exe compiled under dir "Launcher/release-builds/ts2launcher-win32-x64".

To change the launcher design, you just need to know html & css. You can update the design according to you under the "Hosting/Launcher" dir.

We have made our settings, we have compiled our project, now let's copy the contents of our "Hosting" folder to our server (Inside the folder, the "Launcher" directory is equivalent to the "launcherUrl" parameter in the "Settings.js" file. Likewise, the "Patch" directory is equivalent to the "patchUrl" parameter.)

Now let's examine the autopatcher system we wrote.
The "PATCH" parameter in the "Hosting/Patch/SERVERVER.DAT" file represents the client version to be updated.

Client versions are kept in folders 00002, 00003 under "Hosting/Patch/Updates" directory. Let's give a small example of autopatcher, the current client version is kept in the "Preversion.dat" file in the client folder, let's say the value in it is "00001" for now. Let the "PATCH" value in the "SERVERVER.DAT" file be "00003". Launcher compares "PATCH" value with the value in "Preversion.dat" file and downloads defined files in update.json file under "00002, 00003" folders in "Hosting/Patch/Updates" respectively until it reaches "00003" value.

In "update.json", we must create objects in the "files" array and write the file name and file size in bytes, for example:

```javascript
{
  "files": [
    {
      "name": "TwelveSky2.exe",
      "size": 17684000
    },
    {
      "name": "GXDCompress.dll",
      "size": 344000
    },
    {
      "name": "G03_GDATA/D01_GIMAGE2D/005/005_00005.IMG",
      "size": 64000
    }
  ]
}
```

The directory with the "update.json" file is considered the main directory. As you can see in the example, there are update files in the folder. The important thing here is that the files must be in the same directory as the "update.json" file.

You can solve the rest by examining the codes, I think I wrote clean code.

Feel free to write your thoughts and criticisms to improve the project. Thanks.
