import { Container, Graphics } from "pixi.js";

export class BaseComponent {
  public readonly container = new Container();
  protected graphics = new Graphics();

  constructor() {}

  destroy() {
    this.container.children.forEach((c) => c.destroy(true));
    this.container.destroy(true);
  }
}
