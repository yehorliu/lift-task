export interface IGameConfig {
  floors: number;
  elevatorCapacity: number;
}

export type ElevatorDirection = "UP" | "DOWN";
export type Direction = ElevatorDirection | null;
export type ElevatorStatus = "idle" | "moving" | "wait";
export interface ISize {
  width: number;
  height: number;
}
