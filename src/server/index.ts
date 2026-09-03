import type { PluginContext, UnloadPluginContext } from "@sharkord/plugin-sdk";
import type { TKlipy } from "../contract";
import { getTrendingGifs, searchGifs } from "./klipy";

const SETTINGS = [
  {
    key: "apiKey",
    name: "Klipy API Key",
    description: "Your Klipy API key. Get one at https://klipy.com/developers",
    type: "secret",
    defaultValue: "",
  },
  {
    key: "customerId",
    name: "Klipy Customer ID",
    description: "Your Klipy Customer ID. Normally shows up in your profile.",
    type: "string",
    defaultValue: "",
  },
] as const;

const onLoad = async (ctx: PluginContext<TKlipy>) => {
  ctx.logger.log("Klipy plugin loaded");

  const settings = await ctx.settings.register(SETTINGS);

  // the sdk types a 'secret' setting as unknown, so the value is coerced here
  const getAuth = () => ({
    apiKey: String(settings.get("apiKey") ?? ""),
    customerId: settings.get("customerId"),
  });

  ctx.actions.register({
    name: "searchGifs",
    description: "Search Klipy for GIFs matching a query",
    executes: async (_invoker, payload) =>
      searchGifs({
        query: payload.query,
        page: payload.page,
        perPage: payload.perPage,
        ...getAuth(),
      }),
  });

  ctx.actions.register({
    name: "getTrendingGifs",
    description: "List the GIFs currently trending on Klipy",
    executes: async (_invoker, payload) =>
      getTrendingGifs({
        page: payload.page,
        perPage: payload.perPage,
        ...getAuth(),
      }),
  });

  ctx.ui.enable();
};

const onUnload = (ctx: UnloadPluginContext) => {
  ctx.logger.log("Klipy plugin unloaded");
};

export { onLoad, onUnload };
