import * as PIXI from "pixi.js";
import { SparrowSprite } from "./SparrowSprite.js";

export class BackgroundDancer extends SparrowSprite {
  constructor(x, y) {
    super(x, y);
    this.danceDir = false;
  }

  async init() {
    await this.loadAtlas("assets/images/limo/limoDancer.png", "assets/images/limo/limoDancer.xml");
    this.addAnimationByIndices("danceLeft", "bg dancer sketch PINK", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 24, false);
    this.addAnimationByIndices("danceRight", "bg dancer sketch PINK", [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 24, false);
    this.playAnimation("danceLeft");
    this.antialias = true;
  }

  dance() {
    this.danceDir = !this.danceDir;
    this.playAnimation(this.danceDir ? "danceRight" : "danceLeft", true);
  }
}
