// Which colour a recipe's tag strip takes. Tags are stored as their display labels,
// so the match is against the same translated strings the tag chips offer.
import type { TFunction } from 'i18next';

export type TagStrip = 'teal' | 'butter' | 'tomato';

/**
 * Teal for the long ferments, butter for the sweet things, tomato for everything
 * else. The first match in that order wins, so a sweet sourdough still reads as a
 * sourdough.
 */
export function tagStripFor(tags: string[], t: TFunction): TagStrip {
  const teal = [t('recipes.tag_sourdough'), t('recipes.tag_bread')];
  const butter = [t('recipes.tag_sweet')];

  if (tags.some((tag) => teal.includes(tag))) {
    return 'teal';
  }
  if (tags.some((tag) => butter.includes(tag))) {
    return 'butter';
  }
  return 'tomato';
}
