import { IGameConfig } from "../types";

type ConfigKeys = keyof IGameConfig;
type ConfigPanelListeners = {
  onInput?: <K extends ConfigKeys>(key: K, value: IGameConfig[K]) => void;

  onBlur?: <K extends ConfigKeys>(
    key: K,
    value: IGameConfig[K],
  ) => IGameConfig[K];

  onApply?: () => void;
};

export const bindConfigPanel = ({
  onInput,
  onBlur,
  onApply,
}: ConfigPanelListeners) => {
  const panel = document.getElementById("config-panel");

  if (!panel) {
    return;
  }

  const inputs = panel.querySelectorAll<HTMLInputElement>("input");
  const applyButton = panel.querySelector<HTMLButtonElement>(
    ".config-container__submit",
  );

  const elements: Record<ConfigKeys, HTMLInputElement> = {} as Record<
    ConfigKeys,
    HTMLInputElement
  >;

  inputs.forEach((input) => {
    const name = input.name as ConfigKeys;
    elements[name] = input;
    input.addEventListener("input", () => {
      onInput?.(name, Number(input.value));
    });

    input.addEventListener("blur", () => {
      const newValue = onBlur?.(name, Number(input.value));

      if (newValue !== undefined) {
        input.value = String(newValue);
      }
    });
  });

  applyButton?.addEventListener("click", (e) => {
    e.preventDefault();
    onApply?.();
  });

  return {
    remove: () => {
      inputs.forEach((input) => {
        input.remove();
      });

      applyButton?.remove();
    },
    update: <K extends ConfigKeys>(key: K, value: IGameConfig[K]) => {
      elements[key].value = String(value);
    },
  };
};
