import { App } from "./core/App";
import { gameConfiguration } from "./lib";

(async () => {
  const app = new App();
  await app.init(gameConfiguration);
})();
