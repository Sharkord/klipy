import {
  actions,
  createCallAction,
  useCanUseAction,
  usePush,
  useUserData,
} from "@sharkord/plugin-sdk/client";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@sharkord/ui";
import debounce from "lodash/debounce";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type UIEvent,
} from "react";
import type { TGif, TKlipy } from "../../../contract";
import { GifGrid } from "./gif-grid";
import { GifIcon } from "./gif-icon";
import {
  bodyStyle,
  contentStyle,
  emptyStateStyle,
  panelStyle,
  statusTextStyle,
  tabPanelStyle,
} from "./styles";
import { FAVORITES_LIMIT, toggleFavorite } from "./user-data";

const PER_PAGE = 16;
const DEBOUNCE_DELAY = 500;
const SEARCH_TAB = "search";
const FAVORITES_TAB = "favorites";

// module scope: it resolves the plugin id from the bundle url once
const callAction = createCallAction<TKlipy>();

type TBrowserButtonProps = {
  /** the composer this button sits in, which is not the selected channel in a thread */
  channelId: number;
};

const BrowserButton = memo(({ channelId }: TBrowserButtonProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(SEARCH_TAB);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<TGif[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);

  const canBrowse = useCanUseAction<TKlipy>("getTrendingGifs");
  const { data, save } = useUserData<TKlipy>();

  // save() replaces the whole record, and favorites is the only key in it
  const favorites = useMemo(() => data.favorites ?? [], [data.favorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((gif) => gif.id)),
    [favorites],
  );

  const loadPage = useCallback(
    async ({
      nextPage,
      nextQuery,
      append,
    }: {
      nextPage: number;
      nextQuery: string;
      append: boolean;
    }) => {
      const requestId = latestRequestIdRef.current + 1;

      latestRequestIdRef.current = requestId;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoadingInitial(true);
        setMessage(null);
      }

      try {
        const trimmedQuery = nextQuery.trim();

        const response = trimmedQuery
          ? await callAction("searchGifs", {
              query: trimmedQuery,
              page: nextPage,
              perPage: PER_PAGE,
            })
          : await callAction("getTrendingGifs", {
              page: nextPage,
              perPage: PER_PAGE,
            });

        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setHasMore(response.hasMore);
        setPage(nextPage);

        setGifs((current) => {
          if (!append) {
            return response.gifs;
          }

          const existingIds = new Set(current.map((gif) => gif.id));
          const extraGifs = response.gifs.filter(
            (gif) => !existingIds.has(gif.id),
          );
          return [...current, ...extraGifs];
        });
      } catch {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setMessage(
          append
            ? "Could not load more GIFs right now."
            : nextQuery
              ? "Could not find GIFs for that search."
              : "Could not load trending GIFs.",
        );
      } finally {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }

        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((nextQuery: string) => {
        setSearchQuery(nextQuery);
      }, DEBOUNCE_DELAY),
    [],
  );

  useEffect(() => {
    if (!open) {
      debouncedSetSearchQuery.cancel();
      return;
    }

    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [debouncedSetSearchQuery, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      debouncedSetSearchQuery.cancel();
      setSearchQuery("");

      return;
    }

    debouncedSetSearchQuery(trimmedQuery);
  }, [debouncedSetSearchQuery, open, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setPage(1);
    setHasMore(true);
    setGifs([]);

    loadPage({
      nextPage: 1,
      nextQuery: searchQuery,
      append: false,
    });
  }, [loadPage, open, searchQuery]);

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setTab(SEARCH_TAB);
      setQuery("");
      setSearchQuery("");
      setMessage(null);
    }
  }, []);

  const handleTabChange = useCallback((nextTab: string) => {
    setTab(nextTab);
    setMessage(null);
  }, []);

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setQuery(event.currentTarget.value.slice(0, 100)),
    [],
  );

  const handleSelect = useCallback(
    async (gif: TGif) => {
      try {
        await actions.sendMessage(channelId, gif.gifUrl);
      } catch {
        setMessage("Could not send that GIF.");
      }
    },
    [channelId],
  );

  // what /gif answers with. the command runs on the server, which can only
  // author messages as the plugin, so the invoker's own client posts it. every
  // session the user has open receives this, so the post is claimed first and
  // only one of them sends
  usePush<TKlipy>(async (push) => {
    try {
      const claimed = await callAction("claimGifPost", {
        requestId: push.requestId,
      });

      if (!claimed) {
        return;
      }

      await actions.sendMessage(push.channelId, push.gifUrl);
    } catch {
      setMessage("Could not post that GIF.");
    }
  });

  const handleToggleFavorite = useCallback(
    async (gif: TGif) => {
      const nextFavorites = toggleFavorite(favorites, gif);

      if (!nextFavorites) {
        setMessage(
          `You can keep ${FAVORITES_LIMIT} favorites. Remove one to add another.`,
        );

        return;
      }

      try {
        await save({ favorites: nextFavorites });
      } catch {
        setMessage("Could not update your favorites.");
      }
    },
    [favorites, save],
  );

  const handleGridScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (loadingInitial || loadingMore || !hasMore) {
        return;
      }

      const target = event.currentTarget as unknown as {
        scrollTop: number;
        clientHeight: number;
        scrollHeight: number;
      };

      const isNearBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 100;

      if (!isNearBottom) {
        return;
      }

      loadPage({
        nextPage: page + 1,
        nextQuery: searchQuery,
        append: true,
      });
    },
    [hasMore, loadPage, loadingInitial, loadingMore, page, searchQuery],
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!canBrowse}>
          <GifIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" style={panelStyle}>
        <Tabs value={tab} onValueChange={handleTabChange} style={bodyStyle}>
          <TabsList>
            <TabsTrigger value={SEARCH_TAB}>Search</TabsTrigger>
            <TabsTrigger value={FAVORITES_TAB}>
              {favorites.length ? `Favorites (${favorites.length})` : "Favorites"}
            </TabsTrigger>
          </TabsList>

          {message ? <p style={statusTextStyle}>{message}</p> : null}

          <TabsContent value={SEARCH_TAB} style={tabPanelStyle}>
            <div>
              <Input
                placeholder="Search Klipy GIFS..."
                value={query}
                onChange={handleQueryChange}
              />
            </div>

            <div style={contentStyle}>
              {!loadingInitial && gifs.length === 0 ? (
                <p style={emptyStateStyle}>No GIFs found.</p>
              ) : null}

              {loadingInitial ? (
                <p style={emptyStateStyle}>Loading GIFs...</p>
              ) : (
                <GifGrid
                  gifs={gifs}
                  favoriteIds={favoriteIds}
                  loadingMore={loadingMore}
                  onScroll={handleGridScroll}
                  onSelect={handleSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value={FAVORITES_TAB} style={tabPanelStyle}>
            <div style={contentStyle}>
              {favorites.length === 0 ? (
                <p style={emptyStateStyle}>
                  No favorites yet. Use the star on a GIF to keep it here.
                </p>
              ) : (
                <GifGrid
                  gifs={favorites}
                  favoriteIds={favoriteIds}
                  onSelect={handleSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
});

export { BrowserButton };
