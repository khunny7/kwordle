const { app, BrowserWindow } = require('electron');
const path = require('path');

// Basic error handlers to surface issues when running Electron
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in main process:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in main process:', reason);
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading file:', indexPath);
    win.loadFile(indexPath).catch((err) => {
      console.error('Failed to load index.html:', err);
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
