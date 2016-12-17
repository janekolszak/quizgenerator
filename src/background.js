// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import fs from 'fs';
import markdownpdf from 'markdown-pdf';
import { app, Menu, ipcMain } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

ipcMain.on('close-main-window', (event, arg) => {
    app.quit();
})


function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            onError(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(path.join(dirname, filename), 'utf-8', function(err, content) {
                if (err) {
                    onError(err);
                    return;
                }
                onFileContent(filename, content);
            });
        });
    });
}

ipcMain.on('gen-tests', (event, inDir, outDir, numTsts) => {
    var questions = [];

    // Read the files
    readFiles(inDir, (filename, content) => {
        var ext = path.extname(filename);
        if (ext !== ".md" && ext !== ".txt") {
            return
        }

        var lines = content.split(/\r?\n/);

        // Clean up comments and empty lines
        for (var i = lines.length - 1; i >= 0; i--) {
            if (!lines[i].trim() || lines[i].charAt(0) === "#") {
                lines.splice(i, 1);
            }
        }

        // Add to questions array
        var question = {
            text: lines[0],
            answers: lines.slice(1, lines.length)
        }
        questions.push(question);


    }, function(err) {
        event.sender.send('gen-tests-done', 'Failed to generate tests: ' + err);
    });

    event.sender.send('gen-tests-done', 'Tests generated');
})



var mainWindow;

var setApplicationMenu = function() {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

app.on('ready', function() {
    // setApplicationMenu();

    var mainWindow = createWindow('main', {
        width: 330,
        minwidth: 330,
        maxwidth: 330,
        height: 250,
        minheight: 250,
        maxheight: 250,
        resizable: true,
        // fullscreenable: false,
        title: "Quiz Genie",
        // 'use-content-size': true,
        // center:true,
    });

    mainWindow.setMenu(null);
    // mainWindow.setSize(300,300);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    }));



    // if (env.name === 'development') {
    //     mainWindow.openDevTools();
    // }
});

app.on('window-all-closed', function() {
    app.quit();
});
