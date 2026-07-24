import { wait, type Direction, type ElevatorStatus } from "../lib";
import { BaseComponent } from "./BaseComponent";
import { type Passenger } from "./Passenger";

export interface IElevatorState {
  currentFloor: number;
  targetFloor: number | null;
  direction: Direction;
  status: ElevatorStatus;
  doorIsOpen: boolean;
}
const defaultGraphicsSettings = {
  color: 0x1aa7e8,
  width: 4,
};
export class Elevator extends BaseComponent {
  readonly passengers: Passenger[] = [];

  private exitX = 0;
  state: IElevatorState = {
    currentFloor: 0,
    targetFloor: null,
    direction: null,
    status: "idle",
    doorIsOpen: false,
  };

  constructor(
    public readonly capacity = 1,
    size: { width: number; height: number },
    public readonly gap: number,
  ) {
    super();
    const width = size.width + defaultGraphicsSettings.width * 2;
    const height = size.height;
    this.exitX = width;
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

  isFull = () => this.passengers.length === this.capacity;

  load = (passenger: Passenger) => {
    this.passengers.push(passenger);
    return this.passengers.length - 1;
  };

  unload = (passenger: Passenger) => {
    const index = this.passengers.indexOf(passenger);
    if (index >= 0) this.passengers.splice(index, 1);
  };

  getExitX = () => {
    return this.exitX;
  };

  openDoor = async () => {
    this.setState({ doorIsOpen: true });
    await wait(100);
  };
  closeDoor = async () => {
    this.setState({ doorIsOpen: false });
    await wait(100);
  };

  setState = (newState: Partial<IElevatorState>) => {
    Object.assign(this.state, newState);
  };

  get paddings() {
    return defaultGraphicsSettings.width;
  }
}
