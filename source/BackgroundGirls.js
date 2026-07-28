import { SparrowSprite } from "./SparrowSprite.js";
import { CoolUtil } from "./CoolUtil.js";

export class BackgroundGirls extends SparrowSprite {
  constructor(x, y) {
    super(x, y);
    this.danceDir = false;
  }

  async init() {
    await this.loadAtlas("assets/images/weeb/bgFreaks.png", "assets/images/weeb/bgFreaks.xml");

    this.addAnimationByIndices("danceLeft", "BG girls group", CoolUtil.numberArray(14), 24, false);
    this.addAnimationByIndices("danceRight", "BG girls group", CoolUtil.numberArray(30, 15), 24, false);

    this.playAnimation("danceLeft");
  }

  getScared() {
    this.addAnimationByIndices("danceLeft", "BG fangirls dissuaded", CoolUtil.numberArray(14), 24, false);
    this.addAnimationByIndices("danceRight", "BG fangirls dissuaded", CoolUtil.numberArray(30, 15), 24, false);
    this.dance();
  }

  dance() {
    this.danceDir = !this.danceDir;
    this.playAnimation(this.danceDir ? "danceRight" : "danceLeft", true);
  }
}
