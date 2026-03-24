import type { SharkordState } from ".";

export const currentVoiceChannelIdSelector = (state: SharkordState) =>
  state.currentVoiceChannelId;

export const selectedChannelIdSelector = (state: SharkordState) =>
  state.selectedChannelId;
