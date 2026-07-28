export class Song {
  constructor(song, notes, bpm) {
    this.song = song;
    this.notes = notes;
    this.bpm = bpm;
    this.needsVoices = true;
    this.speed = 1;
    this.player1 = "bf";
    this.player2 = "dad";
  }

  static async loadFromJson(jsonInput, folder) {
    const folderName = (folder || jsonInput).toLowerCase();
    const response = await fetch("assets/data/" + folderName + "/" + jsonInput.toLowerCase() + ".json");
    let rawJson = (await response.text()).trim();

    while (!rawJson.endsWith("}")) {
      rawJson = rawJson.substring(0, rawJson.length - 1);
    }

    return Song.parseJSONshit(rawJson);
  }

  static parseJSONshit(rawJson) {
    const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson;
    const swagShit = parsed.song;
    swagShit.validScore = true;
    return swagShit;
  }
}
