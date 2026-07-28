import * as PIXI from "pixi.js";
import { TitleState } from "./states/TitleState.js";

class Main {
  constructor() {
    this.app = new PIXI.Application();
  }

  async init() {
    await this.app.init({
      width: 1280,
      height: 720,
      backgroundColor: 0x000000,
      antialias: false,
      resizeTo: window
    });

    document.body.appendChild(this.app.canvas);

    this.state = new TitleState(this.app);
    this.app.stage.addChild(this.state);

    if (!this.isMobile()) {
      this.fps = new PIXI.Text({
        text: "0",
        style: { fill: 0xffffff, fontSize: 16 }
      });
      this.fps.x = 10;
      this.fps.y = 3;
      this.app.stage.addChild(this.fps);

      this.app.ticker.add(() => {
        this.fps.text = Math.round(this.app.ticker.FPS);
      });
    }
  }

  isMobile() {
    return /Android|iPhone|iPad/i.test(navigator.userAgent);
  }
}

const main = new Main();
main.init();
