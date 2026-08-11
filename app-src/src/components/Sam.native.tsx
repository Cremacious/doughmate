// Sam (native): plays a Lottie animation for the current mood once the real
// files are in and LOTTIE_READY is true; until then, the SVG placeholder.
import LottieView, { type LottieViewProps } from 'lottie-react-native';

import { LOTTIE_READY, lottieSources } from '@/assets/lottie';
import SamVector from '@/assets/sam.svg';
import type { SamState } from '@/lib/samState';

const ASPECT = 180 / 220;

export interface SamProps {
  size?: number;
  state?: SamState;
  loop?: boolean;
  autoPlay?: boolean;
}

export function Sam({ size = 96, state = 'idle', loop = true, autoPlay = true }: SamProps) {
  const height = size * ASPECT;

  if (LOTTIE_READY) {
    return (
      <LottieView
        source={lottieSources[state] as LottieViewProps['source']}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: size, height }}
      />
    );
  }

  return <SamVector width={size} height={height} />;
}

export default Sam;
