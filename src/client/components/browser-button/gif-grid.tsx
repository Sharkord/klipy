import { memo, useCallback, type UIEvent } from "react";
import type { TGif } from "../../../actions-contract";
import { cardStyle, gridStyle, imageStyle, loadingMoreStyle } from "./styles";
import { useSelectedChannelId } from "../../store/hooks";
import { actions } from "../../store";

type TGifGridProps = {
  gifs: TGif[];
  loadingMore: boolean;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
};

const GifGrid = memo(({ gifs, loadingMore, onScroll }: TGifGridProps) => {
  const selectedChannelId = useSelectedChannelId();

  const onImageClick = useCallback(
    async (gif: TGif) => {
      if (!selectedChannelId) return;

      await actions.sendMessage(selectedChannelId, gif.gifUrl);
    },
    [selectedChannelId],
  );

  return (
    <div style={gridStyle} onScroll={onScroll}>
      {gifs.map((gif) => (
        <button
          key={gif.id}
          type="button"
          style={cardStyle}
          onClick={() => onImageClick(gif)}
          title={gif.title || "GIF"}
        >
          <img
            src={gif.previewUrl}
            alt={gif.title || "GIF"}
            loading="lazy"
            style={imageStyle}
          />
        </button>
      ))}

      {loadingMore ? (
        <p style={loadingMoreStyle}>Loading more GIFs...</p>
      ) : null}
    </div>
  );
});

export { GifGrid };
