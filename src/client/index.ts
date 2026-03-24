import {
  PluginSlot,
  type TPluginComponentsMapBySlotId,
} from "@sharkord/plugin-sdk";
import { BrowserButton } from "./components/browser-button";

const components: TPluginComponentsMapBySlotId = {
  [PluginSlot.CHAT_ACTIONS]: [BrowserButton],
};

export { components };
