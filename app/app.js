const fs = require('fs');
const path = require('path');
const {app, Menu, Tray, BrowserWindow, ipcMain} = require('electron');

const sudo = require('sudo-prompt');
const options = {
  name: 'Electron',
};

let tray = null;
app.on('ready', () => {
  tray = new Tray(path.join(__dirname, 'iconTemplate.png'));
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Open hosts', type: 'normal', click: () => openHosts() },
    {label: 'Exit', type: 'normal', click: () => app.quit() },
  ]);
  tray.setToolTip('This is my application.');
  tray.setContextMenu(contextMenu);

  ipcMain.on('runCommand', function(event, cmd) {
    console.log(cmd);
    sudo.exec(cmd, options, function(error, stdout, stderr) {
      event.sender.send('status', { error, stdout, stderr });
    });
  });
});

const openHosts = () => {
  const options = {
    width: 400,
    height: 250,
    autoHideMenuBar: true,
    backgroundColor: '#FFFFFF',
    useContentSize: true,
  }
  if (process.platform === 'linux') {
    options.icon = path.join(__dirname, 'iconTemplate.png');
  }

  mainWindow = new BrowserWindow(options);
  mainWindow.setResizable(false);
  // mainWindow.openDevTools();
  mainWindow.loadURL(path.join('file://', __dirname, 'app.html'));
  mainWindow.focus();
}
