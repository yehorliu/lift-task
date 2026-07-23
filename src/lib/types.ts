export interface IGameConfig {
  floors: number;
  elevatorCapacity: number;
}

export type ElevatorDirection = "UP" | "DOWN";
export interface ISize {
  width: number;
  height: number;
}
