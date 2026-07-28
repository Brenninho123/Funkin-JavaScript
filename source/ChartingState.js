import * as PIXI from "pixi.js";
import { MusicBeatState } from "./MusicBeatState.js";
import { Note } from "./Note.js";
import { HealthIcon } from "./HealthIcon.js";
import { Conductor } from "./Conductor.js";
import { PlayState } from "./PlayState.js";
import { Song } from "./Song.js";
import { CoolUtil } from "./CoolUtil.js";
import { TitleState } from "./TitleState.js";

const GRID_SIZE = 40;

export class ChartingState extends MusicBeatState {
  static lastSection = 0;

  constructor(app) {
    super(app);
    this.curSection = ChartingState.lastSection;
    this.tempBpm = 0;
    this.curSelectedNote = null;
    this.updatedSection = false;
    this.daSpacing = 0.3;
  }

  async create() {
    this.gridBG = this.createGridOverlay(GRID_SIZE, GRID_SIZE, GRID_SIZE * 8, GRID_SIZE * 16);
    this.addChild(this.gridBG);

    this.leftIcon = new HealthIcon("bf");
    this.rightIcon = new HealthIcon("dad");
    await this.leftIcon.init();
    await this.rightIcon.init();

    this.leftIcon.setGraphicSize(0, 45);
    this.rightIcon.setGraphicSize(0, 45);

    this.addChild(this.leftIcon);
    this.addChild(this.rightIcon);

    this.leftIcon.x = 0;
    this.leftIcon.y = -100;
    this.rightIcon.x = this.gridBG.width / 2;
    this.rightIcon.y = -100;

    const gridBlackLine = new PIXI.Graphics();
    gridBlackLine.rect(this.gridBG.x + this.gridBG.width / 2, 0, 2, this.gridBG.height);
    gridBlackLine.fill(0x000000);
    this.addChild(gridBlackLine);

    this.curRenderedNotes = new PIXI.Container();
    this.curRenderedSustains = new PIXI.Container();

    if (PlayState.SONG != null) {
      this._song = PlayState.SONG;
    } else {
      this._song = {
        song: "Test",
        notes: [],
        bpm: 150,
        needsVoices: true,
        player1: "bf",
        player2: "dad",
        speed: 1,
        validScore: false
      };
    }

    this.tempBpm = this._song.bpm;

    this.addSection();
    this.updateGrid();

    await this.loadSong(this._song.song);
    Conductor.changeBPM(this._song.bpm);
    Conductor.mapBPMChanges(this._song);

    this.bpmTxt = new PIXI.Text({ text: "", style: { fontSize: 16, fill: 0xffffff } });
    this.bpmTxt.x = 1000;
    this.bpmTxt.y = 50;
    this.addChild(this.bpmTxt);

    this.strumLine = new PIXI.Graphics();
    this.strumLine.rect(0, 50, this.app.screen.width / 2, 4);
    this.strumLine.fill(0xffffff);
    this.addChild(this.strumLine);

    this.dummyArrow = new PIXI.Graphics();
    this.dummyArrow.rect(0, 0, GRID_SIZE, GRID_SIZE);
    this.dummyArrow.fill(0xffffff);
    this.addChild(this.dummyArrow);

    this.buildDomUI();

    this.addChild(this.curRenderedNotes);
    this.addChild(this.curRenderedSustains);

    this.setupMouseHandlers();
    this.setupKeyboardHandlers();
  }

  createGridOverlay(tileW, tileH, w, h) {
    const g = new PIXI.Graphics();
    for (let x = 0; x < w; x += tileW) {
      for (let y = 0; y < h; y += tileH) {
        const isEven = (x / tileW + y / tileH) % 2 === 0;
        g.rect(x, y, tileW, tileH).fill(isEven ? 0x333333 : 0x444444);
      }
    }
    return g;
  }

  buildDomUI() {
    this.uiRoot = document.createElement("div");
    this.uiRoot.style.position = "absolute";
    this.uiRoot.style.right = "20px";
    this.uiRoot.style.top = "20px";
    this.uiRoot.style.width = "300px";
    this.uiRoot.style.background = "#222";
    this.uiRoot.style.color = "#fff";
    this.uiRoot.style.fontFamily = "monospace";
    this.uiRoot.style.padding = "10px";
    document.body.appendChild(this.uiRoot);

    this.tabs = { song: null, section: null, note: null };
    this.activeTab = "song";

    const tabBar = document.createElement("div");
    ["song", "section", "note"].forEach((name) => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.onclick = () => this.switchTab(name);
      tabBar.appendChild(btn);
    });
    this.uiRoot.appendChild(tabBar);

