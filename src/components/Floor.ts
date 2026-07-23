import { BaseComponent } from "./BaseComponent";
import { Passenger } from "./Passenger";
const defaultGraphicsSettings = {
  color: 0x000000,
  width: 5,
};
export class Floor extends BaseComponent {
  readonly passengers: Passenger[] = [];

  private info = {
    spawnPosX: 0,
    exitPosX: 0,
    queueGap: 5,
  };
  constructor(
    public index: number,
    size: {
      width: number;
    },
  ) {
    super();
    this.info.spawnPosX = size.width;
    this.graphics
      .moveTo(0, 0)
      .lineTo(size.width, 0)
      .stroke({ ...defaultGraphicsSettings });

    this.graphics.cacheAsTexture(true);
    this.container.addChild(this.graphics);
  }
  addPassenger = (passenger: Passenger): number => {
    this.container.addChild(passenger.container);
    this.passengers.push(passenger);
    return this.passengers.length - 1;
  };
  removePassenger = (passenger: Passenger) => {
    const index = this.passengers.indexOf(passenger);
    if (index >= 0) this.passengers.splice(index, 1);
  };
  getInfo = () => {
    return { ...this.info };
  };
}
