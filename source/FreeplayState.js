import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { Alphabet } from "./Alphabet.js";
import { CoolUtil } from "./CoolUtil.js";
import { StoryMenuState } from "./StoryMenuState.js";
import { TitleState } from "./TitleState.js";
import { Highscore } from "./Highscore.js";
import { Song } from "./Song.js";
import { PlayState } from "./PlayState.js";
import { MainMenuState } from "./MainMenuState.js";

export class FreeplayState extends MusicBeatState {
  constructor(app) {
    super(app);
    this.songs = [];
    this.curSelected = 0;
    this.curDifficulty = 1;
    this.lerpScore = 0;
    this.intendedScore = 0;
    this.curPlaying = false;
  }

  async create() {
    this.songs = await CoolUtil.coolTextFile("assets/data/freeplaySonglist.txt");

    const isDebug = false;

    if (StoryMenuState.weekUnlocked[2] || isDebug) {
      this.songs.push("Spookeez", "South");
    }
    if (StoryMenuState.weekUnlocked[3] || isDebug) {
      this.songs.push("Pico", "Philly", "Blammed");
    }
    if (StoryMenuState.weekUnlocked[4] || isDebug) {
      this.songs.push("Satin-Panties", "High", "Milf");
    }
    if (StoryMenuState.weekUnlocked[5] || isDebug) {
      this.songs.push("Cocoa", "Eggnog", "Winter-Horrorland");
    }
    if (StoryMenuState.weekUnlocked[6] || isDebug) {
      this.songs.push("Senpai", "Roses", "Thorns");
    }

    const bg = PIXI.Sprite.from("assets/images/menuBGBlue.png");
    this.addChild(bg);

    this.grpSongs = new PIXI.Container();
    this.addChild(this.grpSongs);

    for (let i = 0; i < this.songs.length; i++) {
      const songText = new Alphabet(0, 70 * i + 30, this.songs[i], true, false);
      songText.isMenuItem = true;
      songText.targetY = i;
      this.grpSongs.addChild(songText);
    }

    this.scoreText = new PIXI.Text({
      text: "",
      style: { fontFamily: "vcr", fontSize: 32, fill: 0xffffff, align: "right" }
    });
    this.scoreText.x = this.app.screen.width * 0.7;
    this.scoreText.y = 5;

    const scoreBG = new PIXI.Graphics();
    scoreBG.rect(0, 0, this.app.screen.width * 0.35, 66);
    scoreBG.fill(0x000000);
    scoreBG.x = this.scoreText.x - 6;
    scoreBG.y = 0;
    scoreBG.alpha = 0.6;
    this.addChild(scoreBG);

    this.diffText = new PIXI.Text({
      text: "",
      style: { fontFamily: "vcr", fontSize: 24, fill: 0xffffff }
    });
    this.diffText.x = this.scoreText.x;
    this.diffText.y = this.scoreText.y + 36;
    this.addChild(this.diffText);

    this.addChild(this.scoreText);

    this.changeSelection();
    this.changeDiff();
  }

  update(elapsed) {
    super.update(elapsed);

    if (this.app.sound.music && this.app.sound.music.volume < 0.7) {
      this.app.sound.music.volume += 0.5 * (elapsed / 1000);
    }

    this.lerpScore = Math.floor(lerp(this.lerpScore, this.intendedScore, 0.4));

    if (Math.abs(this.lerpScore - this.intendedScore) <= 10) {
      this.lerpScore = this.intendedScore;
    }

    this.scoreText.text = "PERSONAL BEST:" + this.lerpScore;

    const controls = this.app.controls;

    if (controls.UP_P) {
      this.changeSelection(-1);
    }
    if (controls.DOWN_P) {
      this.changeSelection(1);
    }

    if (controls.LEFT_P) {
      this.changeDiff(-1);
    }
    if (controls.RIGHT_P) {
      this.changeDiff(1);
    }

    if (controls.BACK) {
      this.app.switchState(new MainMenuState(this.app));
    }

    if (controls.ACCEPT) {
      this.selectSong();
    }
  }

  async selectSong() {
    const poop = Highscore.formatSong(this.songs[this.curSelected].toLowerCase(), this.curDifficulty);

    PlayState.SONG = await Song.loadFromJson(poop, this.songs[this.curSelected].toLowerCase());
    PlayState.isStoryMode = false;
    PlayState.storyDifficulty = this.curDifficulty;

    if (this.app.sound.music) {
      this.app.sound.music.stop();
    }

    this.app.switchState(new PlayState(this.app));
  }

  changeDiff(change = 0) {
    this.curDifficulty += change;

    if (this.curDifficulty < 0) this.curDifficulty = 2;
    if (this.curDifficulty > 2) this.curDifficulty = 0;

    this.intendedScore = Highscore.getScore(this.songs[this.curSelected], this.curDifficulty);

    switch (this.curDifficulty) {
      case 0: this.diffText.text = "EASY"; break;
      case 1: this.diffText.text = "NORMAL"; break;
      case 2: this.diffText.text = "HARD"; break;
    }
  }

  changeSelection(change = 0) {
    this.app.sound.play("assets/sounds/scrollMenu" + TitleState.soundExt, 0.4);

    this.curSelected += change;

    if (this.curSelected < 0) this.curSelected = this.songs.length - 1;
    if (this.curSelected >= this.songs.length) this.curSelected = 0;

    this.intendedScore = Highscore.getScore(this.songs[this.curSelected], this.curDifficulty);

    this.app.sound.playMusic("assets/music/" + this.songs[this.curSelected] + "_Inst" + TitleState.soundExt, 0);

    let bullShit = 0;
    for (const item of this.grpSongs.children) {
      item.targetY = bullShit - this.curSelected;
      bullShit++;
      item.alpha = item.targetY === 0 ? 1 : 0.6;
    }
  }
}

function lerp(a, b, ratio) {
  return a + (b - a) * ratio;
}
