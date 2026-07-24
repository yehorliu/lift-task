import { Floor, Passenger } from "../../components";
import {
  Direction,
  type ElevatorDirection,
  type ISize,
  getRandomExcept,
  random,
} from "../../lib";
import { configurationLimits } from "../../lib/configs/limits";
import { EventManager } from "../eventManager";
import { MoveService } from "../services/moveService";

interface IControllerParams {
  floors: Floor[];
  eventManager: EventManager;
  passengerSize: ISize;
}
export class FloorsController {
  private moveService = new MoveService();
  constructor(private params: IControllerParams) {}

  private spawnTimers = new Map<number, ReturnType<typeof setTimeout>>();
  init = () => {
    this.startSpawnPassengers();
  };
  private startSpawnPassengers = () => {
    this.floors.forEach((floor) => {
      const spawn = () => {
        const time = this.getRandomSpawnTime();

        const t = setTimeout(() => {
          const isFull = floor.isFull();
          if (!isFull) {
            this.spawnPassenger(floor.index);
          }
          spawn();
        }, time);
        this.spawnTimers.set(floor.index, t);
      };
      spawn();
    });
  };
  private stopSpawnPassengers = () => {
    this.spawnTimers.forEach((timer) => clearTimeout(timer));
    this.spawnTimers.clear();
  };

  private spawnPassenger = (floorIndex: number) => {
    const floor = this.floors[floorIndex];
    const size = this.params.passengerSize;

    const floorCount = this.floorCount;
    const targetFloor = getRandomExcept(0, floorCount - 1, floorIndex);
    const passengerDirection: Direction =
      targetFloor > floorIndex ? "UP" : "DOWN";
    const passenger = new Passenger({
      size,
      targetFloor,
      currentFloor: floorIndex,
      direction: passengerDirection,
    });
    const { spawnPos } = floor.getInfo();
    const y = spawnPos.y - passenger.params.size.height;
    passenger.container.position.set(spawnPos.x, y);

    floor.addPassenger(passenger);
    this.walkToSlot(floor, passenger);
  };

  private walkToSlot = (floor: Floor, passenger: Passenger) => {
    const { exitPosX, queueGap } = floor.getInfo();
    const index = floor.passengers.indexOf(passenger);
    const x = exitPosX + index * (passenger.params.size.width + queueGap);
    const diff = Math.abs(passenger.container.x - x);
    this.moveService.move(
      passenger.container,
      { x },
      {
        onComplete: () => {
          if (passenger.status === "move") {
            passenger.status = "wait";
            this.params.eventManager.actions.updateQueue("add", passenger);
            this.params.eventManager.actions.callElevator();
          }
        },
        timeMs: diff / passenger.speed,
      },
    );
  };

  getFloor = (floorIndex: number): Floor => {
    return this.floors[floorIndex];
  };

  hasWaitingPassenger = (floorIndex: number, direction: ElevatorDirection) => {
    return this.floors[floorIndex].hasPassengerWithDirection(direction);
  };

  pickUpPassengers = (
    floorIndex: number,
    direction: ElevatorDirection | null,
    currentCapacity: number,
  ) => {
    const floor = this.floors[floorIndex];
    const pickedUpPassengers: Passenger[] = [];

    for (let i = 0; i < floor.passengers.length; i++) {
      const passenger = floor.passengers[i];
      if (passenger.status !== "wait") continue;
      if (direction === null) {
        direction = passenger.params.direction;
      }
      if (passenger && passenger.params.direction === direction) {
        pickedUpPassengers.push(passenger);
      }
      if (pickedUpPassengers.length === currentCapacity) break;
    }
    if (pickedUpPassengers.length) {
      pickedUpPassengers.forEach((p) => {
        floor.removePassenger(p);
        this.params.eventManager.actions.updateQueue("remove", p);
      });
      this.repositionQueue(floor);
    }

    return pickedUpPassengers;
  };

  private repositionQueue = (floor: Floor) => {
    floor.passengers.forEach((passenger) => {
      this.walkToSlot(floor, passenger);
    });
  };
  private getRandomSpawnTime = () => {
    const { passengerSpawnTime } = configurationLimits;
    return random(passengerSpawnTime.min, passengerSpawnTime.max);
  };
  get floorCount() {
    return this.floors.length;
  }

  private get floors() {
    return this.params.floors;
  }
  onUpdate = (time?: number | undefined) => {
    this.moveService.onUpdate(time);
  };

  clear = () => {
    this.stopSpawnPassengers();
    this.moveService.clear();
  };
}
