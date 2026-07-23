import { Tween } from "@tweenjs/tween.js";

export const createTween = <T extends object>(target: T, to: Partial<T>) => {
  return new Promise<void>((resolve) => {
    new Tween(target)
      .to({ ...to })
      .onComplete(() => {
        resolve();
      })
      .start();
  });
};
