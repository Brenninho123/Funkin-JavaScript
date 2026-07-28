import * as PIXI from "pixi.js";
import { MusicBeatSubstate } from "./MusicBeatSubstate.js";
import { Alphabet } from "./Alphabet.js";
import { TitleState } from "./TitleState.js";
import { MainMenuState } from "./MainMenuState.js";

export class PauseSubState extends MusicBeatSubstate {
  constructor(app, x, y) {
    super(app);
    this.menuItems = ["Resume", "Restart Song", "Exit to menu"];
    this.curSelected = 0;
  }

  async create() {
    this.pauseMusic = await this.app.sound.loadEmbedded("assets/music/breakfast" + TitleState.soundExt, true);
    this.pauseMusic.volume = 0;
    this.pauseMusic.play(Math.floor(Math.random() * (this.pauseMusic.length / 2)));

    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill(0x000000);
    bg.alpha = 0.6;
    this.addChild(bg);

    this.grpMenuShit = new PIXI.Container();
    this.addChild(this.grpMenuShit);

    for (let i = 0; i < this.menuItems.length; i++) {
      const songText = new Alphabet(0, 70 * i + 30, this.menuItems[i], true, false);
      songText.isMenuItem = true;
      songText.targetY = i;
      this.grpMenuShit.addChild(songText);
    }

    this.changeSelection();
  }

  update(elapsed) {
    if (this.pauseMusic.volume < 0.5) {
      this.pauseMusic.volume += 0.01 * elapsed;
    }

    super.update(elapsed);

    const controls = this.app.controls;

    if (controls.UP_P) {
      this.changeSelection(-1);
    }
    if (controls.DOWN_P) {
      this.changeSelection(1);
    }

    if (controls.ACCEPT) {
      const daSelected = this.menuItems[this.curSelected];

      switch (daSelected) {
        case "Resume":
          this.close();
          break;
        case "Restart Song":
          this.app.resetState();
          break;
        case "Exit to menu":
          this.app.switchState(new MainMenuState(this.app));
          break;
      }
    }
  }

  close() {
    if (this.parent) {
      this.parent.closeSubState();
    }
  }

  destroy(options) {
    this.pauseMusic.destroy();
    super.destroy(options);
  }

  changeSelection(change = 0) {
    this.curSelected += change;

    if (this.curSelected < 0) this.curSelected = this.menuItems.length - 1;
    if (this.curSelected >= this.menuItems.length) this.curSelected = 0;

    let bullShit = 0;
    for (const item of this.grpMenuShit.children) {
      item.targetY = bullShit - this.curSelected;
      bullShit++;
      item.alpha = item.targetY === 0 ? 1 : 0.6;
    }
  }
}
