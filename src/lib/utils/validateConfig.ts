import { configurationLimits } from "../configs/limits";
import { IGameConfig } from "../types";

export const validateConfig = (config: IGameConfig) => {
  const { elevatorCapacity, floors } = configurationLimits;
  if (config.floors < floors.min || config.floors > floors.max) {
    throw new Error(`Floors must be between ${floors.min} and ${floors.max}`);
  }

  if (config.elevatorCapacity < 2 || config.elevatorCapacity > 4) {
    throw new Error(
      `Elevator capacity must be between ${elevatorCapacity.min} and ${elevatorCapacity.max}`,
    );
  }
  return { ...config };
};
export const isSameConfing = (
  prevConfig: IGameConfig,
  newConfig: IGameConfig,
) => {
  let isSame = true;

  for (const k in prevConfig) {
    const key = k as keyof IGameConfig;
    const prevValue = prevConfig[key];
    const newValue = newConfig[key];

    if (prevValue !== newValue) {
      isSame = false;
      break;
    }
  }
  return isSame;
};
