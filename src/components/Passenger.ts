import { Text } from "pixi.js";
import { ElevatorDirection, ISize } from "../lib";
import { BaseComponent } from "./BaseComponent";

interface IPassengerParams {
  size: ISize;
  currentFloor: number;
  targetFloor: number;
  direction: ElevatorDirection;
}

export class Passenger extends BaseComponent {
  public readonly speed = 0.4;

  public status: "wait" | "move" = "move";
  constructor(public params: IPassengerParams) {
    super();

    const { width, height } = params.size;
    const color = params.direction === "DOWN" ? "green" : "blue";

    const borderWidth = Math.floor(width * 0.1);
    this.graphics
      .rect(0, 0, width, height)
      .stroke({ width: borderWidth, color, alignment: 1 });

    this.graphics.cacheAsTexture(true);

    this.container.addChild(this.graphics);

    const t = new Text({
      text: params.targetFloor + 1,
      anchor: { x: 0.5, y: 0.5 },
      style: {
        fontSize: width * 0.55,
      },
    });

    const x = params.size.width / 2;
    const y = params.size.height / 2;
    t.position.set(x, y);
    this.container.addChild(t);
    this.container.cacheAsTexture(true);
  }
}
