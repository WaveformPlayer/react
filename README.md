# WaveformPlayer for React

React components for the WaveformPlayer family: the player, the persistent bar,
the playlist and the sound list. Each component has its own sub-path, and you
install only the cores you use.

**[Documentation](https://docs.waveformplayer.com/frameworks/react/)**

## Sub-paths

| Import | Components | Cores to install |
| --- | --- | --- |
| `@arraypress/waveform-react/player` | `WaveformPlayer` | `@arraypress/waveform-player` (1.27.0+) |
| `@arraypress/waveform-react/bar` | `WaveformBar`, `WaveformBarTrigger` | `@arraypress/waveform-bar`, `@arraypress/waveform-player` |
| `@arraypress/waveform-react/playlist` | `WaveformPlaylist` | `@arraypress/waveform-playlist`, `@arraypress/waveform-player` |
| `@arraypress/waveform-react/sounds` | `WaveformSounds` | `@arraypress/waveform-sounds`, `@arraypress/waveform-player` |

There is no root import. Each component loads its core with a dynamic
`import()`, and bundlers resolve every dynamic import at build time, so one
combined entry would fail to build unless every core were installed. The cores
are optional peer dependencies for the same reason.

Each sub-path exports exactly what the old single-component package exported
(`@arraypress/waveform-player-react` and the others): same names, props, refs
and types. Moving over means changing the import path.

## Player

```bash
npm install @arraypress/waveform-react @arraypress/waveform-player react
```

```tsx
import '@arraypress/waveform-player/dist/waveform-player.css';
import { WaveformPlayer } from '@arraypress/waveform-react/player';

<WaveformPlayer url="/track.mp3" title="My Song" artist="The Artist" waveformStyle="mirror" />
```

## Bar

```bash
npm install @arraypress/waveform-react @arraypress/waveform-bar @arraypress/waveform-player react
```

```tsx
import { WaveformBar, WaveformBarTrigger } from '@arraypress/waveform-react/bar';

function App() {
  return (
    <>
      {/* Render once in your layout */}
      <WaveformBar config={{ persist: true, continuous: true }} />

      {/* Trigger buttons anywhere */}
      <WaveformBarTrigger url="/audio/track.mp3" title="My Track" artist="Producer" />
    </>
  );
}
```

## Playlist

```bash
npm install @arraypress/waveform-react @arraypress/waveform-playlist @arraypress/waveform-player react
```

```tsx
import { WaveformPlaylist } from '@arraypress/waveform-react/playlist';

<WaveformPlaylist tracks={[{ url: '/a.mp3', title: 'A', artist: 'Artist' }]} />
```

## Sounds

```bash
npm install @arraypress/waveform-react @arraypress/waveform-sounds @arraypress/waveform-player react
```

Once, at your app entry:

```ts
import '@arraypress/waveform-player';            // the audio engine (window.WaveformPlayer)
import '@arraypress/waveform-player/styles.css';
import '@arraypress/waveform-sounds/styles.css';
```

```tsx
import { WaveformSounds } from '@arraypress/waveform-react/sounds';

<WaveformSounds
  sounds={[
    { url: '/s/bass-01.mp3', title: 'Bass Loop 01', type: 'Bass', bpm: 128, key: 'Fm' },
    { url: '/s/drum-01.mp3', title: 'Drum Loop 01', type: 'Drums', bpm: 140 },
  ]}
  onPlay={(sound) => console.log(sound.title)}
/>
```

## License

MIT © ArrayPress Limited
