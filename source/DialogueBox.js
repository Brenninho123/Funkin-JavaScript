import * as PIXI from "pixi.js";
import { SparrowSprite } from "./SparrowSprite.js";
import { Alphabet } from "./Alphabet.js";
import { PlayState } from "./PlayState.js";
import { TitleState } from "./TitleState.js";

export class DialogueBox extends PIXI.Container {
  constructor(app, talkingRight = true, dialogueList = []) {
    super();
    this.app = app;
    this.curCharacter = "";
    this.dialogueList = dialogueList;
    this.dialogueOpened = false;
    this.dialogueStarted = false;
    this.isEnding = false;
    this.finishThing = null;
  }

  async create() {
    const song = PlayState.SONG.song.toLowerCase();

    if (song === "senpai") {
      await this.app.sound.playMusic("assets/music/Lunchbox" + TitleState.soundExt, 0);
      this.app.sound.music.fadeIn(1, 0, 0.8);
    } else if (song === "thorns") {
      await this.app.sound.playMusic("assets/music/LunchboxScary" + TitleState.soundExt, 0);
      this.app.sound.music.fadeIn(1, 0, 0.8);
    }

    this.bgFade = new PIXI.Graphics();
    this.bgFade.rect(0, 0, this.app.screen.width * 1.3, this.app.screen.height * 1.3);
    this.bgFade.fill(0xb3dfd8);
    this.bgFade.x = -200;
    this.bgFade.y = -200;
    this.bgFade.alpha = 0;
    this.addChild(this.bgFade);

    let fadeStep = 0;
    const fadeTicker = setInterval(() => {
      this.bgFade.alpha += (1 / 5) * 0.7;
      if (this.bgFade.alpha > 0.7) {
        this.bgFade.alpha = 0.7;
      }
      fadeStep++;
      if (fadeStep >= 5) {
        clearInterval(fadeTicker);
      }
    }, 830);

    this.portraitLeft = new SparrowSprite(-20, 40);
    await this.portraitLeft.loadAtlas("assets/images/weeb/senpaiPortrait.png", "assets/images/weeb/senpaiPortrait.xml");
    this.portraitLeft.addAnimation("enter", "Senpai Portrait Enter", 24, false);
    this.portraitLeft.setGraphicSize(Math.floor(this.portraitLeft.width * PlayState.daPixelZoom * 0.9));
    this.portraitLeft.updateHitbox();
    this.addChild(this.portraitLeft);
    this.portraitLeft.visible = false;

    this.portraitRight = new SparrowSprite(0, 40);
    await this.portraitRight.loadAtlas("assets/images/weeb/bfPortrait.png", "assets/images/weeb/bfPortrait.xml");
    this.portraitRight.addAnimation("enter", "Boyfriend portrait enter", 24, false);
    this.portraitRight.setGraphicSize(Math.floor(this.portraitRight.width * PlayState.daPixelZoom * 0.9));
    this.portraitRight.updateHitbox();
    this.addChild(this.portraitRight);
    this.portraitRight.visible = false;

    this.box = new SparrowSprite(-20, 45);

    switch (song) {
      case "senpai":
        await this.box.loadAtlas("assets/images/weeb/pixelUI/dialogueBox-pixel.png", "assets/images/weeb/pixelUI/dialogueBox-pixel.xml");
        this.box.addAnimation("normalOpen", "Text Box Appear", 24, false);
        this.box.addAnimationByIndices("normal", "Text Box Appear", [4], 24, true);
        break;
      case "roses":
        this.app.sound.play("assets/sounds/ANGRY_TEXT_BOX" + TitleState.soundExt);
        await this.box.loadAtlas("assets/images/weeb/pixelUI/dialogueBox-senpaiMad.png", "assets/images/weeb/pixelUI/dialogueBox-senpaiMad.xml");
        this.box.addAnimation("normalOpen", "SENPAI ANGRY IMPACT SPEECH", 24, false);
        this.box.addAnimationByIndices("normal", "SENPAI ANGRY IMPACT SPEECH", [4], 24, true);
        break;
      case "thorns": {
        await this.box.loadAtlas("assets/images/weeb/pixelUI/dialogueBox-evil.png", "assets/images/weeb/pixelUI/dialogueBox-evil.xml");
        this.box.addAnimation("normalOpen", "Spirit Textbox spawn", 24, false);
        this.box.addAnimationByIndices("normal", "Spirit Textbox spawn", [11], 24, true);

        const face = PIXI.Sprite.from("assets/images/weeb/spiritFaceForward.png");
        face.x = 320;
        face.y = 170;
        face.scale.set(6);
        this.addChild(face);
        break;
      }
    }

    this.box.playAnimation("normalOpen");
    this.box.setGraphicSize(Math.floor(this.box.width * PlayState.daPixelZoom * 0.9));
    this.box.updateHitbox();
    this.addChild(this.box);

    this.handSelect = PIXI.Sprite.from("assets/images/weeb/pixelUI/hand_textbox.png");
    this.handSelect.x = this.app.screen.width * 0.9;
    this.handSelect.y = this.app.screen.height * 0.9;
    this.addChild(this.handSelect);

    this.box.x = (this.app.screen.width - this.box.width) / 2;
    this.portraitLeft.x = (this.app.screen.width - this.portraitLeft.width) / 2;

    this.dropText = new PIXI.Text({
      text: "",
      style: {
        fontFamily: "Pixel Arial 11 Bold",
        fontSize: 32,
        fill: 0xd89494,
        wordWrap: true,
        wordWrapWidth: this.app.screen.width * 0.6
      }
    });
    this.dropText.x = 242;
    this.dropText.y = 502;
    this.addChild(this.dropText);

    this.swagDialogue = new PIXI.Text({
      text: "",
      style: {
        fontFamily: "Pixel Arial 11 Bold",
        fontSize: 32,
        fill: 0x3f2021,
        wordWrap: true,
        wordWrapWidth: this.app.screen.width * 0.6
      }
    });
    this.swagDialogue.x = 240;
    this.swagDialogue.y = 500;
    this.addChild(this.swagDialogue);

    this.typeSound = "assets/sounds/pixelText" + TitleState.soundExt;

    this.dialogue = new Alphabet(0, 80, "", false, true);
  }

