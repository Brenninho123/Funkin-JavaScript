export class Conductor {
  static bpm = 100;
  static crochet = (60 / Conductor.bpm) * 1000;
  static stepCrochet = Conductor.crochet / 4;
  static songPosition = 0;
  static lastSongPos = 0;
  static offset = 0;

  static safeFrames = 10;
  static safeZoneOffset = (Conductor.safeFrames / 60) * 1000;

  static bpmChangeMap = [];

  static mapBPMChanges(song) {
    Conductor.bpmChangeMap = [];

    let curBPM = song.bpm;
    let totalSteps = 0;
    let totalPos = 0;

    for (let i = 0; i < song.notes.length; i++) {
      if (song.notes[i].changeBPM && song.notes[i].bpm !== curBPM) {
        curBPM = song.notes[i].bpm;
        Conductor.bpmChangeMap.push({
          stepTime: totalSteps,
          songTime: totalPos,
          bpm: curBPM
        });
      }

      const deltaSteps = song.notes[i].lengthInSteps;
      totalSteps += deltaSteps;
      totalPos += ((60 / curBPM) * 1000) / 4 * deltaSteps;
    }
  }

  static changeBPM(newBpm) {
    Conductor.bpm = newBpm;
    Conductor.crochet = (60 / Conductor.bpm) * 1000;
    Conductor.stepCrochet = Conductor.crochet / 4;
  }
}
