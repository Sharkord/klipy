import { memo, type UIEvent } from "react";
import type { TGif } from "../../../contract";
import { StarIcon } from "./star-icon";
import {
  cardStyle,
  favoriteButtonStyle,
  gridStyle,
  imageButtonStyle,
  imageStyle,
  loadingMoreStyle,
} from "./styles";

type TGifGridProps = {
  gifs: TGif[];
  favoriteIds: Set<string>;
  loadingMore?: boolean;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  onSelect: (gif: TGif) => void;
  onToggleFavorite: (gif: TGif) => void;
};

const GifGrid = memo(
  ({
    gifs,
    favoriteIds,
    loadingMore,
    onScroll,
    onSelect,
    onToggleFavorite,
  }: TGifGridProps) => (
    <div style={gridStyle} onScroll={onScroll}>
      {gifs.map((gif) => {
        const favorited = favoriteIds.has(gif.id);

        return (
          <div key={gif.id} style={cardStyle}>
            <button
              type="button"
              style={imageButtonStyle}
              onClick={() => onSelect(gif)}
              title={gif.title || "GIF"}
            >
              <img
                src={gif.previewUrl}
                alt={gif.title || "GIF"}
                loading="lazy"
                style={imageStyle}
              />
            </button>

            <button
              type="button"
              style={favoriteButtonStyle}
              onClick={() => onToggleFavorite(gif)}
              title={favorited ? "Remove from favorites" : "Add to favorites"}
              aria-pressed={favorited}
            >
              <StarIcon filled={favorited} />
            </button>
          </div>
        );
      })}

      {loadingMore ? <p style={loadingMoreStyle}>Loading more GIFs...</p> : null}
    </div>
  ),
);

export { GifGrid };
