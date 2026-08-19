// Shared create/edit bake sheet, a tall sheet. Logs how a loaf turned out,
// optionally linked to a recipe and a starter (id plus a name snapshot each).
// The day stepper never steps past today; deleting offers an undo toast.
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { daysAgo } from '@/lib/bake';
import { triggerHaptic } from '@/lib/haptics';
import { scaleType } from '@/lib/typeScale';
import { type Bake, type BakeInput, useBakes } from '@/state/bakes';
import { useRecipes } from '@/state/recipes';
import { useStarters } from '@/state/starters';
import { radius, spacing, stroke, typography } from '@/theme';
import { BottomSheet } from '@/ui/BottomSheet';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Chip } from '@/ui/Chip';
import { Input } from '@/ui/Input';
import { OptionSheet } from '@/ui/OptionSheet';
import { PickerField } from '@/ui/PickerField';
import { StarRating } from '@/ui/StarRating';
import { useToast } from '@/ui/Toast';

const TAG_IDS = [
  'open_crumb',
  'tight_crumb',
  'good_ear',
  'big_spring',
  'dark_crust',
  'pale_crust',
  'gummy',
  'dense',
  'flat',
  'sour',
  'airy',
  'golden',
] as const;

const DAY_MS = 86_400_000;

export default function BakeEditorSheet() {
  const { t } = useTranslation();
  const { palette, fontScale } = useAppTheme();
  const { addBake, updateBake, getBake, removeBake, restoreBake } = useBakes();
  const { recipes, getRecipe } = useRecipes();
  const { starters } = useStarters();
  const { show } = useToast();
  const [now] = useState(() => Date.now());
  const { id, recipeId: paramRecipeId } = useLocalSearchParams<{
    id?: string;
    recipeId?: string;
  }>();
  const existing = id ? getBake(id) : undefined;
  const prefillRecipe = !existing && paramRecipeId ? getRecipe(paramRecipeId) : undefined;

  const [name, setName] = useState(existing?.name ?? prefillRecipe?.name ?? '');
  const [recipeId, setRecipeId] = useState<string | undefined>(
    existing?.recipeId ?? prefillRecipe?.id
  );
  const [recipeName, setRecipeName] = useState<string | undefined>(
    existing?.recipeName ?? prefillRecipe?.name
  );
  const [starterId, setStarterId] = useState<string | undefined>(existing?.starterId);
  const [starterName, setStarterName] = useState<string | undefined>(existing?.starterName);
  const [rating, setRating] = useState(existing?.rating ?? 4);
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [bakedAt, setBakedAt] = useState(existing?.bakedAt ?? now);
  const [picker, setPicker] = useState<'recipe' | 'starter' | null>(null);

  const toggleTag = (tagId: string) =>
    setTags((prev) => (prev.includes(tagId) ? prev.filter((x) => x !== tagId) : [...prev, tagId]));

  const dayLabel = (() => {
    const diff = daysAgo(bakedAt, now);
    if (diff === 0) {
      return t('bakes.today');
    }
    if (diff === 1) {
      return t('bakes.yesterday');
    }
    return t('bakes.days_ago', { count: diff });
  })();

  const save = () => {
    const input: BakeInput = {
      name: name.trim() || t('bakes.new_title'),
      recipeId,
      recipeName,
      starterId,
      starterName,
      rating,
      tags,
      notes: notes.trim() || undefined,
      bakedAt,
    };
    if (existing) {
      updateBake(existing.id, input);
      router.back();
      show({ message: t('bakes.toast_updated'), variant: 'confirmation' });
    } else {
      addBake(input);
      router.back();
      show({ message: t('bakes.toast_saved'), variant: 'confirmation' });
    }
  };

  const deleteBake = () => {
    if (!existing) {
      return;
    }
    const removed: Bake = existing;
    removeBake(existing.id);
    router.back();
    show({
      message: t('bakes.toast_deleted'),
      actionLabel: t('recipes.button_undo'),
      onAction: () => restoreBake(removed),
    });
  };

  return (
    <BottomSheet
      size="tall"
      onClose={() => router.back()}
      header={
        <Text
          style={[
            typography.display.md,
            scaleType(typography.display.md, fontScale),
            styles.title,
            { color: palette.textInk },
          ]}
        >
          {existing ? t('bakes.edit_title') : t('bakes.new_title')}
        </Text>
      }
      footer={
        <Button
          label={existing ? t('bakes.save_changes') : t('bakes.save')}
          onPress={save}
          haptic="pop"
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Input
            label={t('bakes.field_name')}
            value={name}
            onChangeText={setName}
            placeholder={t('bakes.name_placeholder')}
          />
          <PickerField
            label={t('bakes.link_recipe')}
            value={recipeName ?? ''}
            onPress={() => setPicker('recipe')}
          />
        </Card>

        {/* The rating is the sheet's one hero: it is the whole point of logging. */}
        <Card tier="hero" heroColor={palette.accentButter} style={styles.ratingCard}>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: palette.onButterSoft },
            ]}
          >
            {t('bakes.field_rating')}
          </Text>
          <StarRating value={rating} onChange={setRating} size={30} color={palette.onButter} />
          <Text
            style={[
              typography.subheading,
              scaleType(typography.subheading, fontScale),
              { color: palette.onButter },
            ]}
          >
            {t(`bakes.rating_${rating}` as 'bakes.rating_4')}
          </Text>
        </Card>

        <Card>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {t('bakes.field_crumb')}
          </Text>
          <View style={styles.chips}>
            {TAG_IDS.map((tagId) => (
              <Chip
                key={tagId}
                label={t(`bakes.tags.${tagId}` as 'bakes.tags.open_crumb')}
                selected={tags.includes(tagId)}
                onPress={() => toggleTag(tagId)}
              />
            ))}
          </View>
        </Card>

        {/* When and Starter used share a row: two short facts, one line. */}
        <Card>
          <View style={styles.splitRow}>
            <View style={styles.splitCell}>
              <Text
                style={[
                  typography.label,
                  scaleType(typography.label, fontScale),
                  { color: palette.textFaint },
                ]}
              >
                {t('bakes.field_when')}
              </Text>
              <View style={styles.dayRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('bakes.field_when')}
                  onPress={() => {
                    triggerHaptic('select');
                    setBakedAt((prev) => prev - DAY_MS);
                  }}
                  style={[
                    styles.dayCircle,
                    { backgroundColor: palette.bgCanvas, borderColor: palette.outline },
                  ]}
                >
                  <Text style={[typography.subheading, { color: palette.textInk }]}>{'−'}</Text>
                </Pressable>
                <Text
                  style={[
                    typography.body.md,
                    scaleType(typography.body.md, fontScale),
                    styles.dayLabel,
                    { color: palette.textInk },
                  ]}
                  numberOfLines={1}
                >
                  {dayLabel}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('bakes.field_when')}
                  disabled={bakedAt >= now}
                  onPress={() => {
                    triggerHaptic('select');
                    setBakedAt((prev) => Math.min(prev + DAY_MS, now));
                  }}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: palette.bgCanvas,
                      borderColor: palette.outline,
                      opacity: bakedAt >= now ? 0.35 : 1,
                    },
                  ]}
                >
                  <Text style={[typography.subheading, { color: palette.textInk }]}>{'+'}</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.splitCell}>
              <PickerField
                label={t('bakes.field_starter')}
                value={starterName ?? ''}
                onPress={() => setPicker('starter')}
              />
            </View>
          </View>
        </Card>

        <Card>
          <Text
            style={[
              typography.label,
              scaleType(typography.label, fontScale),
              { color: palette.textFaint },
            ]}
          >
            {t('bakes.field_notes')}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t('bakes.notes_placeholder')}
            placeholderTextColor={palette.textFaint}
            multiline
            textAlignVertical="top"
            style={[
              typography.body.lg,
              scaleType(typography.body.lg, fontScale),
              styles.area,
              {
                backgroundColor: palette.bgCanvas,
                borderColor: palette.borderField,
                color: palette.textInk,
              },
            ]}
          />
        </Card>

        {existing ? (
          <Button
            label={t('bakes.delete')}
            variant="destructive"
            onPress={deleteBake}
            haptic="warning"
          />
        ) : null}
      </ScrollView>

      {picker === 'recipe' ? (
        <OptionSheet
          title={t('bakes.link_recipe')}
          searchable
          size="half"
          searchPlaceholder={t('bakes.recipe_search_placeholder')}
          selectedId={recipeId ?? ''}
          onClose={() => setPicker(null)}
          onSelect={(rid) => {
            if (rid === '') {
              setRecipeId(undefined);
              setRecipeName(undefined);
              return;
            }
            const r = getRecipe(rid);
            setRecipeId(rid);
            setRecipeName(r?.name);
            if (r && name.trim() === '') {
              setName(r.name);
            }
          }}
          options={[
            { id: '', label: t('bakes.pick_none') },
            ...recipes.map((r) => ({ id: r.id, label: r.name })),
          ]}
        />
      ) : null}
      {picker === 'starter' ? (
        <OptionSheet
          title={t('bakes.field_starter')}
          selectedId={starterId ?? ''}
          onClose={() => setPicker(null)}
          onSelect={(sid) => {
            if (sid === '') {
              setStarterId(undefined);
              setStarterName(undefined);
              return;
            }
            const s = starters.find((x) => x.id === sid);
            setStarterId(sid);
            setStarterName(s?.name);
          }}
          options={[
            { id: '', label: t('bakes.pick_none') },
            ...starters.map((s) => ({ id: s.id, label: s.name })),
          ]}
        />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing['3xl'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  ratingCard: { alignItems: 'flex-start', gap: spacing.sm },
  splitRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  splitCell: { flex: 1, gap: spacing.xs },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: stroke.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: { flex: 1, textAlign: 'center' },
  area: {
    borderRadius: radius.lg,
    borderWidth: stroke.soft,
    padding: spacing.md,
    height: 100,
  },
});
