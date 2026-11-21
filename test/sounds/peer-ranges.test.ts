/**
 * test/peer-ranges.test.ts
 * ------------------------
 *
 * The peer floors are load-bearing, not cosmetic. The server render takes
 * its options from `pickRenderOptions()` and a re-mount uses
 * `destroy({ restore: true })`, both added in `@arraypress/waveform-sounds`
 * 2.1.0; sounds itself peers on `@arraypress/waveform-player@^2.0.0` for
 * its engine.
 */
import { describe, it, expect } from 'vitest';
import pkg from '../../package.json';

/** The lowest version a range accepts: `^x.y.z`, or a `||` union of them. */
const floor = (range: string): number[] => {
	const parts = range.split('||').map((part) => {
		const m = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(part.trim());
		if (!m) throw new Error(`expected ^x.y.z ranges, got ${range}`);
		return m.slice(1).map(Number);
	});
	return parts.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2])[0];
};
const atLeast = (range: string, min: string): boolean => {
	const [a, b] = [floor(range), floor(`^${min}`)];
	for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
	return true;
};

describe('peer dependency floors', () => {
	it('requires waveform-sounds >= 2.1.0 (pickRenderOptions, destroy({ restore }))', () => {
		expect(atLeast(pkg.peerDependencies['@arraypress/waveform-sounds'], '2.1.0')).toBe(true);
	});

	it("requires waveform-player >= 2.0.0 (the sounds core's own floor)", () => {
		expect(atLeast(pkg.peerDependencies['@arraypress/waveform-player'], '2.0.0')).toBe(true);
	});

	it('develops against the published 2.0 packages (a ^2.x devDependency at least the peer floor)', () => {
		for (const [name, min] of [
			['@arraypress/waveform-sounds', '2.1.0'],
			['@arraypress/waveform-player', '2.0.0'],
		] as const) {
			const range = pkg.devDependencies[name];
			expect(floor(range)[0], `${name}@${range} is not a ^2.x range`).toBe(2);
			expect(atLeast(range, min), `${name}@${range} < ${min}`).toBe(true);
		}
	});
});
