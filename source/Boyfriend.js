import { Character } from "./Character.js";

export class Boyfriend extends Character {
  constructor(x, y, char = "bf") {
    super(x, y, char, true);
    this.stunned = false;
  }

  update(elapsed) {
    if (!this.debugMode) {
      if (this.currentAnimName?.startsWith("sing")) {
        this.holdTimer += elapsed;
      } else {
        this.holdTimer = 0;
      }

      if (this.currentAnimName?.endsWith("miss") && this.animationFinished && !this.debugMode) {
        this.playAnim("idle", true, false, 10);
      }

      if (this.currentAnimName === "firstDeath" && this.animationFinished) {
        this.playAnim("deathLoop");
      }
    }

    super.update(elapsed);
  }
}
