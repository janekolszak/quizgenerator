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


/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function shuffleQuestions(questions) {
    for (var i = 0; i < questions.length; i++) {
        shuffleArray(questions[i].answers);
    }
    shuffleArray(questions);
}

function getQuestions(inDir) {
    var questions = [];

    var filenames = fs.readdirSync(inDir);
    for (var i = 0; i < filenames.length; i++) {
        var ext = path.extname(filenames[i]);
        if ((ext !== ".md" && ext !== ".txt") || filenames[i] === "header.md") {
            continue;
        }
        var content = fs.readFileSync(path.join(inDir, filenames[i]), 'utf-8');
        var lines = content.split(/\r?\n/);

        // Clean up comments and empty lines
        for (var j = lines.length - 1; j >= 0; j--) {
            if (!lines[j].trim() || lines[j].charAt(0) === "#") {
                lines.splice(j, 1);
            }
        }

        // Add to questions array
        var question = {
            text: lines[0],
            answers: lines.slice(1, lines.length)
        }
        questions.push(question);

    }

    return questions;
}

function question2Md(question) {
    var str = question.text;
    str += '\n';
    str += question.answers.join('\n');
    return str;
}

function getTest(questions, header) {
    var test = ""
    test += header;
    for (var i = 0; i < questions.length; i++) {
        test += question2Md(questions[i]);
        test += '\n';
        test += '\n';
    }
    return test;
}

function getHeader(inDir) {
    var headerPath = path.join(inDir, "header.md");
    if (fs.existsSync(headerPath)) {
        return fs.readFileSync(headerPath, 'utf-8');
    }
    return ""
}

ipcMain.on('gen-tests', (event, inDir, outDir, numTsts) => {
    var questions = getQuestions(inDir);
    var header = getHeader(inDir);

    for (var i = 1; i <= numTsts; ++i) {
        shuffleQuestions(questions);
        markdownpdf().from.string(getTest(questions, header)).to(path.join(outDir, i + ".pdf"), function() {
            console.log("Done")
        });
    }
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
