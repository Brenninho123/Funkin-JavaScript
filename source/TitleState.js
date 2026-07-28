import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { Alphabet } from "./Alphabet.js";
import { Conductor } from "./Conductor.js";
import { Highscore } from "./Highscore.js";
import { PlayerSettings } from "./PlayerSettings.js";
import { MainMenuState } from "./MainMenuState.js";

export class TitleState extends MusicBeatState {
  static initialized = false;
  static soundExt = ".mp3";

  constructor(app) {
    super(app);
    this.curWacky = [];
    this.danceLeft = false;
    this.transitioning = false;
    this.skippedIntro = false;
  }

  async create() {
    PlayerSettings.init();

    const introLines = await this.getIntroTextShit();
    this.curWacky = introLines[Math.floor(Math.random() * introLines.length)];

    await super.create();

    Highscore.load();

    setTimeout(() => this.startIntro(), 1000);
  }

  async startIntro() {
    if (!TitleState.initialized) {
      this.app.sound.playMusic("assets/music/freakyMenu" + TitleState.soundExt, 0);
      this.app.sound.music.fadeIn(4, 0, 0.7);
    }

    Conductor.changeBPM(102);
    this.persistentUpdate = true;

    const bg = new PIXI.Graphics();
    bg.rect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.fill(0x000000);
    this.addChild(bg);

    this.logoBl = await this.loadSprite("assets/images/logoBumpin", -150, -100);
    this.logoBl.addAnimation("bump", "logo bumpin", 24);
    this.logoBl.playAnimation("bump");

    this.gfDance = await this.loadSprite("assets/images/gfDanceTitle", this.app.screen.width * 0.4, this.app.screen.height * 0.07);
    this.gfDance.addAnimationByIndices("danceLeft", "gfDance", [30, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 24, false);
    this.gfDance.addAnimationByIndices("danceRight", "gfDance", [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 24, false);
    this.addChild(this.gfDance);
    this.addChild(this.logoBl);

    this.titleText = await this.loadSprite("assets/images/titleEnter", 100, this.app.screen.height * 0.8);
    this.titleText.addAnimation("idle", "Press Enter to Begin", 24);
    this.titleText.addAnimation("press", "ENTER PRESSED", 24);
    this.titleText.playAnimation("idle");
    this.addChild(this.titleText);

    this.credGroup = new PIXI.Container();
    this.addChild(this.credGroup);
    this.textGroup = new PIXI.Container();

    this.ngSpr = PIXI.Sprite.from("assets/images/newgrounds_logo.png");
    this.ngSpr.y = this.app.screen.height * 0.52;
    this.ngSpr.visible = false;
    this.ngSpr.scale.set(0.8);
    this.ngSpr.x = (this.app.screen.width - this.ngSpr.width) / 2;
    this.addChild(this.ngSpr);

    if (TitleState.initialized) {
      this.skipIntro();
    } else {
      TitleState.initialized = true;
    }
  }

  async getIntroTextShit() {
    const response = await fetch("assets/data/introText.txt");
    const fullText = await response.text();
    return fullText.split("\n").map((line) => line.split("--"));
  }

  update(elapsed) {
    if (this.app.sound.music) {
      Conductor.songPosition = this.app.sound.music.currentTime * 1000;
    }

    const pressedEnter = this.app.input.justPressed("Enter");

    if (pressedEnter && !this.transitioning && this.skippedIntro) {
      this.titleText.playAnimation("press");
      this.app.camera.flash(0xffffff, 1);
      this.app.sound.play("assets/sounds/confirmMenu" + TitleState.soundExt, 0.7);

      this.transitioning = true;

      setTimeout(() => {
        this.app.switchState(new MainMenuState(this.app));
      }, 2000);
    }

    if (pressedEnter && !this.skippedIntro) {
      this.skipIntro();
    }

    super.update(elapsed);
  }

  createCoolText(textArray) {
    textArray.forEach((text, i) => {
      const money = new Alphabet(0, 0, text, true, false);
      money.x = (this.app.screen.width - money.width) / 2;
      money.y += i * 60 + 200;
      this.credGroup.addChild(money);
      this.textGroup.addChild(money);
    });
  }

  addMoreText(text) {
    const coolText = new Alphabet(0, 0, text, true, false);
    coolText.x = (this.app.screen.width - coolText.width) / 2;
    coolText.y += this.textGroup.children.length * 60 + 200;
    this.credGroup.addChild(coolText);
    this.textGroup.addChild(coolText);
  }

  deleteCoolText() {
    while (this.textGroup.children.length > 0) {
      const child = this.textGroup.children[0];
      this.credGroup.removeChild(child);
      this.textGroup.removeChild(child);
    }
  }

  beatHit() {
    super.beatHit();

    this.logoBl.playAnimation("bump");
    this.danceLeft = !this.danceLeft;
    this.gfDance.playAnimation(this.danceLeft ? "danceRight" : "danceLeft");

    switch (this.curBeat) {
      case 1:
        this.createCoolText(["ninjamuffin99", "phantomArcade", "kawaisprite", "evilsk8er"]);
        break;
      case 3:
        this.addMoreText("present");
        break;
      case 4:
        this.deleteCoolText();
        break;
      case 5:
        this.createCoolText(["In association", "with"]);
        break;
      case 7:
        this.addMoreText("newgrounds");
        this.ngSpr.visible = true;
        break;
      case 8:
        this.deleteCoolText();
        this.ngSpr.visible = false;
        break;
      case 9:
        this.createCoolText([this.curWacky[0]]);
        break;
      case 11:
        this.addMoreText(this.curWacky[1]);
        break;
      case 12:
        this.deleteCoolText();
        break;
      case 13:
        this.addMoreText("Friday");
        break;
      case 14:
        this.addMoreText("Night");
        break;
      case 15:
        this.addMoreText("Funkin");
        break;
      case 16:
        this.skipIntro();
        break;
    }
  }

  skipIntro() {
    if (!this.skippedIntro) {
      this.removeChild(this.ngSpr);
      this.app.camera.flash(0xffffff, 4);
      this.removeChild(this.credGroup);
      this.skippedIntro = true;
    }
  }
}
