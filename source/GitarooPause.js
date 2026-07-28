import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { SparrowSprite } from "./SparrowSprite.js";
import { PlayState } from "./PlayState.js";
import { MainMenuState } from "./MainMenuState.js";

export class GitarooPause extends MusicBeatState {
  constructor(app) {
    super(app);
    this.replaySelect = false;
  }

  async create() {
    if (this.app.sound.music) {
      this.app.sound.music.stop();
    }

    const bg = PIXI.Sprite.from("assets/images/pauseAlt/pauseBG.png");
    this.addChild(bg);

    const bf = new SparrowSprite(0, 30);
    await bf.loadAtlas("assets/images/pauseAlt/bfLol.png", "assets/images/pauseAlt/bfLol.xml");
    bf.addAnimation("lol", "funnyThing", 13, true);
    bf.playAnimation("lol");
    this.addChild(bf);
    bf.x = (this.app.screen.width - bf.width) / 2;

    this.replayButton = new SparrowSprite(this.app.screen.width * 0.28, this.app.screen.height * 0.7);
    await this.replayButton.loadAtlas("assets/images/pauseAlt/pauseUI.png", "assets/images/pauseAlt/pauseUI.xml");
    this.replayButton.addAnimation("selected", "bluereplay", 24, false);
    this.replayButton.appendAnimation("selected", "yellowreplay");
    this.replayButton.playAnimation("selected");
    this.addChild(this.replayButton);

    this.cancelButton = new SparrowSprite(this.app.screen.width * 0.58, this.replayButton.y);
    await this.cancelButton.loadAtlas("assets/images/pauseAlt/pauseUI.png", "assets/images/pauseAlt/pauseUI.xml");
    this.cancelButton.addAnimation("selected", "bluecancel", 24, false);
    this.cancelButton.appendAnimation("selected", "cancelyellow");
    this.cancelButton.playAnimation("selected");
    this.addChild(this.cancelButton);

    this.changeThing();
  }

  update(elapsed) {
    super.update(elapsed);

    const controls = this.app.controls;

    if (controls.LEFT_P || controls.RIGHT_P) {
      this.changeThing();
    }

    if (controls.ACCEPT) {
      if (this.replaySelect) {
        this.app.switchState(new PlayState(this.app));
      } else {
        this.app.switchState(new MainMenuState(this.app));
      }
    }
  }

  changeThing() {
    this.replaySelect = !this.replaySelect;

    if (this.replaySelect) {
      this.cancelButton.setAnimationFrame(0);
      this.replayButton.setAnimationFrame(1);
    } else {
      this.cancelButton.setAnimationFrame(1);
      this.replayButton.setAnimationFrame(0);
    }
  }
}
