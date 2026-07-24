import { Sprite, Text, Texture } from "pixi.js";
import { ISize, type ElevatorDirection } from "../lib";
import { BaseComponent } from "./BaseComponent";
import { Passenger } from "./Passenger";
const defaultGraphicsSettings = {
  color: 0x000000,
  width: 5,
};
interface IParams {
  size: ISize;
  gap: number;
  capacity: number;
}
export class Floor extends BaseComponent {
  readonly passengers: Passenger[] = [];

  private info = {
    spawnPos: { x: 0, y: 0 },
    exitPosX: 0,
    queueGap: 5,
    height: 5,
    width: 5,
    capacity: 0,
  };
  constructor(
    public index: number,
    params: IParams,
  ) {
    super();
    const { size, gap, capacity } = params;
    this.info.spawnPos.x = size.width;
    this.info.spawnPos.y = size.height * 0.84;
    this.info.height = size.height;
    this.info.width = size.width;
    this.info.queueGap = gap;
    this.info.capacity = capacity;

    const spriteBase = new Sprite(Texture.WHITE);
    spriteBase.width = size.width;
    spriteBase.height = size.height;
    spriteBase.alpha = 0;
    this.container.addChild(spriteBase);

    this.graphics
      .moveTo(0, 0)
      .lineTo(size.width, 0)
      .stroke({ ...defaultGraphicsSettings });

    this.graphics.cacheAsTexture(true);
    this.graphics.position.set(0, size.height - this.graphics.height / 2);
    this.container.addChild(this.graphics);

    const lvl = index + 1;
    const t = new Text({
      text: "level " + lvl,
      anchor: { x: 0, y: 0.5 },
      style: {
        fontSize: size.height * 0.3,
      },
    });

    const x = size.width * 0.96 - t.width;
    const y = size.height / 2;
    t.position.set(x, y);
    this.container.addChild(t);
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

  getPassengerDirection = (passenger: Passenger): ElevatorDirection => {
    return passenger.params.targetFloor > this.index ? "UP" : "DOWN";
  };

  hasPassengerWithDirection = (direction: ElevatorDirection) => {
    return this.passengers.some(
      (passenger) =>
        passenger.status === "wait" &&
        this.getPassengerDirection(passenger) === direction,
    );
  };

  isFull = () => {
    return this.passengers.length >= this.info.capacity;
  };
}
