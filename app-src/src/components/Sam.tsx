// Sam (web / default): always the SVG. Lottie is native only, so the web bundle
// never pulls in lottie-react-native. Native uses Sam.native.tsx.
import SamVector from '@/assets/sam.svg';
import type { SamState } from '@/lib/samState';

const ASPECT = 180 / 220;

export interface SamProps {
  /** Rendered width in points. Height keeps the 220x180 aspect ratio. */
  size?: number;
  /** Which mood to show. Used by the Lottie build; the SVG is mood agnostic. */
  state?: SamState;
  loop?: boolean;
  autoPlay?: boolean;
}

export function Sam({ size = 96 }: SamProps) {
  return <SamVector width={size} height={size * ASPECT} />;
}

export default Sam;
