import { SparrowSprite } from "./SparrowSprite.js";

export class MenuItem extends SparrowSprite {
  constructor(x, y, weekNum = 0) {
    super(x, y);
    this.targetY = 0;
    this.weekNum = weekNum;
  }

  async init() {
    await this.loadAtlas(
      "assets/images/campaign_menu_UI_assets.png",
      "assets/images/campaign_menu_UI_assets.xml"
    );

    this.addAnimation("week0", "tutorial selected", 24, true);
    this.addAnimation("week1", "WEEK1 select", 24, true);
    this.addAnimation("week2", "week2 select", 24, true);
    this.addAnimation("week3", "Week 3 press", 24, true);
    this.addAnimation("week4", "Week 4 press", 24, true);
    this.addAnimation("week5", "week 5", 24, true);
    this.addAnimation("week6", "Week 6", 24, true);

    this.playAnimation("week" + this.weekNum);
    this._animPlaying = false;
    this.updateHitbox();
  }

  update(elapsed) {
    super.update(elapsed);
    this.y = lerp(this.y, this.targetY * 120 + 480, 0.17);
  }
}

function lerp(a, b, ratio) {
  return a + (b - a) * ratio;
}
