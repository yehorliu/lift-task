import { Passenger } from "../../components";
import { ElevatorDirection } from "../../lib";

type Task = {
  passenger: Passenger;
  floorIndex: number;
};
export type Queue = Record<ElevatorDirection, Task[]>;
export class QueueService {
  private queue: Queue = {
    DOWN: [],
    UP: [],
  };

  constructor() {}

  addToQueue = (passenger: Passenger) => {
    const { direction, currentFloor } = passenger.params;
    const queue = this.queue[direction];
    const index = queue.findIndex((v) => v.passenger === passenger);

    if (index !== -1) return;
    this.queue[direction].push({ passenger, floorIndex: currentFloor });
  };
  removeFromQueue = (passenger: Passenger) => {
    const { direction } = passenger.params;
    const queue = this.queue[direction];
    const index = queue.findIndex((v) => v.passenger === passenger);

    if (index === -1) return;

    queue.splice(index, 1);
  };

  getNearest = (currentFloor: number) => {
    const queue = [...this.queue.DOWN, ...this.queue.UP];
    if (queue.length === 0) {
      return null;
    }

    return this.findNearest(queue, currentFloor);
  };
  getNearestByDirection = (
    currentFloor: number,
    direction: ElevatorDirection,
  ) => {
    const queue = [...this.queue[direction]].filter((item) =>
      direction === "UP"
        ? item.floorIndex > currentFloor
        : item.floorIndex < currentFloor,
    );

    if (queue.length === 0) {
      return null;
    }

    return this.findNearest(queue, currentFloor);
  };

  private findNearest = (queue: Task[], currentFloor: number) => {
    const queueItem = queue[0];
    const { floorIndex, passenger } = queueItem;
    let minDiff = Math.abs(currentFloor - floorIndex);
    let nearest = { floorIndex, passenger };
    for (let i = 1; i < queue.length; i++) {
      const floor = queue[i];
      const diff = Math.abs(currentFloor - floor.floorIndex);

      if (diff < minDiff) {
        minDiff = diff;
        nearest = { ...floor };
      }
    }

    return nearest;
  };
  getAll = () => {
    return this.queue;
  };
  clear = () => {
    this.queue.DOWN.length = 0;
    this.queue.UP.length = 0;
  };
}
