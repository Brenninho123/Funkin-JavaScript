import * as PIXI from "pixi.js";

function parseSparrowXML(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const subTextures = xml.getElementsByTagName("SubTexture");

  const frames = [];
  for (let i = 0; i < subTextures.length; i++) {
    const node = subTextures[i];
    frames.push({
      name: node.getAttribute("name"),
      x: parseInt(node.getAttribute("x"), 10),
      y: parseInt(node.getAttribute("y"), 10),
      width: parseInt(node.getAttribute("width"), 10),
      height: parseInt(node.getAttribute("height"), 10)
    });
  }
  return frames;
}

const atlasCache = new Map();

async function loadSparrowAtlas(imagePath, xmlPath) {
  const cacheKey = imagePath + "|" + xmlPath;
  if (atlasCache.has(cacheKey)) {
    return atlasCache.get(cacheKey);
  }

  const [baseTexture, xmlText] = await Promise.all([
    PIXI.Assets.load(imagePath),
    fetch(xmlPath).then((r) => r.text())
  ]);

  const frameDefs = parseSparrowXML(xmlText);
  const textures = new Map();

  for (const def of frameDefs) {
    const rect = new PIXI.Rectangle(def.x, def.y, def.width, def.height);
    const texture = new PIXI.Texture({ source: baseTexture.source, frame: rect });
    if (!textures.has(def.name)) {
      textures.set(def.name, []);
    }
    textures.get(def.name).push(texture);
  }

  const atlas = { baseTexture, frameDefs, textures };
  atlasCache.set(cacheKey, atlas);
  return atlas;
}

async function loadSpriteSheetPackerAtlas(imagePath, txtPath) {
  const cacheKey = imagePath + "|" + txtPath;
  if (atlasCache.has(cacheKey)) {
    return atlasCache.get(cacheKey);
  }

  const [baseTexture, txtText] = await Promise.all([
    PIXI.Assets.load(imagePath),
    fetch(txtPath).then((r) => r.text())
  ]);

  const lines = txtText.trim().split("\n");
  const textures = new Map();
  const frameDefs = [];

  for (const line of lines) {
    const parts = line.split("=");
    if (parts.length < 2) continue;
    const name = parts[0].trim();
    const coords = parts[1].trim().split(" ").map(Number);
    const [x, y, w, h] = coords;

    const rect = new PIXI.Rectangle(x, y, w, h);
    const texture = new PIXI.Texture({ source: baseTexture.source, frame: rect });

    if (!textures.has(name)) {
      textures.set(name, []);
    }
    textures.get(name).push(texture);
    frameDefs.push({ name, x, y, width: w, height: h });
  }

  const atlas = { baseTexture, frameDefs, textures };
  atlasCache.set(cacheKey, atlas);
  return atlas;
}

export class SparrowSprite extends PIXI.Container {
  constructor(x = 0, y = 0) {
    super();
    this.x = x;
    this.y = y;

    this.atlas = null;
    this.animations = new Map();

    this.currentAnimName = null;
    this.currentAnimFrame = 0;
    this.animationFinished = false;

    this._animPlaying = false;
    this._animLoop = false;
    this._animTimer = 0;
    this._animFps = 24;
    this._animReversed = false;

    this.sprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
    this.addChild(this.sprite);

    this.offsetX = 0;
    this.offsetY = 0;
    this.scrollFactorX = 1;
    this.scrollFactorY = 1;
    this.antialias = true;
    this.debugMode = false;
    this.flipX = false;

    this.width = 0;
    this.height = 0;
  }

  async loadAtlas(imagePath, xmlPath) {
    this.atlas = await loadSparrowAtlas(imagePath, xmlPath);
    this._applyFirstFrame();
  }

  async loadSpriteSheetPacker(imagePath, txtPath) {
    this.atlas = await loadSpriteSheetPackerAtlas(imagePath, txtPath);
    this._applyFirstFrame();
  }

  copyAtlasFrom(otherSprite) {
    this.atlas = otherSprite.atlas;
    this._applyFirstFrame();
  }

  _applyFirstFrame() {
    if (this.atlas && this.atlas.frameDefs.length > 0) {
      const firstName = this.atlas.frameDefs[0].name;
      const tex = this.atlas.textures.get(firstName)[0];
      this.sprite.texture = tex;
      this.updateHitbox();
    }
  }

