class Snd {
  constructor(url, loop = false) {
    this.url = url;
    this.audio = new Audio(url);
    this.audio.loop = loop;
    this.audio.preload = "auto";
    this._volume = 1;
    this.audio.volume = 1;
    this.onComplete = null;
    this._fadeRaf = null;

    this.audio.addEventListener("ended", () => {
      if (this.onComplete) {
        this.onComplete();
      }
    });
  }

  play(offsetMs = 0) {
    this.audio.currentTime = offsetMs / 1000;
    this.audio.play().catch(() => {});
  }

  stop() {
    this.cancelFade();
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  pause() {
    this.audio.pause();
  }

  get playing() {
    return !this.audio.paused && !this.audio.ended;
  }

  get time() {
    return this.audio.currentTime * 1000;
  }

  set time(ms) {
    this.audio.currentTime = ms / 1000;
  }

  get length() {
    return (this.audio.duration || 0) * 1000;
  }

  get volume() {
    return this._volume;
  }

  set volume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    this.audio.volume = this._volume;
  }

  cancelFade() {
    if (this._fadeRaf) {
      cancelAnimationFrame(this._fadeRaf);
      this._fadeRaf = null;
    }
  }

  fadeIn(durationSec, fromVol = 0, toVol = 1) {
    this.cancelFade();
    this.volume = fromVol;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / (durationSec * 1000), 1);
      this.volume = fromVol + (toVol - fromVol) * t;
      if (t < 1) {
        this._fadeRaf = requestAnimationFrame(step);
      } else {
        this._fadeRaf = null;
      }
    };
    this._fadeRaf = requestAnimationFrame(step);
  }

  fadeOut(durationSec, toVol = 0, onComplete) {
    this.cancelFade();
    const fromVol = this.volume;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / (durationSec * 1000), 1);
      this.volume = fromVol + (toVol - fromVol) * t;
      if (t < 1) {
        this._fadeRaf = requestAnimationFrame(step);
      } else {
        this._fadeRaf = null;
        if (onComplete) onComplete();
      }
    };
    this._fadeRaf = requestAnimationFrame(step);
  }

  destroy() {
    this.cancelFade();
    this.audio.pause();
    this.audio.src = "";
  }
}

export class SoundSystem {
  constructor() {
    this.music = null;
    this._sfxCache = new Map();
  }

  async playMusic(path, volume = 1) {
    if (this.music) {
      this.music.destroy();
    }
    this.music = new Snd(path, true);
    this.music.volume = volume;
    this.music.play();
    return this.music;
  }

  play(path, volume = 1) {
    let audio = this._sfxCache.get(path);
    if (!audio || !audio.paused) {
      audio = new Audio(path);
    }
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    audio.play().catch(() => {});
    this._sfxCache.set(path, audio);
  }

  async loadEmbedded(path, loop = false) {
    const snd = new Snd(path, loop);
    await new Promise((resolve) => {
      snd.audio.addEventListener("canplaythrough", resolve, { once: true });
      snd.audio.load();
    });
    return snd;
  }

  createEmpty() {
    const empty = new Snd("");
    empty.play = () => {};
    empty.stop = () => {};
    empty.pause = () => {};
    return empty;
  }
}
