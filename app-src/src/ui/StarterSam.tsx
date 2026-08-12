// Sam drawn as your starter. Same loaf, a face and small props per mood. All
// react native svg, no asset files. Fixed brand palette, intentional in light
// and dark.
import Svg, { Circle, Ellipse, G, Path, Text as SvgText } from 'react-native-svg';

import type { StarterMood } from '@/lib/starterMood';

const INK = '#2C1E17';
const CRUST = '#E9B478';
const CRUST_TOP = '#C77D3A';
const SHADOW = '#8B5A2B';
const TEAL = '#2C7A70';
const CHEEK = '#F2A0A0';
const DROP = '#8FC0EA';
const PRIMARY = '#F2603C';
const FAINT = '#A08D7C';

const ASPECT = 105 / 120;

function Face({ mood }: { mood: StarterMood }) {
  switch (mood) {
    case 'new':
      return (
        <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <Path d="M46 58 q5 4 10 0" />
          <Path d="M64 58 q5 4 10 0" />
          <Path d="M55 72 q5 2 10 0" />
        </G>
      );
    case 'full':
      return (
        <G>
          <Ellipse cx={42} cy={66} rx={6} ry={4} fill={CHEEK} opacity={0.55} />
          <Ellipse cx={78} cy={66} rx={6} ry={4} fill={CHEEK} opacity={0.55} />
          <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
            <Path d="M46 61 q5 -5 10 0" />
            <Path d="M64 61 q5 -5 10 0" />
            <Path d="M52 68 q8 7 16 0" />
          </G>
        </G>
      );
    case 'peak':
      return (
        <G>
          <Circle cx={26} cy={30} r={4.5} stroke={TEAL} strokeWidth={1.7} fill="none" />
          <Circle cx={38} cy={18} r={3} stroke={TEAL} strokeWidth={1.7} fill="none" />
          <Circle cx={95} cy={26} r={3.6} stroke={TEAL} strokeWidth={1.7} fill="none" />
          <Circle cx={51} cy={56} r={4.2} fill={INK} />
          <Circle cx={69} cy={56} r={4.2} fill={INK} />
          <Circle cx={52.6} cy={54.4} r={1.3} fill="#fff" />
          <Circle cx={70.6} cy={54.4} r={1.3} fill="#fff" />
          <Path d="M51 68 q9 10 18 0 z" fill={INK} />
        </G>
      );
    case 'peckish':
      return (
        <G>
          <Path d="M86 46 q3.5 6 0 10 q-3.5 -4 0 -10" fill={DROP} />
          <Circle cx={51} cy={56} r={3.4} fill={INK} />
          <Circle cx={69} cy={56} r={3.4} fill={INK} />
          <Path
            d="M53 71 q3.5 -3 7 0 q3.5 3 7 0"
            stroke={INK}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      );
    case 'hungry':
      return (
        <G>
          <SvgText x={92} y={28} fontSize={20} fontWeight="800" fill={PRIMARY}>
            !
          </SvgText>
          <Circle cx={51} cy={55} r={5} fill={INK} />
          <Circle cx={69} cy={55} r={5} fill={INK} />
          <Circle cx={52.8} cy={57} r={1.6} fill="#fff" />
          <Circle cx={70.8} cy={57} r={1.6} fill="#fff" />
          <Ellipse cx={60} cy={72} rx={3.2} ry={4} fill={INK} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <SvgText x={84} y={24} fontSize={12} fontWeight="800" fill={FAINT}>
            z
          </SvgText>
          <SvgText x={92} y={18} fontSize={16} fontWeight="800" fill={FAINT}>
            z
          </SvgText>
          <SvgText x={102} y={10} fontSize={20} fontWeight="800" fill={FAINT}>
            z
          </SvgText>
          <G stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none">
            <Path d="M46 57 h10" />
            <Path d="M64 57 h10" />
            <Path d="M56 71 h8" />
          </G>
        </G>
      );
  }
}

export interface StarterSamProps {
  mood: StarterMood;
  size?: number;
}

export function StarterSam({ mood, size = 120 }: StarterSamProps) {
  return (
    <Svg width={size} height={size * ASPECT} viewBox="0 0 120 105">
      <Ellipse cx={60} cy={97} rx={40} ry={5} fill={SHADOW} opacity={0.2} />
      <Ellipse cx={60} cy={58} rx={47} ry={40} fill={CRUST} stroke={INK} strokeWidth={2.5} />
      <Path
        d="M38 46 q22 -13 44 0"
        stroke={CRUST_TOP}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
      <Face mood={mood} />
    </Svg>
  );
}

export default StarterSam;
