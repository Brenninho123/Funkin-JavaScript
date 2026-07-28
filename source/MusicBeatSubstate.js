import * as PIXI from "pixi.js";
import { Conductor } from "./Conductor.js";

export class MusicBeatSubstate extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
    this.lastBeat = 0;
    this.lastStep = 0;
    this.curStep = 0;
    this.curBeat = 0;
  }

  get controls() {
    return this.app.controls;
  }

  async create() {}

  update(elapsed) {
    const oldStep = this.curStep;

    this.updateCurStep();
    this.curBeat = Math.floor(this.curStep / 4);

    if (oldStep !== this.curStep && this.curStep > 0) {
      this.stepHit();
    }
  }

  updateCurStep() {
    let lastChange = { stepTime: 0, songTime: 0, bpm: 0 };

    for (const change of Conductor.bpmChangeMap) {
      if (Conductor.songPosition > change.songTime) {
        lastChange = change;
      }
    }

    this.curStep = lastChange.stepTime + Math.floor((Conductor.songPosition - lastChange.songTime) / Conductor.stepCrochet);
  }

  stepHit() {
    if (this.curStep % 4 === 0) {
      this.beatHit();
    }
  }

  beatHit() {}
}
