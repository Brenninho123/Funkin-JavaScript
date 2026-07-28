export const TVVar = {
  Volume: "volume",
  Pan: "pan"
};

export const TType = {
  Linear: "linear",
  Ease: "ease",
  Rand: "rand"
};

function interp(type, n) {
  switch (type) {
    case TType.Linear:
      return n;
    case TType.Ease:
      return n * n * (3 - 2 * n);
    case TType.Rand:
      return n;
    default:
      return n;
  }
}

let GUID = 0;

export class TweenV {
  constructor(parent, n, ln, varType, speed, from, to, type, plays, onUpdate, onEnd) {
    this.uid = 0;
    this.man = null;
    this.parent = parent;
    this.n = n;
    this.ln = ln;
    this.speed = speed;
    this.from = from;
    this.to = to;
    this.type = type;
    this.plays = plays;
    this.varType = varType;
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;
    this.isDebug = false;
  }

  reset(parent, n, ln, varType, speed, from, to, type, plays, onUpdate, onEnd) {
    this.parent = parent;
    this.n = n;
    this.ln = ln;
    this.speed = speed;
    this.from = from;
    this.to = to;
    this.type = type;
    this.plays = plays;
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;
    this.varType = varType;
    this.isDebug = false;
    this.uid = GUID++;
  }

  clear() {
    this.n = 0;
    this.ln = 0;
    this.speed = 0;
    this.plays = 0;
    this.from = 0;
    this.to = 0;
    this.parent = null;
    this.onEnd = null;
    this.onUpdate = null;
    this.isDebug = false;
    this.uid = GUID++;
  }

  apply(val) {
    switch (this.varType) {
      case TVVar.Volume:
        this.parent.volume = val;
        break;
      case TVVar.Pan:
        this.parent.pan = val;
        break;
    }
  }

  kill(withCbk = true) {
    if (withCbk) {
      this.man.terminateTween(this);
    } else {
      this.man.forceTerminateTween(this);
    }
  }
}

export class SndTV {
  static DEFAULT_DURATION = 1000;

  constructor() {
    this.fps = 60;
    this.isDebug = false;
    this.tlist = [];
    this.pool = [];
  }

  count() {
    return this.tlist.length;
  }

  create(parent, vartype, to, tp = TType.Ease, durationMs) {
    return this._createInternal(parent, vartype, to, tp, durationMs);
  }

  exists(p) {
    return this.tlist.some((t) => t.parent === p);
  }

  _createInternal(p, vartype, to, tp = TType.Ease, durationMs) {
    if (durationMs == null) {
      durationMs = SndTV.DEFAULT_DURATION;
    }

    for (let i = this.tlist.length - 1; i >= 0; i--) {
      const t = this.tlist[i];
      if (t.parent === p && t.varType === vartype) {
        this.forceTerminateTween(t);
      }
    }

    const from = vartype === TVVar.Volume ? p.volume : p.pan;

    let t;
    const speed = 1 / ((durationMs * this.fps) / 1000);

    if (this.pool.length === 0) {
      t = new TweenV(p, 0, 0, vartype, speed, from, to, tp, 1, null, null);
    } else {
      t = this.pool.pop();
      t.reset(p, 0, 0, vartype, speed, from, to, tp, 1, null, null);
    }

    if (t.from === t.to) {
      t.ln = 1;
    }

    t.man = this;
    this.tlist.push(t);

    return t;
  }

  static fastPow2(n) {
    return n * n;
  }

  static fastPow3(n) {
    return n * n * n;
  }

  static bezier(t, p0, p1, p2, p3) {
    return (
      SndTV.fastPow3(1 - t) * p0 +
      3 * (t * SndTV.fastPow2(1 - t) * p1 + SndTV.fastPow2(t) * (1 - t) * p2) +
      SndTV.fastPow3(t) * p3
    );
  }

  killWithoutCallbacks(parent) {
    for (let i = this.tlist.length - 1; i >= 0; i--) {
      if (this.tlist[i].parent === parent) {
        this.forceTerminateTween(this.tlist[i]);
        return true;
      }
    }
    return false;
  }

  terminate(parent) {
    for (let i = this.tlist.length - 1; i >= 0; i--) {
      if (this.tlist[i].parent === parent) {
        this.forceTerminateTween(this.tlist[i]);
      }
    }
  }

  forceTerminateTween(t) {
    const idx = this.tlist.indexOf(t);
    if (idx !== -1) {
      this.tlist.splice(idx, 1);
      t.clear();
      this.pool.push(t);
    }
  }

  terminateTween(t, flAllowLoop = false) {
    const v = t.from + (t.to - t.from) * interp(t.type, 1);
    t.apply(v);
    this._onUpdate(t, 1);

    const ouid = t.uid;

    this._onEnd(t);

    if (ouid === t.uid) {
      if (flAllowLoop && (t.plays === -1 || t.plays > 1)) {
        if (t.plays !== -1) {
          t.plays--;
        }
        t.n = t.ln = 0;
      } else {
        this.forceTerminateTween(t);
      }
    }
  }

  terminateAll() {
    for (const t of this.tlist) {
      t.ln = 1;
    }
    this.update();
  }

  _onUpdate(t, n) {
    if (t.onUpdate != null) {
      t.onUpdate(t);
    }
  }

  _onEnd(t) {
    if (t.onEnd != null) {
      t.onEnd(t);
    }
  }

  update(tmod = 1.0) {
    if (this.tlist.length === 0) {
      return;
    }

    for (let i = this.tlist.length - 1; i >= 0; i--) {
      const t = this.tlist[i];
      const dist = t.to - t.from;

      if (t.type === TType.Rand) {
        t.ln += Math.random() * 100 < 33 ? t.speed * tmod : 0;
      } else {
        t.ln += t.speed * tmod;
      }

      t.n = interp(t.type, t.ln);

      if (t.ln < 1) {
        const val = t.from + t.n * dist;
        t.apply(val);
        this._onUpdate(t, t.ln);
      } else {
        this.terminateTween(t, true);
      }
    }
  }
}
