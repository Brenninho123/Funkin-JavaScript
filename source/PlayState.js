import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { Character } from "./Character.js";
import { Boyfriend } from "./Boyfriend.js";
import { Note } from "./Note.js";
import { HealthIcon } from "./HealthIcon.js";
import { BackgroundDancer } from "./BackgroundDancer.js";
import { BackgroundGirls } from "./BackgroundGirls.js";
import { Conductor } from "./Conductor.js";
import { Song } from "./Song.js";
import { Highscore } from "./Highscore.js";
import { TitleState } from "./TitleState.js";
import { ChartingState } from "./ChartingState.js";
import { AnimationDebug } from "./AnimationDebug.js";
import { FreeplayState } from "./FreeplayState.js";
import { StoryMenuState } from "./StoryMenuState.js";
import { PauseSubState } from "./PauseSubState.js";
import { GameOverSubstate } from "./GameOverSubstate.js";
import { CoolUtil } from "./CoolUtil.js";

export class PlayState extends MusicBeatState {
  static curStage = "";
  static SONG = null;
  static isStoryMode = false;
  static storyWeek = 0;
  static storyPlaylist = [];
  static storyDifficulty = 1;
  static campaignScore = 0;
  static daPixelZoom = 6;
  static prevCamFollow = null;

  constructor(app) {
    super(app);
    this.halloweenLevel = false;
    this.unspawnNotes = [];
    this.curSection = 0;
    this.camZooming = false;
    this.curSong = "";
    this.gfSpeed = 1;
    this.health = 1;
    this.combo = 0;
    this.generatedMusic = false;
    this.startingSong = false;
    this.dialogue = ["blah blah blah", "coolswag"];
    this.isHalloween = false;
    this.wiggleAmount = 0;
    this.talking = true;
    this.songScore = 0;
    this.defaultCamZoom = 1.05;
    this.inCutscene = false;
    this.paused = false;
    this.startedCountdown = false;
    this.canPause = true;
    this.perfectMode = false;
    this.fastCarCanDrive = true;
    this.trainMoving = false;
    this.trainFrameTiming = 0;
    this.trainCars = 8;
    this.trainFinishing = false;
    this.trainCooldown = 0;
    this.startedMoving = false;
    this.lightningStrikeBeat = 0;
    this.lightningOffset = 8;
    this.curLight = 0;
  }

  async create() {
    this.camHUD = new PIXI.Container();
    this.addChild(this.camHUD);

    this.persistentUpdate = true;
    this.persistentDraw = true;

    if (PlayState.SONG == null) {
      PlayState.SONG = await Song.loadFromJson("tutorial");
    }
    const SONG = PlayState.SONG;

    Conductor.mapBPMChanges(SONG);
    Conductor.changeBPM(SONG.bpm);

    switch (SONG.song.toLowerCase()) {
      case "tutorial":
        this.dialogue = ["Hey you're pretty cute.", "Use the arrow keys to keep up \nwith me singing."];
        break;
      case "bopeebo":
        this.dialogue = [
          "HEY!",
          "You think you can just sing\nwith my daughter like that?",
          "If you want to date her...",
          "You're going to have to go \nthrough ME first!"
        ];
        break;
      case "fresh":
        this.dialogue = ["Not too shabby boy.", ""];
        break;
      case "dadbattle":
        this.dialogue = [
          "gah you think you're hot stuff?",
          "If you can beat me here...",
          "Only then I will even CONSIDER letting you\ndate my daughter!"
        ];
        break;
      case "senpai":
        this.dialogue = await CoolUtil.coolTextFile("assets/data/senpai/senpaiDialogue.txt");
        break;
      case "roses":
        this.dialogue = await CoolUtil.coolTextFile("assets/data/roses/rosesDialogue.txt");
        break;
      case "thorns":
        this.dialogue = await CoolUtil.coolTextFile("assets/data/thorns/thornsDialogue.txt");
        break;
    }

    await this.setupStage(SONG);

    let gfVersion = "gf";
    switch (PlayState.curStage) {
      case "limo": gfVersion = "gf-car"; break;
      case "mall":
      case "mallEvil": gfVersion = "gf-christmas"; break;
      case "school":
      case "schoolEvil": gfVersion = "gf-pixel"; break;
    }

    this.gf = new Character(400, 130, gfVersion);
    await this.gf.init();
    this.gf.scrollFactorX = 0.95;
    this.gf.scrollFactorY = 0.95;

    this.dad = new Character(100, 100, SONG.player2);
    await this.dad.init();

    const camPos = { x: this.dad.getGraphicMidpointX(), y: this.dad.getGraphicMidpointY() };

    switch (SONG.player2) {
      case "gf":
        this.dad.x = this.gf.x;
        this.dad.y = this.gf.y;
        this.gf.visible = false;
        if (PlayState.isStoryMode) {
          camPos.x += 600;
          this.tweenCamIn();
        }
        break;
      case "spooky":
        this.dad.y += 200;
        break;
      case "monster":
        this.dad.y += 100;
        break;
      case "monster-christmas":
        this.dad.y += 130;
        break;
      case "dad":
        camPos.x += 400;
        break;
      case "pico":
        camPos.x += 600;
        this.dad.y += 300;
        break;
      case "parents-christmas":
        this.dad.x -= 500;
        break;
      case "senpai":
      case "senpai-angry":
        this.dad.x += 150;
        this.dad.y += 360;
        camPos.x = this.dad.getGraphicMidpointX() + 300;
        camPos.y = this.dad.getGraphicMidpointY();
        break;
      case "spirit":
        this.dad.x -= 150;
        this.dad.y += 100;
        camPos.x = this.dad.getGraphicMidpointX() + 300;
        camPos.y = this.dad.getGraphicMidpointY();
        break;
    }

    this.boyfriend = new Boyfriend(770, 450, SONG.player1);
    await this.boyfriend.init();

    switch (PlayState.curStage) {
      case "limo":
        this.boyfriend.y -= 220;
        this.boyfriend.x += 260;
        this.resetFastCar();
        this.addChild(this.fastCar);
        break;
      case "mall":
        this.boyfriend.x += 200;
        break;
      case "mallEvil":
        this.boyfriend.x += 320;
        this.dad.y -= 80;
        break;
      case "school":
        this.boyfriend.x += 200;
        this.boyfriend.y += 220;
        this.gf.x += 180;
        this.gf.y += 300;
        break;
      case "schoolEvil":
        this.boyfriend.x += 200;
        this.boyfriend.y += 220;
        this.gf.x += 180;
        this.gf.y += 300;
        break;
    }

    this.addChild(this.gf);

    if (PlayState.curStage === "limo") {
      this.addChild(this.limo);
    }

    this.addChild(this.dad);
    this.addChild(this.boyfriend);

    Conductor.songPosition = -5000;

    this.strumLine = new PIXI.Graphics();
    this.strumLine.rect(0, 50, this.app.screen.width, 10);
    this.strumLine.fill(0xffffff);

    this.strumLineNotes = new PIXI.Container();
    this.addChild(this.strumLineNotes);

    this.playerStrums = new PIXI.Container();

    await this.generateSong(SONG.song);

    this.camFollow = { x: camPos.x, y: camPos.y };

    if (PlayState.prevCamFollow != null) {
      this.camFollow = PlayState.prevCamFollow;
      PlayState.prevCamFollow = null;
    }

    this.app.camera.follow(this.camFollow, 0.04);
    this.app.camera.zoom = this.defaultCamZoom;

    this.healthBarBG = PIXI.Sprite.from("assets/images/healthBar.png");
    this.healthBarBG.y = this.app.screen.height * 0.9;
    this.healthBarBG.x = (this.app.screen.width - this.healthBarBG.width) / 2;
    this.addChild(this.healthBarBG);

    this.healthBar = new PIXI.Graphics();
    this.addChild(this.healthBar);

    this.scoreTxt = new PIXI.Text({
      text: "",
      style: { fontFamily: "vcr", fontSize: 16, fill: 0xffffff, align: "right" }
    });
    this.scoreTxt.x = this.healthBarBG.x + this.healthBarBG.width - 190;
    this.scoreTxt.y = this.healthBarBG.y + 30;
    this.addChild(this.scoreTxt);

    this.iconP1 = new HealthIcon(SONG.player1, true);
    await this.iconP1.init();
    this.iconP1.y = this.healthBarBG.y - this.iconP1.height / 2;
    this.addChild(this.iconP1);

    this.iconP2 = new HealthIcon(SONG.player2, false);
    await this.iconP2.init();
    this.iconP2.y = this.healthBarBG.y - this.iconP2.height / 2;
    this.addChild(this.iconP2);

    this.startingSong = true;

    this.generateStaticArrows(0);
    this.generateStaticArrows(1);

    if (PlayState.isStoryMode) {
      switch (this.curSong.toLowerCase()) {
        case "winter-horrorland":
          await this.winterHorrorlandIntro();
          break;
        case "senpai":
        case "thorns":
          this.schoolIntro();
          break;
        case "roses":
          this.app.sound.play("assets/sounds/ANGRY" + TitleState.soundExt);
          this.schoolIntro();
          break;
        default:
          this.startCountdown();
      }
    } else {
      this.startCountdown();
    }
  }

