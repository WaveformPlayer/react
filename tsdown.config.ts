/**
 * tsdown.config.ts
 * ----------------
 *
 * Build configuration for `@arraypress/waveform-react`.
 *
 * One entry per component, each its own sub-path:
 *   - dist/<name>/index.js    (ESM)  — modern bundlers and Node `import`
 *   - dist/<name>/index.cjs   (CJS)  — older toolchains and Node `require`
 *   - dist/<name>/index.d.ts / index.d.cts — declarations
 *
 * Separate entries are the point of this package: each component lazily
 * `import()`s its core, and bundlers resolve every dynamic import at build
 * time, so a combined entry would break the build of anyone who hasn't
 * installed every core.
 *
 * Same output settings as the four tsup builds this replaces: ESM + CJS,
 * `.js` for ESM (`fixedExtension: false`, since the package is
 * `type: module`), ES2022 syntax (tsup took it from tsconfig's `target`),
 * sourcemaps, no minification. React and every core stay external so they
 * resolve to the consumer's installed copies, never bundled in.
 */
import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: {
		'player/index': 'src/player/index.ts',
		'bar/index': 'src/bar/index.ts',
		'playlist/index': 'src/playlist/index.ts',
		'sounds/index': 'src/sounds/index.ts',
	},
	format: ['esm', 'cjs'],
	platform: 'node',
	target: 'es2022',
	fixedExtension: false,
	dts: true,
	sourcemap: true,
	clean: true,
	treeshake: true,
	minify: false,
	// Each entry has a named export and a default export. `named` is what
	// tsup (esbuild) always emitted: `exports.X` + `exports.default`. Being
	// explicit silences Rolldown's MIXED_EXPORTS warning; the output is the
	// same as its `auto` mode.
	outputOptions: { exports: 'named' },
	deps: {
		neverBundle: [/^react(-dom)?(\/|$)/, /^@arraypress\/waveform-(player|bar|playlist|sounds)(\/|$)/],
	},
});
