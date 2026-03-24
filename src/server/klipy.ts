import type { TGif, TGifListResponse } from "../actions-contract";

type TAuthParams = {
  apiKey: string;
  customerId: string;
};

type TKlipyGifItem = {
  id: number | string;
  title?: string;
  file?: {
    sm?: {
      gif?: {
        url?: string;
      };
    };
    md?: {
      gif?: {
        url?: string;
      };
    };
    hd?: {
      gif?: {
        url?: string;
      };
    };
  };
};

type TGetKlipyGifsParams = {
  query?: string;
  page?: number;
  perPage?: number;
} & TAuthParams;

const KLIPY_BASE_URL = "https://api.klipy.com";

const mapKlipyGif = (item: TKlipyGifItem): TGif | null => {
  const previewUrl = item.file?.sm?.gif?.url ?? item.file?.md?.gif?.url;
  const gifUrl =
    item.file?.md?.gif?.url ?? item.file?.hd?.gif?.url ?? previewUrl;

  if (!previewUrl || !gifUrl) {
    return null;
  }

  return {
    id: String(item.id),
    title: item.title ?? "GIF",
    gifUrl,
    previewUrl,
  };
};

const getKlipyGifs = async (
  params: TGetKlipyGifsParams = {
    apiKey: "",
    customerId: "",
  },
): Promise<TGifListResponse> => {
  const query = params.query?.trim();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 8;
  const endpoint = query ? "search" : "trending";

  const searchParams = new URLSearchParams({
    customer_id: params.customerId,
    per_page: String(perPage),
    page: String(page),
    format_filter: "gif",
  });

  if (query) {
    searchParams.set("q", query);
  }

  const response = await fetch(
    `${KLIPY_BASE_URL}/api/v1/${params.apiKey}/gifs/${endpoint}?${searchParams.toString()}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch GIFs from Klipy.");
  }

  const payload = (await response.json()) as {
    data?: {
      data?: TKlipyGifItem[];
      pagination?: {
        page?: number;
        total_pages?: number;
      };
    };
  };

  const gifs = (payload.data?.data ?? [])
    .map(mapKlipyGif)
    .filter((gif): gif is TGif => gif !== null);

  const pagination = payload.data?.pagination;

  const hasMore = pagination?.total_pages
    ? (pagination.page ?? page) < pagination.total_pages
    : gifs.length >= perPage;

  return {
    gifs,
    hasMore,
  };
};

const getTrendingGifs = async (
  params: {
    page?: number;
    perPage?: number;
  } & TAuthParams,
): Promise<TGifListResponse> =>
  getKlipyGifs({
    page: params.page,
    perPage: params.perPage,
    apiKey: params.apiKey,
    customerId: params.customerId,
  });

const searchGifs = async (
  params: {
    query: string;
    page?: number;
    perPage?: number;
  } & TAuthParams,
): Promise<TGifListResponse> =>
  getKlipyGifs({
    query: params.query,
    page: params.page,
    perPage: params.perPage,
    apiKey: params.apiKey,
    customerId: params.customerId,
  });

export { getTrendingGifs, searchGifs };
