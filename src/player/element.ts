/**
 * @module element
 * @description
 * JSX typing for the core's `<waveform-player>` custom element, so React 19
 * (which passes custom-element props through as attributes and properties)
 * can render the tag with typed attributes:
 *
 * ```tsx
 * import '@arraypress/waveform-player'; // registers <waveform-player>
 * import type {} from '@arraypress/waveform-react/player'; // or any import from it
 *
 * <waveform-player src="/a.mp3" duration={187} waveform-style="bars" preload="none" />
 * ```
 *
 * Declarations only. Registering the element is the core's job: its default
 * entry does it on import; `/no-autoinit` (what `<WaveformPlayer>` loads)
 * exports `defineWaveformPlayerElement()` instead.
 *
 * The attribute names are derived from the core's `WaveformPlayerOptions`
 * the way its element derives them (`waveformStyle` → `waveform-style`,
 * `showBPM` → `show-bpm`), so they follow the core; `test/player/element.test.ts`
 * checks the result against the element's `observedAttributes`. The
 * `data-` forms the element also reads need no typing: React accepts any
 * `data-*` attribute.
 */
import type { WaveformPlayerElement, WaveformPlayerOptions } from '@arraypress/waveform-player';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/**
 * camelCase → kebab-case as the core's element names its attributes: a dash
 * before each capital that follows a lowercase letter, so a run of capitals
 * stays one word (`showBPM` → `show-bpm`, `waveformStyle` → `waveform-style`).
 */
type Kebab<S extends string, Prev extends string = ''> = S extends `${infer Head}${infer Tail}`
	? `${Head extends Lowercase<Head>
			? Head
			: Prev extends Lowercase<Prev>
				? Prev extends Uppercase<Prev>
					? Lowercase<Head>
					: `-${Lowercase<Head>}`
				: Lowercase<Head>}${Kebab<Tail, Head>}`
	: '';

/**
 * What an attribute takes for an option of type `V`: its strings and
 * numbers as themselves (a number also as a numeric string), a boolean as
 * `true` / `false` (React writes `true` as a bare attribute and drops
 * `false`) or `'true'` / `'false'`, and anything structured — arrays of
 * peaks, colour stops or markers — as the JSON or text the core parses.
 */
type AttributeValue<V> = V extends string
	? V
	: V extends number
		? number | `${number}`
		: V extends boolean
			? boolean | 'true' | 'false'
			: string;

/**
 * The `<waveform-player>` option attributes: every core option except the
 * `on*` callbacks (functions can't be attributes; listen for the
 * `waveformplayer:*` events, which bubble from the tag) and `style`, which on
 * the tag is its CSS (the alias works as `data-style`; or `waveform-style`).
 */
export type WaveformPlayerElementAttributes = {
	[K in Exclude<keyof WaveformPlayerOptions, `on${string}` | 'style'> as Kebab<K>]?: AttributeValue<
		NonNullable<WaveformPlayerOptions[K]>
	>;
};

/** Every prop `<waveform-player>` takes in JSX: the HTML ones plus its options. */
export type WaveformPlayerElementProps = DetailedHTMLProps<HTMLAttributes<WaveformPlayerElement>, WaveformPlayerElement> &
	WaveformPlayerElementAttributes;

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'waveform-player': WaveformPlayerElementProps;
		}
	}
}
