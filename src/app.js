import { remote, ipcRenderer } from 'electron';

ipcRenderer.on('gen-tests-done', (event, status) => {
    alert(status);
})

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('inDirBtn').addEventListener('click', _ => {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), { properties: ['openDirectory'] },
            files => {
                document.getElementById('inDirTxt').value = files[0];
            });
    });

    document.getElementById('outDirBtn').addEventListener('click', _ => {
        remote.dialog.showOpenDialog(remote.getCurrentWindow(), { properties: ['openDirectory'] },
            files => {
                document.getElementById('outDirTxt').value = files[0];
            });
    });

    document.getElementById('quitBtn').addEventListener('click', _ => {
        ipcRenderer.send('close-main-window');
    });

    document.getElementById('okBtn').addEventListener('click', _ => {
        var inDir = document.getElementById('inDirTxt').value
        var outDir = document.getElementById('outDirTxt').value
        var numTsts = document.getElementById('numTsts').value
        ipcRenderer.send('gen-tests', inDir, outDir, numTsts);
    });
});
