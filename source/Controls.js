export const Action = {
  UP: "up",
  LEFT: "left",
  RIGHT: "right",
  DOWN: "down",
  UP_P: "up-press",
  LEFT_P: "left-press",
  RIGHT_P: "right-press",
  DOWN_P: "down-press",
  UP_R: "up-release",
  LEFT_R: "left-release",
  RIGHT_R: "right-release",
  DOWN_R: "down-release",
  ACCEPT: "accept",
  BACK: "back",
  PAUSE: "pause",
  RESET: "reset",
  CHEAT: "cheat"
};

export const Control = {
  UP: "UP",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  DOWN: "DOWN",
  RESET: "RESET",
  ACCEPT: "ACCEPT",
  BACK: "BACK",
  PAUSE: "PAUSE",
  CHEAT: "CHEAT"
};

export const KeyboardScheme = {
  Solo: "Solo",
  DuoP1: "DuoP1",
  DuoP2: "DuoP2",
  None: "None",
  Custom: "Custom"
};

class ActionDigital {
  constructor(name) {
    this.name = name;
    this.keys = new Map();
    this.pressed = false;
    this.justPressed = false;
    this.justReleased = false;
  }

  addKey(code, state) {
    this.keys.set(code, state);
  }

  removeKeys(codes) {
    for (const code of codes) {
      this.keys.delete(code);
    }
  }

  hasKey(code) {
    return this.keys.has(code);
  }

  check() {
    return this.pressed || this.justPressed || this.justReleased;
  }
}

export class Controls {
  constructor(name, scheme = KeyboardScheme.None) {
    this.name = name;
    this.gamepadsAdded = [];
    this.keyboardScheme = KeyboardScheme.None;

    this.byName = new Map();
    for (const key of Object.keys(Action)) {
      const action = new ActionDigital(Action[key]);
      this.byName.set(Action[key], action);
    }

    this._up = this.byName.get(Action.UP);
    this._left = this.byName.get(Action.LEFT);
    this._right = this.byName.get(Action.RIGHT);
    this._down = this.byName.get(Action.DOWN);
    this._upP = this.byName.get(Action.UP_P);
    this._leftP = this.byName.get(Action.LEFT_P);
    this._rightP = this.byName.get(Action.RIGHT_P);
    this._downP = this.byName.get(Action.DOWN_P);
    this._upR = this.byName.get(Action.UP_R);
    this._leftR = this.byName.get(Action.LEFT_R);
    this._rightR = this.byName.get(Action.RIGHT_R);
    this._downR = this.byName.get(Action.DOWN_R);
    this._accept = this.byName.get(Action.ACCEPT);
    this._back = this.byName.get(Action.BACK);
    this._pause = this.byName.get(Action.PAUSE);
    this._reset = this.byName.get(Action.RESET);
    this._cheat = this.byName.get(Action.CHEAT);

    this._keysDown = new Set();
    this._keysJustPressed = new Set();
    this._keysJustReleased = new Set();

    window.addEventListener("keydown", (e) => this.onKeyDown(e));
    window.addEventListener("keyup", (e) => this.onKeyUp(e));

    this.setKeyboardScheme(scheme, false);
  }

  onKeyDown(e) {
    if (!this._keysDown.has(e.code)) {
      this._keysJustPressed.add(e.code);
    }
    this._keysDown.add(e.code);
  }

  onKeyUp(e) {
    this._keysDown.delete(e.code);
    this._keysJustReleased.add(e.code);
  }

  get UP() { return this._up.check(); }
  get LEFT() { return this._left.check(); }
  get RIGHT() { return this._right.check(); }
  get DOWN() { return this._down.check(); }
  get UP_P() { return this._upP.check(); }
  get LEFT_P() { return this._leftP.check(); }
  get RIGHT_P() { return this._rightP.check(); }
  get DOWN_P() { return this._downP.check(); }
  get UP_R() { return this._upR.check(); }
  get LEFT_R() { return this._leftR.check(); }
  get RIGHT_R() { return this._rightR.check(); }
  get DOWN_R() { return this._downR.check(); }
  get ACCEPT() { return this._accept.check(); }
  get BACK() { return this._back.check(); }
  get PAUSE() { return this._pause.check(); }
  get RESET() { return this._reset.check(); }
  get CHEAT() { return this._cheat.check(); }

  update() {
    for (const [name, action] of this.byName.entries()) {
      action.pressed = false;
      action.justPressed = false;
      action.justReleased = false;

      for (const [code, state] of action.keys.entries()) {
        if (state === "PRESSED" && this._keysDown.has(code)) {
          action.pressed = true;
        }
        if (state === "JUST_PRESSED" && this._keysJustPressed.has(code)) {
          action.justPressed = true;
        }
        if (state === "JUST_RELEASED" && this._keysJustReleased.has(code)) {
          action.justReleased = true;
        }
      }
    }

    this._keysJustPressed.clear();
    this._keysJustReleased.clear();
  }

  checkByName(name) {
    const action = this.byName.get(name);
    return action ? action.check() : false;
  }

  getActionFromControl(control) {
    switch (control) {
      case Control.UP: return this._up;
      case Control.DOWN: return this._down;
      case Control.LEFT: return this._left;
      case Control.RIGHT: return this._right;
      case Control.ACCEPT: return this._accept;
      case Control.BACK: return this._back;
      case Control.PAUSE: return this._pause;
      case Control.RESET: return this._reset;
      case Control.CHEAT: return this._cheat;
      default: return null;
    }
  }

