import { actions, useStoreSelector } from ".";
import {
  currentVoiceChannelIdSelector,
  selectedChannelIdSelector,
} from "./selectors";
import type { Actions } from "../../actions-contract";
import { createCallAction } from "@sharkord/plugin-sdk";

export const useCurrentVoiceChannelId = () =>
  useStoreSelector(currentVoiceChannelIdSelector);

export const useSelectedChannelId = () =>
  useStoreSelector(selectedChannelIdSelector);

export const useCallAction = () => createCallAction<Actions>(actions);
