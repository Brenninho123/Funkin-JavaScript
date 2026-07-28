import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { MenuItem } from "./MenuItem.js";
import { MenuCharacter } from "./MenuCharacter.js";
import { TitleState } from "./TitleState.js";
import { PlayState } from "./PlayState.js";
import { MainMenuState } from "./MainMenuState.js";
import { Song } from "./Song.js";
import { Highscore } from "./Highscore.js";
import { SparrowSprite } from "./SparrowSprite.js";

export class StoryMenuState extends MusicBeatState {
  static weekUnlocked = [true, true, true, true, true, true, true];

  constructor(app) {
    super(app);

    this.weekData = [
      ["Tutorial"],
      ["Bopeebo", "Fresh", "Dadbattle"],
      ["Spookeez", "South"],
      ["Pico", "Philly", "Blammed"],
      ["Satin-Panties", "High", "Milf"],
      ["Cocoa", "Eggnog", "Winter-Horrorland"],
      ["Senpai", "Roses", "Thorns"]
    ];

    this.curDifficulty = 1;

    this.weekCharacters = [
      ["dad", "bf", "gf"],
      ["dad", "bf", "gf"],
      ["spooky", "bf", "gf"],
      ["pico", "bf", "gf"],
      ["mom", "bf", "gf"],
      ["parents-christmas", "bf", "gf"],
      ["senpai", "bf", "gf"]
    ];

    this.weekNames = [
      "",
      "Daddy Dearest",
      "Spooky Month",
      "PICO",
      "MOMMY MUST MURDER",
      "RED SNOW",
      "hating simulator ft. moawling"
    ];

    this.curWeek = 0;
    this.lerpScore = 0;
    this.intendedScore = 0;
    this.movedBack = false;
    this.selectedWeek = false;
    this.stopspamming = false;
  }

  async create() {
    if (this.app.sound.music) {
      if (!this.app.sound.music.playing) {
        this.app.sound.playMusic("assets/music/freakyMenu" + TitleState.soundExt);
      }
    }

    this.persistentUpdate = true;
    this.persistentDraw = true;

    this.scoreText = new PIXI.Text({
      text: "SCORE: 49324858",
      style: { fontFamily: "VCR OSD Mono", fontSize: 36, fill: 0xffffff }
    });
    this.scoreText.x = 10;
    this.scoreText.y = 10;

    this.txtWeekTitle = new PIXI.Text({
      text: "",
      style: { fontFamily: "VCR OSD Mono", fontSize: 32, fill: 0xffffff, align: "right" }
    });
    this.txtWeekTitle.x = this.app.screen.width * 0.7;
    this.txtWeekTitle.y = 10;
    this.txtWeekTitle.alpha = 0.7;

    const uiAtlas = new SparrowSprite(0, 0);
    await uiAtlas.loadAtlas("assets/images/campaign_menu_UI_assets.png", "assets/images/campaign_menu_UI_assets.xml");
    this.uiTex = uiAtlas;

    const yellowBG = new PIXI.Graphics();
    yellowBG.rect(0, 56, this.app.screen.width, 400);
    yellowBG.fill(0xf9cf51);
    yellowBG.y = 56;

    this.grpWeekText = new PIXI.Container();
    this.addChild(this.grpWeekText);

    const blackBarThingie = new PIXI.Graphics();
    blackBarThingie.rect(0, 0, this.app.screen.width, 56);
    blackBarThingie.fill(0x000000);
    this.addChild(blackBarThingie);

    this.grpWeekCharacters = new PIXI.Container();
    this.grpLocks = new PIXI.Container();
    this.addChild(this.grpLocks);

    for (let i = 0; i < this.weekData.length; i++) {
      const weekThing = new MenuItem(0, yellowBG.y + 400 + 10, i);
      await weekThing.init();
      weekThing.y += (weekThing.height + 20) * i;
      weekThing.targetY = i;
      this.grpWeekText.addChild(weekThing);

      weekThing.x = (this.app.screen.width - weekThing.width) / 2;
      weekThing.antialias = true;

      if (!StoryMenuState.weekUnlocked[i]) {
        const lock = this.cloneFromAtlas(this.uiTex, weekThing.width + 10 + weekThing.x, weekThing.y);
        lock.addAnimation("lock", "lock", 24, true);
        lock.playAnimation("lock");
        lock.lockID = i;
        lock.antialias = true;
        this.grpLocks.addChild(lock);
      }
    }

    for (let char = 0; char < 3; char++) {
      const weekCharacterThing = new MenuCharacter(
        this.app.screen.width * 0.25 * (1 + char) - 150,
        this.weekCharacters[this.curWeek][char]
      );
      await weekCharacterThing.init();
      weekCharacterThing.y += 70;
      weekCharacterThing.antialias = true;

      switch (weekCharacterThing.character) {
        case "dad":
          weekCharacterThing.setGraphicSize(Math.floor(weekCharacterThing.width * 0.5));
          weekCharacterThing.updateHitbox();
          break;
        case "bf":
          weekCharacterThing.setGraphicSize(Math.floor(weekCharacterThing.width * 0.9));
          weekCharacterThing.updateHitbox();
          weekCharacterThing.x -= 80;
          break;
        case "gf":
          weekCharacterThing.setGraphicSize(Math.floor(weekCharacterThing.width * 0.5));
          weekCharacterThing.updateHitbox();
          break;
        case "pico":
          weekCharacterThing.flipX = true;
          break;
        case "parents-christmas":
          weekCharacterThing.setGraphicSize(Math.floor(weekCharacterThing.width * 0.9));
          weekCharacterThing.updateHitbox();
          break;
      }

      this.grpWeekCharacters.addChild(weekCharacterThing);
    }

    this.difficultySelectors = new PIXI.Container();
    this.addChild(this.difficultySelectors);

    const firstWeekItem = this.grpWeekText.children[0];

    this.leftArrow = this.cloneFromAtlas(this.uiTex, firstWeekItem.x + firstWeekItem.width + 10, firstWeekItem.y + 10);
    this.leftArrow.addAnimation("idle", "arrow left", 24, true);
    this.leftArrow.addAnimation("press", "arrow push left", 24, true);
    this.leftArrow.playAnimation("idle");
    this.difficultySelectors.addChild(this.leftArrow);

    this.sprDifficulty = this.cloneFromAtlas(this.uiTex, this.leftArrow.x + 130, this.leftArrow.y);
    this.sprDifficulty.addAnimation("easy", "EASY", 24, true);
    this.sprDifficulty.addAnimation("normal", "NORMAL", 24, true);
    this.sprDifficulty.addAnimation("hard", "HARD", 24, true);
    this.sprDifficulty.playAnimation("easy");
    this.difficultySelectors.addChild(this.sprDifficulty);
    this.changeDifficulty();

    this.rightArrow = this.cloneFromAtlas(this.uiTex, this.sprDifficulty.x + this.sprDifficulty.width + 50, this.leftArrow.y);
    this.rightArrow.addAnimation("idle", "arrow right", 24, true);
    this.rightArrow.addAnimation("press", "arrow push right", 24, false);
    this.rightArrow.playAnimation("idle");
    this.difficultySelectors.addChild(this.rightArrow);

    this.addChild(yellowBG);
    this.addChild(this.grpWeekCharacters);

    this.txtTracklist = new PIXI.Text({
      text: "Tracks",
      style: { fontFamily: "VCR OSD Mono", fontSize: 32, fill: 0xe55777, align: "center" }
    });
    this.txtTracklist.x = this.app.screen.width * 0.05;
    this.txtTracklist.y = yellowBG.y + 400 + 100;
    this.addChild(this.txtTracklist);

    this.addChild(this.scoreText);
    this.addChild(this.txtWeekTitle);

    this.updateText();
  }

