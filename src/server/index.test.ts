import { expect, test } from "bun:test";
import type { PluginContext } from "@sharkord/plugin-sdk";
import type { TKlipy } from "../contract";
import { onLoad } from ".";

type TRegistered = Record<
  string,
  (ctx: { userId: number }, payload: never) => Promise<unknown>
>;

// the sdk ships no fake context, so this is the smallest one onLoad touches
const loadWithFakeContext = async (values: Record<string, unknown>) => {
  const actions: TRegistered = {};

  let uiEnabled = false;

  const ctx = {
    logger: { log: () => {}, debug: () => {}, error: () => {} },
    settings: {
      register: async () => ({
        get: (key: string) => values[key],
        set: () => {},
      }),
    },
    actions: {
      register: (action: { name: string; executes: TRegistered[string] }) => {
        actions[action.name] = action.executes;
      },
    },
    ui: { enable: () => (uiEnabled = true), disable: () => {} },
  } as unknown as PluginContext<TKlipy>;

  await onLoad(ctx);

  return { actions, uiEnabled };
};

test("onLoad registers both actions and enables the ui", async () => {
  const { actions, uiEnabled } = await loadWithFakeContext({});

  expect(Object.keys(actions).sort()).toEqual(["getTrendingGifs", "searchGifs"]);
  expect(uiEnabled).toBe(true);
});

test("searchGifs sends the registered credentials to klipy", async () => {
  const originalFetch = globalThis.fetch;

  let requestedUrl = "";

  globalThis.fetch = (async (url: string) => {
    requestedUrl = String(url);

    return Response.json({ data: { data: [], pagination: {} } });
  }) as unknown as typeof fetch;

  try {
    const { actions } = await loadWithFakeContext({
      apiKey: "key-123",
      customerId: "customer-456",
    });

    const response = await actions.searchGifs?.({ userId: 1 }, {
      query: "cat",
      perPage: 4,
    } as never);

    expect(requestedUrl).toContain("/api/v1/key-123/gifs/search");
    expect(requestedUrl).toContain("customer_id=customer-456");
    expect(requestedUrl).toContain("q=cat");
    expect(response).toEqual({ gifs: [], hasMore: false });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