  async setupStage(SONG) {
    const song = SONG.song.toLowerCase();

    if (song === "spookeez" || song === "monster" || song === "south") {
      PlayState.curStage = "spooky";
      this.halloweenLevel = true;
      this.isHalloween = true;

      const { SparrowSprite } = await import("./SparrowSprite.js");
      this.halloweenBG = new SparrowSprite(-200, -100);
      await this.halloweenBG.loadAtlas("assets/images/halloween_bg.png", "assets/images/halloween_bg.xml");
      this.halloweenBG.addAnimation("idle", "halloweem bg0", 24, true);
      this.halloweenBG.addAnimation("lightning", "halloweem bg lightning strike", 24, false);
      this.halloweenBG.playAnimation("idle");
      this.halloweenBG.antialias = true;
      this.addChild(this.halloweenBG);
    } else if (song === "pico" || song === "blammed" || song === "philly") {
      PlayState.curStage = "philly";

      const bg = PIXI.Sprite.from("assets/images/philly/sky.png");
      bg.x = -100;
      bg.scrollFactorX = 0.1;
      bg.scrollFactorY = 0.1;
      this.addChild(bg);

      const city = PIXI.Sprite.from("assets/images/philly/city.png");
      city.x = -10;
      city.scrollFactorX = 0.3;
      city.scrollFactorY = 0.3;
      city.scale.set(0.85);
      this.addChild(city);

      this.phillyCityLights = new PIXI.Container();
      this.addChild(this.phillyCityLights);

      for (let i = 0; i < 5; i++) {
        const light = PIXI.Sprite.from("assets/images/philly/win" + i + ".png");
        light.x = city.x;
        light.scrollFactorX = 0.3;
        light.scrollFactorY = 0.3;
        light.visible = false;
        light.scale.set(0.85);
        this.phillyCityLights.addChild(light);
      }

      const streetBehind = PIXI.Sprite.from("assets/images/philly/behindTrain.png");
      streetBehind.x = -40;
      streetBehind.y = 50;
      this.addChild(streetBehind);

      this.phillyTrain = PIXI.Sprite.from("assets/images/philly/train.png");
      this.phillyTrain.x = 2000;
      this.phillyTrain.y = 360;
      this.addChild(this.phillyTrain);

      this.trainSound = await this.app.sound.loadEmbedded("assets/sounds/train_passes" + TitleState.soundExt);

      const street = PIXI.Sprite.from("assets/images/philly/street.png");
      street.x = -40;
      street.y = streetBehind.y;
      this.addChild(street);
    } else if (song === "milf" || song === "satin-panties" || song === "high") {
      PlayState.curStage = "limo";
      this.defaultCamZoom = 0.9;

      const { SparrowSprite } = await import("./SparrowSprite.js");

      const skyBG = PIXI.Sprite.from("assets/images/limo/limoSunset.png");
      skyBG.x = -120;
      skyBG.y = -50;
      skyBG.scrollFactorX = 0.1;
      skyBG.scrollFactorY = 0.1;
      this.addChild(skyBG);

      const bgLimo = new SparrowSprite(-200, 480);
      await bgLimo.loadAtlas("assets/images/limo/bgLimo.png", "assets/images/limo/bgLimo.xml");
      bgLimo.addAnimation("drive", "background limo pink", 24, true);
      bgLimo.playAnimation("drive");
      bgLimo.scrollFactorX = 0.4;
      bgLimo.scrollFactorY = 0.4;
      this.addChild(bgLimo);

      this.grpLimoDancers = new PIXI.Container();
      this.addChild(this.grpLimoDancers);

      for (let i = 0; i < 5; i++) {
        const dancer = new BackgroundDancer(370 * i + 130, bgLimo.y - 400);
        await dancer.init();
        dancer.scrollFactorX = 0.4;
        dancer.scrollFactorY = 0.4;
        this.grpLimoDancers.addChild(dancer);
      }

      const limoTex = new SparrowSprite(-120, 550);
      await limoTex.loadAtlas("assets/images/limo/limoDrive.png", "assets/images/limo/limoDrive.xml");
      limoTex.addAnimation("drive", "Limo stage", 24, true);
      limoTex.playAnimation("drive");
      limoTex.antialias = true;
      this.limo = limoTex;

      this.fastCar = PIXI.Sprite.from("assets/images/limo/fastCarLol.png");
      this.fastCar.x = -300;
      this.fastCar.y = 160;
    } else if (song === "cocoa" || song === "eggnog") {
      PlayState.curStage = "mall";
      this.defaultCamZoom = 0.8;

      const { SparrowSprite } = await import("./SparrowSprite.js");

      const bg = PIXI.Sprite.from("assets/images/christmas/bgWalls.png");
      bg.x = -1000;
      bg.y = -500;
      bg.scrollFactorX = 0.2;
      bg.scrollFactorY = 0.2;
      bg.scale.set(0.8);
      this.addChild(bg);

      this.upperBoppers = new SparrowSprite(-240, -90);
      await this.upperBoppers.loadAtlas("assets/images/christmas/upperBop.png", "assets/images/christmas/upperBop.xml");
      this.upperBoppers.addAnimation("bop", "Upper Crowd Bob", 24, false);
      this.upperBoppers.scrollFactorX = 0.33;
      this.upperBoppers.scrollFactorY = 0.33;
      this.upperBoppers.scale.set(0.85);
      this.addChild(this.upperBoppers);

      const bgEscalator = PIXI.Sprite.from("assets/images/christmas/bgEscalator.png");
      bgEscalator.x = -1100;
      bgEscalator.y = -600;
      bgEscalator.scrollFactorX = 0.3;
      bgEscalator.scrollFactorY = 0.3;
      bgEscalator.scale.set(0.9);
      this.addChild(bgEscalator);

      const tree = PIXI.Sprite.from("assets/images/christmas/christmasTree.png");
      tree.x = 370;
      tree.y = -250;
      tree.scrollFactorX = 0.4;
      tree.scrollFactorY = 0.4;
      this.addChild(tree);

      this.bottomBoppers = new SparrowSprite(-300, 140);
      await this.bottomBoppers.loadAtlas("assets/images/christmas/bottomBop.png", "assets/images/christmas/bottomBop.xml");
      this.bottomBoppers.addAnimation("bop", "Bottom Level Boppers", 24, false);
      this.bottomBoppers.scrollFactorX = 0.9;
      this.bottomBoppers.scrollFactorY = 0.9;
      this.addChild(this.bottomBoppers);

      const fgSnow = PIXI.Sprite.from("assets/images/christmas/fgSnow.png");
      fgSnow.x = -600;
      fgSnow.y = 700;
      this.addChild(fgSnow);

      this.santa = new SparrowSprite(-840, 150);
      await this.santa.loadAtlas("assets/images/christmas/santa.png", "assets/images/christmas/santa.xml");
      this.santa.addAnimation("idle", "santa idle in fear", 24, false);
      this.addChild(this.santa);
    } else if (song === "winter-horrorland") {
      PlayState.curStage = "mallEvil";

      const bg = PIXI.Sprite.from("assets/images/christmas/evilBG.png");
      bg.x = -400;
      bg.y = -500;
      bg.scrollFactorX = 0.2;
      bg.scrollFactorY = 0.2;
      bg.scale.set(0.8);
      this.addChild(bg);

      const evilTree = PIXI.Sprite.from("assets/images/christmas/evilTree.png");
      evilTree.x = 300;
      evilTree.y = -300;
      evilTree.scrollFactorX = 0.2;
      evilTree.scrollFactorY = 0.2;
      this.addChild(evilTree);

      const evilSnow = PIXI.Sprite.from("assets/images/christmas/evilSnow.png");
      evilSnow.x = -200;
      evilSnow.y = 700;
      this.addChild(evilSnow);
    } else if (song === "senpai" || song === "roses") {
      PlayState.curStage = "school";

      const { SparrowSprite } = await import("./SparrowSprite.js");
      const repositionShit = -200;

      const bgSky = PIXI.Sprite.from("assets/images/weeb/weebSky.png");
      bgSky.scrollFactorX = 0.1;
      bgSky.scrollFactorY = 0.1;
      this.addChild(bgSky);

      const bgSchool = PIXI.Sprite.from("assets/images/weeb/weebSchool.png");
      bgSchool.x = repositionShit;
      bgSchool.scrollFactorX = 0.6;
      bgSchool.scrollFactorY = 0.9;
      this.addChild(bgSchool);

      const bgStreet = PIXI.Sprite.from("assets/images/weeb/weebStreet.png");
      bgStreet.x = repositionShit;
      bgStreet.scrollFactorX = 0.95;
      bgStreet.scrollFactorY = 0.95;
      this.addChild(bgStreet);

      const fgTrees = PIXI.Sprite.from("assets/images/weeb/weebTreesBack.png");
      fgTrees.x = repositionShit + 170;
      fgTrees.y = 130;
      fgTrees.scrollFactorX = 0.9;
      fgTrees.scrollFactorY = 0.9;
      this.addChild(fgTrees);

      const bgTrees = new SparrowSprite(repositionShit - 380, -800);
      await bgTrees.loadSpriteSheetPacker("assets/images/weeb/weebTrees.png", "assets/images/weeb/weebTrees.txt");
      bgTrees.addAnimationRaw("treeLoop", [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18], 12);
      bgTrees.playAnimation("treeLoop");
      bgTrees.scrollFactorX = 0.85;
      bgTrees.scrollFactorY = 0.85;
      this.addChild(bgTrees);

      const treeLeaves = new SparrowSprite(repositionShit, -40);
      await treeLeaves.loadAtlas("assets/images/weeb/petals.png", "assets/images/weeb/petals.xml");
      treeLeaves.addAnimation("leaves", "PETALS ALL", 24, true);
      treeLeaves.playAnimation("leaves");
      treeLeaves.scrollFactorX = 0.85;
      treeLeaves.scrollFactorY = 0.85;
      this.addChild(treeLeaves);

      const widShit = bgSky.width * 6;
      bgSky.width = widShit;
      bgSchool.width = widShit;
      bgStreet.width = widShit;
      bgTrees.setGraphicSize(Math.floor(widShit * 1.4));
      fgTrees.width = widShit * 0.8;
      treeLeaves.setGraphicSize(widShit);

      this.bgGirls = new BackgroundGirls(-100, 190);
      await this.bgGirls.init();
      this.bgGirls.scrollFactorX = 0.9;
      this.bgGirls.scrollFactorY = 0.9;

      if (song === "roses") {
        this.bgGirls.getScared();
      }

      this.bgGirls.setGraphicSize(Math.floor(this.bgGirls.width * PlayState.daPixelZoom));
      this.addChild(this.bgGirls);
    } else if (song === "thorns") {
      PlayState.curStage = "schoolEvil";

      const { SparrowSprite } = await import("./SparrowSprite.js");
      const bg = new SparrowSprite(400, 200);
      await bg.loadAtlas("assets/images/weeb/animatedEvilSchool.png", "assets/images/weeb/animatedEvilSchool.xml");
      bg.addAnimation("idle", "background 2", 24, true);
      bg.playAnimation("idle");
      bg.scrollFactorX = 0.8;
      bg.scrollFactorY = 0.9;
      bg.scale.set(6, 6);
      this.addChild(bg);
    } else {
      this.defaultCamZoom = 0.9;
      PlayState.curStage = "stage";

      const bg = PIXI.Sprite.from("assets/images/stageback.png");
      bg.x = -600;
      bg.y = -200;
      bg.scrollFactorX = 0.9;
      bg.scrollFactorY = 0.9;
      this.addChild(bg);

      const stageFront = PIXI.Sprite.from("assets/images/stagefront.png");
      stageFront.x = -650;
      stageFront.y = 600;
      stageFront.scale.set(1.1);
      stageFront.scrollFactorX = 0.9;
      stageFront.scrollFactorY = 0.9;
      this.addChild(stageFront);

      const stageCurtains = PIXI.Sprite.from("assets/images/stagecurtains.png");
      stageCurtains.x = -500;
      stageCurtains.y = -300;
      stageCurtains.scale.set(0.9);
      stageCurtains.scrollFactorX = 1.3;
      stageCurtains.scrollFactorY = 1.3;
      this.addChild(stageCurtains);
    }
  }

