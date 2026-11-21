# CLAUDE.md — @arraypress/waveform-react

React 19.3+ components for the WaveformPlayer family, one sub-path each:
`./player`, `./bar`, `./playlist`, `./sounds` (merged in 2.0 from
`waveform-{player,bar,playlist,sounds}-react`; their histories are in those
repos). No root entry: each component `import()`s its core, and a bundler
resolves every dynamic import at build time, so a combined entry would fail
to build without every core installed. The cores are optional peers.

## Commands (the gate before every commit)
- `npm run typecheck` — `tsc --noEmit` (TypeScript 7), including the
  `*.typecheck.ts(x)` type-assertion files. 0 errors.
- `npm test` — Vitest, one project per component (`vitest.config.ts`).
- `npm run lint` — Biome; the policy and why each rule is off are in `biome.jsonc`.
- `npm run build` — tsdown: `dist/<name>/index.{js,d.ts}`, ES modules only.
- `npm run test:pack` (after a build) — packs this package and the cores,
  installs them into throwaway consumers: import + `require()` of every
  sub-path, types under bundler / nodenext (ESM and CJS) / node10 (TS 6, via
  `typesVersions`), bundling, and a player-only consumer that must bundle
  `./player` and fail to bundle `./bar`. Run it when touching `exports`,
  `files`, `typesVersions` or the build. Needs network.

## The cores are `file:` devDependencies — on purpose, for now
`@arraypress/waveform-{player,bar,playlist,sounds}` are
`file:../waveform-<name>`: the sibling checkouts on branch `ts` (2.0.0, not on
npm yet). npm links them, so their real paths sit outside this repo; that is
why `vitest.config.ts` sets `server.fs.allow` (the drift tests read the cores'
files) and `server.deps.inline` for the player's `src/` (TypeScript with `.js`
specifiers that only Vite resolves). The peers are `^2.0.0`. Once 2.0 is
published, switch the devDependencies to `^2.0.0`; `test:pack` packs `file:`
cores and installs anything else from npm, and the peer-range tests expect
`file:` today (update them in the same change).

## Toolchain
TypeScript 7, tsdown, Vitest 5, Biome 2, React 19.3 — the newest each (checked
2026-11-21). React 18 is not supported: the components take `ref` as a plain
prop (no `forwardRef`). `test/ref-api.typecheck.ts` pins the ref contract
consumers see (`ComponentRef` = the handle type, object and callback refs,
wrong refs rejected); keep it passing.

## Per-option forwarding rules

The prop **types** derive from the cores (`Omit<WaveformPlayerOptions, …>`,
`WaveformSoundsOptions`, …), so a new core option typechecks here for free —
and then does nothing, because runtime forwarding is a hand-written
allowlist. Each sub-path has a drift test that reads the installed core and
fails until a new option is forwarded or listed in its `NOT_FORWARDED` map
with a reason. After a core change, rerun the tests: they read the sibling
checkout directly.

### `./player` — `src/player/WaveformPlayer.tsx`
A new option needs **both**:
1. `if (props.<key> !== undefined) opts.<key> = props.<key>;` in `buildLibraryOptions`.
2. `props.<key>,` in the remount `useEffect` deps array.

Skip (2) and it works on mount but a change at runtime does nothing.
`test/player/forwarding-drift.test.tsx` checks both against the core's option
keys (`types/types.d.ts`) ∪ `DEFAULT_OPTIONS` (`src/js/themes.ts`, imported);
a new option with a `null` default needs a sample pair in
`test/player/core-options.ts`.
- `NOT_FORWARDED`: `style` (React's CSS prop on the host; the visual style is
  `waveformStyle`). `FORWARDED_AS`: `src` → `url`.
- Per-track options (`duration`, `downloadUrl`, `downloadName`, like `url`,
  `title`, `waveform`, `markers`) follow `url` because a `url` change
  remounts. If the component ever switches tracks with `loadTrack()` instead,
  pass them through that call — the core resets them per track.
- Callbacks (`onLoad` … `onPreviousTrack`) are stable trampolines reading
  `callbacksRef`, never deps. Exception: the *presence* of `onNextTrack` /
  `onPreviousTrack` is a dep (the core shows lock-screen buttons for them).
