import { MusicBeatSubstate } from "./MusicBeatSubstate.js";
import { Boyfriend } from "./Boyfriend.js";
import { PlayState } from "./PlayState.js";
import { Conductor } from "./Conductor.js";
import { TitleState } from "./TitleState.js";
import { StoryMenuState } from "./StoryMenuState.js";
import { FreeplayState } from "./FreeplayState.js";

export class GameOverSubstate extends MusicBeatSubstate {
  constructor(app, x, y) {
    super(app);

    const daStage = PlayState.curStage;
    let daBf = "bf";

    switch (daStage) {
      case "school":
      case "schoolEvil":
        this.stageSuffix = "-pixel";
        daBf = "bf-pixel-dead";
        break;
      default:
        this.stageSuffix = "";
        daBf = "bf";
    }

    this.daBfCharacter = daBf;
    this.isEnding = false;
  }

  async create() {
    Conductor.songPosition = 0;

    this.bf = new Boyfriend(this.x, this.y, this.daBfCharacter);
    await this.bf.init();
    this.addChild(this.bf);

    this.camFollow = { x: this.bf.getGraphicMidpointX(), y: this.bf.getGraphicMidpointY() };

    this.app.sound.play("assets/sounds/fnf_loss_sfx" + this.stageSuffix + TitleState.soundExt);
    Conductor.changeBPM(100);

    this.app.camera.scroll = { x: 0, y: 0 };
    this.app.camera.target = null;

    this.bf.playAnim("firstDeath");
  }

  update(elapsed) {
    super.update(elapsed);

    const controls = this.app.controls;

    if (controls.ACCEPT) {
      this.endBullshit();
    }

    if (controls.BACK) {
      this.app.sound.music.stop();

      if (PlayState.isStoryMode) {
        this.app.switchState(new StoryMenuState(this.app));
      } else {
        this.app.switchState(new FreeplayState(this.app));
      }
    }

    if (this.bf.currentAnimName === "firstDeath" && this.bf.currentAnimFrame === 12) {
      this.app.camera.follow(this.camFollow, 0.01);
    }

    if (this.bf.currentAnimName === "firstDeath" && this.bf.animationFinished) {
      this.app.sound.playMusic("assets/music/gameOver" + this.stageSuffix + TitleState.soundExt);
    }

    if (this.app.sound.music && this.app.sound.music.playing) {
      Conductor.songPosition = this.app.sound.music.time;
    }
  }

  beatHit() {
    super.beatHit();
  }

  endBullshit() {
    if (!this.isEnding) {
      this.isEnding = true;
      this.bf.playAnim("deathConfirm", true);
      this.app.sound.music.stop();
      this.app.sound.play("assets/music/gameOverEnd" + this.stageSuffix + TitleState.soundExt);

      setTimeout(() => {
        this.app.camera.fade(0x000000, 2, false, () => {
          this.app.switchState(new PlayState(this.app));
        });
      }, 700);
    }
  }
}
