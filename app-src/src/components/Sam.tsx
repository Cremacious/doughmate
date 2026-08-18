// Sam, Doughmate's sourdough mascot. One chubby outlined boule, drawn in
// react native svg so it renders identically on web and native, with an
// expressive face per emotion. The crust and outline come from the theme's Sam
// tokens; the small accents (score ear, cheeks, flour, sparkles) are a fixed
// brand palette, intentional in both light and dark.
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import type { SamEmotion } from '@/lib/samEmotion';

const ASPECT = 104 / 120;
/** Tight crop drops the drawing's slack so Sam fills a circular avatar. */
const TIGHT_VIEWBOX = '6 12 108 84';
const TIGHT_ASPECT = 84 / 108;

const SHADOW = '#8B5A2B';
const EAR = '#C77D3A';
const CHEEK = '#F2A0A0';
const FLOUR = '#FBF5EA';
const SPARKLE = '#2C7A70';
const ALERT = '#F2603C';
const ZZZ = '#A08D7C';
const SHINE = '#FFFFFF';

export interface SamProps {
  /** Rendered width in points. Height keeps the 120x104 aspect ratio. */
  size?: number;
  /** Which face to show. Defaults to a gentle idle smile. */
  emotion?: SamEmotion;
  /**
   * Crops the viewBox in to the loaf itself. Use inside a circular avatar so Sam
   * fills the circle instead of floating in the middle of it.
   */
  tightCrop?: boolean;
  /**
   * Overrides the crust fill. Pass `samCrustPale` on a butter or plum hero, where
   * the usual crust disappears into the fill.
   */
  crust?: string;
}

function Face({ emotion, ink }: { emotion: SamEmotion; ink: string }) {
  switch (emotion) {
    case 'idle':
      return (
        <G>
          <Circle cx={47} cy={54} r={3} fill={ink} />
          <Circle cx={73} cy={54} r={3} fill={ink} />
          <Path
            d="M52 66 q8 6 16 0"
            stroke={ink}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'happy':
      return (
        <G>
          <Ellipse cx={36} cy={62} rx={6} ry={3.6} fill={CHEEK} opacity={0.5} />
          <Ellipse cx={84} cy={62} rx={6} ry={3.6} fill={CHEEK} opacity={0.5} />
          <G stroke={ink} strokeWidth={2.6} fill="none" strokeLinecap="round">
            <Path d="M42 56 q5 -5 10 0" />
            <Path d="M68 56 q5 -5 10 0" />
            <Path d="M50 65 q10 9 20 0" />
          </G>
        </G>
      );
    case 'excited':
      return (
        <G>
          <Path
            d="M22 28 l0 8 M18 32 l8 0"
            stroke={SPARKLE}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Path
            d="M98 24 l0 6 M95 27 l6 0"
            stroke={SPARKLE}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Circle cx={47} cy={54} r={4} fill={ink} />
          <Circle cx={73} cy={54} r={4} fill={ink} />
          <Circle cx={48.6} cy={52.4} r={1.3} fill={SHINE} />
          <Circle cx={74.6} cy={52.4} r={1.3} fill={SHINE} />
          <Path d="M50 65 q10 11 20 0 z" fill={ink} />
        </G>
      );
    case 'curious':
      return (
        <G>
          <Path
            d="M67 45 q6 -4 11 1"
            stroke={ink}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          <Circle cx={47} cy={55} r={3} fill={ink} />
          <Circle cx={73} cy={52} r={3} fill={ink} />
          <Path
            d="M54 67 q6 3 12 0"
            stroke={ink}
            strokeWidth={2.4}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'hungry':
      return (
        <G>
          <Path d="M95 22 l0 8" stroke={ALERT} strokeWidth={2.6} strokeLinecap="round" />
          <Circle cx={95} cy={34} r={1.5} fill={ALERT} />
          <Circle cx={47} cy={54} r={4.4} fill={ink} />
          <Circle cx={73} cy={54} r={4.4} fill={ink} />
          <Circle cx={48.7} cy={52.1} r={1.5} fill={SHINE} />
          <Circle cx={74.7} cy={52.1} r={1.5} fill={SHINE} />
          <Ellipse cx={60} cy={69} rx={3.2} ry={3.8} fill={ink} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <Path
            d="M84 30 h6 l-6 6 h6"
            stroke={ZZZ}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M93 22 h4 l-4 4 h4"
            stroke={ZZZ}
            strokeWidth={1.4}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <G stroke={ink} strokeWidth={2.6} strokeLinecap="round">
            <Path d="M42 55 h10" />
            <Path d="M68 55 h10" />
          </G>
          <Path d="M56 68 h8" stroke={ink} strokeWidth={2.4} strokeLinecap="round" />
        </G>
      );
  }
}

export function Sam({ size = 96, emotion = 'idle', tightCrop = false, crust }: SamProps) {
  const { palette } = useAppTheme();
  const ink = palette.samOutline;
  const crustFill = crust ?? palette.samCrust;

  return (
    <Svg
      width={size}
      height={size * (tightCrop ? TIGHT_ASPECT : ASPECT)}
      viewBox={tightCrop ? TIGHT_VIEWBOX : '0 0 120 104'}
    >
      <Ellipse cx={60} cy={98} rx={40} ry={4.5} fill={SHADOW} opacity={0.18} />
      {/* 3.0 so the loaf holds its own beside a 2px outlined card. */}
      <Path
        d="M14 64 C14 32 40 20 60 20 C80 20 106 32 106 64 C106 82 88 92 60 92 C32 92 14 82 14 64 Z"
        fill={crustFill}
        stroke={ink}
        strokeWidth={3}
      />
      <G stroke={EAR} strokeWidth={3.4} strokeLinecap="round">
        <Path d="M40 36 l11 11" />
        <Path d="M57 32 l12 11" />
        <Path d="M75 36 l11 11" />
      </G>
      <Circle cx={30} cy={50} r={1.6} fill={FLOUR} />
      <Circle cx={92} cy={46} r={1.4} fill={FLOUR} />
      <Face emotion={emotion} ink={ink} />
    </Svg>
  );
}

export default Sam;
