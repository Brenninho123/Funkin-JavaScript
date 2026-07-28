const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "FunkinJS",
    icon: path.join(__dirname, "../art/icon64.png")
  });

  win.loadFile(path.join(__dirname, "../export/release/html5/index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
