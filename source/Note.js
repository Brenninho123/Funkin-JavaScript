import { SparrowSprite } from "./SparrowSprite.js";
import { PlayState } from "./PlayState.js";
import { Conductor } from "./Conductor.js";

export class Note extends SparrowSprite {
  static swagWidth = 160 * 0.7;
  static PURP_NOTE = 0;
  static GREEN_NOTE = 2;
  static BLUE_NOTE = 1;
  static RED_NOTE = 3;

  constructor(strumTime, noteData, prevNote = null, sustainNote = false) {
    super(0, 0);

    this.strumTime = strumTime;
    this.noteData = noteData;
    this.mustPress = false;
    this.canBeHit = false;
    this.tooLate = false;
    this.wasGoodHit = false;
    this.prevNote = prevNote || this;
    this.sustainLength = 0;
    this.isSustainNote = sustainNote;
    this.noteScore = 1;

    this.x += 50;
    this.y -= 2000;
  }

  async init() {
    const daStage = PlayState.curStage;

    if (daStage === "school" || daStage === "schoolEvil") {
      if (this.isSustainNote) {
        await this.loadGridSheet("assets/images/weeb/pixelUI/arrowEnds.png", 7, 6);
        this.addAnimationGrid("purpleholdend", [4], 24, true);
        this.addAnimationGrid("greenholdend", [6], 24, true);
        this.addAnimationGrid("redholdend", [7], 24, true);
        this.addAnimationGrid("blueholdend", [5], 24, true);
        this.addAnimationGrid("purplehold", [0], 24, true);
        this.addAnimationGrid("greenhold", [2], 24, true);
        this.addAnimationGrid("redhold", [3], 24, true);
        this.addAnimationGrid("bluehold", [1], 24, true);
      } else {
        await this.loadGridSheet("assets/images/weeb/pixelUI/arrows-pixels.png", 17, 17);
        this.addAnimationGrid("greenScroll", [6], 24, true);
        this.addAnimationGrid("redScroll", [7], 24, true);
        this.addAnimationGrid("blueScroll", [5], 24, true);
        this.addAnimationGrid("purpleScroll", [4], 24, true);
      }

      this.setGraphicSize(Math.floor(this.width * PlayState.daPixelZoom));
      this.updateHitbox();
    } else {
      await this.loadAtlas("assets/images/NOTE_assets.png", "assets/images/NOTE_assets.xml");

      this.addAnimation("greenScroll", "green0", 24, true);
      this.addAnimation("redScroll", "red0", 24, true);
      this.addAnimation("blueScroll", "blue0", 24, true);
      this.addAnimation("purpleScroll", "purple0", 24, true);

      this.addAnimation("purpleholdend", "pruple end hold", 24, true);
      this.addAnimation("greenholdend", "green hold end", 24, true);
      this.addAnimation("redholdend", "red hold end", 24, true);
      this.addAnimation("blueholdend", "blue hold end", 24, true);

      this.addAnimation("purplehold", "purple hold piece", 24, true);
      this.addAnimation("greenhold", "green hold piece", 24, true);
      this.addAnimation("redhold", "red hold piece", 24, true);
      this.addAnimation("bluehold", "blue hold piece", 24, true);

      this.setGraphicSize(Math.floor(this.width * 0.7));
      this.updateHitbox();
      this.antialias = true;
    }

    switch (this.noteData) {
      case 0:
        this.x += Note.swagWidth * 0;
        this.playAnimation("purpleScroll");
        break;
      case 1:
        this.x += Note.swagWidth * 1;
        this.playAnimation("blueScroll");
        break;
      case 2:
        this.x += Note.swagWidth * 2;
        this.playAnimation("greenScroll");
        break;
      case 3:
        this.x += Note.swagWidth * 3;
        this.playAnimation("redScroll");
        break;
    }

    if (this.isSustainNote && this.prevNote != null) {
      this.noteScore *= 0.2;
      this.alpha = 0.6;

      this.x += this.width / 2;

      switch (this.noteData) {
        case 2: this.playAnimation("greenholdend"); break;
        case 3: this.playAnimation("redholdend"); break;
        case 1: this.playAnimation("blueholdend"); break;
        case 0: this.playAnimation("purpleholdend"); break;
      }

      this.updateHitbox();

      this.x -= this.width / 2;

      if (PlayState.curStage.startsWith("school")) {
        this.x += 30;
      }

      if (this.prevNote.isSustainNote) {
        switch (this.prevNote.noteData) {
          case 0: this.prevNote.playAnimation("purplehold"); break;
          case 1: this.prevNote.playAnimation("bluehold"); break;
          case 2: this.prevNote.playAnimation("greenhold"); break;
          case 3: this.prevNote.playAnimation("redhold"); break;
        }

        this.prevNote.scale.y *= (Conductor.stepCrochet / 100) * 1.5 * PlayState.SONG.speed;
        this.prevNote.updateHitbox();
      }
    }
  }

  async loadGridSheet(imagePath, frameW, frameH) {
    const { SparrowSprite: Self } = await import("./SparrowSprite.js");
    this._gridTexture = await PIXI.Assets.load(imagePath);
    this._gridFrameW = frameW;
    this._gridFrameH = frameH;
  }

  addAnimationGrid(name, indices, fps = 24, loop = false) {
    if (!this._gridTexture) return;
    const cols = Math.floor(this._gridTexture.width / this._gridFrameW);
    const frames = indices.map((i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const rect = new PIXI.Rectangle(col * this._gridFrameW, row * this._gridFrameH, this._gridFrameW, this._gridFrameH);
      return new PIXI.Texture({ source: this._gridTexture.source, frame: rect });
    });
    this.animations.set(name, { frames, fps, loop });
  }

  loadPixelArrow(direction) {
    this.strumID = direction;
  }

  loadNormalArrow(direction) {
    this.strumID = direction;
  }

  update(elapsed) {
    super.update(elapsed);

    if (this.mustPress) {
      if (
        this.strumTime > Conductor.songPosition - Conductor.safeZoneOffset &&
        this.strumTime < Conductor.songPosition + Conductor.safeZoneOffset * 0.5
      ) {
        this.canBeHit = true;
      } else {
        this.canBeHit = false;
      }

      if (this.strumTime < Conductor.songPosition - Conductor.safeZoneOffset) {
        this.tooLate = true;
      }
    } else {
      this.canBeHit = false;

      if (this.strumTime <= Conductor.songPosition) {
        this.wasGoodHit = true;
      }
    }

    if (this.tooLate) {
      if (this.alpha > 0.3) {
        this.alpha = 0.3;
      }
    }
  }
}
