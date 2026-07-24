import { Passenger } from "../../components";
import { Engine } from "../Engine";
import { EventManager } from "../eventManager";
import { EmitterEvents } from "../eventManager/eventTypes";
import { MainScene } from "../MainScene";
import { QueueService } from "../services/queueService";
import { ElevatorController } from "./ElevatorController";
import { FloorsController } from "./FloorsController";
export class GameController {
  private queueService = new QueueService();

  private transferring = false;
  private queueDirty = false;

  controllers: {
    elevator: ElevatorController;
    floors: FloorsController;
  };

  private removeListeners: Array<() => void> = [];
  constructor(
    private scene: MainScene,
    private engine: Engine,
    private eventManager: EventManager,
  ) {
    const { floorHeight, floorCount, passengerSize } =
      this.scene.getSceneInfo();

    this.controllers = {
      elevator: new ElevatorController({
        elevator: scene.elevator,
        eventManager: this.eventManager,
        floorHeight,
        floorCount,
      }),
      floors: new FloorsController({
        floors: scene.floors,
        eventManager: this.eventManager,
        passengerSize: {
          width: passengerSize.w,
          height: passengerSize.h,
        },
      }),
    };
  }
  init = async () => {
    const { floors } = this.controllers;

    this.removeListeners.push(
      this.eventManager.listen([
        {
          event: EmitterEvents.CALL_ELEVATOR,
          callback: () => {
            this.handleProcess();
          },
        },
        {
          event: EmitterEvents.UPDATE_QUEUE,
          callback: (action, passenger) => {
            switch (action) {
              case "add":
                this.queueService.addToQueue(passenger);
                this.reactForUpdateQueue(passenger);
                break;
              case "remove":
                this.queueService.removeFromQueue(passenger);
                break;

              default:
                break;
            }
          },
        },
        {
          event: EmitterEvents.ELEVATOR_ARRIVED,
          callback: async () => {
            await this.transferPassengers();
            this.handleProcess();
          },
        },
      ]),
    );

    this.engine.ticker.add(this.onUpdate, this);
    floors.init();
  };

  handleProcess = () => {
    const { elevator } = this.controllers;

    const { status, direction, currentFloor } = elevator.state;
    switch (status) {
      case "moving":
        return;
      case "wait":
        if (this.transferring) return;
        this.nextTask();
        break;

      case "idle": {
        let floorIndex: null | number = 0;
        if (direction === null) {
          floorIndex =
            this.queueService.getNearest(currentFloor)?.floorIndex ?? null;
        } else {
          floorIndex =
            this.queueService.getNearestByDirection(currentFloor, direction)
              ?.floorIndex ?? null;
        }
        if (floorIndex !== null) {
          elevator.setTargetFloor(floorIndex);
          elevator.moveToFloor(floorIndex);
        }
        break;
      }

      default:
        break;
    }
  };
  nextTask = async () => {
    const { elevator } = this.controllers;
    const { direction, currentFloor } = elevator.state;
    if (direction === null) {
      elevator.reset();
      this.handleProcess();
      return;
    }
    const queueTargetFloor =
      this.queueService.getNearestByDirection(currentFloor, direction)
        ?.floorIndex ?? null;

    const elevatorTargetFloor = elevator.getElevatorNearTarget();
    let queueIndex: number | null = elevatorTargetFloor ?? queueTargetFloor;

    if (elevator.isFull()) {
      queueIndex = elevatorTargetFloor;
    } else if (queueTargetFloor !== null && elevatorTargetFloor !== null) {
      const method = direction === "DOWN" ? "max" : "min";
      queueIndex = Math[method](queueTargetFloor, elevatorTargetFloor);
    }

    if (queueIndex !== null) {
      elevator.moveToFloor(queueIndex);
      return;
    }
    elevator.reset();
    this.handleProcess();
  };

  transferPassengers = async () => {
    const { elevator, floors } = this.controllers;

    const { currentFloor, status } = elevator.state;
    if (status !== "wait" || this.transferring) return;
    const floor = floors.getFloor(currentFloor);

    this.transferring = true;
    await elevator.unloadPassengersTo(floor);

    do {
      this.queueDirty = false;
      if (elevator.isFull()) break;

      const passengers = floors.pickUpPassengers(
        currentFloor,
        elevator.state.direction,
        elevator.cpacityLeft,
      );
      if (!passengers.length) break;

      await elevator.loadPassengers(passengers);
    } while (this.queueDirty);

    this.transferring = false;
    this.queueDirty = false;
  };

  reactForUpdateQueue = (newPassenger: Passenger) => {
    const { elevator } = this.controllers;
    const { status, currentFloor, direction } = elevator.state;
    if (!this.transferring || status !== "wait") return;
    if (elevator.isFull()) return;
    if (currentFloor !== newPassenger.params.currentFloor) return;
    if (direction !== newPassenger.params.direction) {
      return;
    }
    this.queueDirty = true;
  };
  private onUpdate = () => {
    const { elevator, floors } = this.controllers;
    elevator.onUpdate();
    floors.onUpdate();
  };

  clear = () => {
    this.queueService.clear();
    Object.keys(this.controllers).forEach((k) => {
      this.controllers[k as keyof typeof this.controllers].clear();
    });
  };
  destroy = () => {
    this.clear();
    this.engine.ticker.remove(this.onUpdate, this);
    this.removeListeners.forEach((fn) => fn());
  };
}
