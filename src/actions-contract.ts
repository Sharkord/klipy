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

type Actions = {
  searchGifs: {
    payload: { query: string; page?: number; perPage?: number };
    response: TGifListResponse;
  };
  getTrendingGifs: {
    payload: { page?: number; perPage?: number };
    response: TGifListResponse;
  };
};

export type { Actions, TGif, TGifListResponse };
