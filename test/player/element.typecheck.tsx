/**
 * test/player/element.typecheck.tsx
 * ---------------------------------
 *
 * Type-level checks for the `<waveform-player>` JSX typing, run by
 * `npm run typecheck` (not Vitest).
 */
import type { WaveformPlayerElementAttributes } from '../../src/player';

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const assert = <T extends true>(): T => true as T;

// Names follow the core's element: kebab-case, a capital run stays one word.
assert<Equal<'waveform-style' extends keyof WaveformPlayerElementAttributes ? true : false, true>>();
assert<Equal<'show-bpm' extends keyof WaveformPlayerElementAttributes ? true : false, true>>();
assert<Equal<'download-url' extends keyof WaveformPlayerElementAttributes ? true : false, true>>();
assert<Equal<'src' extends keyof WaveformPlayerElementAttributes ? true : false, true>>();
// No callbacks, and no `style` alias (on the tag `style` is CSS).
assert<Equal<Extract<keyof WaveformPlayerElementAttributes, `on${string}` | 'style'>, never>>();

// Values: a number or numeric string, the option's own unions, booleans.
assert<Equal<WaveformPlayerElementAttributes['duration'], number | `${number}` | undefined>>();
assert<Equal<WaveformPlayerElementAttributes['preload'], 'auto' | 'metadata' | 'none' | undefined>>();
assert<Equal<WaveformPlayerElementAttributes['loop'], boolean | 'true' | 'false' | undefined>>();
assert<Equal<WaveformPlayerElementAttributes['waveform'], string | undefined>>();

export const ok = (
	<waveform-player
		src="/a.mp3"
		duration={187}
		preload="none"
		waveform="wp1:AID_"
		waveform-style="bars"
		show-download
		loop={false}
		className="mine"
		data-volume="0.5"
	/>
);

// @ts-expect-error — not a preload value
export const badPreload = <waveform-player src="/a.mp3" preload="eager" />;
// @ts-expect-error — not a number
export const badDuration = <waveform-player src="/a.mp3" duration="long" />;