  schoolIntro() {
    this.inCutscene = true;
    setTimeout(() => this.startCountdown(), 1500);
  }

  async winterHorrorlandIntro() {
    this.camHUD.visible = false;
    setTimeout(() => {
      this.app.sound.play("assets/sounds/Lights_Turn_On" + TitleState.soundExt);
      this.camFollow.y = -2050;
      this.camFollow.x += 200;
      this.app.camera.zoom = 1.5;

      setTimeout(() => {
        this.camHUD.visible = true;
        this.startCountdown();
      }, 800);
    }, 100);
  }

  startCountdown() {
    this.inCutscene = false;
    this.talking = false;
    this.startedCountdown = true;
    Conductor.songPosition = 0;
    Conductor.songPosition -= Conductor.crochet * 5;

    let swagCounter = 0;

    const introAssets = {
      default: ["ready.png", "set.png", "go.png"],
      school: ["weeb/pixelUI/ready-pixel.png", "weeb/pixelUI/set-pixel.png", "weeb/pixelUI/date-pixel.png"],
      schoolEvil: ["weeb/pixelUI/ready-pixel.png", "weeb/pixelUI/set-pixel.png", "weeb/pixelUI/date-pixel.png"]
    };

    const tick = () => {
      this.dad.dance();
      this.gf.dance();
      this.boyfriend.playAnim("idle");

      let introAlts = introAssets.default;
      let altSuffix = "";

      if (introAssets[PlayState.curStage]) {
        introAlts = introAssets[PlayState.curStage];
        altSuffix = "-pixel";
      }

      switch (swagCounter) {
        case 0:
          this.app.sound.play("assets/sounds/intro3" + altSuffix + TitleState.soundExt, 0.6);
          break;
        case 1:
          this.showIntroSprite(introAlts[0], altSuffix, "intro2");
          break;
        case 2:
          this.showIntroSprite(introAlts[1], altSuffix, "intro1");
          break;
        case 3:
          this.showIntroSprite(introAlts[2], altSuffix, "introGo");
          break;
      }

      swagCounter += 1;

      if (swagCounter <= 4) {
        setTimeout(tick, Conductor.crochet);
      }
    };

    tick();
  }

