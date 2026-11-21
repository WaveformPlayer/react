/**
 * @module types
 * @description
 * Public TypeScript types for `@arraypress/waveform-react/playlist`.
 *
 * The shared option surface is owned by two core libraries and
 * re-exported / derived here rather than re-declared:
 *
 *   - `@arraypress/waveform-playlist` owns the playlist-level options
 *     ({@link WaveformPlaylistOptions}) and the parsed track / chapter /
 *     marker shapes ({@link WaveformPlaylistTrack},
 *     {@link WaveformPlaylistChapter}, {@link WaveformPlaylistMarker}).
 *   - `@arraypress/waveform-player` owns the per-player visualisation
 *     options ({@link WaveformPlayerOptions}) the playlist forwards to the
 *     embedded player (e.g. `height`, `waveformStyle`, `colorPreset`).
 *
 * Both cores generate their declarations from their TypeScript source,
 * so these types can never drift out of sync with them.
 *
 * This module only adds the React-specific surface:
 *
 *   - A declarative `tracks` array ({@link WaveformPlaylistTrackInput})
 *     the component renders into the `[data-track]` markup the playlist
 *     constructor parses.
 *   - DOM pass-through (`className`, `style`, `id`).
 *   - A `WaveformPlaylistHandle` exposed via `ref` for imperative
 *     navigation (`selectTrack`, `nextTrack`, `previousTrack`, …).
 *
 * @see {@link https://github.com/WaveformPlayer/waveform-playlist} — core library
 */
import type {
	WaveformPlaylist,
	WaveformPlaylistOptions,
	WaveformPlaylistTrack,
	WaveformPlaylistMarker,
} from '@arraypress/waveform-playlist';
import type { WaveformPlayerOptions } from '@arraypress/waveform-player';

/**
 * Playlist option / parsed-shape types re-exported from
 * `@arraypress/waveform-playlist` so existing consumers importing them
 * from this package keep working. These are the single-source-of-truth
 * definitions shipped by the core — not local copies.
 */
export type {
	WaveformPlaylistOptions,
	WaveformPlaylistTrack,
	WaveformPlaylistChapter,
	WaveformPlaylistMarker,
} from '@arraypress/waveform-playlist';

/**
 * Shared player option types re-exported from
 * `@arraypress/waveform-player` (these flow through to the embedded
 * player the playlist drives).
 */
export type {
	WaveformStyle,
	ColorPreset,
	AudioMode,
	AudioPreload,
	ButtonAlign,
	WaveformMarker,
	WaveformPeaks,
} from '@arraypress/waveform-player';

/**
 * A chapter on a {@link WaveformPlaylistTrackInput}. Rendered as a
 * `[data-chapter]` child of its track's `[data-track]` element.
 */
export interface WaveformPlaylistChapterInput {
	/**
	 * Chapter start time. A number of seconds (e.g. `90`) or a timestamp
	 * string (e.g. `'1:30'`). Both are stringified into `data-time`, which
	 * the playlist parses (`"M:SS"` / `"MM:SS"`, or a bare seconds count).
	 */
	time: number | string;
	/** Chapter label text. Rendered as the element's text content. */
	label: string;
	/** Optional marker colour for this chapter (`data-color`). */
	color?: string;
}

/**
 * A track supplied to `<WaveformPlaylist>` via the `tracks` prop.
 *
 * This is the *input* shape — distinct from the core's parsed
 * {@link WaveformPlaylistTrack} (which also carries the source
 * `element` and resolved `index`). The component renders each track into
 * the `[data-track]` markup the playlist constructor reads on mount.
 */
export interface WaveformPlaylistTrackInput {
	/** Audio file URL (required). Rendered as `data-url`. */
	url: string;
	/** Track title (`data-title`). Falls back to the filename if omitted. */
	title?: string;
	/** Artist or description shown as the artist line (`data-artist`). */
	artist?: string;
	/** Album artwork URL (`data-artwork`). */
	artwork?: string;
	/** Album name, forwarded to the Media Session API (`data-album`). */
	album?: string;
	/**
	 * The track's length (`data-duration`): a clock string (`'3:45'`,
	 * `'1:02:03'`) or a number of seconds (`225`, or `'225'`). The list shows
	 * it (seconds formatted as `3:45`), and the playlist passes it to the
	 * player as its `duration`, so the time readout, markers and seeks have a
	 * length before the audio's metadata loads — with `preload: 'none'`, not
	 * until playback starts.
	 */
	duration?: number | string;
	/**
	 * Where this track's download link points (`data-download-url`), e.g. a
	 * full-quality file when the playlist streams a preview. Shown with the
	 * playlist's `showDownload`; defaults to the track's `url`.
	 */
	downloadUrl?: string;
	/**
	 * File name suggested for this track's download (`data-download-name`).
	 * Defaults to the file name in the url.
	 */
	downloadName?: string;
	/**
	 * Explicit waveform markers (separate from chapters). JSON-encoded into
	 * `data-markers`, which the playlist parses for this track.
	 */
	markers?: WaveformPlaylistMarker[];
	/**
	 * Pre-computed peaks, so the player skips decoding this track's audio.
	 * An array is JSON-encoded into `data-waveform`; a string — a `.json`
	 * peaks URL, or compact `wp1:` peaks (`"wp1:"` + base64url, one byte per
	 * peak, as `@arraypress/waveform-gen` writes and the player's
	 * `utils.encodeCompactPeaks()` makes) — is passed through for the player
	 * to resolve.
	 */
	waveform?: number[] | string;
	/** Chapters rendered as `[data-chapter]` children of this track. */
	chapters?: WaveformPlaylistChapterInput[];
}

