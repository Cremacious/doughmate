// Registry of Sam's Lottie animations, one per mood. The files are placeholders
// until the Fiverr animations land. See README.md: drop the real files in and
// flip LOTTIE_READY to true.
import type { SamState } from '@/lib/samState';

import celebrate from './celebrate.json';
import cookies from './cookies.json';
import croissants from './croissants.json';
import focaccia from './focaccia.json';
import idle from './idle.json';
import macarons from './macarons.json';
import sourdough from './sourdough.json';

/** Flip to true once real Lottie files replace the placeholders in this folder. */
export const LOTTIE_READY = false;

export const lottieSources: Record<SamState, unknown> = {
  idle,
  cookies,
  sourdough,
  macarons,
  focaccia,
  croissants,
  celebrate,
};
