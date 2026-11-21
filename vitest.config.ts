/**
 * vitest.config.ts
 * ----------------
 *
 * One Vitest project per component, so each suite keeps the exact
 * environment it had as its own package: jsdom, no globals, and its own
 * `test/<name>/setup.ts` (the playlist's installs a stub
 * `window.WaveformPlayer`; the sounds' deliberately doesn't).
 *
 * The cores are mocked at the module boundary in the behaviour suites
 * (jsdom has no Web Audio / Canvas / Fetch); the sounds integration suite
 * runs the real sounds core with a stand-in engine. See each test file.
 */
import { defineConfig } from 'vitest/config';

const COMPONENTS = ['player', 'bar', 'playlist', 'sounds'] as const;

export default defineConfig({
	test: {
		projects: COMPONENTS.map((name) => ({
			test: {
				name,
				include: [`test/${name}/**/*.test.{ts,tsx}`],
				environment: 'jsdom',
				globals: false,
				setupFiles: [`./test/${name}/setup.ts`],
			},
		})),
	},
});
