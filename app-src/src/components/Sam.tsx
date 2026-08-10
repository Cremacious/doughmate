// Sam, the sourdough mascot. Renders the placeholder vector for now.
// Swaps to a Lottie view once the Fiverr animation files land (see plan Week 2).
import SamVector from '@/assets/sam.svg';

export interface SamProps {
  /** Rendered width in points. Height keeps the 220x180 aspect ratio. */
  size?: number;
}

const ASPECT = 180 / 220;

export function Sam({ size = 96 }: SamProps) {
  return <SamVector width={size} height={size * ASPECT} />;
}

export default Sam;