  forEachBound(control, func) {
    switch (control) {
      case Control.UP:
        func(this._up, "PRESSED");
        func(this._upP, "JUST_PRESSED");
        func(this._upR, "JUST_RELEASED");
        break;
      case Control.LEFT:
        func(this._left, "PRESSED");
        func(this._leftP, "JUST_PRESSED");
        func(this._leftR, "JUST_RELEASED");
        break;
      case Control.RIGHT:
        func(this._right, "PRESSED");
        func(this._rightP, "JUST_PRESSED");
        func(this._rightR, "JUST_RELEASED");
        break;
      case Control.DOWN:
        func(this._down, "PRESSED");
        func(this._downP, "JUST_PRESSED");
        func(this._downR, "JUST_RELEASED");
        break;
      case Control.ACCEPT:
        func(this._accept, "JUST_PRESSED");
        break;
      case Control.BACK:
        func(this._back, "JUST_PRESSED");
        break;
      case Control.PAUSE:
        func(this._pause, "JUST_PRESSED");
        break;
      case Control.RESET:
        func(this._reset, "JUST_PRESSED");
        break;
      case Control.CHEAT:
        func(this._cheat, "JUST_PRESSED");
        break;
    }
  }

  bindKeys(control, keys) {
    this.forEachBound(control, (action, state) => {
      for (const key of keys) {
        action.addKey(key, state);
      }
    });
  }

  unbindKeys(control, keys) {
    this.forEachBound(control, (action) => {
      action.removeKeys(keys);
    });
  }

  replaceBinding(control, toAdd, toRemove) {
    if (toAdd === toRemove) {
      return;
    }
    if (toRemove != null) {
      this.unbindKeys(control, [toRemove]);
    }
    if (toAdd != null) {
      this.bindKeys(control, [toAdd]);
    }
  }

  removeKeyboard() {
    for (const action of this.byName.values()) {
      action.keys.clear();
    }
  }

  setKeyboardScheme(scheme, reset = true) {
    if (reset) {
      this.removeKeyboard();
    }

    this.keyboardScheme = scheme;

    switch (scheme) {
      case KeyboardScheme.Solo:
        this.bindKeys(Control.UP, ["KeyW", "ArrowUp"]);
        this.bindKeys(Control.DOWN, ["KeyS", "ArrowDown"]);
        this.bindKeys(Control.LEFT, ["KeyA", "ArrowLeft"]);
        this.bindKeys(Control.RIGHT, ["KeyD", "ArrowRight"]);
        this.bindKeys(Control.ACCEPT, ["KeyZ", "Space", "Enter"]);
        this.bindKeys(Control.BACK, ["Backspace", "Escape"]);
        this.bindKeys(Control.PAUSE, ["KeyP", "Enter", "Escape"]);
        this.bindKeys(Control.RESET, ["KeyR"]);
        break;

      case KeyboardScheme.DuoP1:
        this.bindKeys(Control.UP, ["KeyW"]);
        this.bindKeys(Control.DOWN, ["KeyS"]);
        this.bindKeys(Control.LEFT, ["KeyA"]);
        this.bindKeys(Control.RIGHT, ["KeyD"]);
        this.bindKeys(Control.ACCEPT, ["KeyG", "KeyZ"]);
        this.bindKeys(Control.BACK, ["KeyH", "KeyX"]);
        this.bindKeys(Control.PAUSE, ["Digit1"]);
        this.bindKeys(Control.RESET, ["KeyR"]);
        break;

      case KeyboardScheme.DuoP2:
        this.bindKeys(Control.UP, ["ArrowUp"]);
        this.bindKeys(Control.DOWN, ["ArrowDown"]);
        this.bindKeys(Control.LEFT, ["ArrowLeft"]);
        this.bindKeys(Control.RIGHT, ["ArrowRight"]);
        this.bindKeys(Control.ACCEPT, ["KeyO"]);
        this.bindKeys(Control.BACK, ["KeyP"]);
        this.bindKeys(Control.PAUSE, ["Enter"]);
        this.bindKeys(Control.RESET, ["Backspace"]);
        break;

      case KeyboardScheme.None:
      case KeyboardScheme.Custom:
        break;
    }
  }

  mergeKeyboardScheme(scheme) {
    if (scheme !== KeyboardScheme.None) {
      if (this.keyboardScheme === KeyboardScheme.None) {
        this.keyboardScheme = scheme;
      } else {
        this.keyboardScheme = KeyboardScheme.Custom;
      }
    }
  }

  copyFrom(controls) {
    for (const [name, action] of controls.byName.entries()) {
      const myAction = this.byName.get(name);
      for (const [code, state] of action.keys.entries()) {
        myAction.addKey(code, state);
      }
    }
    this.mergeKeyboardScheme(controls.keyboardScheme);
  }

  copyTo(controls) {
    controls.copyFrom(this);
  }

  getInputsFor(control) {
    const action = this.getActionFromControl(control);
    return action ? Array.from(action.keys.keys()) : [];
  }

  removeDevice() {
    this.setKeyboardScheme(KeyboardScheme.None);
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
