# Changelog

## 2.0.0 — Unreleased

The four React wrappers in one package, one sub-path per component, built
for the 2.0 cores and React 19.3+:

| Sub-path | Replaces |
| --- | --- |
| `@arraypress/waveform-react/player` | `@arraypress/waveform-player-react` 0.9.0 |
| `@arraypress/waveform-react/bar` | `@arraypress/waveform-bar-react` 0.5.0 |
| `@arraypress/waveform-react/playlist` | `@arraypress/waveform-playlist-react` 0.5.0 |
| `@arraypress/waveform-react/sounds` | `@arraypress/waveform-sounds-react` 0.2.1 |

Each sub-path exports the same names, props, refs and types as the package
it replaces, plus the additions below. Moving over means changing the import
path, installing the 2.0 cores and being on React 19.3+.

### Requirements
- **React 19.3+ only** (`react` peer `^19.3.0`; React 18 is no longer
  supported).
- **The 2.0 cores**: every core peer is `^2.0.0` — `@arraypress/waveform-player`,
  `-bar`, `-playlist` and `-sounds`. They stay optional peers: install only
  the cores of the components you use.
- **Node 22.12+** (`engines`), as the cores.
- **Browsers**: the cores' 2.0 floor, Chrome/Edge 111, Firefox 114,
  Safari 16.4.

### Added — player (`./player`)
- Props for the 2.0 player options, each forwarded to the core and
  re-creating the player when it changes:
  - `duration` — the track's length in seconds, known before the audio
    loads, so the total time, markers and seeks work with `preload: 'none'`
    before anything is fetched.
  - `lazy` — build the player now, load and draw it when it nears the
    viewport.
  - `loop`, `showLoop`, `loopLabel` — whole-track looping and its toggle
    button.
  - `showVolume`, `volume`, `volumeLabel`, `muteLabel` — mute toggle and
    volume slider, and the initial volume.
  - `showDownload`, `downloadUrl`, `downloadName`, `downloadLabel` — a
    download link for the track.

  `duration`, `downloadUrl` and `downloadName` are per-track: they follow
  `url` (a new `url` re-creates the player with the values given with it).
- Event props `onSeek`, `onRateChange`, `onVolumeChange` and `onLoop`, for
  the 2.0 core's `waveformplayer:seek` / `ratechange` / `volumechange` /
  `loop` events. Each receives the event's `detail` (`WaveformSeekEventDetail`
  and friends, exported from `./player` with `AudioCrossOrigin`). Like the
  other callbacks, a new handler never re-creates the player. They concern
  the player's own audio, so they don't fire with `audioMode: 'external'`.
- `waveform` accepts compact `wp1:` peaks (`"wp1:"` + base64url, about a
  quarter the size of a JSON array), as the 2.0 core does.
- JSX typing for the core's `<waveform-player>` custom element
  (`WaveformPlayerElementProps`): with the element registered (import
  `@arraypress/waveform-player`), `<waveform-player src="/a.mp3"
  duration={187} waveform-style="bars" />` typechecks.

### Added — playlist (`./playlist`)
- Track `duration` is seconds or a clock string (`225`, `'3:45'`,
  `'1:02:03'`); playlist 2.0 also gives it to the player.
- Track `downloadUrl` / `downloadName`, rendered as `data-download-url` /
  `data-download-name`.
- Track `waveform` accepts `wp1:` peaks.
- Props `showVolume`, `volume`, `showDownload`, `volumeLabel`, `muteLabel`
  and `downloadLabel`, which the playlist passes to its player.

### Added — bar (`./bar`)
- Trigger `duration` documented as seconds or a clock string, and
  `waveform` as accepting `wp1:` peaks: bar 2.0 passes both to the player.

### Changed
- **ES modules only.** No CommonJS build (`.cjs`, `.d.cts`) and no
  `require` export conditions, like the 2.0 cores. `require()` still works
  on Node 22.12+, which loads ES modules through it.
- **Components are React 19 function components with a `ref` prop** instead
  of `forwardRef` wrappers. `ref={…}` works as before, with the same handle
  types (`ComponentRef<typeof WaveformPlayer>` is `WaveformPlayerHandle`).
- The playlist props no longer accept options the playlist drops (`loop`,
  `showLoop`, `loopLabel`, `lazy`, like `audioMode` before them) or the
  per-track `duration` / `downloadUrl` / `downloadName` (set those per track).
- The bar's types come from the bar itself (it generates them in 2.0); the
  local shim declaring the module is gone.
- Built with tsdown instead of tsup, with declarations from TypeScript 7.
- No root `.` entry: import a sub-path.

### Removed
- Typing fallbacks for playlist cores before 1.8.0, and the named-export
  fallback used when loading a core (a CommonJS interop shape the ESM-only
  cores can't produce).
