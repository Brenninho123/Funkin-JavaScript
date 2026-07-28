import * as PIXI from "pixi.js";
import { Note } from "./Note.js";
import { Conductor } from "./Conductor.js";
import { TitleState } from "./TitleState.js";

export class LatencyState extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
  }

  async create() {
    await this.app.sound.playMusic("assets/sounds/soundTest" + TitleState.soundExt);

    this.noteGrp = new PIXI.Container();
    this.addChild(this.noteGrp);

    for (let i = 0; i < 32; i++) {
      const note = new Note(Conductor.crochet * i, 1);
      this.noteGrp.addChild(note);
    }

    this.offsetText = new PIXI.Text({ text: "", style: { fill: 0xffffff, fontSize: 24 } });
    this.offsetText.x = (this.app.screen.width - this.offsetText.width) / 2;
    this.offsetText.y = (this.app.screen.height - this.offsetText.height) / 2;
    this.addChild(this.offsetText);

    this.strumLine = new PIXI.Graphics();
    this.strumLine.rect(0, 0, this.app.screen.width, 5);
    this.strumLine.fill(0xffffff);
    this.strumLine.x = this.app.screen.width / 2;
    this.strumLine.y = 100;
    this.addChild(this.strumLine);

    Conductor.changeBPM(120);
  }

  update(elapsed) {
    this.offsetText.text = "Offset: " + Conductor.offset + "ms";

    Conductor.songPosition = this.app.sound.music.time - Conductor.offset;

    const multiply = this.app.input.pressed("ShiftLeft") ? 10 : 1;

    if (this.app.input.justPressed("ArrowRight")) {
      Conductor.offset += 1 * multiply;
    }
    if (this.app.input.justPressed("ArrowLeft")) {
      Conductor.offset -= 1 * multiply;
    }

    if (this.app.input.justPressed("Space")) {
      this.app.sound.music.stop();
      this.app.resetState();
    }

    for (let i = this.noteGrp.children.length - 1; i >= 0; i--) {
      const daNote = this.noteGrp.children[i];
      daNote.y = this.strumLine.y - (Conductor.songPosition - daNote.strumTime) * 0.45;
      daNote.x = this.strumLine.x + 30;

      if (daNote.y < this.strumLine.y) {
        this.noteGrp.removeChild(daNote);
        daNote.destroy();
      }
    }
  }
}