/**
 * Imperative handle exposed through `ref`. Lets consumers drive playlist
 * navigation directly — useful for "play track N" / "next" / "previous"
 * flows where wiring everything through props is awkward.
 *
 * Every method is a thin pass-through to the underlying
 * {@link WaveformPlaylist} instance; refer to the core library's docs for
 * exact behaviour. Calls before the instance has mounted (it loads
 * asynchronously) are no-ops.
 */
export interface WaveformPlaylistHandle {
	/** Select and load a track by index. */
	selectTrack(index: number): void;
	/**
	 * Seek to a chapter within a track. If the chapter lives on a different
	 * track, that track is loaded first and the seek runs once it is ready.
	 */
	seekToChapter(trackIndex: number, time: number): void;
	/** Navigate to the next track (if any). */
	nextTrack(): void;
	/** Navigate to the previous track (if any). */
	previousTrack(): void;
	/**
	 * The embedded `WaveformPlayer` instance, or `null` before init. Exposes
	 * the full player API (`play`, `pause`, `seekTo`, …) for the rare cases
	 * the playlist handle doesn't surface.
	 */
	getPlayer(): unknown | null;
	/** The index of the currently selected track. */
	getCurrentTrackIndex(): number;
	/** All parsed tracks (the core's resolved shape, with `element`/`index`). */
	getTracks(): WaveformPlaylistTrack[];
	/**
	 * Underlying `WaveformPlaylist` instance, or `null` before it mounts.
	 * Escape hatch for anything the handle methods above don't cover.
	 */
	readonly instance: WaveformPlaylist | null;
}

/**
 * The playlist's layout options — `layout` and the hero / grid / density
 * options that ship with it — typed from the playlist core. `layout`
 * overrides the player's own `layout`.
 */
export interface WaveformPlaylistLayoutProps
	extends Pick<
		WaveformPlaylistOptions,
		'layout' | 'showArtist' | 'coverSize' | 'thumbnailSize' | 'density' | 'coverPosition' | 'barPosition'
	> {}

/**
 * Props accepted by `<WaveformPlaylist>`.
 *
 * Combines three groups:
 *
 *   1. **Playlist options** — `continuous`, `expandChapters`,
 *      `showDuration`, `showChapterMarkers`, `chapterMarkerColor`,
 *      `showPlayState`, plus the layout options
 *      ({@link WaveformPlaylistLayoutProps}: `layout` — `'list' |
 *      'minimal' | 'hero' | 'grid'`, overriding the player's own `layout` —
 *      `showArtist`, `coverSize`, `thumbnailSize`, `density`,
 *      `coverPosition`, `barPosition`).
 *   2. **Pass-through player options** — every visualisation / colour /
 *      behaviour option from the core `WaveformPlayerOptions` (including
 *      the 2.0 `showVolume`, `volume`, `showDownload` and their labels),
 *      minus the per-track fields (`url`, `title`, `artist`, `artwork`,
 *      `album`, `markers`, `waveform`, `duration`, `downloadUrl`,
 *      `downloadName`) which come from `tracks`, the `style`/`src` aliases,
 *      the player's `layout` (overridden above), and the options the
 *      playlist never passes to its player: `audioMode` (it always owns its
 *      audio), `loop` and `showLoop` (a looping track never ends, which
 *      stalls `continuous`; `loopLabel` names that hidden toggle) and
 *      `lazy`. The player callbacks (`onLoad`, `onPlay`, `onPause`, `onEnd`,
 *      `onTimeUpdate`, `onError`, `onNextTrack`, `onPreviousTrack`) are
 *      included: the playlist runs each after its own handling. A new
 *      handler never re-mounts the playlist.
 *   3. **React extras** — the required `tracks` array plus the DOM
 *      pass-throughs `id`, `className`, and `style`.
 *
 * Because the option surface is inherited rather than hand-copied,
 * anything the cores add in future is exposed here without a manual edit.
 */
export interface WaveformPlaylistProps
	extends WaveformPlaylistLayoutProps,
		Pick<
			WaveformPlaylistOptions,
			| 'continuous'
			| 'expandChapters'
			| 'showDuration'
			| 'showChapterMarkers'
			| 'chapterMarkerColor'
			| 'showPlayState'
		>,
		Omit<
			WaveformPlayerOptions,
			| 'url'
			| 'src'
			| 'style'
			| 'layout'
			| 'title'
			| 'artist'
			| 'artwork'
			| 'album'
			| 'markers'
			| 'waveform'
			| 'duration'
			| 'downloadUrl'
			| 'downloadName'
			| 'audioMode'
			| 'loop'
			| 'showLoop'
			| 'loopLabel'
			| 'lazy'
		> {
	// ── Tracks (required) ──────────────────────────────────────────────

	/**
	 * The playlist's tracks. Each is rendered into the `[data-track]`
	 * markup the playlist constructor parses on mount. At least one track
	 * is expected; an empty array renders an empty playlist (the core
	 * skips init when there are no tracks).
	 */
	tracks: WaveformPlaylistTrackInput[];


	// ── React-specific extras ──────────────────────────────────────────

	/**
	 * DOM id forwarded to the container `<div>`. Useful for targeting the
	 * playlist from external scripts.
	 */
	id?: string;
	/**
	 * Extra class names appended to the container. The base class
	 * `wfp-host` is always applied.
	 */
	className?: string;
	/**
	 * Inline style passed through to the container. Useful for reserving
	 * layout space before the playlist renders.
	 */
	style?: React.CSSProperties;
}
