import { ISize } from "../lib";
import { BaseComponent } from "./BaseComponent";

interface IPassengerParams {
  size: ISize;
  targetFloor: number;
}
const defaultGraphicsSettings = {
  color: 0x1aa7e8,
  width: 3,
};

export class Passenger extends BaseComponent {
  constructor(public params: IPassengerParams) {
    super();

    const { width, height } = params.size;
    this.graphics
      .rect(0, 0, width, height)
      .stroke({ ...defaultGraphicsSettings });

    this.graphics.cacheAsTexture(true);

    this.container.addChild(this.graphics);
  }
}
