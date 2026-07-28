import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { MainMenuState } from "./MainMenuState.js";

export class OptionsMenu extends MusicBeatState {
  async create() {
    const menuBG = PIXI.Sprite.from("assets/images/menuDesat.png");
    menuBG.tint = 0xea71fd;
    menuBG.scale.set(1.1);
    menuBG.x = (this.app.screen.width - menuBG.width) / 2;
    menuBG.y = (this.app.screen.height - menuBG.height) / 2;
    this.addChild(menuBG);
  }

  update(elapsed) {
    if (this.app.controls.BACK) {
      this.app.switchState(new MainMenuState(this.app));
    }

    super.update(elapsed);
  }
}
