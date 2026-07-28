import { Controls, KeyboardScheme } from "./Controls.js";

export class PlayerSettings {
  static numPlayers = 0;
  static numAvatars = 0;
  static player1 = null;
  static player2 = null;

  constructor(id, scheme) {
    this.id = id;
    this.controls = new Controls("player" + id, scheme);
  }

  setKeyboardScheme(scheme) {
    this.controls.setKeyboardScheme(scheme);
  }

  static init() {
    if (PlayerSettings.player1 == null) {
      PlayerSettings.player1 = new PlayerSettings(0, KeyboardScheme.Solo);
      PlayerSettings.numPlayers++;
    }
  }

  static reset() {
    PlayerSettings.player1 = null;
    PlayerSettings.player2 = null;
    PlayerSettings.numPlayers = 0;
  }
}
