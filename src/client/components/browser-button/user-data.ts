import type { TGif } from "../../../contract";

// userData is a single json blob with a 64 kb server side cap, so the list is
// bounded rather than left to grow into a rejected save
const FAVORITES_LIMIT = 100;

/**
 * Adds or removes the gif. Returns null when the list is full, so the caller
 * can say so rather than silently dropping someone's oldest favorite.
 */
const toggleFavorite = (favorites: TGif[], gif: TGif): TGif[] | null => {
  const without = favorites.filter((item) => item.id !== gif.id);

  if (without.length !== favorites.length) {
    return without;
  }

  if (favorites.length >= FAVORITES_LIMIT) {
    return null;
  }

  return [gif, ...favorites];
};

export { FAVORITES_LIMIT, toggleFavorite };
