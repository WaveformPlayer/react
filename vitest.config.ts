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
 *
 * The drift tests read the installed cores' own files: their generated
 * `types/types.d.ts`, the bar's `src/js/core.ts`, and the player's
 * `src/js/themes.ts` (imported for `DEFAULT_OPTIONS`). Two settings make
 * that work wherever the cores are installed:
 *
 *  - `server.fs.allow`: this repo plus each core's own directory. With the
 *    published cores those sit inside node_modules (redundant but harmless);
 *    it is kept for a temporary `file:` devDependency during cross-repo work,
 *    which npm links, so its real path sits outside this repo and Vite would
 *    otherwise refuse to read it.
 *  - `server.deps.inline` for the player core's `src/`: it is TypeScript
 *    with `.js` import specifiers, which only Vite resolves. From a normal
 *    (npm) install it would sit in node_modules, where Vitest hands files to
 *    Node, which can't load it.
 */
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const COMPONENTS = ['player', 'bar', 'playlist', 'sounds'] as const;
const require = createRequire(import.meta.url);
const coreDirs = COMPONENTS.map((name) => dirname(require.resolve(`@arraypress/waveform-${name}/package.json`)));

export default defineConfig({
	server: { fs: { allow: [dirname(fileURLToPath(import.meta.url)), ...coreDirs] } },
	test: {
		server: { deps: { inline: [/@arraypress\/waveform-player\/src\//] } },
		projects: COMPONENTS.map((name) => ({
			extends: true,
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
