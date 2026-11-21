/**
 * test/player/element.test.ts
 * ---------------------------
 *
 * The `<waveform-player>` JSX typing (`src/player/element.ts`) derives each
 * attribute name from a `WaveformPlayerOptions` key with a type-level
 * kebab-case. This mirrors that rule in JavaScript, applies it to the
 * installed core's typed option keys, and compares the result with the
 * attributes the real element observes — so a core option the typing names
 * wrongly, or an attribute it misses, fails here.
 */
import { describe, expect, it } from 'vitest';
import { WaveformPlayerElement } from '@arraypress/waveform-player/no-autoinit';
import { isCallbackKey, loadTypedOptionKeys } from './core-options';

/** The `Kebab<>` type in src/player/element.ts, in JavaScript. */
const kebab = (key: string) => key.replace(/(?<=[a-z])[A-Z]/g, (c) => `-${c}`).toLowerCase();

describe('<waveform-player> JSX attributes vs the core element', () => {
	it('types exactly the plain (unprefixed) attributes the element observes', () => {
		const typed = loadTypedOptionKeys()
			.filter((key) => !isCallbackKey(key) && key !== 'style')
			.map(kebab)
			.sort();
		const observed = WaveformPlayerElement.observedAttributes.filter((name) => !name.startsWith('data-')).sort();
		expect(observed.length).toBeGreaterThan(40);
		expect(typed).toEqual(observed);
	});

	it('names a capital run as one word, as the core does', () => {
		expect(kebab('showBPM')).toBe('show-bpm');
		expect(kebab('waveformStyle')).toBe('waveform-style');
	});
});