    this.tabContent = document.createElement("div");
    this.uiRoot.appendChild(this.tabContent);

    this.buildSongTab();
    this.buildSectionTab();
    this.buildNoteTab();
    this.switchTab("song");
  }

  switchTab(name) {
    this.activeTab = name;
    Object.keys(this.tabs).forEach((key) => {
      if (this.tabs[key]) {
        this.tabs[key].style.display = key === name ? "block" : "none";
      }
    });
  }

  buildSongTab() {
    const container = document.createElement("div");

    this.songTitleInput = document.createElement("input");
    this.songTitleInput.value = this._song.song;
    container.appendChild(this.songTitleInput);

    const checkVoices = document.createElement("label");
    const checkVoicesInput = document.createElement("input");
    checkVoicesInput.type = "checkbox";
    checkVoicesInput.checked = this._song.needsVoices;
    checkVoicesInput.onchange = () => {
      this._song.needsVoices = checkVoicesInput.checked;
    };
    checkVoices.appendChild(checkVoicesInput);
    checkVoices.append("Has voice track");
    container.appendChild(checkVoices);

    const checkMuteInst = document.createElement("label");
    const checkMuteInstInput = document.createElement("input");
    checkMuteInstInput.type = "checkbox";
    checkMuteInstInput.onchange = () => {
      this.app.sound.music.volume = checkMuteInstInput.checked ? 0 : 1;
    };
    checkMuteInst.appendChild(checkMuteInstInput);
    checkMuteInst.append("Mute Instrumental (in editor)");
    container.appendChild(checkMuteInst);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.onclick = () => this.saveLevel();
    container.appendChild(saveButton);

    const reloadSong = document.createElement("button");
    reloadSong.textContent = "Reload Audio";
    reloadSong.onclick = () => this.loadSong(this._song.song);
    container.appendChild(reloadSong);

    const reloadSongJson = document.createElement("button");
    reloadSongJson.textContent = "Reload JSON";
    reloadSongJson.onclick = () => this.loadJson(this._song.song.toLowerCase());
    container.appendChild(reloadSongJson);

    const loadAutosaveBtn = document.createElement("button");
    loadAutosaveBtn.textContent = "load autosave";
    loadAutosaveBtn.onclick = () => this.loadAutosave();
    container.appendChild(loadAutosaveBtn);

    this.stepperSpeed = document.createElement("input");
    this.stepperSpeed.type = "number";
    this.stepperSpeed.step = "0.1";
    this.stepperSpeed.value = this._song.speed;
    this.stepperSpeed.onchange = () => {
      this._song.speed = parseFloat(this.stepperSpeed.value);
    };
    container.appendChild(this.stepperSpeed);

    this.stepperBPM = document.createElement("input");
    this.stepperBPM.type = "number";
    this.stepperBPM.value = Conductor.bpm;
    this.stepperBPM.onchange = () => {
      this.tempBpm = parseInt(this.stepperBPM.value, 10);
      Conductor.mapBPMChanges(this._song);
      Conductor.changeBPM(this.tempBpm);
    };
    container.appendChild(this.stepperBPM);

    this.characterList = CoolUtil.coolTextFile("assets/data/characterList.txt");

    this.player1Select = document.createElement("select");
    this.player2Select = document.createElement("select");

    this.characterList.then((characters) => {
      characters.forEach((char) => {
        const opt1 = document.createElement("option");
        opt1.value = char;
        opt1.textContent = char;
        this.player1Select.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = char;
        opt2.textContent = char;
        this.player2Select.appendChild(opt2);
      });
      this.player1Select.value = this._song.player1;
      this.player2Select.value = this._song.player2;
    });

    this.player1Select.onchange = () => {
      this._song.player1 = this.player1Select.value;
    };
    this.player2Select.onchange = () => {
      this._song.player2 = this.player2Select.value;
    };

    container.appendChild(this.player1Select);
    container.appendChild(this.player2Select);

    this.tabContent.appendChild(container);
    this.tabs.song = container;
  }

  buildSectionTab() {
    const container = document.createElement("div");

    this.stepperLength = document.createElement("input");
    this.stepperLength.type = "number";
    this.stepperLength.value = this._song.notes[this.curSection].lengthInSteps;
    this.stepperLength.onchange = () => {
      this._song.notes[this.curSection].lengthInSteps = parseInt(this.stepperLength.value, 10);
      this.updateGrid();
    };
    container.appendChild(this.stepperLength);

    this.stepperSectionBPM = document.createElement("input");
    this.stepperSectionBPM.type = "number";
    this.stepperSectionBPM.value = Conductor.bpm;
    this.stepperSectionBPM.onchange = () => {
      this._song.notes[this.curSection].bpm = parseInt(this.stepperSectionBPM.value, 10);
      this.updateGrid();
    };
    container.appendChild(this.stepperSectionBPM);

    this.stepperCopy = document.createElement("input");
    this.stepperCopy.type = "number";
    this.stepperCopy.value = 1;
    container.appendChild(this.stepperCopy);

    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy last section";
    copyButton.onclick = () => this.copySection(parseInt(this.stepperCopy.value, 10));
    container.appendChild(copyButton);

    const clearSectionButton = document.createElement("button");
    clearSectionButton.textContent = "Clear";
    clearSectionButton.onclick = () => this.clearSection();
    container.appendChild(clearSectionButton);

    const swapSection = document.createElement("button");
    swapSection.textContent = "Swap section";
    swapSection.onclick = () => {
      const notes = this._song.notes[this.curSection].sectionNotes;
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        note[1] = (note[1] + 4) % 8;
        notes[i] = note;
      }
      this.updateGrid();
    };
    container.appendChild(swapSection);

    this.checkMustHitSection = document.createElement("label");
    this.checkMustHitSectionInput = document.createElement("input");
    this.checkMustHitSectionInput.type = "checkbox";
    this.checkMustHitSectionInput.checked = true;
    this.checkMustHitSectionInput.onchange = () => {
      this._song.notes[this.curSection].mustHitSection = this.checkMustHitSectionInput.checked;
      this.updateHeads();
    };
    this.checkMustHitSection.appendChild(this.checkMustHitSectionInput);
    this.checkMustHitSection.append("Must hit section");
    container.appendChild(this.checkMustHitSection);

    this.checkAltAnim = document.createElement("label");
    this.checkAltAnimInput = document.createElement("input");
    this.checkAltAnimInput.type = "checkbox";
    this.checkAltAnimInput.onchange = () => {
      this._song.notes[this.curSection].altAnim = this.checkAltAnimInput.checked;
    };
    this.checkAltAnim.appendChild(this.checkAltAnimInput);
    this.checkAltAnim.append("Alt Animation");
    container.appendChild(this.checkAltAnim);

    this.checkChangeBPM = document.createElement("label");
    this.checkChangeBPMInput = document.createElement("input");
    this.checkChangeBPMInput.type = "checkbox";
    this.checkChangeBPMInput.onchange = () => {
      this._song.notes[this.curSection].changeBPM = this.checkChangeBPMInput.checked;
    };
    this.checkChangeBPM.appendChild(this.checkChangeBPMInput);
    this.checkChangeBPM.append("Change BPM");
    container.appendChild(this.checkChangeBPM);

    this.tabContent.appendChild(container);
    this.tabs.section = container;
  }

  buildNoteTab() {
    const container = document.createElement("div");

    this.stepperSusLength = document.createElement("input");
    this.stepperSusLength.type = "number";
    this.stepperSusLength.value = 0;
    this.stepperSusLength.onchange = () => {
      if (this.curSelectedNote != null) {
        this.curSelectedNote[2] = parseFloat(this.stepperSusLength.value);
        this.updateGrid();
      }
    };
    container.appendChild(this.stepperSusLength);

    this.tabContent.appendChild(container);
    this.tabs.note = container;
  }

  async loadSong(daSong) {
    if (this.app.sound.music) {
      this.app.sound.music.stop();
    }

    await this.app.sound.playMusic("assets/music/" + daSong + "_Inst" + TitleState.soundExt, 0.6);

    this.vocals = await this.app.sound.loadEmbedded("assets/music/" + daSong + "_Voices" + TitleState.soundExt);

    this.app.sound.music.pause();
    this.vocals.pause();

    this.app.sound.music.onComplete = () => {
      this.vocals.pause();
      this.vocals.time = 0;
      this.app.sound.music.pause();
      this.app.sound.music.time = 0;
      this.changeSection();
    };
  }

  sectionStartTime() {
    let daBPM = this._song.bpm;
    let daPos = 0;
    for (let i = 0; i < this.curSection; i++) {
      if (this._song.notes[i].changeBPM) {
        daBPM = this._song.notes[i].bpm;
      }
      daPos += 4 * (1000 * 60 / daBPM);
    }
    return daPos;
  }

  update(elapsed) {
    this.curStep = this.recalculateSteps();

    Conductor.songPosition = this.app.sound.music.time;
    this._song.song = this.songTitleInput.value;

    this.strumLine.y = this.getYfromStrum(
      (Conductor.songPosition - this.sectionStartTime()) % (Conductor.stepCrochet * this._song.notes[this.curSection].lengthInSteps)
    );

    if (this.curBeat % 4 === 0 && this.curStep >= 16 * (this.curSection + 1)) {
      if (this._song.notes[this.curSection + 1] == null) {
        this.addSection();
      }
      this.changeSection(this.curSection + 1, false);
    }

    if (this.dummyArrow) {
      const mouse = this.app.input.mouse;
      if (
        mouse.x > this.gridBG.x &&
        mouse.x < this.gridBG.x + this.gridBG.width &&
        mouse.y > this.gridBG.y &&
        mouse.y < this.gridBG.y + GRID_SIZE * this._song.notes[this.curSection].lengthInSteps
      ) {
        this.dummyArrow.x = Math.floor(mouse.x / GRID_SIZE) * GRID_SIZE;
        this.dummyArrow.y = this.app.input.pressed("ShiftLeft")
          ? mouse.y
          : Math.floor(mouse.y / GRID_SIZE) * GRID_SIZE;
      }
    }

    if (this.app.input.justPressed("Enter")) {
      ChartingState.lastSection = this.curSection;
      PlayState.SONG = this._song;
      this.app.sound.music.stop();
      this.vocals.stop();
      this.app.switchState(new PlayState(this.app));
    }

    if (this.app.input.justPressed("KeyE")) {
      this.changeNoteSustain(Conductor.stepCrochet);
    }
    if (this.app.input.justPressed("KeyQ")) {
      this.changeNoteSustain(-Conductor.stepCrochet);
    }

    if (document.activeElement !== this.songTitleInput) {
      if (this.app.input.justPressed("Space")) {
        if (this.app.sound.music.playing) {
          this.app.sound.music.pause();
          this.vocals.pause();
        } else {
          this.vocals.play();
          this.app.sound.music.play();
        }
      }

      if (this.app.input.justPressed("KeyR")) {
        this.resetSection(this.app.input.pressed("ShiftLeft"));
      }

      const wheel = this.app.input.wheelDelta;
      if (wheel !== 0) {
        this.app.sound.music.pause();
        this.vocals.pause();
        this.app.sound.music.time -= wheel * Conductor.stepCrochet * 0.4;
        this.vocals.time = this.app.sound.music.time;
      }

      if (!this.app.input.pressed("ShiftLeft")) {
        if (this.app.input.pressed("KeyW") || this.app.input.pressed("KeyS")) {
          this.app.sound.music.pause();
          this.vocals.pause();

          const daTime = 700 * (elapsed / 1000);
          this.app.sound.music.time += this.app.input.pressed("KeyW") ? -daTime : daTime;
          this.vocals.time = this.app.sound.music.time;
        }
      } else {
        if (this.app.input.justPressed("KeyW") || this.app.input.justPressed("KeyS")) {
          this.app.sound.music.pause();
          this.vocals.pause();

          const daTime = Conductor.stepCrochet * 2;
          this.app.sound.music.time += this.app.input.justPressed("KeyW") ? -daTime : daTime;
          this.vocals.time = this.app.sound.music.time;
        }
      }
    }

    this._song.bpm = this.tempBpm;

    const shiftThing = this.app.input.pressed("ShiftLeft") ? 4 : 1;
    if (this.app.input.justPressed("ArrowRight") || this.app.input.justPressed("KeyD")) {
      this.changeSection(this.curSection + shiftThing);
    }
    if (this.app.input.justPressed("ArrowLeft") || this.app.input.justPressed("KeyA")) {
      this.changeSection(this.curSection - shiftThing);
    }

    const pos = Math.round((Conductor.songPosition / 1000) * 100) / 100;
    const len = Math.round((this.app.sound.music.length / 1000) * 100) / 100;
    this.bpmTxt.text = pos + " / " + len + "\nSection: " + this.curSection;

    super.update(elapsed);
  }

  setupMouseHandlers() {
    this.app.stage.on("pointerdown", () => {
      const mouse = this.app.input.mouse;
      let hitNote = false;

      for (const note of this.curRenderedNotes.children) {
        if (note.getBounds().containsPoint(mouse.x, mouse.y)) {
          hitNote = true;
          if (this.app.input.pressed("ControlLeft")) {
            this.selectNote(note);
          } else {
            this.deleteNote(note);
          }
        }
      }

      if (!hitNote) {
        if (
          mouse.x > this.gridBG.x &&
          mouse.x < this.gridBG.x + this.gridBG.width &&
          mouse.y > this.gridBG.y &&
          mouse.y < this.gridBG.y + GRID_SIZE * this._song.notes[this.curSection].lengthInSteps
        ) {
          this.addNote();
        }
      }
    });
  }

  setupKeyboardHandlers() {}

  changeNoteSustain(value) {
    if (this.curSelectedNote != null && this.curSelectedNote[2] != null) {
      this.curSelectedNote[2] += value;
      this.curSelectedNote[2] = Math.max(this.curSelectedNote[2], 0);
    }

    this.updateNoteUI();
    this.updateGrid();
  }

  recalculateSteps() {
    let lastChange = { stepTime: 0, songTime: 0, bpm: 0 };
    for (const change of Conductor.bpmChangeMap) {
      if (this.app.sound.music.time > change.songTime) {
        lastChange = change;
      }
    }

    const curStep = lastChange.stepTime + Math.floor((this.app.sound.music.time - lastChange.songTime) / Conductor.stepCrochet);
    this.updateBeat();
    return curStep;
  }

  resetSection(songBeginning = false) {
    this.updateGrid();

    this.app.sound.music.pause();
    this.vocals.pause();
    this.app.sound.music.time = this.sectionStartTime();

    if (songBeginning) {
      this.app.sound.music.time = 0;
      this.curSection = 0;
    }

    this.vocals.time = this.app.sound.music.time;
    this.updateCurStep();
    this.updateGrid();
    this.updateSectionUI();
  }

  changeSection(sec = 0, updateMusic = true) {
    if (this._song.notes[sec] != null) {
      this.curSection = sec;
      this.updateGrid();

      if (updateMusic) {
        this.app.sound.music.pause();
        this.vocals.pause();
        this.app.sound.music.time = this.sectionStartTime();
        this.vocals.time = this.app.sound.music.time;
        this.updateCurStep();
      }

      this.updateGrid();
      this.updateSectionUI();
    }
  }

  copySection(sectionNum = 1) {
    const daSec = Math.max(this.curSection, sectionNum);

    for (const note of this._song.notes[daSec - sectionNum].sectionNotes) {
      const strum = note[0] + Conductor.stepCrochet * (this._song.notes[daSec].lengthInSteps * sectionNum);
      const copiedNote = [strum, note[1], note[2]];
      this._song.notes[daSec].sectionNotes.push(copiedNote);
    }

    this.updateGrid();
  }

  updateSectionUI() {
    const sec = this._song.notes[this.curSection];

    this.stepperLength.value = sec.lengthInSteps;
    this.checkMustHitSectionInput.checked = sec.mustHitSection;
    this.checkAltAnimInput.checked = sec.altAnim;
    this.checkChangeBPMInput.checked = sec.changeBPM;
    this.stepperSectionBPM.value = sec.bpm;

    this.updateHeads();
  }

  updateHeads() {
    if (this.checkMustHitSectionInput.checked) {
      this.leftIcon.playAnimation("bf");
      this.rightIcon.playAnimation("dad");
    } else {
      this.leftIcon.playAnimation("dad");
      this.rightIcon.playAnimation("bf");
    }
  }

  updateNoteUI() {
    if (this.curSelectedNote != null) {
      this.stepperSusLength.value = this.curSelectedNote[2];
    }
  }

  updateGrid() {
    while (this.curRenderedNotes.children.length > 0) {
      const child = this.curRenderedNotes.children[0];
      this.curRenderedNotes.removeChild(child);
      child.destroy();
    }

    while (this.curRenderedSustains.children.length > 0) {
      const child = this.curRenderedSustains.children[0];
      this.curRenderedSustains.removeChild(child);
      child.destroy();
    }

    const sectionInfo = this._song.notes[this.curSection].sectionNotes;

    if (this._song.notes[this.curSection].changeBPM && this._song.notes[this.curSection].bpm > 0) {
      Conductor.changeBPM(this._song.notes[this.curSection].bpm);
    } else {
      let daBPM = this._song.bpm;
      for (let i = 0; i < this.curSection; i++) {
        if (this._song.notes[i].changeBPM) {
          daBPM = this._song.notes[i].bpm;
        }
      }
      Conductor.changeBPM(daBPM);
    }

    for (const i of sectionInfo) {
      const daNoteInfo = i[1];
      const daStrumTime = i[0];
      const daSus = i[2];

      const note = new Note(daStrumTime, daNoteInfo % 4);
      note.sustainLength = daSus;
      note.setGraphicSize(GRID_SIZE, GRID_SIZE);
      note.updateHitbox();
      note.x = Math.floor(daNoteInfo * GRID_SIZE);
      note.y = Math.floor(
        this.getYfromStrum((daStrumTime - this.sectionStartTime()) % (Conductor.stepCrochet * this._song.notes[this.curSection].lengthInSteps))
      );

      this.curRenderedNotes.addChild(note);

      if (daSus > 0) {
        const sustainVis = new PIXI.Graphics();
        const sustainHeight = remapToRange(daSus, 0, Conductor.stepCrochet * 16, 0, this.gridBG.height);
        sustainVis.rect(0, 0, 8, Math.floor(sustainHeight));
        sustainVis.fill(0xffffff);
        sustainVis.x = note.x + GRID_SIZE / 2;
        sustainVis.y = note.y + GRID_SIZE;
        this.curRenderedSustains.addChild(sustainVis);
      }
    }
  }

  addSection(lengthInSteps = 16) {
    const sec = {
      lengthInSteps,
      bpm: this._song.bpm,
      changeBPM: false,
      mustHitSection: true,
      sectionNotes: [],
      typeOfSection: 0,
      altAnim: false
    };

    this._song.notes.push(sec);
  }

  selectNote(note) {
    let swagNum = 0;

    for (const i of this._song.notes[this.curSection].sectionNotes) {
      if (i[0] === note.strumTime && i[1] % 4 === note.noteData) {
        this.curSelectedNote = this._song.notes[this.curSection].sectionNotes[swagNum];
      }
      swagNum += 1;
    }

    this.updateGrid();
    this.updateNoteUI();
  }

  deleteNote(note) {
    const notes = this._song.notes[this.curSection].sectionNotes;
    for (let i = notes.length - 1; i >= 0; i--) {
      if (notes[i][0] === note.strumTime && notes[i][1] % 4 === note.noteData) {
        notes.splice(i, 1);
      }
    }

    this.updateGrid();
  }

  clearSection() {
    this._song.notes[this.curSection].sectionNotes = [];
    this.updateGrid();
  }

  clearSong() {
    for (let daSection = 0; daSection < this._song.notes.length; daSection++) {
      this._song.notes[daSection].sectionNotes = [];
    }
    this.updateGrid();
  }

  addNote() {
    const mouse = this.app.input.mouse;
    const noteStrum = this.getStrumTime(this.dummyArrow.y) + this.sectionStartTime();
    const noteData = Math.floor(mouse.x / GRID_SIZE);
    const noteSus = 0;

    this._song.notes[this.curSection].sectionNotes.push([noteStrum, noteData, noteSus]);

    const notes = this._song.notes[this.curSection].sectionNotes;
    this.curSelectedNote = notes[notes.length - 1];

    if (this.app.input.pressed("ControlLeft")) {
      this._song.notes[this.curSection].sectionNotes.push([noteStrum, (noteData + 4) % 8, noteSus]);
    }

    this.updateGrid();
    this.updateNoteUI();
    this.autosaveSong();
  }

  getStrumTime(yPos) {
    return remapToRange(yPos, this.gridBG.y, this.gridBG.y + this.gridBG.height, 0, 16 * Conductor.stepCrochet);
  }

  getYfromStrum(strumTime) {
    return remapToRange(strumTime, 0, 16 * Conductor.stepCrochet, this.gridBG.y, this.gridBG.y + this.gridBG.height);
  }

  getNotes() {
    return this._song.notes.map((section) => section.sectionNotes);
  }

  loadJson(song) {
    PlayState.SONG = Song.loadFromJson(song.toLowerCase(), song.toLowerCase());
    this.app.resetState();
  }

  loadAutosave() {
    const saved = localStorage.getItem("autosave");
    if (saved) {
      PlayState.SONG = Song.parseJSONshit(JSON.parse(saved));
      this.app.resetState();
    }
  }

  autosaveSong() {
    localStorage.setItem("autosave", JSON.stringify({ song: this._song }));
  }

  saveLevel() {
    const json = { song: this._song };
    const data = JSON.stringify(json);

    if (data && data.length > 0) {
      const blob = new Blob([data.trim()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this._song.song.toLowerCase() + ".json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}

function remapToRange(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
