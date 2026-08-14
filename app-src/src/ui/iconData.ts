// Auto-generated from the Proof design system icon set. 24x24, 2pt round stroke.
export type IconName =
  | 'convert'
  | 'recipes'
  | 'starters'
  | 'swaps'
  | 'settings'
  | 'pan'
  | 'oven'
  | 'yeast'
  | 'egg'
  | 'butter'
  | 'timer'
  | 'save'
  | 'delete'
  | 'add'
  | 'search';

export type IconTag = 'path' | 'circle' | 'rect' | 'line' | 'ellipse';
export interface IconElement {
  tag: IconTag;
  attrs: Record<string, string | number>;
}

export const ICONS: Record<IconName, IconElement[]> = {
  convert: [
    { tag: 'path', attrs: { d: 'M4 8h9M9.5 4.5 13 8l-3.5 3.5' } },
    { tag: 'path', attrs: { d: 'M20 16h-9M14.5 12.5 11 16l3.5 3.5' } },
  ],
  recipes: [
    { tag: 'path', attrs: { d: 'M4 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14H6a2 2 0 0 0-2 2z' } },
    { tag: 'path', attrs: { d: 'M9 9h6M9 13h4' } },
  ],
  starters: [
    {
      tag: 'path',
      attrs: { d: 'M8 3h8M9.5 3v4.5L6 15.5A3 3 0 0 0 8.7 20h6.6A3 3 0 0 0 18 15.5L14.5 7.5V3' },
    },
    { tag: 'path', attrs: { d: 'M7 15h10' } },
  ],
  swaps: [
    { tag: 'path', attrs: { d: 'M5 8h9l-3-3M19 16h-9l3 3' } },
    { tag: 'circle', attrs: { cx: 17, cy: 8, r: 2.5 } },
    { tag: 'circle', attrs: { cx: 7, cy: 16, r: 2.5 } },
  ],
  settings: [
    { tag: 'circle', attrs: { cx: 12, cy: 12, r: 3 } },
    {
      tag: 'path',
      attrs: {
        d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
      },
    },
  ],
  pan: [
    { tag: 'rect', attrs: { x: 3.5, y: 6.5, width: 17, height: 12, rx: 3 } },
    { tag: 'path', attrs: { d: 'M8 6.5V5M16 6.5V5' } },
  ],
  oven: [
    { tag: 'path', attrs: { d: 'M10 4a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z' } },
    { tag: 'path', attrs: { d: 'M12 8v6' } },
  ],
  yeast: [{ tag: 'path', attrs: { d: 'M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z' } }],
  egg: [{ tag: 'ellipse', attrs: { cx: 12, cy: 13, rx: 6, ry: 8 } }],
  butter: [
    { tag: 'path', attrs: { d: 'M4 15l6-8h10l-6 8z' } },
    { tag: 'path', attrs: { d: 'M10 7v8M4 15h10' } },
  ],
  timer: [
    { tag: 'circle', attrs: { cx: 12, cy: 13, r: 8 } },
    { tag: 'path', attrs: { d: 'M12 9v4l3 2M9 3h6' } },
  ],
  save: [
    {
      tag: 'path',
      attrs: { d: 'M12 3.5l2.6 5.6 6 .8-4.4 4.3 1.1 6.1L12 17.4l-5.3 2.9 1.1-6.1L3.4 9.9l6-.8z' },
    },
  ],
  delete: [{ tag: 'path', attrs: { d: 'M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9L18 7' } }],
  add: [{ tag: 'path', attrs: { d: 'M12 5v14M5 12h14' } }],
  search: [
    { tag: 'circle', attrs: { cx: 11, cy: 11, r: 6.5 } },
    { tag: 'path', attrs: { d: 'M16 16l4 4' } },
  ],
};
