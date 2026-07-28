import * as PIXI from "pixi.js";
import { Character } from "./Character.js";
import { Boyfriend } from "./Boyfriend.js";

export class AnimationDebug extends PIXI.Container {
  constructor(app, daAnim = "spooky") {
    super();
    this.app = app;
    this.daAnim = daAnim;
    this.animList = [];
    this.curAnim = 0;
    this.isDad = true;
    this.dumbTexts = new PIXI.Container();
  }

  async create() {
    if (this.app.sound.music) {
      this.app.sound.music.stop();
    }

    const gridBG = this.createGridOverlay(10, 10);
    this.addChild(gridBG);

    if (this.daAnim === "bf") {
      this.isDad = false;
    }

    if (this.isDad) {
      this.dad = new Character(0, 0, this.daAnim);
      await this.dad.init();
      this.centerOnScreen(this.dad);
      this.dad.debugMode = true;
      this.addChild(this.dad);

      this.char = this.dad;
      this.dad.flipX = false;
    } else {
      this.bf = new Boyfriend(0, 0);
      await this.bf.init();
      this.centerOnScreen(this.bf);
      this.bf.debugMode = true;
      this.addChild(this.bf);

      this.char = this.bf;
      this.bf.flipX = false;
    }

    this.addChild(this.dumbTexts);

    this.textAnim = new PIXI.Text({
      text: "",
      style: { fontSize: 26, fill: 0xffffff }
    });
    this.textAnim.x = 300;
    this.textAnim.y = 16;
    this.addChild(this.textAnim);

    this.genBoyOffsets();

    this.camFollowX = this.app.screen.width / 2;
    this.camFollowY = this.app.screen.height / 2;
    this.camVelX = 0;
    this.camVelY = 0;
    this.camZoom = 1;

    this.app.stage.on("pointerdown", () => {});
  }

  createGridOverlay(w, h) {
    const g = new PIXI.Graphics();
    for (let x = 0; x < this.app.screen.width; x += w) {
      for (let y = 0; y < this.app.screen.height; y += h) {
        const isEven = ((x / w) + (y / h)) % 2 === 0;
        g.rect(x, y, w, h).fill(isEven ? 0x333333 : 0x444444);
      }
    }
    return g;
  }

  centerOnScreen(sprite) {
    sprite.x = (this.app.screen.width - sprite.width) / 2;
    sprite.y = (this.app.screen.height - sprite.height) / 2;
  }

  genBoyOffsets(pushList = true) {
    let daLoop = 0;

    for (const [anim, offsets] of this.char.animOffsets.entries()) {
      const text = new PIXI.Text({
        text: anim + ": " + offsets,
        style: { fontSize: 15, fill: 0x0000ff }
      });
      text.x = 10;
      text.y = 20 + 18 * daLoop;
      this.dumbTexts.addChild(text);

      if (pushList) {
        this.animList.push(anim);
      }

      daLoop++;
    }
  }

  updateTexts() {
    while (this.dumbTexts.children.length > 0) {
      const text = this.dumbTexts.children[0];
      this.dumbTexts.removeChild(text);
      text.destroy();
    }
  }

  update(elapsed, input) {
    this.textAnim.text = this.char.currentAnimName;

    if (input.justPressed("KeyE")) {
      this.camZoom += 0.25;
    }
    if (input.justPressed("KeyQ")) {
      this.camZoom -= 0.25;
    }

    if (input.pressed("KeyI") || input.pressed("KeyJ") || input.pressed("KeyK") || input.pressed("KeyL")) {
      if (input.pressed("KeyI")) {
        this.camVelY = -90;
      } else if (input.pressed("KeyK")) {
        this.camVelY = 90;
      } else {
        this.camVelY = 0;
      }

      if (input.pressed("KeyJ")) {
        this.camVelX = -90;
      } else if (input.pressed("KeyL")) {
        this.camVelX = 90;
      } else {
        this.camVelX = 0;
      }
    } else {
      this.camVelX = 0;
      this.camVelY = 0;
    }

    if (input.justPressed("KeyW")) {
      this.curAnim -= 1;
    }

    if (input.justPressed("KeyS")) {
      this.curAnim += 1;
    }

    if (this.curAnim < 0) {
      this.curAnim = this.animList.length - 1;
    }

    if (this.curAnim >= this.animList.length) {
      this.curAnim = 0;
    }

    if (input.justPressed("KeyS") || input.justPressed("KeyW") || input.justPressed("Space")) {
      this.char.playAnim(this.animList[this.curAnim]);
      this.updateTexts();
      this.genBoyOffsets(false);
    }

    const upP = input.justPressed("ArrowUp");
    const rightP = input.justPressed("ArrowRight");
    const downP = input.justPressed("ArrowDown");
    const leftP = input.justPressed("ArrowLeft");

    const holdShift = input.pressed("ShiftLeft") || input.pressed("ShiftRight");
    const multiplier = holdShift ? 10 : 1;

    if (upP || rightP || downP || leftP) {
      this.updateTexts();

      const offsets = this.char.animOffsets.get(this.animList[this.curAnim]);

      if (upP) offsets[1] += 1 * multiplier;
      if (downP) offsets[1] -= 1 * multiplier;
      if (leftP) offsets[0] += 1 * multiplier;
      if (rightP) offsets[0] -= 1 * multiplier;

      this.updateTexts();
      this.genBoyOffsets(false);
      this.char.playAnim(this.animList[this.curAnim]);
    }
  }
}
