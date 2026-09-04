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
  as you, not as the plugin, to the channel whose composer the button sits in.
- The star on each GIF adds it to your favorites, or takes it back out. Favorites are per
  user and capped at 100, since all plugin user data shares a 64 kb budget.
- The button is disabled if a server owner has restricted the plugin's actions for your roles.
- `/gif <query>` posts a GIF to the channel **as you**, picked at random from the top 24
  matches so re-running it gives you something else.

`/gif` runs on the server, and a plugin server can only author messages as the plugin
itself. So the command searches, then pushes the result to the client of the person who
ran it, and that client posts it the same way the picker does. A push reaches every
session that user has open, so each one claims the post first and only the winner sends
it. Two consequences: the GIF lands in the channel even when the command was typed in a
thread, since the client send has no thread argument, and nothing is posted at all if the
invoker has no channel view open by the time the push arrives.

## Development

```bash
bun run check-types
bun run build
```

`build.ts` copies the built plugin straight into a local Sharkord `data/plugins` directory;
adjust the path at the top of that file, or drop the `copyPluginToSharkord` call.

## Screenshot

![klipy screenshot](https://i.imgur.com/GbWRoaE.png)
