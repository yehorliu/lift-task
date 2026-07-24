import { EventEmitter } from "pixi.js";
import { Passenger } from "../../../components";
import { EmitterEvents, EventDataType } from "../eventTypes";
import { IGameConfig } from "../../../lib";

export const createActions = (emitter: EventEmitter) => {
  const handleAction = <T extends EmitterEvents>(
    event: T,
    ...data: EventDataType<T>
  ) => {
    emitter.emit(event, ...data);
  };

  return {
    updateConfiguration: (config: IGameConfig) => {
      handleAction(EmitterEvents.UPDATE_CONFIGURATION, config);
    },
    callElevator: () => {
      handleAction(EmitterEvents.CALL_ELEVATOR);
    },
    updateQueue: (action: "add" | "remove", passenger: Passenger) => {
      handleAction(EmitterEvents.UPDATE_QUEUE, action, passenger);
    },

    elevatorArrived: (floorIndex: number) => {
      handleAction(EmitterEvents.ELEVATOR_ARRIVED, floorIndex);
    },
  };
};
