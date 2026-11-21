import { describe, it, expect } from 'vitest';
import pkg from '../../package.json';

/**
 * Pins the peer floor on the player core.
 *
 * The runtime half of the `/no-autoinit` guard lives in the behaviour suite,
 * which mocks the package root with a factory that throws: if the component
 * ever imports the scanning entry again, every mount test fails with that
 * message. This half covers the other way it can break — the right import
 * against a core that can't serve it, which fails at mount, in the browser,
 * at the consumer's site rather than here.
 */

describe('core entry point', () => {
	it('declares a peer floor that has everything the component forwards', () => {
		// `/no-autoinit` landed in core 1.27.0, but the component now forwards
		// the 2.0 options (duration, lazy, loop, volume, download, …) and
		// listens for the 2.0 events (seek, ratechange, volumechange, loop),
		// and 2.0 is ES modules only. A 1.x core would ignore all of it.
		expect(pkg.peerDependencies['@arraypress/waveform-player']).toBe('^2.0.0');
	});

	it('keeps the core an optional peer (install only the cores you use)', () => {
		expect(pkg.peerDependenciesMeta['@arraypress/waveform-player']).toEqual({ optional: true });
	});
});

describe('react peer', () => {
	it('supports React 19.3+ only (ref is a plain prop; no forwardRef)', () => {
		expect(pkg.peerDependencies.react).toBe('^19.3.0');
		expect(pkg.devDependencies.react).toMatch(/^\^19\.3\./);
		expect(pkg.devDependencies['react-dom']).toMatch(/^\^19\.3\./);
	});
});
