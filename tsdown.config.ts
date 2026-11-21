/**
 * tsdown.config.ts
 * ----------------
 *
 * Build configuration for `@arraypress/waveform-react`.
 *
 * One entry per component, each its own sub-path:
 *   - dist/<name>/index.js    (ESM) — bundlers, Node `import`, and Node
 *     22.12+ `require()` (which loads ES modules)
 *   - dist/<name>/index.d.ts  — declarations
 *
 * ES modules only since 2.0, like the cores: no CommonJS build, `.cjs` or
 * `.d.cts`. (The CJS-only output options the tsup parity needed —
 * `exports: 'named'`, `strict`, `generatedCode.symbols` — went with it: an
 * ES module is always strict and has no exports object to shape.)
 *
 * Separate entries are the point of this package: each component lazily
 * `import()`s its core, and bundlers resolve every dynamic import at build
 * time, so a combined entry would break the build of anyone who hasn't
 * installed every core.
 *
 * `.js` for ESM (`fixedExtension: false`, since the package is
 * `type: module`), ES2022 syntax (the cores' floor too), sourcemaps, no
 * minification. React and every core stay external so they resolve to the
 * consumer's installed copies, never bundled in.
 */
import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		'player/index': 'src/player/index.ts',
		'bar/index': 'src/bar/index.ts',
		'playlist/index': 'src/playlist/index.ts',
		'sounds/index': 'src/sounds/index.ts',
	},
	format: ['esm'],
	platform: 'node',
	target: 'es2022',
	fixedExtension: false,
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	minify: false,
	deps: {
		neverBundle: [/^react(-dom)?(\/|$)/, /^@arraypress\/waveform-(player|bar|playlist|sounds)(\/|$)/],
	},
});