  cloneFromAtlas(source, x, y) {
    const spr = new SparrowSprite(x, y);
    spr.copyAtlasFrom(source);
    return spr;
  }

  update(elapsed) {
    this.lerpScore = Math.floor(lerp(this.lerpScore, this.intendedScore, 0.5));
    this.scoreText.text = "WEEK SCORE:" + this.lerpScore;

    this.txtWeekTitle.text = this.weekNames[this.curWeek].toUpperCase();
    this.txtWeekTitle.x = this.app.screen.width - (this.txtWeekTitle.width + 10);

    this.difficultySelectors.visible = StoryMenuState.weekUnlocked[this.curWeek];

    for (const lock of this.grpLocks.children) {
      lock.y = this.grpWeekText.children[lock.lockID].y;
    }

    const controls = this.app.controls;

    if (!this.movedBack) {
      if (!this.selectedWeek) {
        if (controls.UP_P) {
          this.changeWeek(-1);
        }
        if (controls.DOWN_P) {
          this.changeWeek(1);
        }

        this.rightArrow.playAnimation(controls.RIGHT ? "press" : "idle");
        this.leftArrow.playAnimation(controls.LEFT ? "press" : "idle");

        if (controls.RIGHT_P) {
          this.changeDifficulty(1);
        }
        if (controls.LEFT_P) {
          this.changeDifficulty(-1);
        }
      }

      if (controls.ACCEPT) {
        this.selectWeek();
      }
    }

    if (controls.BACK && !this.movedBack && !this.selectedWeek) {
      this.app.sound.play("assets/sounds/cancelMenu" + TitleState.soundExt);
      this.movedBack = true;
      this.app.switchState(new MainMenuState(this.app));
    }

    super.update(elapsed);
  }

