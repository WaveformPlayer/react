# Changelog

## 2.0.0 — Unreleased

The four React wrappers in one package, one sub-path per component:

| Sub-path | Replaces |
| --- | --- |
| `@arraypress/waveform-react/player` | `@arraypress/waveform-player-react` 0.9.0 |
| `@arraypress/waveform-react/bar` | `@arraypress/waveform-bar-react` 0.5.0 |
| `@arraypress/waveform-react/playlist` | `@arraypress/waveform-playlist-react` 0.5.0 |
| `@arraypress/waveform-react/sounds` | `@arraypress/waveform-sounds-react` 0.2.1 |

Each sub-path exports the same names, props, refs and behaviour as the package
it replaces. Only the import path changes.

### Changed
- Built with tsdown instead of tsup, with declarations from TypeScript 7.
- The cores are optional peer dependencies: install only the ones you use.
- `@arraypress/waveform-player` peer floor is `^1.27.0` for every sub-path
  (the player component needs its `/no-autoinit` entry). The bar, playlist and
  sounds packages had accepted older cores (`^1.8.0`, `^1.24.5`, `^1.24.5`).
- No root `.` entry: import a sub-path.
