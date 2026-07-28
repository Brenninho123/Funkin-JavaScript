import * as PIXI from "pixi.js";

const alphabetChars = "abcdefghijklmnopqrstuvwxyz";
const numberChars = "1234567890";
const symbolChars = "|~#$%()*+-:;<=>@[]^_.,'!?";

let atlasFramesCache = null;

async function loadAlphaAtlas() {
  if (atlasFramesCache) {
    return atlasFramesCache;
  }
  atlasFramesCache = await PIXI.Assets.load("assets/images/alphabet.png");
  return atlasFramesCache;
}

export class AlphaCharacter extends PIXI.AnimatedSprite {
  constructor(x, y) {
    super([PIXI.Texture.EMPTY]);
    this.x = x;
    this.y = y;
    this.row = 0;
    this.antialias = true;
  }

  async init() {
    this.texture = await loadAlphaAtlas();
  }

  createBold(letter) {
    this.playTag(letter.toUpperCase() + " bold");
    this.updateHitbox();
  }

  createLetter(letter) {
    const letterCase = letter.toLowerCase() !== letter ? "capital" : "lowercase";
    this.playTag(letter + " " + letterCase);
    this.updateHitbox();

    this.y = 110 - this.height;
    this.y += this.row * 60;
  }

  createNumber(letter) {
    this.playTag(letter);
    this.updateHitbox();
  }

  createSymbol(letter) {
    switch (letter) {
      case ".":
        this.playTag("period");
        this.y += 50;
        break;
      case "'":
        this.playTag("apostraphie");
        break;
      case "?":
        this.playTag("question mark");
        break;
      case "!":
        this.playTag("exclamation point");
        break;
    }
    this.updateHitbox();
  }

  playTag(tag) {
    this.currentTag = tag;
  }

  updateHitbox() {
    this.pivot.set(0, 0);
  }
}

export class Alphabet extends PIXI.Container {
  constructor(x, y, text = "", bold = false, typed = false) {
    super();
    this.x = x;
    this.y = y;

    this.delay = 0.05;
    this.paused = false;
    this.targetY = 0;
    this.isMenuItem = false;
    this.text = text;

    this._finalText = text;
    this._curText = "";
    this.widthOfWords = window.innerWidth;
    this.yMulti = 1;

    this.lastSprite = null;
    this.xPosResetted = false;
    this.lastWasSpace = false;
    this.splitWords = [];
    this.isBold = bold;
    this.personTalking = "gf";

    if (text !== "") {
      if (typed) {
        this.startTypedText();
      } else {
        this.addText();
      }
    }
  }

  async addText() {
    this.doSplitWords();

    let xPos = 0;
    for (const character of this.splitWords) {
      if (character === " " || character === "-") {
        this.lastWasSpace = true;
      }

      if (alphabetChars.indexOf(character.toLowerCase()) !== -1) {
        if (this.lastSprite != null) {
          xPos = this.lastSprite.x + this.lastSprite.width;
        }

        if (this.lastWasSpace) {
          xPos += 40;
          this.lastWasSpace = false;
        }

        const letter = new AlphaCharacter(xPos, 0);
        await letter.init();

        if (this.isBold) {
          letter.createBold(character);
        } else {
          letter.createLetter(character);
        }

        this.addChild(letter);
        this.lastSprite = letter;
      }
    }
  }

  doSplitWords() {
    this.splitWords = this._finalText.split("");
  }

  async startTypedText() {
    this._finalText = this.text;
    this.doSplitWords();

    let loopNum = 0;
    let xPos = 0;
    let curRow = 0;

    const step = async () => {
      if (loopNum >= this.splitWords.length) {
        return;
      }

      if (this._finalText.charCodeAt(loopNum) === "\n".charCodeAt(0)) {
        this.yMulti += 1;
        this.xPosResetted = true;
        xPos = 0;
        curRow += 1;
      }

      const currentChar = this.splitWords[loopNum];

      if (currentChar === " ") {
        this.lastWasSpace = true;
      }

      const isNumber = numberChars.indexOf(currentChar) !== -1;
      const isSymbol = symbolChars.indexOf(currentChar) !== -1;

      if (alphabetChars.indexOf(currentChar.toLowerCase()) !== -1 || isNumber || isSymbol) {
        if (this.lastSprite != null && !this.xPosResetted) {
          this.lastSprite.updateHitbox();
          xPos += this.lastSprite.width + 3;
        } else {
          this.xPosResetted = false;
        }

        if (this.lastWasSpace) {
          xPos += 20;
          this.lastWasSpace = false;
        }

        const letter = new AlphaCharacter(xPos, 55 * this.yMulti);
        await letter.init();
        letter.row = curRow;

        if (this.isBold) {
          letter.createBold(currentChar);
        } else {
          if (isNumber) {
            letter.createNumber(currentChar);
          } else if (isSymbol) {
            letter.createSymbol(currentChar);
          } else {
            letter.createLetter(currentChar);
          }
          letter.x += 90;
        }

        if (Math.random() < 0.4) {
          const soundNum = Math.floor(Math.random() * 4) + 1;
          this.app?.sound?.play("assets/sounds/GF_" + soundNum + ".mp3", 0.4);
        }

        this.addChild(letter);
        this.lastSprite = letter;
      }

      loopNum += 1;

      const nextDelay = 40 + Math.random() * 50;
      setTimeout(step, nextDelay);
    };

    setTimeout(step, 50);
  }

  update(elapsed) {
    if (this.isMenuItem) {
      const scaledY = remapToRange(this.targetY, 0, 1, 0, 1.3);
      this.y = lerp(this.y, scaledY * 120 + window.innerHeight * 0.48, 0.16);
      this.x = lerp(this.x, this.targetY * 20 + 90, 0.16);
    }
  }
}

function lerp(a, b, ratio) {
  return a + (b - a) * ratio;
}

function remapToRange(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
