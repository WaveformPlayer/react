/**
 * @module core-module-shim
 * @description
 * Ambient declaration for `@arraypress/waveform-bar`, which ships no
 * `.d.ts` types yet; without this shim `tsc` errors on the dynamic import
 * inside `WaveformBar`.
 *
 * Delete this file once the bar ships its own types — TypeScript will
 * pick those up automatically.
 *
 * (The standalone waveform-bar-react package also declared
 * `@arraypress/waveform-player` here as `unknown`. Nothing in the bar
 * imports the player module, and in this merged package that ambient
 * declaration would override the player core's real `index.d.ts` for the
 * player and playlist components too, so it was dropped. Declarations
 * only: no emitted code depends on this file.)
 */
declare module '@arraypress/waveform-bar' {
	const WaveformBar: unknown;
	export default WaveformBar;
	export { WaveformBar };
}
