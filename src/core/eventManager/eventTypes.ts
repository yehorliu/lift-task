import { Passenger } from "../../components";
import { IGameConfig } from "../../lib";

export enum EmitterEvents {
  CALL_ELEVATOR = "CALL_ELEVATOR",
  ELEVATOR_ARRIVED = "ELEVATOR_ARRIVED",
  UPDATE_QUEUE = "UPDATE_QUEUE",
  UPDATE_CONFIGURATION = "UPDATE_CONFIGURATION",
}

export type EventData =
  | {
      event: EmitterEvents.UPDATE_CONFIGURATION;
      callback: (config: IGameConfig) => void;
    }
  | {
      event: EmitterEvents.ELEVATOR_ARRIVED;
      callback: (floorIndex: number) => void;
    }
  | {
      event: EmitterEvents.CALL_ELEVATOR;
      callback: () => void;
    }
  | {
      event: EmitterEvents.UPDATE_QUEUE;
      callback: (action: "add" | "remove", passenger: Passenger) => void;
    };
export type EventDataType<T> = Parameters<
  Extract<EventData, { event: T }>["callback"]
>;
