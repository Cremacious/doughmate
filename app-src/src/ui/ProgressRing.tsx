// Proof ProgressRing. A 44 ring that fills as the feed interval elapses. Teal
// while proofing, primary once a feed is due. A small label sits in the middle.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useAppTheme } from '@/hooks/useAppTheme';
import { typography } from '@/theme';

export interface ProgressRingProps {
  /** 0..1 fill. */
  progress: number;
  due?: boolean;
  size?: number;
  label?: string;
}

export function ProgressRing({ progress, due = false, size = 44, label }: ProgressRingProps) {
  const { palette } = useAppTheme();
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const color = due ? palette.primary : palette.proofTeal;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={palette.bgSunken}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {label ? <Text style={[styles.label, typography.numeric.sm, { color }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute' },
});

export default ProgressRing;
