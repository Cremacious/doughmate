// Fresh Bake empty state. The old ones were a centred Sam, two lines and no way
// forward. This is a hero: Sam at full size on butter, a headline, a line in his
// voice, and two routes out. Optional dashed suggestion tiles sit below the card,
// on the canvas, because they are ideas rather than actions.
import { StyleSheet, Text, View } from 'react-native';

import { Sam } from '@/components/Sam';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { SamEmotion } from '@/lib/samEmotion';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';
import { Button } from './Button';
import { Card } from './Card';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  headline: string;
  body: string;
  primary: EmptyStateAction;
  secondary: EmptyStateAction;
  emotion?: SamEmotion;
  /** Ideas rather than actions, so they sit outside the card. */
  suggestions?: string[];
}

const SAM_SIZE = 150;

export function EmptyState({
  headline,
  body,
  primary,
  secondary,
  emotion = 'curious',
  suggestions,
}: EmptyStateProps) {
  const { palette, fontScale } = useAppTheme();

  return (
    <View style={styles.wrap}>
      <Card tier="hero" heroColor={palette.accentButter} style={styles.card}>
        <Sam size={SAM_SIZE} emotion={emotion} crust={palette.samCrustPale} />
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.centred,
            { color: palette.onButter },
          ]}
        >
          {headline}
        </Text>
        <Text
          style={[
            typography.body.md,
            scaleType(typography.body.md, fontScale),
            styles.centred,
            { color: palette.onButterBody },
          ]}
        >
          {body}
        </Text>
        <View style={styles.actions}>
          {/* Ink, not tomato: the card is already butter, and one hero colour per screen. */}
          <Button label={primary.label} onPress={primary.onPress} haptic="pop" variant="ink" />
          <Button label={secondary.label} onPress={secondary.onPress} variant="secondary" />
        </View>
      </Card>

      {suggestions?.length ? (
        <View style={styles.suggestions}>
          {suggestions.map((s) => (
            <View key={s} style={[styles.tile, { borderColor: palette.border }]}>
              <Text
                style={[
                  typography.body.sm,
                  scaleType(typography.body.sm, fontScale),
                  { color: palette.textFaint },
                ]}
              >
                {s}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  card: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  centred: { textAlign: 'center' },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing['2xs'] },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius['2xl'],
    borderWidth: stroke.soft,
    borderStyle: 'dashed',
  },
});

export default EmptyState;
