// Fresh Bake Input. A quiet field on the canvas fill, so it reads as a hole in the
// standard card rather than another raised surface. Focus swaps the soft edge for the
// ink one, which is the only state change the field needs.
import { useState } from 'react';
import { type KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { scaleType } from '@/lib/typeScale';
import { radius, spacing, stroke, typography } from '@/theme';
import { fieldHeight } from './fieldMetrics';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  numeric?: boolean;
  autoFocus?: boolean;
  /** Overrides the field height, for the tall oven temperature field. */
  height?: number;
  /** Overrides the numeric face size, paired with `height`. */
  numericSize?: number;
  /** The one required field on a sheet gets the ink edge at rest. */
  required?: boolean;
}

export function Input({
  value,
  onChangeText,
  label,
  placeholder,
  keyboardType,
  numeric = false,
  autoFocus = false,
  height,
  numericSize,
  required = false,
}: InputProps) {
  const { palette, fontScale } = useAppTheme();
  const [focused, setFocused] = useState(false);

  const inked = focused || required;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text
          numberOfLines={1}
          style={[
            typography.label,
            scaleType(typography.label, fontScale),
            { color: palette.textFaint },
          ]}
        >
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.box,
          {
            height: height ? height * fontScale : fieldHeight(fontScale),
            backgroundColor: palette.bgCanvas,
            borderColor: inked ? palette.outline : palette.borderField,
            borderWidth: inked ? stroke.ink : stroke.soft,
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
              ? {
                  fontFamily: typography.numeric.md.fontFamily,
                  fontSize: (numericSize ?? typography.numeric.md.fontSize) * fontScale,
                }
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
