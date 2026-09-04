type TGif = {
  id: string;
  title: string;
  gifUrl: string;
  previewUrl: string;
};

type TGifListResponse = {
  gifs: TGif[];
  hasMore: boolean;
};

// the single contract both halves share: the server reads it through
// PluginContext<TKlipy>, the client through createCallAction and useUserData
type TKlipy = {
  actions: {
    searchGifs: {
      payload: { query: string; page?: number; perPage?: number };
      response: TGifListResponse;
    };
    getTrendingGifs: {
      payload: { page?: number; perPage?: number };
      response: TGifListResponse;
    };
    claimGifPost: {
      payload: { requestId: string };
      response: boolean;
    };
  };
  commands: {
    gif: { args: { query: string }; response: string };
  };
  // a /gif result on its way to the invoker's own client, which is what posts
  // it: only a client can author a message as the signed in user
  push: { requestId: string; channelId: number; gifUrl: string };
  // optional because useUserData reports an empty object until the first load
  userData: { favorites?: TGif[] };
};

export type { TGif, TGifListResponse, TKlipy };
