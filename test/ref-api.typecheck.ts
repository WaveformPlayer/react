/**
 * test/ref-api.typecheck.ts
 * -------------------------
 *
 * The ref contract of every component that takes a `ref`, checked by
 * `npm run typecheck` (not Vitest). Written against the React 18-era
 * `forwardRef` components and kept unchanged when they became React 19
 * function components with a `ref` prop, to show consumers see the same
 * API: the same handle type through `ComponentRef`, a `ref` prop that
 * takes a ref object or a callback, the props without `ref` unchanged, and
 * a ref of the wrong type rejected.
 */
import {
	createElement,
	createRef,
	type ComponentProps,
	type ComponentPropsWithoutRef,
	type ComponentRef,
	type Ref,
} from 'react';
import { WaveformBarTrigger, type WaveformBarTriggerProps } from '../src/bar';
import { WaveformPlayer, type WaveformPlayerHandle, type WaveformPlayerProps } from '../src/player';
import { WaveformPlaylist, type WaveformPlaylistHandle, type WaveformPlaylistProps } from '../src/playlist';
import { WaveformSounds, type WaveformSoundsHandle, type WaveformSoundsProps } from '../src/sounds';

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
/** Each assignable to the other (`Equal` is too strict for `Omit`-built types). */
type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const assert = <T extends true>(): T => true as T;

// What `ref` resolves to.
assert<Equal<ComponentRef<typeof WaveformPlayer>, WaveformPlayerHandle>>();
assert<Equal<ComponentRef<typeof WaveformPlaylist>, WaveformPlaylistHandle>>();
assert<Equal<ComponentRef<typeof WaveformSounds>, WaveformSoundsHandle>>();
assert<Equal<ComponentRef<typeof WaveformBarTrigger>, HTMLElement>>();

// The props, minus `ref`, are exactly the exported props types.
assert<Same<ComponentPropsWithoutRef<typeof WaveformPlayer>, WaveformPlayerProps>>();
assert<Same<ComponentPropsWithoutRef<typeof WaveformPlaylist>, WaveformPlaylistProps>>();
assert<Same<ComponentPropsWithoutRef<typeof WaveformSounds>, WaveformSoundsProps>>();
assert<Same<ComponentPropsWithoutRef<typeof WaveformBarTrigger>, WaveformBarTriggerProps>>();

// The exported props types don't carry `ref` themselves.
assert<Equal<'ref' extends keyof WaveformPlayerProps ? true : false, false>>();
assert<Equal<'ref' extends keyof WaveformPlaylistProps ? true : false, false>>();
assert<Equal<'ref' extends keyof WaveformSoundsProps ? true : false, false>>();

// `ref` takes a ref object or a callback ref of the handle type…
export const objectRefs = [
	createElement(WaveformPlayer, { url: '/a.mp3', ref: createRef<WaveformPlayerHandle>() }),
	createElement(WaveformPlaylist, { tracks: [], ref: createRef<WaveformPlaylistHandle>() }),
	createElement(WaveformSounds, { sounds: [], ref: createRef<WaveformSoundsHandle>() }),
	createElement(WaveformBarTrigger, { url: '/a.mp3', ref: createRef<HTMLElement>() }),
];
export const callbackRefs = [
	createElement(WaveformPlayer, { url: '/a.mp3', ref: (h: WaveformPlayerHandle | null) => void h }),
	createElement(WaveformPlaylist, { tracks: [], ref: (h: WaveformPlaylistHandle | null) => void h }),
	createElement(WaveformSounds, { sounds: [], ref: (h: WaveformSoundsHandle | null) => void h }),
];
assert<Same<NonNullable<ComponentProps<typeof WaveformPlayer>['ref']>, NonNullable<Ref<WaveformPlayerHandle>>>>();

// …and rejects a ref of another type.
export const wrongRefs = [
	// @ts-expect-error — a div ref is not a player handle
	createElement(WaveformPlayer, { url: '/a.mp3', ref: createRef<HTMLDivElement>() }),
	// @ts-expect-error — a player handle is not a playlist handle
	createElement(WaveformPlaylist, { tracks: [], ref: createRef<WaveformPlayerHandle>() }),
];