  showIntroSprite(path, altSuffix, sound) {
    const spr = PIXI.Sprite.from("assets/images/" + path);
    if (PlayState.curStage.startsWith("school")) {
      spr.scale.set(PlayState.daPixelZoom);
    }
    spr.x = (this.app.screen.width - spr.width) / 2;
    spr.y = (this.app.screen.height - spr.height) / 2;
    this.addChild(spr);

    let elapsed = 0;
    const duration = Conductor.crochet;
    const startY = spr.y;
    const ticker = () => {
      elapsed += 16;
      const t = Math.min(elapsed / duration, 1);
      spr.y = startY + 100 * t;
      spr.alpha = 1 - t;
      if (t >= 1) {
        spr.destroy();
      } else {
        requestAnimationFrame(ticker);
      }
    };
    requestAnimationFrame(ticker);

    this.app.sound.play("assets/sounds/" + sound + altSuffix + TitleState.soundExt, 0.6);
  }

  async startSong() {
    this.startingSong = false;

    if (!this.paused) {
      await this.app.sound.playMusic("assets/music/" + PlayState.SONG.song + "_Inst" + TitleState.soundExt, 1);
    }
    this.app.sound.music.onComplete = () => this.endSong();
    this.vocals.play();
  }

  async generateSong(dataPath) {
    const songData = PlayState.SONG;
    Conductor.changeBPM(songData.bpm);
    this.curSong = songData.song;

    if (songData.needsVoices) {
      this.vocals = await this.app.sound.loadEmbedded("assets/music/" + this.curSong + "_Voices" + TitleState.soundExt);
    } else {
      this.vocals = this.app.sound.createEmpty();
    }

    this.notes = new PIXI.Container();
    this.addChild(this.notes);

    const noteData = songData.notes;

    for (const section of noteData) {
      for (const songNotes of section.sectionNotes) {
        const daStrumTime = songNotes[0];
        const daNoteData = Math.floor(songNotes[1] % 4);

        let gottaHitNote = section.mustHitSection;
        if (songNotes[1] > 3) {
          gottaHitNote = !section.mustHitSection;
        }

        let oldNote = this.unspawnNotes.length > 0 ? this.unspawnNotes[this.unspawnNotes.length - 1] : null;

        const swagNote = new Note(daStrumTime, daNoteData, oldNote);
        swagNote.sustainLength = songNotes[2];

        let susLength = swagNote.sustainLength / Conductor.stepCrochet;
        this.unspawnNotes.push(swagNote);

        for (let susNote = 0; susNote < Math.floor(susLength); susNote++) {
          oldNote = this.unspawnNotes[this.unspawnNotes.length - 1];

          const sustainNote = new Note(
            daStrumTime + Conductor.stepCrochet * susNote + Conductor.stepCrochet,
            daNoteData,
            oldNote,
            true
          );
          this.unspawnNotes.push(sustainNote);

          sustainNote.mustPress = gottaHitNote;
          if (sustainNote.mustPress) {
            sustainNote.x += this.app.screen.width / 2;
          }
        }

        swagNote.mustPress = gottaHitNote;
        if (swagNote.mustPress) {
          swagNote.x += this.app.screen.width / 2;
        }
      }
    }

    this.unspawnNotes.sort((a, b) => a.strumTime - b.strumTime);

    this.generatedMusic = true;
  }