  async selectWeek() {
    if (!StoryMenuState.weekUnlocked[this.curWeek]) {
      return;
    }

    if (!this.stopspamming) {
      this.app.sound.play("assets/sounds/confirmMenu" + TitleState.soundExt);
      this.grpWeekCharacters.children[1].playAnimation("bfConfirm");
      this.stopspamming = true;
    }

    PlayState.storyPlaylist = this.weekData[this.curWeek];
    PlayState.isStoryMode = true;
    this.selectedWeek = true;

    let diffic = "";
    switch (this.curDifficulty) {
      case 0: diffic = "-easy"; break;
      case 2: diffic = "-hard"; break;
    }

    PlayState.storyDifficulty = this.curDifficulty;
    PlayState.SONG = await Song.loadFromJson(
      PlayState.storyPlaylist[0].toLowerCase() + diffic,
      PlayState.storyPlaylist[0].toLowerCase()
    );
    PlayState.storyWeek = this.curWeek;
    PlayState.campaignScore = 0;

    setTimeout(() => {
      if (this.app.sound.music) {
        this.app.sound.music.stop();
      }
      this.app.switchState(new PlayState(this.app));
    }, 1000);
  }

  changeDifficulty(change = 0) {
    this.curDifficulty += change;

    if (this.curDifficulty < 0) this.curDifficulty = 2;
    if (this.curDifficulty > 2) this.curDifficulty = 0;

    this.sprDifficulty.offsetX = 0;

    switch (this.curDifficulty) {
      case 0:
        this.sprDifficulty.playAnimation("easy");
        this.sprDifficulty.offsetX = 20;
        break;
      case 1:
        this.sprDifficulty.playAnimation("normal");
        this.sprDifficulty.offsetX = 70;
        break;
      case 2:
        this.sprDifficulty.playAnimation("hard");
        this.sprDifficulty.offsetX = 20;
        break;
    }

    this.sprDifficulty.alpha = 0;
    this.sprDifficulty.y = this.leftArrow.y - 15;

    this.intendedScore = Highscore.getWeekScore(this.curWeek, this.curDifficulty);

    this.tweenTo(this.sprDifficulty, { y: this.leftArrow.y + 15, alpha: 1 }, 70);
  }

  tweenTo(target, props, durationMs) {
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
      }
    };
    requestAnimationFrame(step);
  }

  changeWeek(change = 0) {
    this.curWeek += change;

    if (this.curWeek >= this.weekData.length) this.curWeek = 0;
    if (this.curWeek < 0) this.curWeek = this.weekData.length - 1;

    let bullShit = 0;
    for (const item of this.grpWeekText.children) {
      item.targetY = bullShit - this.curWeek;
      item.alpha = item.targetY === 0 && StoryMenuState.weekUnlocked[this.curWeek] ? 1 : 0.6;
      bullShit++;
    }

    this.app.sound.play("assets/sounds/scrollMenu" + TitleState.soundExt);

    this.updateText();
  }

  updateText() {
    this.grpWeekCharacters.children[0].playAnimation(this.weekCharacters[this.curWeek][0]);
    this.grpWeekCharacters.children[1].playAnimation(this.weekCharacters[this.curWeek][1]);
    this.grpWeekCharacters.children[2].playAnimation(this.weekCharacters[this.curWeek][2]);

    this.txtTracklist.text = "Tracks\n";

    const firstChar = this.grpWeekCharacters.children[0];

    switch (firstChar.currentAnimName) {
      case "parents-christmas":
        firstChar.offsetX = 200;
        firstChar.offsetY = 200;
        firstChar.setGraphicSize(Math.floor(firstChar.width * 0.99));
        break;
      case "senpai":
        firstChar.offsetX = 130;
        firstChar.offsetY = 0;
        firstChar.setGraphicSize(Math.floor(firstChar.width * 1.4));
        break;
      case "mom":
        firstChar.offsetX = 100;
        firstChar.offsetY = 200;
        firstChar.setGraphicSize(Math.floor(firstChar.width * 1));
        break;
      case "dad":
        firstChar.offsetX = 120;
        firstChar.offsetY = 200;
        firstChar.setGraphicSize(Math.floor(firstChar.width * 1));
        break;
      default:
        firstChar.offsetX = 100;
        firstChar.offsetY = 100;
        firstChar.setGraphicSize(Math.floor(firstChar.width * 1));
    }

    const stringThing = this.weekData[this.curWeek];
    for (const i of stringThing) {
      this.txtTracklist.text += "\n" + i;
    }

    this.txtTracklist.text = this.txtTracklist.text.toUpperCase();
    this.txtTracklist.x = (this.app.screen.width - this.txtTracklist.width) / 2 - this.app.screen.width * 0.35;

    this.intendedScore = Highscore.getWeekScore(this.curWeek, this.curDifficulty);
  }
}

function lerp(a, b, ratio) {
  return a + (b - a) * ratio;
}
