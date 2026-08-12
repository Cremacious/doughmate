// Proof Input. Sunken field, optional label above, focus ring. Numbers render in
// the tabular numeric face.
import { useState } from 'react';
import { type KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, typography } from '@/theme';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  numeric?: boolean;
  autoFocus?: boolean;
}

export function Input({
  value,
  onChangeText,
  label,
  placeholder,
  keyboardType,
  numeric = false,
  autoFocus = false,
}: InputProps) {
  const { palette, fontScale } = useAppTheme();
  const [focused, setFocused] = useState(false);
  const floured = fontScale > 1;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text
          style={[
            typography.label,
            scaleType(typography.label, fontScale),
            { color: palette.textSoft },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          {
            height: floured ? 64 : 56,
            backgroundColor: palette.bgSunken,
            borderColor: focused ? palette.primary : 'transparent',
            borderWidth: focused ? 2 : 0,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textFaint}
          keyboardType={keyboardType}
          inputMode={numeric ? 'decimal' : undefined}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            numeric
              ? { fontFamily: typography.numeric.hero.fontFamily, fontSize: 20 * fontScale }
              : [typography.body.lg, scaleType(typography.body.lg, fontScale)],
            styles.input,
            { color: palette.textInk },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  box: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: { padding: 0 },
});

export default Input;
