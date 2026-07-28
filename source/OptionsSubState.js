import { MusicBeatSubstate } from "./MusicBeatSubstate.js";

export class OptionsSubState extends MusicBeatSubstate {
  constructor(app) {
    super(app);
    this.textMenuItems = ["Master Volume", "Sound Volume"];
  }
}
