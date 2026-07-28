import { SparrowSprite } from "./SparrowSprite.js";

export class MenuCharacter extends SparrowSprite {
  constructor(x, character = "bf") {
    super(x, 0);
    this.character = character;
  }

  async init() {
    await this.loadAtlas(
      "assets/images/campaign_menu_UI_characters.png",
      "assets/images/campaign_menu_UI_characters.xml"
    );

    this.addAnimation("bf", "BF idle dance white", 24, true);
    this.addAnimation("bfConfirm", "BF HEY!!", 24, false);
    this.addAnimation("gf", "GF Dancing Beat WHITE", 24, true);
    this.addAnimation("dad", "Dad idle dance BLACK LINE", 24, true);
    this.addAnimation("spooky", "spooky dance idle BLACK LINES", 24, true);
    this.addAnimation("pico", "Pico Idle Dance", 24, true);
    this.addAnimation("mom", "Mom Idle BLACK LINES", 24, true);
    this.addAnimation("parents-christmas", "Parent Christmas Idle", 24, true);
    this.addAnimation("senpai", "SENPAI idle Black Lines", 24, true);

    this.playAnimation(this.character);
    this.updateHitbox();
  }
}
