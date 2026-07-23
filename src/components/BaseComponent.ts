import { Container, Graphics } from "pixi.js";

export class BaseComponent {
  public readonly container = new Container();
  protected graphics = new Graphics();

  constructor() {}

  destroy = () => {
    this.graphics.destroy(true);
    this.container.removeChildren();
    this.container.destroy();
  };
}
