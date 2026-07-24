import { IGameConfig, isSameConfing, validateConfig } from "../../lib";
import { configurationLimits } from "../../lib/configs/limits";
import { bindConfigPanel } from "../../lib/utils/bindConfigPanel";
import { EventManager } from "../eventManager";

export class ConfigurationService {
  private lastConfiguration?: IGameConfig;

  private limits = { ...configurationLimits };

  private configPanelState: IGameConfig = {
    elevatorCapacity: this.limits.elevatorCapacity.min,
    floors: this.limits.floors.min,
  };
  private panel;

  constructor(eventManager: EventManager) {
    this.panel = bindConfigPanel({
      onInput: this.onChange,
      onBlur: this.onBlur,
      onApply: () => {
        const newConfig = this.configPanelState;
        if (this.isSame(newConfig)) return;
        eventManager.actions.updateConfiguration(newConfig);
      },
    });
  }
  init = (config: IGameConfig) => {
    this.validate(config);
    this.updatePanel(config);
  };
  validate = (config: IGameConfig) => {
    validateConfig(config);

    this.lastConfiguration = { ...config };
  };

  isSame = (newConfig: IGameConfig) => {
    if (!this.lastConfiguration) return false;
    return isSameConfing(this.lastConfiguration, newConfig);
  };
  private updatePanel = (config: IGameConfig) => {
    for (const k in config) {
      const key = k as keyof IGameConfig;
      this.panel?.update(key, config[key]);
      this.onChange(key, config[key]);
    }
  };

  private onChange = (name: keyof IGameConfig, value: number) => {
    this.configPanelState[name] = value;
  };
  private onBlur = (name: keyof IGameConfig, value: number) => {
    const limits = this.limits[name];
    let newValue = value;
    if (limits) {
      const { min, max } = limits;
      if (value > max) {
        newValue = max;
      } else if (value < min) {
        newValue = min;
      }
    }

    this.onChange(name, newValue);
    return newValue;
  };
}
