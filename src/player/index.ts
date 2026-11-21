/**
 * @module @arraypress/waveform-react/player
 * @description
 * Public entry point for the React wrapper around
 * `@arraypress/waveform-player`.
 *
 * ```tsx
 * import { WaveformPlayer } from '@arraypress/waveform-react/player';
 *
 * function App() {
 *   return <WaveformPlayer url="/audio/track.mp3" title="My Track" />;
 * }
 * ```
 *
 * ## Types
 *
 * ```ts
 * import type {
 *   WaveformPlayerProps,
 *   WaveformPlayerHandle,
 *   WaveformStyle,
 *   WaveformMarker,
 *   WaveformPeaks,
 *   ColorPreset,
 *   AudioMode,
 *   AudioPreload,
 *   ButtonAlign,
 * } from '@arraypress/waveform-react/player';
 * ```
 */

export { WaveformPlayer } from './WaveformPlayer';
export { WaveformPlayer as default } from './WaveformPlayer';

export type {
	WaveformPlayerProps,
	WaveformPlayerHandle,
	WaveformStyle,
	WaveformMarker,
	WaveformPeaks,
	ColorPreset,
	AudioMode,
	AudioPreload,
	ButtonAlign,
} from './types';
