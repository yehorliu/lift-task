import { Easing } from "@tweenjs/tween.js";
import { Container } from "pixi.js";
import { Elevator, Floor, IElevatorState, Passenger } from "../../components";
import { ELEVATOR_LOAD_TIME_MS, ELEVATOR_MOVE_SPEED_MS, wait } from "../../lib";
import {
  calcPositionInOtherParent,
  updateParents,
} from "../../lib/utils/updateParents";
import { EventManager } from "../eventManager";
import { MoveService } from "../services/moveService";

interface IControllerParams {
  elevator: Elevator;
  eventManager: EventManager;
  floorHeight: number;
  floorCount: number;
}

export class ElevatorController {
  private moveService = new MoveService();

  constructor(private params: IControllerParams) {}

  public moveToFloor = async (floorIndex: number) => {
    const { elevator, floorHeight, floorCount } = this.params;
    const distance = Math.abs(floorIndex - this.state.currentFloor) || 1;
    const y = (floorCount - 1) * floorHeight - floorIndex * floorHeight;
    this.setState({ status: "moving" });

    await elevator.closeDoor();
    await this.moveService.move(
      elevator.container,
      { y },
      {
        timeMs: ELEVATOR_MOVE_SPEED_MS * distance,
        easing: Easing.Cubic.InOut,
      },
    );
    await elevator.openDoor();
    this.setState({ currentFloor: floorIndex, status: "wait" });
    this.params.eventManager.actions.elevatorArrived(floorIndex);
  };
  public setTargetFloor = (floorIndex: number | null) => {
    this.setState({ targetFloor: floorIndex });
  };

  public setState = (newState: Partial<IElevatorState>) => {
    this.elevator.setState({ ...newState });
  };

  public isFull = () => this.elevator.isFull();
  public isEmpty = () => this.elevator.passengers.length === 0;

  public getElevatorNearTarget = () => {
    const { direction, currentFloor } = this.state;
    const targets = this.elevator.passengers
      .map((p) => p.params.targetFloor)
      .filter((v) => {
        return direction === "DOWN" ? v < currentFloor : v > currentFloor;
      })
      .sort((a, b) => {
        return direction === "DOWN" ? b - a : a - b;
      });

    return targets[0] ?? null;
  };

  public unloadPassengersTo = async (floor: Floor) => {
    const leaving = [...this.elevator.passengers].filter(
      (p) => p.params.targetFloor === floor.index,
    );

    if (!leaving.length) {
      return leaving;
    }
    const { spawnPos, queueGap } = floor.getInfo();
    const exitX = this.elevator.getExitX();
    const promises = leaving.map(async (passenger, i) => {
      this.elevator.unload(passenger);

      const step = passenger.params.size.width + queueGap;
      const x = exitX + step * i;
      const range = Math.abs(x - passenger.container.x);

      await this.moveService.move(
        passenger.container,
        { x },
        { timeMs: range / passenger.speed },
      );
    });
    await Promise.all(promises);
    this.repositionPassengers();

    leaving.map(async (passenger) => {
      const posInFloor = calcPositionInOtherParent(
        passenger.container,
        floor.container,
      );
      const timeMs = Math.abs(posInFloor.x - spawnPos.x) / passenger.speed;

      this.movePassengerToOtherParent({
        passenger,
        newParent: floor.container,
        x: spawnPos.x,
        time: timeMs,
        onComplete: () => passenger.destroy(),
      });
    });

    return leaving;
  };

  public loadPassengers = async (passengers: Passenger[]) => {
    const startIndex = this.elevator.passengers.length;
    const promises = passengers.map(async (passenger, i) => {
      if (this.state.direction === null) {
        this.setState({ direction: passenger.params.direction });
      }
      this.params.elevator.load(passenger);

      const newPossiblePos = calcPositionInOtherParent(
        passenger.container,
        this.elevator.container,
      );
      const index = startIndex + i;
      const { paddings, gap } = this.elevator;
      const x = paddings + (passenger.params.size.width + gap) * index;
      const range = Math.abs(newPossiblePos.x - x);

      const time = Math.min(range / passenger.speed, ELEVATOR_LOAD_TIME_MS);
      await this.movePassengerToOtherParent({
        passenger,
        newParent: this.elevator.container,
        x,
        time,
      });
    });
    if (promises.length) {
      await Promise.all([...promises, wait(ELEVATOR_LOAD_TIME_MS)]);
    }
  };
  private repositionPassengers = () => {
    this.elevator.passengers.forEach((passenger, index) => {
      const { paddings, gap } = this.elevator;
      const x = paddings + (passenger.params.size.width + gap) * index;
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
    });
  };
  private movePassengerToOtherParent = async ({
    passenger,
    newParent,
    x,
    time,
    onComplete,
  }: {
    passenger: Passenger;
    newParent: Container;
    x: number;
    time: number;
    onComplete?: () => void;
  }) => {
    updateParents(passenger.container, newParent);
    await this.moveService.move(
      passenger.container,
      { x },
      {
        onComplete,
        timeMs: time,
      },
    );
  };

  public handleDoor = async (action: "open" | "close") => {
    const method = action === "open" ? "openDoor" : "closeDoor";
    await this.elevator[method]();
  };

  public onUpdate = (time?: number | undefined) => {
    this.moveService.onUpdate(time);
  };

  public get cpacityLeft() {
    return (
      this.params.elevator.capacity - this.params.elevator.passengers.length
    );
  }
  private get elevator() {
    return this.params.elevator;
  }
  public get state() {
    return this.params.elevator.state;
  }
  reset = () => {
    this.setState({
      status: "idle",
      direction: null,
      targetFloor: null,
    });
  };

  clear = () => {
    this.moveService.clear();
  };
}