  _framesByPrefix(prefix) {
    if (!this.atlas) return [];

    const matched = this.atlas.frameDefs
      .filter((f) => f.name.startsWith(prefix))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const seen = new Set();
    const result = [];
    for (const def of matched) {
      if (seen.has(def.name)) continue;
      seen.add(def.name);
      const texArr = this.atlas.textures.get(def.name);
      result.push(texArr[0]);
    }
    return result;
  }

  addAnimation(name, prefix, fps = 24, loop = false) {
    const frames = this._framesByPrefix(prefix);
    this.animations.set(name, { frames, fps, loop });
  }

  addAnimationByPrefix(name, prefix, fps = 24, loop = false) {
    this.addAnimation(name, prefix, fps, loop);
  }

  addAnimationByIndices(name, prefix, indices, fps = 24, loop = false) {
    const allFrames = this._framesByPrefix(prefix);
    const frames = indices.map((i) => allFrames[i]).filter(Boolean);
    this.animations.set(name, { frames, fps, loop });
  }

  addAnimationRaw(name, indices, fps = 24, loop = false) {
    if (!this.atlas) return;
    const allDefs = this.atlas.frameDefs;
    const frames = indices
      .map((i) => {
        const def = allDefs[i];
        return def ? this.atlas.textures.get(def.name)[0] : null;
      })
      .filter(Boolean);
    this.animations.set(name, { frames, fps, loop });
  }

  appendAnimation(name, prefix) {
    const existing = this.animations.get(name);
    if (!existing) return;
    existing.frames = existing.frames.concat(this._framesByPrefix(prefix));
  }

  getAnimation(name) {
    return this.animations.get(name);
  }

  playAnimation(name, force = false, reversed = false, startFrame = 0) {
    if (!force && this.currentAnimName === name && this._animPlaying) {
      return;
    }

    const anim = this.animations.get(name);
    if (!anim || anim.frames.length === 0) {
      return;
    }

    this.currentAnimName = name;
    this.currentAnimFrame = startFrame;
    this._animReversed = reversed;
    this._animFps = anim.fps;
    this._animLoop = anim.loop;
    this._animTimer = 0;
    this._animPlaying = true;
    this.animationFinished = false;

    this._applyCurrentFrame(anim);
  }

  setAnimationFrame(index) {
    const anim = this.animations.get(this.currentAnimName);
    if (!anim) return;
    this.currentAnimFrame = index;
    this._applyCurrentFrame(anim);
  }

  _applyCurrentFrame(anim) {
    const idx = this._animReversed
      ? anim.frames.length - 1 - this.currentAnimFrame
      : this.currentAnimFrame;

    const tex = anim.frames[idx];
    if (tex) {
      this.sprite.texture = tex;
    }
    this.updateHitbox();
  }

  update(elapsed) {
    if (!this._animPlaying || !this.currentAnimName) {
      return;
    }

    const anim = this.animations.get(this.currentAnimName);
    if (!anim || anim.frames.length === 0) {
      return;
    }

    this._animTimer += elapsed;
    const frameDuration = 1000 / this._animFps;

    while (this._animTimer >= frameDuration) {
      this._animTimer -= frameDuration;
      this.currentAnimFrame += 1;

      if (this.currentAnimFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentAnimFrame = 0;
        } else {
          this.currentAnimFrame = anim.frames.length - 1;
          this._animPlaying = false;
          this.animationFinished = true;
          break;
        }
      }
    }

    this._applyCurrentFrame(anim);
  }

  setGraphicSize(width, height) {
    const baseWidth = this.sprite.texture.width;
    const baseHeight = this.sprite.texture.height;

    if (width && !height) {
      this.sprite.scale.set(width / baseWidth);
    } else if (width && height) {
      this.sprite.scale.set(width / baseWidth, height / baseHeight);
    }

    this.updateHitbox();
  }

  updateHitbox() {
    this.width = this.sprite.width;
    this.height = this.sprite.height;
  }

  get antialiasing() {
    return this.antialias;
  }

  set antialiasing(value) {
    this.antialias = value;
  }
}
