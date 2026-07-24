import { EventEmitter } from "pixi.js";
import type { EventData } from "./eventTypes";
import { createActions } from "./utils/createActions";

export class EventManager {
  private emitter: EventEmitter = new EventEmitter();

  readonly actions;

  constructor() {
    this.actions = createActions(this.emitter);
  }

  private subscribeOnEvent = (data: EventData) => {
    const { event, callback } = data;
    this.emitter.on(event, callback);

    return () => {
      this.emitter.off(event, callback);
    };
  };
  listen = (data: EventData | EventData[]) => {
    if (Array.isArray(data)) {
      const clearFns = data.map((data) => this.subscribeOnEvent(data));

      return () => {
        clearFns.forEach((fn) => fn());
      };
    } else {
      return this.subscribeOnEvent(data);
    }
  };

  destroy = () => {
    this.emitter.removeAllListeners();
  };
}
