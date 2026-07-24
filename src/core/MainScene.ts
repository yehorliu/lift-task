import { type Application, Container } from "pixi.js";
import { Elevator, Floor } from "../components";
import { IGameConfig, PASSENGER_GAP } from "../lib";
import { optimizeNumValue } from "../lib/utils/optimizeNumValue";

export class MainScene {
  readonly container = new Container();

  public elevator!: Elevator;

  public floors: Floor[] = [];
  private options = {
    floorHeight: 0,
    floorCount: 0,
    elevatorSize: {
      w: 0,
      h: 0,
    },
    passengerSize: {
      w: 0,
      h: 0,
    },
    passengerGap: 0,
  };

  constructor(public screen: Application["screen"]) {}
  draw = (config: IGameConfig) => {
    this.updateSceneInfo(config);
    const { elevatorSize, floorHeight, floorCount, passengerGap } =
      this.options;
    this.elevator = new Elevator(
      config.elevatorCapacity,
      {
        height: elevatorSize.h,
        width: elevatorSize.w,
      },
      passengerGap,
    );
    const x = 8;
    const y = floorHeight * floorCount - elevatorSize.h;

    this.elevator.container.position.set(x, y);
    this.createFloors(floorCount);

    this.container.addChild(this.elevator.container);
  };

  getSceneInfo = () => {
    return { ...this.options };
  };

  private createFloors = (floorCount: number) => {
    const { passengerSize, passengerGap } = this.options;
    const screenHeight = this.screen.height;
    const screenWidth = this.screen.width;

    const elevatorX = this.elevator?.container.x ?? 0;
    const elevatorWidth = this.elevator?.container.width ?? 0;

    const elevatorGap = 1;
    const x = elevatorX + elevatorWidth + elevatorGap;
    const floorHeight = screenHeight / floorCount;
    const floorWidth = screenWidth - x;

    const maxIndex = floorCount - 1;

    const floorCapacity = Math.floor(
      (floorWidth + passengerGap) / (passengerSize.w + passengerGap),
    );
    for (let i = maxIndex; i >= 0; i--) {
      const y = floorHeight * (maxIndex - i);
      const floor = new Floor(i, {
        gap: this.options.passengerGap,
        size: { width: floorWidth, height: floorHeight },
        capacity: floorCapacity,
      });
      this.floors[i] = floor;
      floor.container.position.set(x, y);
      this.container.addChild(floor.container);
    }
  };

  private updateSceneInfo = ({ floors, elevatorCapacity }: IGameConfig) => {
    const { height } = this.screen;
    this.options.passengerGap = PASSENGER_GAP;
    this.options.floorCount = floors;
    this.options.floorHeight = optimizeNumValue(height / floors);
    this.options.passengerSize.h = optimizeNumValue(
      this.options.floorHeight * 0.6,
    );
    this.options.passengerSize.w = optimizeNumValue(
      this.options.passengerSize.h * 0.65,
    );
    this.options.elevatorSize.w = optimizeNumValue(
      this.options.passengerSize.w * elevatorCapacity +
        PASSENGER_GAP * (elevatorCapacity - 1),
    );
    this.options.elevatorSize.h = this.options.floorHeight;
  };

  destroy = () => {
    this.container.destroy(true);
  };
}