  update(elapsed) {
    const song = PlayState.SONG.song.toLowerCase();

    if (song === "roses") {
      this.portraitLeft.visible = false;
    }
    if (song === "thorns") {
      this.portraitLeft.tint = 0x000000;
      this.swagDialogue.style.fill = 0xffffff;
      this.dropText.style.fill = 0x000000;
    }

    this.dropText.text = this.swagDialogue.text;

    if (this.box.currentAnimName === "normalOpen" && this.box.animationFinished) {
      this.box.playAnimation("normal");
      this.dialogueOpened = true;
    }

    if (this.dialogueOpened && !this.dialogueStarted) {
      this.startDialogue();
      this.dialogueStarted = true;
    }

    if (this.app.input.anyJustPressed() && this.dialogueStarted) {
      if (this.dialogue.parent) {
        this.removeChild(this.dialogue);
      }

      this.app.sound.play("assets/sounds/clickText" + TitleState.soundExt, 0.8);

      if (this.dialogueList[1] == null && this.dialogueList[0] != null) {
        if (!this.isEnding) {
          this.isEnding = true;

          if (song === "senpai" || song === "thorns") {
            this.app.sound.music.fadeOut(2.2, 0);
          }

          let fadeStep = 0;
          const fadeOutTicker = setInterval(() => {
            this.box.alpha -= 1 / 5;
            this.bgFade.alpha -= (1 / 5) * 0.7;
            this.portraitLeft.visible = false;
            this.portraitRight.visible = false;
            this.swagDialogue.alpha -= 1 / 5;
            this.dropText.alpha = this.swagDialogue.alpha;
            fadeStep++;
            if (fadeStep >= 5) {
              clearInterval(fadeOutTicker);
            }
          }, 200);

          setTimeout(() => {
            if (this.finishThing) {
              this.finishThing();
            }
            this.destroy();
          }, 1200);
        }
      } else {
        this.dialogueList.splice(0, 1);
        this.startDialogue();
      }
    }
  }

  startDialogue() {
    this.cleanDialog();

    this.swagDialogue.text = "";
    this.typeText(this.dialogueList[0], 40);

    switch (this.curCharacter) {
      case "dad":
        this.portraitRight.visible = false;
        if (!this.portraitLeft.visible) {
          this.portraitLeft.visible = true;
          this.portraitLeft.playAnimation("enter");
        }
        break;
      case "bf":
        this.portraitLeft.visible = false;
        if (!this.portraitRight.visible) {
          this.portraitRight.visible = true;
          this.portraitRight.playAnimation("enter");
        }
        break;
    }
  }

  typeText(text, intervalMs) {
    let i = 0;
    const step = () => {
      if (i >= text.length) {
        return;
      }
      this.swagDialogue.text += text[i];
      this.app.sound.play(this.typeSound, 0.6);
      i++;
      setTimeout(step, intervalMs);
    };
    step();
  }

  cleanDialog() {
    const splitName = this.dialogueList[0].split(":");
    this.curCharacter = splitName[1];
    this.dialogueList[0] = this.dialogueList[0].substring(splitName[1].length + 2).trim();
  }
}