  generateStaticArrows(player) {
    for (let i = 0; i < 4; i++) {
      const babyArrow = new Note(0, i);
      babyArrow.y = 50;

      if (PlayState.curStage === "school" || PlayState.curStage === "schoolEvil") {
        babyArrow.loadPixelArrow(i);
      } else {
        babyArrow.loadNormalArrow(i);
      }

      babyArrow.strumID = i;

      if (player === 1) {
        this.playerStrums.addChild(babyArrow);
      }

      babyArrow.playAnimation("static");
      babyArrow.x += 50;
      babyArrow.x += (this.app.screen.width / 2) * player;

      this.strumLineNotes.addChild(babyArrow);
    }
  }

  tweenCamIn() {
    this.app.camera.tweenZoom(1.3, (Conductor.stepCrochet * 4) / 1000);
  }

  openSubState(subState) {
    if (this.paused) {
      if (this.app.sound.music) {
        this.app.sound.music.pause();
        this.vocals.pause();
      }
    }
    super.openSubState(subState);
  }

  closeSubState() {
    if (this.paused) {
      if (this.app.sound.music && !this.startingSong) {
        this.resyncVocals();
      }
      this.paused = false;
    }
    super.closeSubState();
  }

  resyncVocals() {
    this.vocals.pause();
    this.app.sound.music.play();
    Conductor.songPosition = this.app.sound.music.time;
    this.vocals.time = Conductor.songPosition;
    this.vocals.play();
  }

