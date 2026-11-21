/**
 * scripts/pack-check.mjs  (`npm run test:pack`, after `npm run build`)
 * --------------------------------------------------------------------
 *
 * Packs the package and installs the tarball into throwaway consumers, the
 * way a user gets it, to prove the sub-path design works:
 *
 *   1. The tarball holds dist/<name>/index.{js,d.ts} for every component
 *      plus README / LICENSE / CHANGELOG, no CommonJS (.cjs / .d.cts; ES
 *      modules only since 2.0), and no src/ or test/.
 *   2. "full" consumer (react + all four cores): every sub-path imports in
 *      Node with `import` and with `require()` (Node 22.12+ loads ES modules
 *      through require) with the expected export names, bundles with every
 *      import resolved, and typechecks under moduleResolution bundler and
 *      nodenext (ESM and CJS files) with this repo's TypeScript, and under
 *      node10 (via typesVersions) with TypeScript 6, since TS 7 removed node10.
 *   3. "player-only" consumer (react + @arraypress/waveform-player only):
 *      `./player` imports, typechecks, and BUNDLES (a bundler resolves the
 *      component's dynamic `import()` of its core at build time). Bundling
 *      counts an unresolved import as a failure (Rolldown, like Rollup, would
 *      otherwise only warn and leave it external). As a control, bundling
 *      `./bar` there must fail: that is the reason each component has its own
 *      sub-path.
 *
 * The cores come from this package's devDependencies: normally the
 * published `^2.x` range, installed from npm. A `file:` path (a sibling
 * checkout, used only temporarily for cross-repo work before a release) is
 * packed and installed as a tarball instead.
 *
 * Needs network access for `npm install`. npm 12 prints `npm pack --json`
 * as an object keyed by package name; older npm prints an array. Both are
 * handled.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const work = mkdtempSync(join(tmpdir(), 'waveform-react-pack-'));
const keep = process.argv.includes('--keep');

const COMPONENTS = {
	player: { exports: ['WaveformPlayer', 'default'], use: 'WaveformPlayer' },
	bar: { exports: ['WaveformBar', 'WaveformBarTrigger'], use: 'WaveformBar' },
	playlist: { exports: ['WaveformPlaylist', 'default'], use: 'WaveformPlaylist' },
	sounds: { exports: ['WaveformSounds', 'default'], use: 'WaveformSounds' },
};
const CORES = ['@arraypress/waveform-player', '@arraypress/waveform-bar', '@arraypress/waveform-playlist', '@arraypress/waveform-sounds'];

let failures = 0;
const check = (ok, label, detail = '') => {
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}${detail ? `: ${detail}` : ''}`);
	if (!ok) failures++;
};
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const tryRun = (cmd, args, cwd) => {
	try {
		return { ok: true, out: run(cmd, args, cwd) };
	} catch (err) {
		return { ok: false, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
	}
};

// --- 1. pack ----------------------------------------------------------------
/** `npm pack` `dir` into `work`; returns the tarball's path and file list. */
function pack(dir) {
	const packed = JSON.parse(run('npm', ['pack', '--json', '--pack-destination', work], dir));
	const info = Array.isArray(packed) ? packed[0] : Object.values(packed)[0];
	return { tarball: join(work, info.filename), files: info.files.map((f) => f.path).sort(), filename: info.filename };
}

const { tarball, files, filename } = pack(root);
console.log(`packed ${filename} (${files.length} files)`);
for (const name of Object.keys(COMPONENTS)) {
	for (const ext of ['js', 'd.ts']) {
		check(files.includes(`dist/${name}/index.${ext}`), `tarball has dist/${name}/index.${ext}`);
	}
}
check(!files.some((f) => /\.(cjs|d\.cts)$/.test(f)), 'tarball has no CommonJS (.cjs / .d.cts)');
for (const f of ['README.md', 'LICENSE', 'CHANGELOG.md', 'package.json']) check(files.includes(f), `tarball has ${f}`);
check(!files.some((f) => /^(src|test|examples|scripts)\//.test(f)), 'tarball has no src/, test/, examples/ or scripts/');

/** What to `npm install` for a core: its npm range, or a packed `file:` checkout. */
const coreSpec = Object.fromEntries(
	CORES.map((name) => {
		const range = pkg.devDependencies[name];
		if (!range.startsWith('file:')) return [name, `${name}@${range}`];
		const core = pack(resolve(root, range.slice('file:'.length)));
		console.log(`packed ${core.filename} (from ${range})`);
		return [name, core.tarball];
	})
);

// --- consumers --------------------------------------------------------------
const tsc = join(root, 'node_modules/.bin/tsc');

function makeConsumer(label, deps) {
	const dir = join(work, label);
	mkdirSync(dir);
	writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: `consumer-${label}`, private: true, type: 'module' }));
	const react = `react@${pkg.peerDependencies.react}`;
	const types = `@types/react@${pkg.devDependencies['@types/react']}`;
	run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', tarball, react, types, ...deps], dir);
	return dir;
}

