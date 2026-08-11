// Temporary primitives gallery for verifying the Proof design system on web.
// Removed in phase 6.
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { Toggle } from '@/ui/Toggle';
import { spacing, typography } from '@/theme';

export default function DevUi() {
  const { palette } = useAppTheme();
  const [chip, setChip] = useState('cup');
  const [on, setOn] = useState(true);
  const [amount, setAmount] = useState('1');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bgCanvas }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[typography.display.lg, { color: palette.textInk }]}>Proof primitives</Text>
        <Text style={[typography.body.md, { color: palette.textSoft }]}>
          Gabarito display, Nunito Sans body, Space Grotesk numbers.
        </Text>

        <Text style={[typography.numeric.hero, { color: palette.primary }]}>120</Text>

        <Text style={[typography.label, { color: palette.primaryText }]}>Buttons</Text>
        <Button label="Save this" onPress={() => {}} />
        <Button label="Secondary" variant="secondary" onPress={() => {}} />
        <Button label="Quiet" variant="quiet" onPress={() => {}} />
        <Button label="Delete recipe" variant="destructive" onPress={() => {}} />
        <Button label="Loading" loading onPress={() => {}} />

        <Text style={[typography.label, { color: palette.primaryText }]}>Chips</Text>
        <View style={styles.row}>
          {['cup', 'tbsp', 'tsp', 'g'].map((u) => (
            <Chip key={u} label={u} selected={chip === u} onPress={() => setChip(u)} />
          ))}
        </View>

        <Card>
          <Text style={[typography.heading, { color: palette.textInk }]}>Card</Text>
          <Text style={[typography.body.md, { color: palette.textSoft }]}>
            Surface with a hairline border and the proof teal accent.
          </Text>
          <View style={styles.rowBetween}>
            <Text style={[typography.body.lg, { color: palette.textInk }]}>Reduced motion</Text>
            <Toggle value={on} onValueChange={setOn} />
          </View>
          <Input label="Amount" value={amount} onChangeText={setAmount} numeric />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['4xl'] },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
