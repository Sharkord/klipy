import { expect, test } from "bun:test";
import type { TGif } from "../../../contract";
import { FAVORITES_LIMIT, toggleFavorite } from "./user-data";

const gif = (id: string): TGif => ({
  id,
  title: id,
  gifUrl: `${id}.gif`,
  previewUrl: `${id}-sm.gif`,
});

const list = (length: number) =>
  Array.from({ length }, (_, index) => gif(`g${index}`));

test("toggleFavorite adds a new gif at the front", () => {
  const result = toggleFavorite([gif("a")], gif("b"));

  expect(result?.map((item) => item.id)).toEqual(["b", "a"]);
});

test("toggleFavorite removes one that is already favorited", () => {
  const result = toggleFavorite([gif("a"), gif("b")], gif("a"));

  expect(result?.map((item) => item.id)).toEqual(["b"]);
});

test("toggleFavorite refuses to add past the limit", () => {
  expect(toggleFavorite(list(FAVORITES_LIMIT), gif("new"))).toBeNull();
});

test("toggleFavorite still removes when the list is full", () => {
  expect(toggleFavorite(list(FAVORITES_LIMIT), gif("g0"))).toHaveLength(
    FAVORITES_LIMIT - 1,
  );
});
