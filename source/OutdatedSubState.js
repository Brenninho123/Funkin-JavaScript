import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { MainMenuState } from "./MainMenuState.js";

export class OutdatedSubState extends MusicBeatState {
  static leftState = false;

  async create() {
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill(0x000000);
    this.addChild(bg);

    const ver = "v" + (this.app.appVersion || "0.0.0");
    const latestVer = this.app.latestVersion || ver;

    const txt = new PIXI.Text({
      text:
        "HEY! You're running an outdated version of the game!\nCurrent version is " +
        ver +
        " while the most recent version is " +
        latestVer +
        "! Press Space to go to itch.io, or ESCAPE to ignore this!!",
      style: {
        fontFamily: "VCR OSD Mono",
        fontSize: 32,
        fill: 0xffffff,
        align: "center",
        wordWrap: true,
        wordWrapWidth: this.app.screen.width
      }
    });
    txt.x = (this.app.screen.width - txt.width) / 2;
    txt.y = (this.app.screen.height - txt.height) / 2;
    this.addChild(txt);
  }

  update(elapsed) {
    const controls = this.app.controls;

    if (controls.ACCEPT) {
      window.open("https://ninja-muffin24.itch.io/funkin", "_blank");
    }
    if (controls.BACK) {
      OutdatedSubState.leftState = true;
      this.app.switchState(new MainMenuState(this.app));
    }

    super.update(elapsed);
  }
}
