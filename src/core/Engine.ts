import { Application } from "pixi.js";

export class Engine {
  private app = new Application();

  public initialized = false;
  constructor() {}

  init = async () => {
    if (this.initialized) return;
    this.initialized = true;
    const root = document.getElementById("pixi-container");

    await this.app.init({
      background: "#ffffff",
      resolution: Math.max(window.devicePixelRatio, 2),
    });

    if (root) {
      root.appendChild(this.app.canvas);
    } else {
      document.appendChild(this.app.canvas);
    }
  };

  get stage() {
    return this.app.stage;
  }
  get ticker() {
    return this.app.ticker;
  }
  get screen() {
    return this.app.screen;
  }

  destroy = () => {
    this.initialized = false;
    this.app?.destroy(true);
  };
}