  update(elapsed) {
    super.update(elapsed);

    if (PlayState.curStage === "philly" && this.trainMoving) {
      this.trainFrameTiming += elapsed;
      if (this.trainFrameTiming >= 1000 / 24) {
        this.updateTrainPos();
        this.trainFrameTiming = 0;
      }
    }

    this.scoreTxt.text = "Score:" + this.songScore;

    if (this.app.input.justPressed("Enter") && this.startedCountdown && this.canPause) {
      this.persistentUpdate = false;
      this.persistentDraw = true;
      this.paused = true;
      this.openSubState(new PauseSubState(this.app, this.boyfriend.x, this.boyfriend.y));
    }

    if (this.app.input.justPressed("Digit7")) {
      this.app.switchState(new ChartingState(this.app));
    }

    this.iconP1.updateHealthSize(this.healthBar.percent);
    this.iconP2.updateHealthSize(this.healthBar.percent);

    if (this.health > 2) {
      this.health = 2;
    }

    if (this.startingSong) {
      if (this.startedCountdown) {
        Conductor.songPosition += elapsed;
        if (Conductor.songPosition >= 0) {
          this.startSong();
        }
      }
    } else {
      Conductor.songPosition += elapsed;
    }

    if (this.generatedMusic && PlayState.SONG.notes[Math.floor(this.curStep / 16)] != null) {
      const curSectionData = PlayState.SONG.notes[Math.floor(this.curStep / 16)];

      if (this.camFollow.x !== this.dad.x + 150 && !curSectionData.mustHitSection) {
        this.camFollow.x = this.dad.x + 150;
        this.camFollow.y = this.dad.y - 100;

        switch (this.dad.curCharacter) {
          case "mom":
            this.camFollow.y = this.dad.y;
            break;
          case "senpai":
          case "senpai-angry":
            this.camFollow.y = this.dad.y - 430;
            this.camFollow.x = this.dad.x - 100;
            break;
        }

        if (this.dad.curCharacter === "mom") {
          this.vocals.volume = 1;
        }

        if (PlayState.SONG.song.toLowerCase() === "tutorial") {
          this.tweenCamIn();
        }
      }

      if (curSectionData.mustHitSection && this.camFollow.x !== this.boyfriend.x - 100) {
        this.camFollow.x = this.boyfriend.x - 100;
        this.camFollow.y = this.boyfriend.y - 100;

        switch (PlayState.curStage) {
          case "limo":
            this.camFollow.x = this.boyfriend.x - 300;
            break;
          case "mall":
            this.camFollow.y = this.boyfriend.y - 200;
            break;
          case "school":
          case "schoolEvil":
            this.camFollow.x = this.boyfriend.x - 200;
            this.camFollow.y = this.boyfriend.y - 200;
            break;
        }

        if (PlayState.SONG.song.toLowerCase() === "tutorial") {
          this.app.camera.tweenZoom(1, (Conductor.stepCrochet * 4) / 1000);
        }
      }
    }

    if (this.camZooming) {
      this.app.camera.zoom = lerp(this.defaultCamZoom, this.app.camera.zoom, 0.95);
    }

    if (this.curSong === "Fresh") {
      switch (this.curBeat) {
        case 16: this.camZooming = true; this.gfSpeed = 2; break;
        case 48: this.gfSpeed = 1; break;
        case 80: this.gfSpeed = 2; break;
        case 112: this.gfSpeed = 1; break;
      }
    }

    if (this.curSong === "Bopeebo" && [128, 129, 130].includes(this.curBeat)) {
      this.vocals.volume = 0;
    }

    if (this.app.controls.RESET) {
      this.health = 0;
    }

    if (this.app.controls.CHEAT) {
      this.health += 1;
    }

    if (this.health <= 0) {
      this.boyfriend.stunned = true;
      this.persistentUpdate = false;
      this.persistentDraw = false;
      this.paused = true;

      this.vocals.stop();
      this.app.sound.music.stop();

      this.openSubState(new GameOverSubstate(this.app, this.boyfriend.x, this.boyfriend.y));
    }

    if (this.unspawnNotes[0] != null && this.unspawnNotes[0].strumTime - Conductor.songPosition < 1500) {
      const dunceNote = this.unspawnNotes[0];
      this.notes.addChild(dunceNote);
      this.unspawnNotes.splice(0, 1);
    }

    if (this.generatedMusic) {
      for (let i = this.notes.children.length - 1; i >= 0; i--) {
        const daNote = this.notes.children[i];

        daNote.visible = daNote.y <= this.app.screen.height;

        daNote.y = this.strumLine.y - (Conductor.songPosition - daNote.strumTime) * (0.45 * round2(PlayState.SONG.speed));

        if (!daNote.mustPress && daNote.wasGoodHit) {
          if (PlayState.SONG.song !== "Tutorial") {
            this.camZooming = true;
          }

          let altAnim = "";
          const sectionData = PlayState.SONG.notes[Math.floor(this.curStep / 16)];
          if (sectionData && sectionData.altAnim) {
            altAnim = "-alt";
          }

          switch (Math.abs(daNote.noteData)) {
            case 0: this.dad.playAnim("singLEFT" + altAnim, true); break;
            case 1: this.dad.playAnim("singDOWN" + altAnim, true); break;
            case 2: this.dad.playAnim("singUP" + altAnim, true); break;
            case 3: this.dad.playAnim("singRIGHT" + altAnim, true); break;
          }

          this.dad.holdTimer = 0;

          if (PlayState.SONG.needsVoices) {
            this.vocals.volume = 1;
          }

          this.notes.removeChild(daNote);
          daNote.destroy();
          continue;
        }

        if (daNote.y < -daNote.height) {
          if (daNote.isSustainNote && daNote.wasGoodHit) {
            this.notes.removeChild(daNote);
            daNote.destroy();
          } else {
            if (daNote.tooLate || !daNote.wasGoodHit) {
              this.health -= 0.0475;
              this.vocals.volume = 0;
            }
            this.notes.removeChild(daNote);
            daNote.destroy();
          }
        }
      }
    }

    if (!this.inCutscene) {
      this.keyShit();
    }
  }

  async endSong() {
    this.canPause = false;
    this.app.sound.music.volume = 0;
    this.vocals.volume = 0;

    if (PlayState.SONG.validScore) {
      Highscore.saveScore(PlayState.SONG.song, this.songScore, PlayState.storyDifficulty);
    }

    if (PlayState.isStoryMode) {
      PlayState.campaignScore += this.songScore;
      PlayState.storyPlaylist.shift();

      if (PlayState.storyPlaylist.length <= 0) {
        this.app.sound.playMusic("assets/music/freakyMenu" + TitleState.soundExt);
        this.app.switchState(new StoryMenuState(this.app));

        if (PlayState.SONG.validScore) {
          Highscore.saveWeekScore(PlayState.storyWeek, PlayState.campaignScore, PlayState.storyDifficulty);
        }
      } else {
        let difficulty = "";
        if (PlayState.storyDifficulty === 0) difficulty = "-easy";
        if (PlayState.storyDifficulty === 2) difficulty = "-hard";

        PlayState.prevCamFollow = this.camFollow;
        PlayState.SONG = await Song.loadFromJson(
          PlayState.storyPlaylist[0].toLowerCase() + difficulty,
          PlayState.storyPlaylist[0]
        );
        this.app.sound.music.stop();
        this.app.switchState(new PlayState(this.app));
      }
    } else {
      this.app.switchState(new FreeplayState(this.app));
    }
  }

