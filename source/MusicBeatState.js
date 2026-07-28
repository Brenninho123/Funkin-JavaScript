import { Conductor } from "./Conductor.js";

export class MusicBeatState extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
    this.lastBeat = 0;
    this.lastStep = 0;
    this.curStep = 0;
    this.curBeat = 0;
    this.persistentUpdate = false;
    this.persistentDraw = false;
    this.subState = null;
  }

  get controls() {
    return this.app.controls;
  }

  async create() {}

  update(elapsed) {
    const oldStep = this.curStep;

    this.updateCurStep();
    this.updateBeat();

    if (oldStep !== this.curStep && this.curStep > 0) {
      this.stepHit();
    }
  }

  updateBeat() {
    this.curBeat = Math.floor(this.curStep / 4);
  }

  updateCurStep() {
    let lastChange = { stepTime: 0, songTime: 0, bpm: 0 };

    for (const change of Conductor.bpmChangeMap) {
      if (Conductor.songPosition >= change.songTime) {
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

  openSubState(subState) {
    this.subState = subState;
    this.addChild(subState);
    if (subState.create) {
      subState.create();
    }
  }

  closeSubState() {
    if (this.subState) {
      this.removeChild(this.subState);
      this.subState.destroy();
      this.subState = null;
    }
  }
}