- 2.0 events: `onSeek`, `onRateChange`, `onVolumeChange`, `onLoop` (`EVENT_PROPS`)
  listen for `waveformplayer:<name>` on the host and get the event's `detail`
  — one argument, the core's detail type (same as the Vue package's emits).
  Events whose `detail.player` isn't this effect's player are ignored. A new
  core event: add it to `EVENT_PROPS`, the props type, `index.ts` exports and
  a test.
- `src/player/element.ts`: JSX typing for the core's `<waveform-player>`
  (a `declare module 'react'` augmentation), names derived from the core's
  options; `test/player/element.test.ts` compares them with the element's
  `observedAttributes`.
- Loads `@arraypress/waveform-player/no-autoinit`, never the root (which scans
  the page and registers the element); the behaviour suite mocks the root to throw.

### `./playlist` — `src/playlist/WaveformPlaylist.tsx`
Same two edits as the player (`buildPlaylistOptions` + remount deps).
Forward a new *player* option only if the playlist passes it to its player.
`test/playlist/forwarding-drift.test.tsx` covers `WaveformPlaylistOptions` ∪
`WaveformPlayerOptions` (both cores' `types/types.d.ts`).
- `NOT_FORWARDED`, per-track (rendered on each `[data-track]` from `tracks`):
  `url`, `src`, `title`, `artist`, `artwork`, `album`, `markers`, `waveform`,
  `duration`, `downloadUrl`, `downloadName`.
- `NOT_FORWARDED`, dropped by the playlist core: `audioMode`, `loop`,
  `showLoop`, `lazy`; plus `loopLabel` (names the loop toggle, which never
  renders). These are also `Omit`ted from the props type
  (`test/playlist/types.typecheck.ts`). `style` is the host's CSS.
- Track markup: `data-duration` (seconds or clock string), `data-download-url`,
  `data-download-name`, `data-waveform` (array → JSON; strings incl. `wp1:`
  verbatim), `data-markers` (JSON), `[data-chapter]` children. A new per-track
  field goes in `WaveformPlaylistTrackInput`, the markup and `NOT_FORWARDED`.

### `./bar` — `src/bar/types.ts`
`config` goes to `window.WaveformBar.init()` **verbatim**; the type is the
contract. `WaveformBarConfig` is hand-written and kept key-for-key identical
in all four framework packages (`SHARED_CONFIG_KEYS`).
`test/bar/config-drift.test.ts` parses the bar's `DEFAULTS` from
`node_modules/@arraypress/waveform-bar/src/js/core.ts` (a relative path: the
bar's `exports` blocks `src/`) and fails on an untyped key (unless in
`NOT_TYPED`: the `on*` callbacks — use the `waveformbar:*` events) or a typed
key the bar lacks (unless in `NOT_IN_DEFAULTS`: `mode`). No shim: the bar
ships its own declarations (and a `declare global` for `Window.WaveformBar`
and the `waveformbar:*` events) — don't re-declare the module. Trigger
`duration` (seconds or clock string) and `waveform` (`wp1:` too) pass through
as `data-wb-*`.

### `./sounds` — `src/sounds/WaveformSounds.tsx`
1. `buildSoundsOptions` allowlist; 2. the mount effect's deps (`valueKey()`
for arrays / objects); 3. if it shapes the markup, pass it to `renderSounds`
and the `html` memo deps. `test/sounds/forwarding-drift.test.tsx` reads
`WaveformSoundsOptions` from the core's `types/types.d.ts`; `NOT_FORWARDED`
is empty. The server markup is the contract (`test/sounds/ssr.test.tsx`,
plus hydration in `WaveformSounds.test.tsx`); `idPrefix` must never depend
on anything that differs between server and client.

## Conventions
- Every component freezes the host `class` at first render and syncs
  `className` with `classList` (the cores own part of the class list).
- Logging prefixes: `[WaveformPlayerReact]`, `[WaveformBarReact]`,
  `[WaveformPlaylistReact]`, `[WaveformSoundsReact]`.
- A change gets a test and a CHANGELOG entry.

## Cross-repo
An option change in a core is a family-wide batch: load the
`waveform-release` skill. The package scope rename (`@waveformplayer/*`)
happens later for every package at once: don't rename here.
