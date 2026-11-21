/**
 * test/types.typecheck.ts
 * -----------------------
 *
 * Type-level assertions, checked by `npm run typecheck` (not vitest).
 *
 * The playlist's layout options are picked from the installed playlist
 * core's `WaveformPlaylistOptions`, which also has an `unknown` index
 * signature. These assertions make sure the props are the declared types,
 * never `unknown`, and that the per-track / never-forwarded player options
 * aren't props at all.
 */
import type { WaveformPlaylistProps, WaveformPlaylistTrackInput } from '../../src/playlist/types';

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assert = <T extends true>(): T => true as T;

assert<Equal<WaveformPlaylistProps['layout'], 'list' | 'minimal' | 'hero' | 'grid' | undefined>>();
assert<Equal<WaveformPlaylistProps['showArtist'], boolean | undefined>>();
assert<Equal<WaveformPlaylistProps['coverSize'], number | undefined>>();
assert<Equal<WaveformPlaylistProps['thumbnailSize'], number | undefined>>();
assert<Equal<WaveformPlaylistProps['density'], 'comfortable' | 'compact' | undefined>>();
assert<Equal<WaveformPlaylistProps['coverPosition'], 'left' | 'top' | undefined>>();
assert<Equal<WaveformPlaylistProps['barPosition'], 'top' | 'bottom' | undefined>>();

// Per-track input: a clock string or seconds, plus the 2.0 download target.
assert<Equal<WaveformPlaylistTrackInput['duration'], number | string | undefined>>();
assert<Equal<WaveformPlaylistTrackInput['downloadUrl'], string | undefined>>();
assert<Equal<WaveformPlaylistTrackInput['downloadName'], string | undefined>>();

// The 2.0 player options the playlist passes to its player are props…
assert<Equal<WaveformPlaylistProps['showVolume'], boolean | undefined>>();
assert<Equal<WaveformPlaylistProps['volume'], number | null | undefined>>();
assert<Equal<WaveformPlaylistProps['showDownload'], boolean | undefined>>();

// …the ones it drops, and the per-track ones, are not.
type Dropped = 'audioMode' | 'loop' | 'showLoop' | 'loopLabel' | 'lazy' | 'duration' | 'downloadUrl' | 'downloadName';
assert<Equal<Extract<keyof WaveformPlaylistProps, Dropped>, never>>();