  popUpScore(strumtime) {
    const noteDiff = Math.abs(strumtime - Conductor.songPosition);
    this.vocals.volume = 1;

    let score = 350;
    let daRating = "sick";

    if (noteDiff > Conductor.safeZoneOffset * 0.9) {
      daRating = "shit";
      score = 50;
    } else if (noteDiff > Conductor.safeZoneOffset * 0.75) {
      daRating = "bad";
      score = 100;
    } else if (noteDiff > Conductor.safeZoneOffset * 0.2) {
      daRating = "good";
      score = 200;
    }

    this.songScore += score;

    const pixelPrefix = PlayState.curStage.startsWith("school") ? "weeb/pixelUI/" : "";
    const pixelSuffix = PlayState.curStage.startsWith("school") ? "-pixel" : "";

    const rating = PIXI.Sprite.from("assets/images/" + pixelPrefix + daRating + pixelSuffix + ".png");
    rating.x = this.app.screen.width * 0.55 - 40;
    rating.y = this.app.screen.height / 2 - 60;
    this.addChild(rating);

    const comboSpr = PIXI.Sprite.from("assets/images/" + pixelPrefix + "combo" + pixelSuffix + ".png");
    comboSpr.x = this.app.screen.width * 0.55;
    comboSpr.y = this.app.screen.height / 2;
    this.addChild(comboSpr);

    const scale = PlayState.curStage.startsWith("school") ? PlayState.daPixelZoom * 0.7 : 0.7;
    rating.scale.set(scale);
    comboSpr.scale.set(scale);

    const separatedScore = [
      Math.floor(this.combo / 100),
      Math.floor((this.combo - Math.floor(this.combo / 100) * 100) / 10),
      this.combo % 10
    ];

    separatedScore.forEach((digit, i) => {
      const numScore = PIXI.Sprite.from("assets/images/" + pixelPrefix + "num" + digit + pixelSuffix + ".png");
      numScore.x = this.app.screen.width * 0.55 + 43 * i - 90;
      numScore.y = this.app.screen.height / 2 + 80;
      numScore.scale.set(PlayState.curStage.startsWith("school") ? PlayState.daPixelZoom : 0.5);

      if (this.combo >= 10 || this.combo === 0) {
        this.addChild(numScore);
      }

      setTimeout(() => numScore.destroy(), Conductor.crochet * 0.002 + 200);
    });

    setTimeout(() => {
      rating.destroy();
      comboSpr.destroy();
    }, Conductor.crochet * 0.001 + 200);

    this.curSection += 1;
  }

  keyShit() {
    const controls = this.app.controls;

    const up = controls.UP, right = controls.RIGHT, down = controls.DOWN, left = controls.LEFT;
    const upP = controls.UP_P, rightP = controls.RIGHT_P, downP = controls.DOWN_P, leftP = controls.LEFT_P;
    const upR = controls.UP_R, rightR = controls.RIGHT_R, downR = controls.DOWN_R, leftR = controls.LEFT_R;

    const controlArray = [leftP, downP, upP, rightP];

    if ((upP || rightP || downP || leftP) && !this.boyfriend.stunned && this.generatedMusic) {
      this.boyfriend.holdTimer = 0;

      const possibleNotes = [];
      const ignoreList = [];

      for (const daNote of this.notes.children) {
        if (daNote.canBeHit && daNote.mustPress && !daNote.tooLate) {
          possibleNotes.push(daNote);
          ignoreList.push(daNote.noteData);
        }
      }
      possibleNotes.sort((a, b) => a.strumTime - b.strumTime);

      if (possibleNotes.length > 0) {
        const daNote = possibleNotes[0];

        if (this.perfectMode) {
          this.noteCheck(true, daNote);
        }

        if (possibleNotes.length >= 2) {
          if (possibleNotes[0].strumTime === possibleNotes[1].strumTime) {
            for (const coolNote of possibleNotes) {
              if (controlArray[coolNote.noteData]) {
                this.goodNoteHit(coolNote);
              } else {
                let inIgnoreList = false;
                for (const id of ignoreList) {
                  if (controlArray[id]) inIgnoreList = true;
                }
                if (!inIgnoreList) this.badNoteCheck();
              }
            }
          } else if (possibleNotes[0].noteData === possibleNotes[1].noteData) {
            this.noteCheck(controlArray[daNote.noteData], daNote);
          } else {
            for (const coolNote of possibleNotes) {
              this.noteCheck(controlArray[coolNote.noteData], coolNote);
            }
          }
        } else {
          this.noteCheck(controlArray[daNote.noteData], daNote);
        }

        if (daNote.wasGoodHit) {
          this.notes.removeChild(daNote);
          daNote.destroy();
        }
      } else {
        this.badNoteCheck();
      }
    }

    if ((up || right || down || left) && !this.boyfriend.stunned && this.generatedMusic) {
      for (const daNote of this.notes.children) {
        if (daNote.canBeHit && daNote.mustPress && daNote.isSustainNote) {
          switch (daNote.noteData) {
            case 0: if (left) this.goodNoteHit(daNote); break;
            case 1: if (down) this.goodNoteHit(daNote); break;
            case 2: if (up) this.goodNoteHit(daNote); break;
            case 3: if (right) this.goodNoteHit(daNote); break;
          }
        }
      }
    }

    if (this.boyfriend.holdTimer > Conductor.stepCrochet * 4 * 0.001 && !up && !down && !right && !left) {
      if (this.boyfriend.currentAnimName?.startsWith("sing") && !this.boyfriend.currentAnimName?.endsWith("miss")) {
        this.boyfriend.playAnim("idle");
      }
    }

    for (const spr of this.playerStrums.children) {
      switch (spr.strumID) {
        case 0:
          if (leftP && spr.currentAnimName !== "confirm") spr.playAnimation("pressed");
          if (leftR) spr.playAnimation("static");
          break;
        case 1:
          if (downP && spr.currentAnimName !== "confirm") spr.playAnimation("pressed");
          if (downR) spr.playAnimation("static");
          break;
        case 2:
          if (upP && spr.currentAnimName !== "confirm") spr.playAnimation("pressed");
          if (upR) spr.playAnimation("static");
          break;
        case 3:
          if (rightP && spr.currentAnimName !== "confirm") spr.playAnimation("pressed");
          if (rightR) spr.playAnimation("static");
          break;
      }
    }
  }

  noteMiss(direction = 1) {
    if (!this.boyfriend.stunned) {
      this.health -= 0.04;
      if (this.combo > 5) {
        this.gf.playAnim("sad");
      }
      this.combo = 0;
      this.songScore -= 10;

      const soundNum = Math.floor(Math.random() * 3) + 1;
      this.app.sound.play("assets/sounds/missnote" + soundNum + TitleState.soundExt, 0.1 + Math.random() * 0.1);

      this.boyfriend.stunned = true;
      setTimeout(() => { this.boyfriend.stunned = false; }, (5 / 60) * 1000);

      switch (direction) {
        case 0: this.boyfriend.playAnim("singLEFTmiss", true); break;
        case 1: this.boyfriend.playAnim("singDOWNmiss", true); break;
        case 2: this.boyfriend.playAnim("singUPmiss", true); break;
        case 3: this.boyfriend.playAnim("singRIGHTmiss", true); break;
      }
    }
  }

