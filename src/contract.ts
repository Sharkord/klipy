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
  };
  // optional because useUserData reports an empty object until the first load
  userData: { favorites?: TGif[] };
};

export type { TGif, TGifListResponse, TKlipy };
