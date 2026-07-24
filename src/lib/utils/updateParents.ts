import { Container, Point } from "pixi.js";
const point = new Point();

export const calcPositionInOtherParent = <El extends Container>(
  element: El,
  newParent: Container,
) => {
  point.set(element.x, element.y);
  const world = element.parent?.toGlobal(point);
  if (!world) return point.clone();
  const local = newParent.toLocal(world);
  return local;
};
export const updateParents = <El extends Container>(
  element: El,
  newParent: Container,
) => {
  if (element.parent === newParent) return;
  const newPos = calcPositionInOtherParent(element, newParent);
  if (newPos === null) return;
  element.position.copyFrom(newPos);
  newParent.addChild(element);
};
