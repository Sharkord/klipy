import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@sharkord/ui";
import debounce from "lodash/debounce";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import type { TGif } from "../../../actions-contract";
import { GifGrid } from "./gif-grid";
import { GifIcon } from "./gif-icon";
import {
  bodyStyle,
  contentStyle,
  emptyStateStyle,
  panelStyle,
  statusTextStyle,
} from "./styles";
import { useCallAction } from "../../store/hooks";

const PER_PAGE = 16;
const DEBOUNCE_DELAY = 500;

const BrowserButton = memo(() => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<TGif[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestRequestIdRef = useRef(0);
  const callAction = useCallAction();

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
        setErrorMessage(null);
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

        setErrorMessage(
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
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setQuery("");
          setSearchQuery("");
          setErrorMessage(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <GifIcon />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" style={panelStyle}>
        <div style={bodyStyle}>
          <div>
            <Input
              placeholder="Search Klipy GIFS..."
              value={query}
              onChange={(event) =>
                setQuery(event.currentTarget.value.slice(0, 100))
              }
            />
          </div>

          <div style={contentStyle}>
            {errorMessage ? (
              <p style={statusTextStyle}>{errorMessage}</p>
            ) : null}

            {!loadingInitial && gifs.length === 0 ? (
              <p style={emptyStateStyle}>No GIFs found.</p>
            ) : null}

            {loadingInitial ? (
              <p style={emptyStateStyle}>Loading GIFs...</p>
            ) : (
              <GifGrid
                gifs={gifs}
                loadingMore={loadingMore}
                onScroll={handleGridScroll}
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

export { BrowserButton };