function nodeImports(dir, names) {
	for (const name of names) {
		const spec = `${pkg.name}/${name}`;
		const want = JSON.stringify(COMPONENTS[name].exports);
		const esm = tryRun('node', ['--input-type=module', '-e', `const m = await import('${spec}'); console.log(JSON.stringify(Object.keys(m).sort()))`], dir);
		check(esm.ok && esm.out.trim() === want, `ESM  import('${spec}')`, esm.ok ? esm.out.trim() : esm.out.trim().split('\n')[0]);
		// require() of the ES module (Node 22.12+). Node adds a `__esModule`
		// marker to the namespace it returns; the exports are otherwise the same.
		const cjs = tryRun('node', ['--input-type=commonjs', '-e', `console.log(JSON.stringify(Object.keys(require('${spec}')).filter((k) => k !== '__esModule').sort()))`], dir);
		check(cjs.ok && cjs.out.trim() === want, `require('${spec}')`, cjs.ok ? cjs.out.trim() : cjs.out.trim().split('\n')[0]);
	}
}

function typecheck(dir, names, modes, tscBin = tsc) {
	const src = names.map((n) => `import { ${COMPONENTS[n].use} } from '${pkg.name}/${n}';\nexport const _${n} = ${COMPONENTS[n].use};`).join('\n');
	writeFileSync(join(dir, 'use.ts'), src);
	writeFileSync(join(dir, 'use.cts'), src);
	const configs = {
		bundler: { module: 'esnext', moduleResolution: 'bundler', files: ['use.ts'] },
		'nodenext (ESM)': { module: 'nodenext', moduleResolution: 'nodenext', files: ['use.ts'] },
		'nodenext (CJS)': { module: 'nodenext', moduleResolution: 'nodenext', files: ['use.cts'] },
		node10: { module: 'commonjs', moduleResolution: 'node10', ignoreDeprecations: '6.0', files: ['use.cts'] },
	};
	for (const mode of modes) {
		const { files: entry, ...opts } = configs[mode];
		const file = join(dir, `tsconfig.${mode.replace(/\W+/g, '-')}.json`);
		writeFileSync(file, JSON.stringify({ compilerOptions: { ...opts, strict: true, noEmit: true, skipLibCheck: false, types: [] }, files: entry }));
		const r = tryRun(tscBin, ['-p', file], dir);
		check(r.ok, `types resolve and check (${mode})`, r.ok ? '' : r.out.trim().split('\n').slice(0, 3).join(' | '));
	}
}

async function bundle(dir, name) {
	const tsdownRequire = createRequire(createRequire(join(root, 'package.json')).resolve('tsdown'));
	const { rolldown } = await import(pathToFileURL(tsdownRequire.resolve('rolldown')).href);
	const entry = join(dir, `entry-${name}.js`);
	writeFileSync(entry, `import { ${COMPONENTS[name].use} } from '${pkg.name}/${name}';\nconsole.log(${COMPONENTS[name].use});\n`);
	const unresolved = [];
	const onLog = (_level, log) => {
		if (log.code === 'UNRESOLVED_IMPORT') unresolved.push(log.message.split('\n')[0]);
	};
	try {
		const build = await rolldown({ input: entry, cwd: dir, platform: 'browser', onLog });
		await build.generate({ format: 'esm' });
		return unresolved.length ? { ok: false, message: unresolved.join(' | ') } : { ok: true };
	} catch (err) {
		return { ok: false, message: String(err.message ?? err).split('\n').find((l) => l.includes('resolve')) ?? String(err).split('\n')[0] };
	}
}

// --- 2. full consumer -------------------------------------------------------
console.log('\nconsumer: react + all four cores');
const full = makeConsumer('full', [...CORES.map((name) => coreSpec[name]), 'typescript@6']);
nodeImports(full, Object.keys(COMPONENTS));
typecheck(full, Object.keys(COMPONENTS), ['bundler', 'nodenext (ESM)', 'nodenext (CJS)']);
typecheck(full, Object.keys(COMPONENTS), ['node10'], join(full, 'node_modules/.bin/tsc'));
for (const name of Object.keys(COMPONENTS)) {
	const r = await bundle(full, name);
	check(r.ok, `bundles ./${name}`, r.message ?? '');
}

// --- 3. player-only consumer ------------------------------------------------
console.log('\nconsumer: react + @arraypress/waveform-player only');
const only = makeConsumer('player-only', [coreSpec['@arraypress/waveform-player']]);
nodeImports(only, ['player']);
typecheck(only, ['player'], ['bundler', 'nodenext (ESM)', 'nodenext (CJS)']);
const playerBundle = await bundle(only, 'player');
check(playerBundle.ok, 'bundles ./player', playerBundle.message ?? '');
const barBundle = await bundle(only, 'bar');
check(!barBundle.ok, 'control: bundling ./bar without its core fails', barBundle.message ?? 'it built');

if (keep) console.log(`\nkept ${work}`);
else rmSync(work, { recursive: true, force: true });
console.log(failures ? `\n${failures} check(s) failed` : '\nall pack checks passed');
process.exit(failures ? 1 : 0);
