import { SparrowSprite } from "./SparrowSprite.js";
import { Conductor } from "./Conductor.js";
import { PlayState } from "./PlayState.js";

export class Character extends SparrowSprite {
  constructor(x, y, character = "bf", isPlayer = false) {
    super(x, y);
    this.animOffsets = new Map();
    this.debugMode = false;
    this.isPlayer = isPlayer;
    this.curCharacter = character;
    this.holdTimer = 0;
    this.danced = false;
  }

  async init() {
    this.antialias = true;

    switch (this.curCharacter) {
      case "gf":
        await this.loadAtlas("assets/images/GF_assets.png", "assets/images/GF_assets.xml");
        this.addAnimation("cheer", "GF Cheer", 24, false);
        this.addAnimation("singLEFT", "GF left note", 24, false);
        this.addAnimation("singRIGHT", "GF Right Note", 24, false);
        this.addAnimation("singUP", "GF Up Note", 24, false);
        this.addAnimation("singDOWN", "GF Down Note", 24, false);
        this.addAnimationByIndices("sad", "gf sad", [0,1,2,3,4,5,6,7,8,9,10,11,12], 24, false);
        this.addAnimationByIndices("danceLeft", "GF Dancing Beat", [30,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 24, false);
        this.addAnimationByIndices("danceRight", "GF Dancing Beat", [15,16,17,18,19,20,21,22,23,24,25,26,27,28,29], 24, false);
        this.addAnimationByIndices("hairBlow", "GF Dancing Beat Hair blowing", [0,1,2,3], 24, true);
        this.addAnimationByIndices("hairFall", "GF Dancing Beat Hair Landing", [0,1,2,3,4,5,6,7,8,9,10,11], 24, false);
        this.addAnimation("scared", "GF FEAR", 24, true);

        this.addOffset("cheer");
        this.addOffset("sad", -2, -2);
        this.addOffset("danceLeft", 0, -9);
        this.addOffset("danceRight", 0, -9);
        this.addOffset("singUP", 0, 4);
        this.addOffset("singRIGHT", 0, -20);
        this.addOffset("singLEFT", 0, -19);
        this.addOffset("singDOWN", 0, -20);
        this.addOffset("hairBlow", 45, -8);
        this.addOffset("hairFall", 0, -9);
        this.addOffset("scared", -2, -17);

        this.playAnim("danceRight");
        break;

      case "gf-christmas":
        await this.loadAtlas("assets/images/christmas/gfChristmas.png", "assets/images/christmas/gfChristmas.xml");
        this.addAnimation("cheer", "GF Cheer", 24, false);
        this.addAnimation("singLEFT", "GF left note", 24, false);
        this.addAnimation("singRIGHT", "GF Right Note", 24, false);
        this.addAnimation("singUP", "GF Up Note", 24, false);
        this.addAnimation("singDOWN", "GF Down Note", 24, false);
        this.addAnimationByIndices("sad", "gf sad", [0,1,2,3,4,5,6,7,8,9,10,11,12], 24, false);
        this.addAnimationByIndices("danceLeft", "GF Dancing Beat", [30,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 24, false);
        this.addAnimationByIndices("danceRight", "GF Dancing Beat", [15,16,17,18,19,20,21,22,23,24,25,26,27,28,29], 24, false);
        this.addAnimationByIndices("hairBlow", "GF Dancing Beat Hair blowing", [0,1,2,3], 24, true);
        this.addAnimationByIndices("hairFall", "GF Dancing Beat Hair Landing", [0,1,2,3,4,5,6,7,8,9,10,11], 24, false);
        this.addAnimation("scared", "GF FEAR", 24, true);

        this.addOffset("cheer");
        this.addOffset("sad", -2, -2);
        this.addOffset("danceLeft", 0, -9);
        this.addOffset("danceRight", 0, -9);
        this.addOffset("singUP", 0, 4);
        this.addOffset("singRIGHT", 0, -20);
        this.addOffset("singLEFT", 0, -19);
        this.addOffset("singDOWN", 0, -20);
        this.addOffset("hairBlow", 45, -8);
        this.addOffset("hairFall", 0, -9);
        this.addOffset("scared", -2, -17);

        this.playAnim("danceRight");
        break;

      case "gf-car":
        await this.loadAtlas("assets/images/gfCar.png", "assets/images/gfCar.xml");
        this.addAnimationByIndices("singUP", "GF Dancing Beat Hair blowing CAR", [0], 24, false);
        this.addAnimationByIndices("danceLeft", "GF Dancing Beat Hair blowing CAR", [30,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 24, false);
        this.addAnimationByIndices("danceRight", "GF Dancing Beat Hair blowing CAR", [15,16,17,18,19,20,21,22,23,24,25,26,27,28,29], 24, false);

        this.addOffset("danceLeft", 0);
        this.addOffset("danceRight", 0);

        this.playAnim("danceRight");
        break;

      case "gf-pixel":
        await this.loadAtlas("assets/images/weeb/gfPixel.png", "assets/images/weeb/gfPixel.xml");
        this.addAnimationByIndices("singUP", "GF IDLE", [2], 24, false);
        this.addAnimationByIndices("danceLeft", "GF IDLE", [30,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14], 24, false);
        this.addAnimationByIndices("danceRight", "GF IDLE", [15,16,17,18,19,20,21,22,23,24,25,26,27,28,29], 24, false);

        this.addOffset("danceLeft", 0);
        this.addOffset("danceRight", 0);

        this.playAnim("danceRight");

        this.setGraphicSize(Math.floor(this.width * PlayState.daPixelZoom));
        this.updateHitbox();
        this.antialias = false;
        break;

      case "dad":
        await this.loadAtlas("assets/images/DADDY_DEAREST.png", "assets/images/DADDY_DEAREST.xml");
        this.addAnimation("idle", "Dad idle dance", 24, true);
        this.addAnimation("singUP", "Dad Sing Note UP", 24, true);
        this.addAnimation("singRIGHT", "Dad Sing Note RIGHT", 24, true);
        this.addAnimation("singDOWN", "Dad Sing Note DOWN", 24, true);
        this.addAnimation("singLEFT", "Dad Sing Note LEFT", 24, true);

        this.addOffset("idle");
        this.addOffset("singUP", -6, 50);
        this.addOffset("singRIGHT", 0, 27);
        this.addOffset("singLEFT", -10, 10);
        this.addOffset("singDOWN", 0, -30);

        this.playAnim("idle");
        break;

      case "spooky":
        await this.loadAtlas("assets/images/spooky_kids_assets.png", "assets/images/spooky_kids_assets.xml");
        this.addAnimation("singUP", "spooky UP NOTE", 24, false);
        this.addAnimation("singDOWN", "spooky DOWN note", 24, false);
        this.addAnimation("singLEFT", "note sing left", 24, false);
        this.addAnimation("singRIGHT", "spooky sing right", 24, false);
        this.addAnimationByIndices("danceLeft", "spooky dance idle", [0,2,6], 12, false);
        this.addAnimationByIndices("danceRight", "spooky dance idle", [8,10,12,14], 12, false);

        this.addOffset("danceLeft");
        this.addOffset("danceRight");
        this.addOffset("singUP", -20, 26);
        this.addOffset("singRIGHT", -130, -14);
        this.addOffset("singLEFT", 130, -10);
        this.addOffset("singDOWN", -50, -130);

        this.playAnim("danceRight");
        break;

      case "mom":
      case "mom-car": {
        const [img, xml] = this.curCharacter === "mom"
          ? ["assets/images/Mom_Assets.png", "assets/images/Mom_Assets.xml"]
          : ["assets/images/momCar.png", "assets/images/momCar.xml"];
        await this.loadAtlas(img, xml);

        this.addAnimation("idle", "Mom Idle", 24, false);
        this.addAnimation("singUP", "Mom Up Pose", 24, false);
        this.addAnimation("singDOWN", "MOM DOWN POSE", 24, false);
        this.addAnimation("singLEFT", "Mom Left Pose", 24, false);
        this.addAnimation("singRIGHT", "Mom Pose Left", 24, false);

        this.addOffset("idle");
        this.addOffset("singUP", 14, 71);
        this.addOffset("singRIGHT", 10, -60);
        this.addOffset("singLEFT", 250, -23);
        this.addOffset("singDOWN", 20, -160);

        this.playAnim("idle");
        break;
      }

      case "monster":
      case "monster-christmas": {
        const isXmas = this.curCharacter === "monster-christmas";
        await this.loadAtlas(
          isXmas ? "assets/images/christmas/monsterChristmas.png" : "assets/images/Monster_Assets.png",
          isXmas ? "assets/images/christmas/monsterChristmas.xml" : "assets/images/Monster_Assets.xml"
        );
        this.addAnimation("idle", "monster idle", 24, false);
        this.addAnimation("singUP", "monster up note", 24, false);
        this.addAnimation("singDOWN", "monster down", 24, false);
        this.addAnimation("singLEFT", "Monster left note", 24, false);
        this.addAnimation("singRIGHT", "Monster Right note", 24, false);

        this.addOffset("idle");
        this.addOffset("singUP", -20, 50);
        this.addOffset("singRIGHT", -51);
        this.addOffset("singLEFT", -30);
        this.addOffset("singDOWN", isXmas ? -40 : -30, isXmas ? -94 : -40);

        this.playAnim("idle");
        break;
      }

      case "pico":
        await this.loadAtlas("assets/images/Pico_FNF_assetss.png", "assets/images/Pico_FNF_assetss.xml");
        this.addAnimation("idle", "Pico Idle Dance", 24, true);
        this.addAnimation("singUP", "pico Up note0", 24, false);
        this.addAnimation("singDOWN", "Pico Down Note0", 24, false);

        if (this.isPlayer) {
          this.addAnimation("singLEFT", "Pico NOTE LEFT0", 24, false);
          this.addAnimation("singRIGHT", "Pico Note Right0", 24, false);
          this.addAnimation("singRIGHTmiss", "Pico Note Right Miss", 24, false);
          this.addAnimation("singLEFTmiss", "Pico NOTE LEFT miss", 24, false);
        } else {
          this.addAnimation("singLEFT", "Pico Note Right0", 24, false);
          this.addAnimation("singRIGHT", "Pico NOTE LEFT0", 24, false);
          this.addAnimation("singRIGHTmiss", "Pico NOTE LEFT miss", 24, false);
          this.addAnimation("singLEFTmiss", "Pico Note Right Miss", 24, false);
        }

        this.addAnimation("singUPmiss", "pico Up note miss", 24, true);
        this.addAnimation("singDOWNmiss", "Pico Down Note MISS", 24, true);

        this.addOffset("idle");
        this.addOffset("singUP", -29, 27);
        this.addOffset("singRIGHT", -68, -7);
        this.addOffset("singLEFT", 65, 9);
        this.addOffset("singDOWN", 200, -70);
        this.addOffset("singUPmiss", -19, 67);
        this.addOffset("singRIGHTmiss", -60, 41);
        this.addOffset("singLEFTmiss", 62, 64);
        this.addOffset("singDOWNmiss", 210, -28);

        this.playAnim("idle");
        this.flipX = true;
        break;

      case "bf":
      case "bf-christmas":
      case "bf-car": {
        const paths = {
          "bf": ["assets/images/BOYFRIEND.png", "assets/images/BOYFRIEND.xml"],
          "bf-christmas": ["assets/images/christmas/bfChristmas.png", "assets/images/christmas/bfChristmas.xml"],
          "bf-car": ["assets/images/bfCar.png", "assets/images/bfCar.xml"]
        };
        const [img, xml] = paths[this.curCharacter];
        await this.loadAtlas(img, xml);

        this.addAnimation("idle", "BF idle dance", 24, false);
        this.addAnimation("singUP", "BF NOTE UP0", 24, false);
        this.addAnimation("singLEFT", "BF NOTE LEFT0", 24, false);
        this.addAnimation("singRIGHT", "BF NOTE RIGHT0", 24, false);
        this.addAnimation("singDOWN", "BF NOTE DOWN0", 24, false);
        this.addAnimation("singUPmiss", "BF NOTE UP MISS", 24, false);
        this.addAnimation("singLEFTmiss", "BF NOTE LEFT MISS", 24, false);
        this.addAnimation("singRIGHTmiss", "BF NOTE RIGHT MISS", 24, false);
        this.addAnimation("singDOWNmiss", "BF NOTE DOWN MISS", 24, false);

        if (this.curCharacter === "bf") {
          this.addAnimation("hey", "BF HEY", 24, false);
          this.addAnimation("firstDeath", "BF dies", 24, false);
          this.addAnimation("deathLoop", "BF Dead Loop", 24, true);
          this.addAnimation("deathConfirm", "BF Dead confirm", 24, false);
          this.addAnimation("scared", "BF idle shaking", 24, true);
        } else if (this.curCharacter === "bf-christmas") {
          this.addAnimation("hey", "BF HEY", 24, false);
        }

        this.addOffset("idle", -5);
        this.addOffset("singUP", -29, 27);
        this.addOffset("singRIGHT", -38, -7);
        this.addOffset("singLEFT", 12, -6);
        this.addOffset("singDOWN", -10, -50);
        this.addOffset("singUPmiss", -29, 27);
        this.addOffset("singRIGHTmiss", -30, 21);
        this.addOffset("singLEFTmiss", 12, 24);
        this.addOffset("singDOWNmiss", -11, -19);

        if (this.curCharacter === "bf") {
          this.addOffset("hey", 7, 4);
          this.addOffset("firstDeath", 37, 11);
          this.addOffset("deathLoop", 37, 5);
          this.addOffset("deathConfirm", 37, 69);
          this.addOffset("scared", -4);
        } else if (this.curCharacter === "bf-christmas") {
          this.addOffset("hey", 7, 4);
        }

        this.playAnim("idle");
        this.flipX = true;
        break;
      }

      case "bf-pixel":
        await this.loadAtlas("assets/images/weeb/bfPixel.png", "assets/images/weeb/bfPixel.xml");
        this.addAnimation("idle", "BF IDLE", 24, false);
        this.addAnimation("singUP", "BF UP NOTE", 24, false);
        this.addAnimation("singLEFT", "BF LEFT NOTE", 24, false);
        this.addAnimation("singRIGHT", "BF RIGHT NOTE", 24, false);
        this.addAnimation("singDOWN", "BF DOWN NOTE", 24, false);
        this.addAnimation("singUPmiss", "BF UP MISS", 24, false);
        this.addAnimation("singLEFTmiss", "BF LEFT MISS", 24, false);
        this.addAnimation("singRIGHTmiss", "BF RIGHT MISS", 24, false);
        this.addAnimation("singDOWNmiss", "BF DOWN MISS", 24, false);

        this.addOffset("idle");
        this.addOffset("singUP");
        this.addOffset("singRIGHT");
        this.addOffset("singLEFT");
        this.addOffset("singDOWN");
        this.addOffset("singUPmiss");
        this.addOffset("singRIGHTmiss");
        this.addOffset("singLEFTmiss");
        this.addOffset("singDOWNmiss");

        this.setGraphicSize(Math.floor(this.width * 6));
        this.updateHitbox();

        this.playAnim("idle");

        this.width -= 100;
        this.height -= 100;
        this.antialias = false;
        this.flipX = true;
        break;

      case "bf-pixel-dead":
        await this.loadAtlas("assets/images/weeb/bfPixelsDEAD.png", "assets/images/weeb/bfPixelsDEAD.xml");
        this.addAnimation("singUP", "BF Dies pixel", 24, false);
        this.addAnimation("firstDeath", "BF Dies pixel", 24, false);
        this.addAnimation("deathLoop", "Retry Loop", 24, true);
        this.addAnimation("deathConfirm", "RETRY CONFIRM", 24, false);

        this.addOffset("firstDeath");
        this.addOffset("deathLoop", -37);
        this.addOffset("deathConfirm", -37);

        this.playAnim("firstDeath");

        this.setGraphicSize(Math.floor(this.width * 6));
        this.updateHitbox();
        this.antialias = false;
        this.flipX = true;
        break;

      case "senpai":
      case "senpai-angry": {
        await this.loadAtlas("assets/images/weeb/senpai.png", "assets/images/weeb/senpai.xml");
        const prefix = this.curCharacter === "senpai" ? "Senpai" : "Angry Senpai";
        this.addAnimation("idle", prefix + " Idle", 24, false);
        this.addAnimation("singUP", prefix + " UP NOTE", 24, false);
        this.addAnimation("singLEFT", prefix + " LEFT NOTE", 24, false);
        this.addAnimation("singRIGHT", prefix + " RIGHT NOTE", 24, false);
        this.addAnimation("singDOWN", prefix + " DOWN NOTE", 24, false);

        this.addOffset("idle");
        this.addOffset("singUP", 5, 37);
        this.addOffset("singRIGHT");
        this.addOffset("singLEFT", 40);
        this.addOffset("singDOWN", 14);

        this.playAnim("idle");

        this.setGraphicSize(Math.floor(this.width * 6));
        this.updateHitbox();
        this.antialias = false;
        break;
      }

      case "spirit":
        await this.loadSpriteSheetPacker("assets/images/weeb/spirit.png", "assets/images/weeb/spirit.txt");
        this.addAnimation("idle", "idle spirit_", 24, false);
        this.addAnimation("singUP", "up_", 24, false);
        this.addAnimation("singRIGHT", "right_", 24, false);
        this.addAnimation("singLEFT", "left_", 24, false);
        this.addAnimation("singDOWN", "spirit down_", 24, false);

        this.addOffset("idle", -220, -280);
        this.addOffset("singUP", -220, -240);
        this.addOffset("singRIGHT", -220, -280);
        this.addOffset("singLEFT", -200, -280);
        this.addOffset("singDOWN", 170, 110);

        this.setGraphicSize(Math.floor(this.width * 6));
        this.updateHitbox();

        this.playAnim("idle");
        this.antialias = false;
        break;

      case "parents-christmas":
        await this.loadAtlas(
          "assets/images/christmas/mom_dad_christmas_assets.png",
          "assets/images/christmas/mom_dad_christmas_assets.xml"
        );
        this.addAnimation("idle", "Parent Christmas Idle", 24, false);
        this.addAnimation("singUP", "Parent Up Note Dad", 24, false);
        this.addAnimation("singDOWN", "Parent Down Note Dad", 24, false);
        this.addAnimation("singLEFT", "Parent Left Note Dad", 24, false);
        this.addAnimation("singRIGHT", "Parent Right Note Dad", 24, false);
        this.addAnimation("singUP-alt", "Parent Up Note Mom", 24, false);
        this.addAnimation("singDOWN-alt", "Parent Down Note Mom", 24, false);
        this.addAnimation("singLEFT-alt", "Parent Left Note Mom", 24, false);
        this.addAnimation("singRIGHT-alt", "Parent Right Note Mom", 24, false);

        this.addOffset("idle");
        this.addOffset("singUP", -47, 24);
        this.addOffset("singRIGHT", -1, -23);
        this.addOffset("singLEFT", -30, 16);
        this.addOffset("singDOWN", -31, -29);
        this.addOffset("singUP-alt", -47, 24);
        this.addOffset("singRIGHT-alt", -1, -24);
        this.addOffset("singLEFT-alt", -30, 15);
        this.addOffset("singDOWN-alt", -30, -27);

        this.playAnim("idle");
        break;
    }

    this.dance();

    if (this.isPlayer) {
      this.flipX = !this.flipX;

      if (!this.curCharacter.startsWith("bf")) {
        const rightAnim = this.getAnimation("singRIGHT");
        const leftAnim = this.getAnimation("singLEFT");
        const oldRight = rightAnim.frames;
        rightAnim.frames = leftAnim.frames;
        leftAnim.frames = oldRight;

        const rightMiss = this.getAnimation("singRIGHTmiss");
        const leftMiss = this.getAnimation("singLEFTmiss");
        if (rightMiss != null) {
          const oldMiss = rightMiss.frames;
          rightMiss.frames = leftMiss.frames;
          leftMiss.frames = oldMiss;
        }
      }
    }
  }

  update(elapsed) {
    if (!this.curCharacter.startsWith("bf")) {
      if (this.currentAnimName?.startsWith("sing")) {
        this.holdTimer += elapsed;
      }

      let dadVar = 4;
      if (this.curCharacter === "dad") {
        dadVar = 6.1;
      }

      if (this.holdTimer >= Conductor.stepCrochet * dadVar * 0.001) {
        this.dance();
        this.holdTimer = 0;
      }
    }

    if (this.curCharacter === "gf") {
      if (this.currentAnimName === "hairFall" && this.animationFinished) {
        this.playAnim("danceRight");
      }
    }

    super.update(elapsed);
  }

  dance() {
    if (this.debugMode) {
      return;
    }

    switch (this.curCharacter) {
      case "gf":
      case "gf-christmas":
      case "gf-car":
      case "gf-pixel":
        if (!this.currentAnimName?.startsWith("hair")) {
          this.danced = !this.danced;
          this.playAnim(this.danced ? "danceRight" : "danceLeft");
        }
        break;

      case "spooky":
        this.danced = !this.danced;
        this.playAnim(this.danced ? "danceRight" : "danceLeft");
        break;

      default:
        this.playAnim("idle");
    }
  }

  playAnim(animName, force = false, reversed = false, frame = 0) {
    this.playAnimation(animName, force, reversed, frame);

    const daOffset = this.animOffsets.get(this.currentAnimName);
    if (daOffset) {
      this.offsetX = daOffset[0];
      this.offsetY = daOffset[1];
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }

    if (this.curCharacter === "gf") {
      if (animName === "singLEFT") {
        this.danced = true;
      } else if (animName === "singRIGHT") {
        this.danced = false;
      }

      if (animName === "singUP" || animName === "singDOWN") {
        this.danced = !this.danced;
      }
    }
  }

  addOffset(name, x = 0, y = 0) {
    this.animOffsets.set(name, [x, y]);
  }
}
