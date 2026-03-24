import { createRegisterAction, type PluginContext } from "@sharkord/plugin-sdk";
import { getTrendingGifs, searchGifs } from "./klipy";
import type { Actions } from "../actions-contract";

const onLoad = async (ctx: PluginContext) => {
  ctx.log("Klipy plugin loaded");

  const registerAction = createRegisterAction<Actions>(ctx);

  const settings = await ctx.settings.register([
    {
      key: "apiKey",
      name: "Klipy API Key",
      description:
        "Your Klipy API key. Get one at https://klipy.com/developers",
      type: "string",
      defaultValue: "",
    },
    {
      key: "customerId",
      name: "Klipy Customer ID",
      description: "Your Klipy Customer ID. Normally shows up in your profile.",
      type: "string",
      defaultValue: "",
    },
  ]);

  registerAction("searchGifs", async (invoker, payload) => {
    const [apiKey, customerId] = await Promise.all([
      settings.get("apiKey"),
      settings.get("customerId"),
    ]);

    return searchGifs({
      query: payload.query,
      page: payload.page,
      perPage: payload.perPage,
      apiKey: apiKey ?? "",
      customerId: customerId ?? "",
    });
  });

  registerAction("getTrendingGifs", async (invoker, payload) => {
    const [apiKey, customerId] = await Promise.all([
      settings.get("apiKey"),
      settings.get("customerId"),
    ]);

    return getTrendingGifs({
      page: payload.page,
      perPage: payload.perPage,
      apiKey: apiKey ?? "",
      customerId: customerId ?? "",
    });
  });

  ctx.ui.enable();
};

const onUnload = (ctx: PluginContext) => {
  ctx.log("Klipy plugin unloaded");
};

export { onLoad, onUnload };
