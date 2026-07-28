import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { SparrowSprite } from "./SparrowSprite.js";
import { TitleState } from "./TitleState.js";
import { StoryMenuState } from "./StoryMenuState.js";
import { FreeplayState } from "./FreeplayState.js";
import { OptionsMenu } from "./OptionsMenu.js";

export class MainMenuState extends MusicBeatState {
  constructor(app) {
    super(app);
    this.curSelected = 0;
    this.optionShit = ["story mode", "freeplay", "donate", "options"];
    this.selectedSomethin = false;
  }

  async create() {
    if (this.app.sound.music && !this.app.sound.music.playing) {
      this.app.sound.playMusic("assets/music/freakyMenu" + TitleState.soundExt);
    }

    this.persistentUpdate = true;
    this.persistentDraw = true;

    const bg = PIXI.Sprite.from("assets/images/menuBG.png");
    bg.x = -80;
    bg.scrollFactorX = 0;
    bg.scrollFactorY = 0.18;
    bg.scale.set(1.1);
    bg.x = (this.app.screen.width - bg.width) / 2;
    bg.y = (this.app.screen.height - bg.height) / 2;
    this.addChild(bg);

    this.camFollow = { x: 0, y: 0 };

    this.magenta = PIXI.Sprite.from("assets/images/menuDesat.png");
    this.magenta.scrollFactorX = 0;
    this.magenta.scrollFactorY = 0.18;
    this.magenta.scale.set(1.1);
    this.magenta.x = (this.app.screen.width - this.magenta.width) / 2;
    this.magenta.y = (this.app.screen.height - this.magenta.height) / 2;
    this.magenta.visible = false;
    this.magenta.tint = 0xfd719b;
    this.addChild(this.magenta);

    this.menuItems = new PIXI.Container();
    this.addChild(this.menuItems);

    const atlasSource = new SparrowSprite(0, 0);
    await atlasSource.loadAtlas("assets/images/FNF_main_menu_assets.png", "assets/images/FNF_main_menu_assets.xml");

    for (let i = 0; i < this.optionShit.length; i++) {
      const menuItem = new SparrowSprite(0, 60 + i * 160);
      menuItem.copyAtlasFrom(atlasSource);
      menuItem.addAnimation("idle", this.optionShit[i] + " basic", 24, true);
      menuItem.addAnimation("selected", this.optionShit[i] + " white", 24, true);
      menuItem.playAnimation("idle");
      menuItem.menuID = i;
      menuItem.x = (this.app.screen.width - menuItem.width) / 2;
      menuItem.scrollFactorX = 0;
      menuItem.scrollFactorY = 0;
      menuItem.antialias = true;
      this.menuItems.addChild(menuItem);
    }

    this.app.camera.follow(this.camFollow, 0.06);

    this.versionShit = new PIXI.Text({
      text: "v" + (this.app.appVersion || "0.0.0"),
      style: { fontFamily: "VCR OSD Mono", fontSize: 16, fill: 0xffffff, stroke: { color: 0x000000, width: 2 } }
    });
    this.versionShit.x = 5;
    this.versionShit.y = this.app.screen.height - 18;
    this.addChild(this.versionShit);

    this.changeItem();
  }

  update(elapsed) {
    if (this.app.sound.music && this.app.sound.music.volume < 0.8) {
      this.app.sound.music.volume += 0.5 * (elapsed / 1000);
    }

    const controls = this.app.controls;

    if (!this.selectedSomethin) {
      if (controls.UP_P) {
        this.app.sound.play("assets/sounds/scrollMenu" + TitleState.soundExt);
        this.changeItem(-1);
      }

      if (controls.DOWN_P) {
        this.app.sound.play("assets/sounds/scrollMenu" + TitleState.soundExt);
        this.changeItem(1);
      }

      if (controls.BACK) {
        this.app.switchState(new TitleState(this.app));
      }

      if (controls.ACCEPT) {
        if (this.optionShit[this.curSelected] === "donate") {
          window.open("https://ninja-muffin24.itch.io/funkin", "_blank");
        } else {
          this.selectedSomethin = true;
          this.app.sound.play("assets/sounds/confirmMenu" + TitleState.soundExt);

          this.flicker(this.magenta, 1100, 150);

          for (const spr of this.menuItems.children) {
            if (this.curSelected !== spr.menuID) {
              this.tweenTo(spr, { alpha: 0 }, 400, () => {
                spr.visible = false;
              });
            } else {
              this.flicker(spr, 1000, 60, () => {
                const daChoice = this.optionShit[this.curSelected];

                switch (daChoice) {
                  case "story mode":
                    this.app.switchState(new StoryMenuState(this.app));
                    break;
                  case "freeplay":
                    this.app.switchState(new FreeplayState(this.app));
                    break;
                  case "options":
                    this.app.switchState(new OptionsMenu(this.app));
                    break;
                }
              });
            }
          }
        }
      }
    }

    super.update(elapsed);

    for (const spr of this.menuItems.children) {
      spr.x = (this.app.screen.width - spr.width) / 2;
    }
  }

  flicker(target, durationMs, intervalMs, onComplete) {
    let elapsed = 0;
    const step = () => {
      target.visible = !target.visible;
      elapsed += intervalMs;
      if (elapsed < durationMs) {
        setTimeout(step, intervalMs);
      } else {
        target.visible = true;
        if (onComplete) onComplete();
      }
    };
    step();
  }

  tweenTo(target, props, durationMs, onComplete) {
    const start = {};
    for (const key in props) {
      start[key] = target[key];
    }
    const startTime = performance.now();

    const step = () => {
      const t = Math.min((performance.now() - startTime) / durationMs, 1);
      for (const key in props) {
        target[key] = start[key] + (props[key] - start[key]) * t;
      }
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (onComplete) {
        onComplete();
      }
    };
    requestAnimationFrame(step);
  }

  changeItem(huh = 0) {
    this.curSelected += huh;

    if (this.curSelected >= this.menuItems.children.length) this.curSelected = 0;
    if (this.curSelected < 0) this.curSelected = this.menuItems.children.length - 1;

    for (const spr of this.menuItems.children) {
      spr.playAnimation("idle");

      if (spr.menuID === this.curSelected) {
        spr.playAnimation("selected");
        this.camFollow.x = spr.x + spr.width / 2;
        this.camFollow.y = spr.y + spr.height / 2;
      }

      spr.updateHitbox();
    }
  }
}
