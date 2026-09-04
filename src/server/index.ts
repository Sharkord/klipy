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

// how many results the command picks from, so re-running it varies
const COMMAND_POOL_SIZE = 24;

// a push reaches every session the user has open, and one page can mount the
// picker twice (channel plus thread composer), so a post is claimed before it
// is sent and only the winner sends it
const MAX_PENDING_POSTS = 50;

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

  // requestId -> the user it was pushed to. bounded rather than expired: a
  // request nobody claims, because the tab was closed, ages out as newer ones
  // arrive, and there is no timer left running after an unload
  const pendingPosts = new Map<string, number>();

  const addPendingPost = (requestId: string, userId: number) => {
    if (pendingPosts.size >= MAX_PENDING_POSTS) {
      const oldest = pendingPosts.keys().next().value;

      if (oldest) {
        pendingPosts.delete(oldest);
      }
    }

    pendingPosts.set(requestId, userId);
  };

  ctx.actions.register({
    name: "claimGifPost",
    description: "Claims a pending /gif post so only one session sends it",
    executes: async (invoker, payload) => {
      // the owner check stops one user claiming another's post, and the delete
      // is what makes the second caller lose
      if (pendingPosts.get(payload.requestId) !== invoker.userId) {
        return false;
      }

      pendingPosts.delete(payload.requestId);

      return true;
    },
  });

  ctx.commands.register({
    name: "gif",
    description: "Post a GIF from Klipy to this channel",
    args: [
      {
        name: "query",
        description: "What to search for",
        type: "string",
        required: true,
      },
    ],
    executes: async (invoker, args) => {
      // set for every chat invocation, absent only when nothing was open
      if (!invoker.channelId) {
        throw new Error("Run this from a channel.");
      }

      const query = String(args.query ?? "").trim();

      if (!query) {
        throw new Error("Say what to search for, for example /gif cat.");
      }

      const { gifs } = await searchGifs({
        query,
        perPage: COMMAND_POOL_SIZE,
        ...getAuth(),
      });

      const gif = gifs[Math.floor(Math.random() * gifs.length)];

      if (!gif) {
        throw new Error(`No GIFs found for "${query}".`);
      }

      const requestId = crypto.randomUUID();

      addPendingPost(requestId, invoker.userId);

      // ctx.messages.send would author this as the plugin, so the invoker's own
      // client posts it instead and the gif comes from the person who asked
      ctx.push.toUser(invoker.userId, {
        requestId,
        channelId: invoker.channelId,
        gifUrl: gif.gifUrl,
      });

      return gif.title;
    },
  });

  ctx.ui.enable();
};

const onUnload = (ctx: UnloadPluginContext) => {
  ctx.logger.log("Klipy plugin unloaded");
};

export { onLoad, onUnload };
