# klipy

Use klipy to browse and send GIFs to text channels.

Built against Sharkord plugin SDK v2.

## Requirements

To use this plugin, you need to have a Klipy API key. You can get one from the [Klipy website](https://klipy.com/developers/).

The API key and customer ID can be set in the plugin settings. The API key is stored as a
secret setting, so it renders as a password field and is never sent back to the client.

## What it does

- A GIF button in the chat actions slot, opening a **Search** tab and a **Favorites** tab.
- Search has trending GIFs, debounced search and infinite scroll. Clicking a GIF sends it
  to the selected channel as you, not as the plugin.
- The star on each GIF adds it to your favorites, or takes it back out. Favorites are per
  user and capped at 100, since all plugin user data shares a 64 kb budget.
- The button is disabled if a server owner has restricted the plugin's actions for your roles.

## Development

```bash
bun run check-types
bun test
bun run build
```

`build.ts` copies the built plugin straight into a local Sharkord `data/plugins` directory;
adjust the path at the top of that file, or drop the `copyPluginToSharkord` call.

## Screenshot

![klipy screenshot](https://i.imgur.com/GbWRoaE.png)
