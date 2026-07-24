import { Easing, Group, Tween } from "@tweenjs/tween.js";
import { Container } from "pixi.js";

const defaultEasing = Easing.Linear.None;
interface IMoveParams<T> {
  onUpdate?: (data: T) => void;
  onComplete?: () => void;
  timeMs?: number;
  easing?: typeof defaultEasing;
}

interface IActiveTween {
  tween: Tween<Container>;
  resolve: () => void;
}

export class MoveService {
  group = new Group();
  private activeTweens = new Map<Container, IActiveTween>();

  move = <T extends Container>(
    element: T,
    to: Partial<Pick<T, "x" | "y">>,
    params?: IMoveParams<T>,
  ) => {
    this.stop(element);

    return new Promise<void>((res) => {
      const tw = new Tween(element)
        .to({ ...to }, params?.timeMs)
        .easing(params?.easing ?? defaultEasing)
        .onComplete(() => {
          if (params?.onComplete) params.onComplete();
          this.group.remove(tw);
          this.activeTweens.delete(element);
          res();
        });

      if (params?.onUpdate) {
        tw.onUpdate(params.onUpdate);
      }
      this.activeTweens.set(element, { tween: tw, resolve: res });
      this.group.add(tw);
      tw.start();
    });
  };

  private stop = (element: Container) => {
    const active = this.activeTweens.get(element);
    if (!active) return;
    active.tween.stop();
    this.group.remove(active.tween);
    this.activeTweens.delete(element);
    active.resolve();
  };

  onUpdate = (time?: number | undefined) => {
    this.group.update(time);
  };
  clear = () => {
    this.group.removeAll();
    this.activeTweens.clear();
  };
}