  badNoteCheck() {
    const controls = this.app.controls;
    if (controls.LEFT_P) this.noteMiss(0);
    if (controls.DOWN_P) this.noteMiss(1);
    if (controls.UP_P) this.noteMiss(2);
    if (controls.RIGHT_P) this.noteMiss(3);
  }

  noteCheck(keyP, note) {
    if (keyP) {
      this.goodNoteHit(note);
    } else {
      this.badNoteCheck();
    }
  }

  goodNoteHit(note) {
    if (!note.wasGoodHit) {
      if (!note.isSustainNote) {
        this.popUpScore(note.strumTime);
        this.combo += 1;
      }

      this.health += note.noteData >= 0 ? 0.023 : 0.004;

      switch (note.noteData) {
        case 0: this.boyfriend.playAnim("singLEFT", true); break;
        case 1: this.boyfriend.playAnim("singDOWN", true); break;
        case 2: this.boyfriend.playAnim("singUP", true); break;
        case 3: this.boyfriend.playAnim("singRIGHT", true); break;
      }

      for (const spr of this.playerStrums.children) {
        if (Math.abs(note.noteData) === spr.strumID) {
          spr.playAnimation("confirm", true);
        }
      }

      note.wasGoodHit = true;
      this.vocals.volume = 1;

      if (!note.isSustainNote) {
        this.notes.removeChild(note);
        note.destroy();
      }
    }
  }

  resetFastCar() {
    this.fastCar.x = -12600;
    this.fastCar.y = 140 + Math.random() * 110;
    this.fastCarCanDrive = true;
  }

  fastCarDrive() {
    const soundNum = Math.floor(Math.random() * 2);
    this.app.sound.play("assets/sounds/carPass" + soundNum + TitleState.soundExt, 0.7);
    this.fastCarCanDrive = false;
    setTimeout(() => this.resetFastCar(), 2000);
  }

  trainStart() {
    this.trainMoving = true;
    if (!this.trainSound.playing) {
      this.trainSound.play();
    }
  }

  updateTrainPos() {
    if (this.trainSound.time >= 4700) {
      this.startedMoving = true;
      this.gf.playAnim("hairBlow");
    }

    if (this.startedMoving) {
      this.phillyTrain.x -= 400;

      if (this.phillyTrain.x < -2000 && !this.trainFinishing) {
        this.phillyTrain.x = -1150;
        this.trainCars -= 1;
        if (this.trainCars <= 0) {
          this.trainFinishing = true;
        }
      }

      if (this.phillyTrain.x < -4000 && this.trainFinishing) {
        this.trainReset();
      }
    }
  }

  trainReset() {
    this.gf.playAnim("hairFall");
    this.phillyTrain.x = this.app.screen.width + 200;
    this.trainMoving = false;
    this.trainCars = 8;
    this.trainFinishing = false;
    this.startedMoving = false;
  }

  lightningStrikeShit() {
    const num = Math.floor(Math.random() * 2) + 1;
    this.app.sound.play("assets/sounds/thunder_" + num + TitleState.soundExt);
    this.halloweenBG.playAnimation("lightning");

    this.lightningStrikeBeat = this.curBeat;
    this.lightningOffset = Math.floor(Math.random() * 16) + 8;

    this.boyfriend.playAnim("scared", true);
    this.gf.playAnim("scared", true);
  }

  stepHit() {
    super.stepHit();

    if (PlayState.SONG.needsVoices) {
      if (this.vocals.time > Conductor.songPosition + 20 || this.vocals.time < Conductor.songPosition - 20) {
        this.resyncVocals();
      }
    }
  }

  beatHit() {
    super.beatHit();

    const sectionData = PlayState.SONG.notes[Math.floor(this.curStep / 16)];

    if (sectionData) {
      if (sectionData.changeBPM) {
        Conductor.changeBPM(sectionData.bpm);
      }
      if (sectionData.mustHitSection) {
        this.dad.dance();
      }
    }

    if (this.curSong.toLowerCase() === "milf" && this.curBeat >= 168 && this.curBeat < 200 && this.camZooming && this.app.camera.zoom < 1.35) {
      this.app.camera.zoom += 0.015;
    }

    if (this.camZooming && this.app.camera.zoom < 1.35 && this.curBeat % 4 === 0) {
      this.app.camera.zoom += 0.015;
    }

    if (this.curBeat % this.gfSpeed === 0) {
      this.gf.dance();
    }

    if (!this.boyfriend.currentAnimName?.startsWith("sing")) {
      this.boyfriend.playAnim("idle");
    }

    if (this.curBeat % 8 === 7 && this.curSong === "Bopeebo") {
      this.boyfriend.playAnim("hey", true);
      if (PlayState.SONG.song === "Tutorial" && this.dad.curCharacter === "gf") {
        this.dad.playAnim("cheer", true);
      }
    }

    switch (PlayState.curStage) {
      case "school":
        this.bgGirls.dance();
        break;
      case "mall":
        this.upperBoppers.playAnimation("bop", true);
        this.bottomBoppers.playAnimation("bop", true);
        this.santa.playAnimation("idle", true);
        break;
      case "limo":
        for (const dancer of this.grpLimoDancers.children) {
          dancer.dance();
        }
        if (Math.random() < 0.1 && this.fastCarCanDrive) {
          this.fastCarDrive();
        }
        break;
      case "philly":
        if (!this.trainMoving) {
          this.trainCooldown += 1;
        }
        if (this.curBeat % 4 === 0) {
          for (const light of this.phillyCityLights.children) {
            light.visible = false;
          }
          this.curLight = Math.floor(Math.random() * this.phillyCityLights.children.length);
          this.phillyCityLights.children[this.curLight].visible = true;
        }
        if (this.curBeat % 8 === 4 && Math.random() < 0.3 && !this.trainMoving && this.trainCooldown > 8) {
          this.trainCooldown = Math.floor(Math.random() * 5) - 4;
          this.trainStart();
        }
        break;
    }

    if (this.isHalloween && Math.random() < 0.1 && this.curBeat > this.lightningStrikeBeat + this.lightningOffset) {
      this.lightningStrikeShit();
    }
  }
}

function lerp(a, b, ratio) {
  return a + (b - a) * ratio;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}
