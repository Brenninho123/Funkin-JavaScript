import * as PIXI from "pixi.js";
import { Boyfriend } from "./Boyfriend.js";
import { PlayState } from "./PlayState.js";

export class GameOverState extends PIXI.Container {
  constructor(app, x, y) {
    super();
    this.app = app;
    this.bfX = x;
    this.bfY = y;
    this.fading = false;
  }

  async create() {
    this.bf = new Boyfriend(this.bfX, this.bfY);
    await this.bf.init();
    this.addChild(this.bf);
    this.bf.playAnim("firstDeath");

    this.app.camera.follow(this.bf, 0.001);

    if (this.app.sound.music) {
      this.app.sound.music.fadeOut(2, this.app.sound.music.volume * 0.6);
    }
  }

  update(elapsed) {
    const pressed = false;

    if (pressed && !this.fading) {
      this.fading = true;
      this.app.sound.music.fadeOut(0.5, 0, () => {
        this.app.sound.music.stop();
        this.app.switchState(new PlayState(this.app));
      });
    }
  }
}
