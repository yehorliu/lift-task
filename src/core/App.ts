import { IGameConfig } from "../lib";
import { GameController } from "./controllers";
import { Engine } from "./Engine";
import { EventManager } from "./eventManager";
import { EmitterEvents } from "./eventManager/eventTypes";
import { MainScene } from "./MainScene";
import { ConfigurationService } from "./services/configurationService";

export class App {
  private engine!: Engine;
  private scene!: MainScene;
  private controller!: GameController;
  private eventManager: EventManager = new EventManager();

  private configurationService: ConfigurationService;
  constructor() {
    this.configurationService = new ConfigurationService(this.eventManager);
    this.engine = new Engine();

    this.eventManager.listen({
      event: EmitterEvents.UPDATE_CONFIGURATION,
      callback: (config) => {
        this.updateConfiguration(config);
      },
    });
  }

  init = async (config: IGameConfig) => {
    this.configurationService.init(config);
    await this.engine.init();

    this.scene = new MainScene(this.engine.screen);
    this.scene.draw(config);
    this.engine.stage.addChild(this.scene.container);

    this.controller = new GameController(
      this.scene,
      this.engine,
      this.eventManager,
    );
    this.controller.init();
  };

  private updateConfiguration = async (config: IGameConfig) => {
    this.controller.destroy();
    this.scene.destroy();
    await this.init(config);
  };

  destroy = () => {
    this.eventManager.destroy();
    this.controller?.destroy();
    this.scene?.destroy();
    this.engine?.destroy();
  };
}
