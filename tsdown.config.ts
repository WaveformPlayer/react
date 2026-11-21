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
	// CJS output options, set to match what tsup (esbuild) emitted:
	// - `exports: 'named'`: `exports.X` + `exports.default`. Same output as
	//   Rolldown's `auto` here; explicit to silence its MIXED_EXPORTS warning.
	// - `strict: true`: tsup's CJS began with "use strict". Rolldown's default
	//   (`auto`) omits it, which would run the CJS build in sloppy mode.
	// - `generatedCode.symbols: false`: no `Symbol.toStringTag: 'Module'` on
	//   the CJS exports object, which tsup never added.
	// `__esModule` is left at Rolldown's default, which already matches tsup:
	// set when the entry has a default export (player, playlist, sounds),
	// absent for bar. (None of these change the ESM output.)
	outputOptions: { exports: 'named', strict: true, generatedCode: { symbols: false } },
	deps: {
		neverBundle: [/^react(-dom)?(\/|$)/, /^@arraypress\/waveform-(player|bar|playlist|sounds)(\/|$)/],
	},
});
