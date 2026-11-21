/**
 * test/peer-ranges.test.ts
 * ------------------------
 *
 * The peer floors must cover everything the wrapper types and relies on:
 *
 *   - `@arraypress/waveform-bar` ≥ 2.0.0 — the bar the 2.0 player is built
 *     for: it passes a track's `duration` and `wp1:` peaks to the player,
 *     and 1.x bars require a 1.x player.
 *   - `@arraypress/waveform-player` ≥ 2.0.0 — the bar's own peer floor.
 *
 * The repo develops against the published 2.0 packages: each devDependency
 * is a `^2.x` range at least the peer floor, so the tests run against what
 * a consumer installs.
 */
import { describe, expect, it } from 'vitest';
import pkg from '../../package.json';

const MIN_FLOORS: Record<string, string> = {
	'@arraypress/waveform-bar': '2.0.0',
	'@arraypress/waveform-player': '2.0.0',
};

/** Lower bound of a `^x.y.z` range as a comparable tuple. */
function caretFloor(range: string): [number, number, number] {
	const m = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
	if (!m) throw new Error(`expected a ^x.y.z range, got "${range}"`);
	return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function atLeast(range: string, min: string): boolean {
	const a = caretFloor(range);
	const b = min.split('.').map(Number);
	for (let i = 0; i < 3; i++) {
		if (a[i] !== b[i]) return a[i] > b[i];
	}
	return true;
}

describe('package.json — peer floors cover what the wrapper relies on', () => {
	for (const [name, min] of Object.entries(MIN_FLOORS)) {
		it(`peerDependencies["${name}"] is at least ^${min}`, () => {
			const range = (pkg.peerDependencies as Record<string, string>)[name];
			expect(range, `${name} must be a peer`).toBeDefined();
			expect(atLeast(range, min), `${name}@${range} < ${min}`).toBe(true);
		});

		it(`devDependencies["${name}"] is the published ^2.x, at least ^${min}`, () => {
			const range = (pkg.devDependencies as Record<string, string>)[name];
			expect(caretFloor(range)[0], `${name}@${range} is not a ^2.x range`).toBe(2);
			expect(atLeast(range, min), `${name}@${range} < ${min}`).toBe(true);
		});
	}
});
