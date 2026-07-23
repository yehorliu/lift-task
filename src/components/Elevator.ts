import { type ElevatorDirection } from "../lib";
import { BaseComponent } from "./BaseComponent";
import { type Passenger } from "./Passenger";

const defaultGraphicsSettings = {
  color: 0x1aa7e8,
  width: 4,
};
export class Elevator extends BaseComponent {
  readonly passengers: Passenger[] = [];

  private _currentFloor = 1;
  direction: ElevatorDirection = "UP";

  constructor(
    public readonly capacity = 1,
    size: { width: number; height: number },
  ) {
    super();
    const { width, height } = size;
    this.graphics
      .moveTo(width, height * 0.2)
      .lineTo(width, 0)
      .lineTo(0, 0)
      .lineTo(0, height)
      .lineTo(width, height)
      .lineTo(width, height * 0.9)
      .stroke({ ...defaultGraphicsSettings });

    this.graphics.cacheAsTexture(true);

    this.container.addChild(this.graphics);
  }
  setCurrentFloor = (level: number) => {
    this._currentFloor = level;
  };

  isFull = () => this.passengers.length === this.capacity;

  load = (passenger: Passenger) => {
    this.passengers.push(passenger);
    return this.passengers.length - 1;
  };

  unload = (passenger: Passenger) => {
    const index = this.passengers.indexOf(passenger);
    if (index >= 0) this.passengers.splice(index, 1);
  };

  setDirection = (direction: ElevatorDirection) => {
    this.direction = direction;
  };

  get currentFloor() {
    return this._currentFloor;
  }
}
