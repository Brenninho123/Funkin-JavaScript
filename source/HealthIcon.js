import * as PIXI from "pixi.js";

const GRID_COLS = 15;
const FRAME_SIZE = 150;

let iconBaseTexture = null;

async function loadIconGrid() {
  if (iconBaseTexture) {
    return iconBaseTexture;
  }
  iconBaseTexture = await PIXI.Assets.load("assets/images/iconGrid.png");
  return iconBaseTexture;
}

function frameTexture(baseTexture, index) {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  const rect = new PIXI.Rectangle(col * FRAME_SIZE, row * FRAME_SIZE, FRAME_SIZE, FRAME_SIZE);
  return new PIXI.Texture({ source: baseTexture.source, frame: rect });
}

export class HealthIcon extends PIXI.Container {
  constructor(char = "bf", isPlayer = false) {
    super();
    this.char = char;
    this.isPlayer = isPlayer;
    this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.addChild(this.sprite);
    this.antialias = true;
    this.animations = new Map();
    this.currentFrame = 0;
    this.currentAnimName = null;
  }

  async init() {
    const baseTexture = await loadIconGrid();

    const define = (name, indices) => {
      this.animations.set(name, indices.map((i) => frameTexture(baseTexture, i)));
    };

    define("bf", [0, 1]);
    define("bf-car", [0, 1]);
    define("bf-christmas", [0, 1]);
    define("bf-pixel", [21, 21]);
    define("spooky", [2, 3]);
    define("pico", [4, 5]);
    define("mom", [6, 7]);
    define("mom-car", [6, 7]);
    define("tankman", [8, 9]);
    define("face", [10, 11]);
    define("dad", [12, 13]);
    define("senpai", [22, 22]);
    define("senpai-angry", [22, 22]);
    define("spirit", [23, 23]);
    define("bf-old", [14, 15]);
    define("gf", [16]);
    define("parents-christmas", [17]);
    define("monster", [19, 20]);
    define("monster-christmas", [19, 20]);

    this.playAnimation(this.char);
    this.scrollFactorX = 0;
    this.scrollFactorY = 0;
  }

  playAnimation(name) {
    const frames = this.animations.get(name);
    if (!frames) {
      return;
    }
    this.currentAnimName = name;
    this.currentFrame = 0;
    this.sprite.texture = frames[0];
  }

  setFrame(index) {
    const frames = this.animations.get(this.currentAnimName);
    if (!frames || !frames[index]) {
      return;
    }
    this.currentFrame = index;
    this.sprite.texture = frames[index];
  }

  updateHealthSize(percent) {
    const size = Math.floor(lerp(150, this.width, 0.5));
    this.setGraphicSize(size);
    this.updateHitbox();

    if (percent < 20) {
      this.setFrame(1);
    } else if (this.currentAnimName && this.currentAnimName !== "face") {
      this.setFrame(0);
    }
  }

  setGraphicSize(width) {
    const scale = width / FRAME_SIZE;
    this.sprite.scale.set(scale);
  }

  updateHitbox() {
    this.width = this.sprite.width;
    this.height = this.sprite.height;
  }
}

function lerp(a, b, ratio) {
  return a + (b - a) * ratio;
}
