// The Convert mode tray. The mode row only shows the selected converter plus a few
// icons, so this is where the rest live: one row each, with the icon big enough to
// recognise and the hint that says what the converter is for. The selected row is a
// butter hero row, so the tray opens already telling you where you are.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from './BottomSheet';
import { Icon, type IconName } from './Icon';

export interface ModeTrayOption {
  id: string;
  label: string;
  hint: string;
  iconName: IconName;
}

export interface ModeTrayProps {
  title: string;
  options: ModeTrayOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const TILE = 42;

export function ModeTray({ title, options, selectedId, onSelect, onClose }: ModeTrayProps) {
  const { palette, fontScale } = useAppTheme();

  return (
    <BottomSheet
      size="half"
      onClose={onClose}
      header={
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {title}
        </Text>
      }
    >
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
        {options.map((o) => {
          const selected = o.id === selectedId;
          return (
            <Pressable
              key={o.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                triggerHaptic('select');
                onSelect(o.id);
                onClose();
              }}
              style={[
                styles.row,
                selected
                  ? { backgroundColor: palette.accentButter, borderColor: palette.outline }
                  : { borderColor: 'transparent' },
              ]}
            >
              <View
                style={[
                  styles.tile,
                  {
                    backgroundColor: selected ? palette.bgSurface : palette.bgSunken,
                    borderColor: palette.outline,
                    borderWidth: selected ? stroke.ink : 0,
                  },
                ]}
              >
                <Icon name={o.iconName} size={22} color={palette.textInk} />
              </View>
              <View style={styles.text}>
                <Text
                  style={[
                    typography.subheading,
                    scaleType(typography.subheading, fontScale),
                    { color: selected ? palette.onButter : palette.textInk },
                  ]}
                >
                  {o.label}
                </Text>
                <Text
                  style={[
                    typography.body.sm,
                    scaleType(typography.body.sm, fontScale),
                    { color: selected ? palette.onButterBody : palette.textFaint },
                  ]}
                >
                  {o.hint}
                </Text>
              </View>
              {selected ? (
                <Text style={[typography.subheading, { color: palette.onButter }]}>✓</Text>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing['3xl'] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radius['2xl'],
    borderWidth: stroke.ink,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 1 },
});

export default ModeTray;
