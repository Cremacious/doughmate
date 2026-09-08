// Doughmate cold start — continuous composition.
// Recreated from app-src: theme.ts (Fresh Bake tokens), components/Sam.tsx,
// ui/{ScreenHeader,ModeChip,ResultDisplay,Card,Chip,PickerField,Input,UnitPair,
// TabBar,AdSlot,IconButton,iconData,fieldMetrics}.tsx and app/(tabs)/convert.tsx.

const { useComposition, Easing, animate, CompositionStage } = window;
const R = window.React;

/* ---------------------------------------------------------------- tokens */

const L = {
  ink: true,
  bgCanvas: '#F7EFE1', bgSurface: '#FFFDF8', bgSunken: '#EFE2CE',
  outline: '#241611', border: '#DCC9B2', borderField: '#E4D3BC',
  textInk: '#241611', textSoft: '#6B5344', textFaint: '#9C8776',
  primary: '#F2603C', primaryText: '#C24A26',
  onPrimary: '#FFF9F4', onPrimarySoft: '#FFD9C8',
  accentButter: '#FFC24B', onButter: '#241611',
  tabShelf: '#241611', tabShelfIdle: '#A8917C', tabShelfActive: '#FFC24B',
  samOutline: '#241611', samCrustPale: '#FFF3DC',
};
const D = {
  ink: false,
  bgCanvas: '#17120F', bgSurface: '#211A16', bgSunken: '#1B1512',
  outline: '#342922', border: '#342922', borderField: '#342922',
  textInk: '#F7ECE2', textSoft: '#C0AA9B', textFaint: '#8E7A6C',
  primary: '#FF7A52', primaryText: '#FF9C7B',
  onPrimary: '#2A1109', onPrimarySoft: '#3B1810',
  accentButter: '#FFCD6B', onButter: '#2A1109',
  tabShelf: '#211A16', tabShelfIdle: '#8E7A6C', tabShelfActive: '#FFCD6B',
  samOutline: '#12100E', samCrustPale: '#FFE3B0',
};

const DISPLAY = 'Bricolage Grotesque';
const BODY = 'Nunito Sans';
const NUM = 'Space Grotesk';

const LABEL = {
  fontFamily: BODY, fontWeight: 800, fontSize: 11, lineHeight: '15px',
  letterSpacing: 1.5, textTransform: 'uppercase',
};

const PHONE_W = 390, PHONE_H = 844, TOP_INSET = 47, BOTTOM_INSET = 34;
const GUTTER = 22;
const HERO = { x: GUTTER, y: 194, w: PHONE_W - GUTTER * 2, h: 183, r: 26 };
const SHELF_H = 70 + BOTTOM_INSET;

/* --------------------------------------------------------------- motion */

const MOTION = {
  ease: (o) => animate({ ...o, ease: Easing.easeInOutQuart }),
  pop: (o) => animate({ ...o, ease: Easing.easeOutBack }),
  fade: (o) => animate({ ...o, ease: Easing.easeOutQuad }),
};

/** Keyframes: [[t, value, easeName], ...] — every segment goes through MOTION. */
function kf(T, keys) {
  if (T <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (T <= keys[i][0]) {
      const a = keys[i - 1], b = keys[i];
      return MOTION[b[2] || 'ease']({ from: a[1], to: b[1], start: a[0], end: b[0] })(T);
    }
  }
  return keys[keys.length - 1][1];
}

/** Visibility window with short ramps, for the cut-style face changes. */
function win(T, a, b, ramp) {
  const r = ramp || 0.03;
  return Math.min(
    MOTION.fade({ from: 0, to: 1, start: a, end: a + r })(T),
    MOTION.fade({ from: 1, to: 0, start: b, end: b + r })(T)
  );
}

/* ---------------------------------------------------------------- icons */
// Verbatim from src/ui/iconData.ts — 24x24, 2pt round stroke.
const ICONS = {
  convert: ['M4 8h9M9.5 4.5 13 8l-3.5 3.5', 'M20 16h-9M14.5 12.5 11 16l3.5 3.5'],
  recipes: ['M4 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v14H6a2 2 0 0 0-2 2z', 'M9 9h6M9 13h4'],
  starters: ['M8 3h8M9.5 3v4.5L6 15.5A3 3 0 0 0 8.7 20h6.6A3 3 0 0 0 18 15.5L14.5 7.5V3', 'M7 15h10'],
  pan: ['M6.5 6.5h11a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z', 'M8 6.5V5M16 6.5V5'],
  oven: ['M10 4a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z', 'M12 8v6'],
  yeast: ['M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z'],
  settings: [
    'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  ],
  swaps: ['M5 8h9l-3-3M19 16h-9l3 3'],
};

function Icon({ name, size, color, sw }) {
  const extra = [];
  if (name === 'settings') extra.push(R.createElement('circle', { key: 'c', cx: 12, cy: 12, r: 3 }));
  if (name === 'swaps') {
    extra.push(R.createElement('circle', { key: 'a', cx: 17, cy: 8, r: 2.5 }));
    extra.push(R.createElement('circle', { key: 'b', cx: 7, cy: 16, r: 2.5 }));
  }
  return R.createElement(
    'svg',
    {
      width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color,
      strokeWidth: sw || 2, strokeLinecap: 'round', strokeLinejoin: 'round',
      style: { display: 'block', flex: '0 0 auto' },
    },
    (ICONS[name] || []).map((d, i) => R.createElement('path', { key: i, d })),
    extra
  );
}

/* ------------------------------------------------------------------ Sam */
// Geometry lifted from src/components/Sam.tsx (viewBox 0 0 120 104).

const CHEEK = '#F2A0A0', SHADOW = '#8B5A2B', ZZZ = '#A08D7C';

function Sam({ width, crust, ink, sleepy, awake, happy, zzz }) {
  const g = (key, children, opacity) =>
    R.createElement('g', { key, opacity, style: { transition: 'none' } }, children);
  return R.createElement(
    'svg',
    { width, height: width * (104 / 120), viewBox: '0 0 120 104', style: { display: 'block', overflow: 'visible' } },
    R.createElement('ellipse', { cx: 60, cy: 98, rx: 40, ry: 4.5, fill: SHADOW, opacity: 0.18 }),
    R.createElement('path', {
      d: 'M14 64 C14 32 40 20 60 20 C80 20 106 32 106 64 C106 82 88 92 60 92 C32 92 14 82 14 64 Z',
      fill: crust, stroke: ink, strokeWidth: 3,
    }),
    // closed eyes + flat mouth (sleepy face, per Sam.tsx 'sleepy')
    g('closed', [
      R.createElement('path', { key: 1, d: 'M42 55 h10', stroke: ink, strokeWidth: 2.6, strokeLinecap: 'round' }),
      R.createElement('path', { key: 2, d: 'M68 55 h10', stroke: ink, strokeWidth: 2.6, strokeLinecap: 'round' }),
      R.createElement('path', { key: 3, d: 'M56 68 h8', stroke: ink, strokeWidth: 2.4, strokeLinecap: 'round' }),
    ], sleepy),
    // open dot eyes + small smile ('idle')
    g('idle', [
      R.createElement('circle', { key: 1, cx: 47, cy: 54, r: 3, fill: ink }),
      R.createElement('circle', { key: 2, cx: 73, cy: 54, r: 3, fill: ink }),
      R.createElement('path', { key: 3, d: 'M52 66 q8 6 16 0', stroke: ink, strokeWidth: 2.6, fill: 'none', strokeLinecap: 'round' }),
    ], awake),
    // cheeks, brows, big smile ('happy')
    g('happy', [
      R.createElement('ellipse', { key: 1, cx: 36, cy: 62, rx: 6, ry: 3.6, fill: CHEEK, opacity: 0.5 }),
      R.createElement('ellipse', { key: 2, cx: 84, cy: 62, rx: 6, ry: 3.6, fill: CHEEK, opacity: 0.5 }),
      R.createElement('g', { key: 3, stroke: ink, strokeWidth: 2.6, fill: 'none', strokeLinecap: 'round' },
        R.createElement('path', { d: 'M42 56 q5 -5 10 0' }),
        R.createElement('path', { d: 'M68 56 q5 -5 10 0' }),
        R.createElement('path', { d: 'M50 65 q10 9 20 0' })
      ),
    ], happy),
    // zzz (sleepy accent), drifting
    R.createElement('g', { opacity: zzz.o, transform: `translate(0 ${zzz.y})` },
      R.createElement('path', {
        d: 'M84 30 h6 l-6 6 h6', stroke: ZZZ, strokeWidth: 1.6, fill: 'none',
        strokeLinecap: 'round', strokeLinejoin: 'round',
      }),
      R.createElement('path', {
        d: 'M93 22 h4 l-4 4 h4', stroke: ZZZ, strokeWidth: 1.4, fill: 'none',
        strokeLinecap: 'round', strokeLinejoin: 'round',
      })
    )
  );
}

/* -------------------------------------------------------- app fragments */

function StatusBar({ p }) {
  const bar = (h) => R.createElement('div', {
    style: { width: 3, height: h, borderRadius: 1, background: p.textInk },
  });
  return R.createElement('div', {
    style: {
      height: TOP_INSET, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 30px 0 34px', flex: '0 0 auto',
    },
  },
    R.createElement('div', { style: { fontFamily: BODY, fontWeight: 800, fontSize: 15, color: p.textInk } }, '9:41'),
    R.createElement('div', { style: { display: 'flex', alignItems: 'flex-end', gap: 4 } },
      bar(5), bar(7), bar(9), bar(11),
      R.createElement('div', {
        style: {
          marginLeft: 4, width: 24, height: 12, borderRadius: 3,
          border: `1.5px solid ${p.textInk}`, padding: 2, boxSizing: 'border-box',
        },
      }, R.createElement('div', { style: { width: '70%', height: '100%', borderRadius: 1, background: p.textInk } }))
    )
  );
}

function HardShadow({ p, offset, radius, children, style }) {
  // src/ui/HardShadow.tsx — dark mode drops the ink shadow entirely.
  const show = p.ink && offset;
  return R.createElement('div', { style: { position: 'relative', ...(style || {}) } },
    show ? R.createElement('div', {
      style: {
        position: 'absolute', inset: 0, borderRadius: radius,
        background: offset.c, transform: `translate(${offset.x}px, ${offset.y}px)`,
      },
    }) : null,
    R.createElement('div', { style: { position: 'relative' } }, children)
  );
}

function Header({ p }) {
  return R.createElement('div', {
    style: {
      padding: `10px ${GUTTER}px`, display: 'flex', alignItems: 'flex-end',
      justifyContent: 'space-between', gap: 14,
    },
  },
    R.createElement('div', { style: { display: 'grid', gap: 2 } },
      R.createElement('div', { style: { ...LABEL, color: p.primaryText } }, 'Ingredient'),
      R.createElement('div', {
        style: {
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, lineHeight: '38px',
          letterSpacing: -0.72, color: p.textInk,
        },
      }, 'Convert')
    ),
    R.createElement(HardShadow, { p, offset: { x: 3, y: 3, c: p.outline }, radius: 14 },
      R.createElement('div', {
        style: {
          width: 46, height: 46, borderRadius: 14, background: p.bgSurface,
          border: `2px solid ${p.outline}`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        },
      }, R.createElement(Icon, { name: 'settings', size: 21, color: p.textInk }))
    )
  );
}

function ModeRow({ p }) {
  const collapsed = (name) => R.createElement('div', {
    key: name,
    style: {
      width: 44, height: 44, borderRadius: 999, border: `1.5px solid ${p.borderField}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
    },
  }, R.createElement(Icon, { name, size: 18, color: p.textSoft }));

  return R.createElement('div', {
    style: { padding: `8px ${GUTTER}px 10px`, background: p.bgCanvas },
  },
    R.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
      R.createElement(HardShadow, { p, offset: { x: 3, y: 3, c: p.outline }, radius: 999 },
        R.createElement('div', {
          style: {
            height: 44, borderRadius: 999, padding: '0 14px', display: 'flex',
            alignItems: 'center', gap: 8, background: p.accentButter,
            border: `2px solid ${p.outline}`, boxSizing: 'border-box',
          },
        },
          R.createElement(Icon, { name: 'convert', size: 18, color: p.onButter }),
          R.createElement('div', {
            style: { fontFamily: BODY, fontWeight: 800, fontSize: 14, lineHeight: '18px', color: p.onButter },
          }, 'Ingredient')
        )
      ),
      collapsed('pan'), collapsed('oven'), collapsed('yeast'),
      R.createElement('div', {
        style: {
          height: 44, borderRadius: 999, padding: '0 14px', display: 'flex',
          alignItems: 'center', border: `1.5px solid ${p.borderField}`,
          fontFamily: NUM, fontWeight: 700, fontSize: 15, color: p.textSoft, boxSizing: 'border-box',
        },
      }, '+2')
    )
  );
}

function Field({ p, label, children }) {
  return R.createElement('div', { style: { display: 'grid', gap: 8, minWidth: 0 } },
    R.createElement('div', { style: { ...LABEL, color: p.textFaint, whiteSpace: 'nowrap' } }, label),
    children
  );
}

function InputCard({ p }) {
  const box = (children, extra) => R.createElement('div', {
    style: {
      height: 52, borderRadius: 14, background: p.bgCanvas,
      border: `1.5px solid ${p.borderField}`, padding: '0 14px', boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', gap: 8, ...(extra || {}),
    },
  }, children);

  const chip = (label, selected) => R.createElement('div', {
    key: label,
    style: {
      height: 36, borderRadius: 999, padding: '0 14px', display: 'flex',
      alignItems: 'center', boxSizing: 'border-box',
      background: selected ? p.primary : 'transparent',
      border: selected ? 'none' : `1.5px solid ${p.borderField}`,
      fontFamily: BODY, fontWeight: 800, fontSize: 14, lineHeight: '18px',
      color: selected ? p.onPrimary : p.textSoft,
    },
  }, label);

  const half = (label, color, underline) => R.createElement('div', {
    style: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 0 },
  },
    R.createElement('div', {
      style: {
        fontFamily: BODY, fontWeight: 700, fontSize: 17, lineHeight: '22px', color,
        textDecoration: underline ? 'underline' : 'none', whiteSpace: 'nowrap',
      },
    }, label),
    R.createElement('div', { style: { ...LABEL, letterSpacing: 0, color } }, '▾')
  );

  return R.createElement('div', {
    style: {
      background: p.bgSurface, border: `2px solid ${p.outline}`, borderRadius: 24,
      padding: 18, display: 'grid', gap: 14, boxSizing: 'border-box',
    },
  },
    R.createElement(Field, { p, label: 'Ingredient' },
      box([
        R.createElement('div', {
          key: 'v',
          style: {
            flex: 1, fontFamily: BODY, fontWeight: 700, fontSize: 17, color: p.textInk,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          },
        }, 'All purpose flour'),
        R.createElement('div', { key: 'c', style: { fontFamily: BODY, fontWeight: 700, fontSize: 17, color: p.textFaint } }, '▾'),
      ])
    ),
    R.createElement('div', { style: { display: 'flex', gap: 14, alignItems: 'flex-end' } },
      R.createElement('div', { style: { flex: 1, minWidth: 0 } },
        R.createElement(Field, { p, label: 'Amount' },
          box(R.createElement('div', { style: { fontFamily: NUM, fontWeight: 700, fontSize: 22, color: p.textInk } }, '1'))
        )
      ),
      R.createElement('div', { style: { flex: 1.25, minWidth: 0 } },
        R.createElement(Field, { p, label: 'equals' },
          R.createElement('div', {
            style: {
              height: 52, borderRadius: 14, background: p.primary, padding: '0 14px',
              display: 'flex', alignItems: 'center', gap: 10, boxSizing: 'border-box',
            },
          },
            half('cup', p.onPrimary, true),
            R.createElement('div', {
              style: { fontFamily: BODY, fontWeight: 700, fontSize: 17, color: p.accentButter },
            }, '→'),
            half('g', p.accentButter, false)
          )
        )
      )
    ),
    R.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 10 } },
      ['cup', 'tbsp', 'tsp', 'ml', 'g', 'oz', 'lb'].map((u) => chip(u, u === 'cup'))
    )
  );
}

function BottomChrome({ p, opacity, ty }) {
  const tab = (name, label, active) => R.createElement('div', {
    key: name,
    style: { flex: 1, display: 'grid', justifyItems: 'center', gap: 3 },
  },
    R.createElement('div', {
      style: {
        width: 46, height: 32, borderRadius: 999, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: active ? p.tabShelfActive : 'transparent',
      },
    }, R.createElement(Icon, { name, size: 20, color: active ? p.onButter : p.tabShelfIdle })),
    R.createElement('div', {
      style: {
        fontFamily: BODY, fontWeight: 800, fontSize: 11,
        color: active ? p.tabShelfActive : p.tabShelfIdle,
      },
    }, label)
  );

  return R.createElement('div', {
    style: {
      position: 'absolute', left: 0, right: 0, bottom: 0,
      opacity, transform: `translateY(${ty}px)`,
    },
  },
    R.createElement('div', {
      style: {
        margin: `0 14px ${SHELF_H + 12}px`, height: 66, borderRadius: 16,
        background: p.bgSunken, border: `1.5px dashed ${p.border}`, boxSizing: 'border-box',
      },
    }),
    R.createElement('div', {
      style: {
        position: 'absolute', left: 0, right: 0, bottom: 0, height: SHELF_H,
        background: p.tabShelf, borderTopLeftRadius: 26, borderTopRightRadius: 26,
        padding: `10px 14px ${BOTTOM_INSET + 10}px`, display: 'flex', boxSizing: 'border-box',
      },
    },
      tab('convert', 'Convert', true),
      tab('recipes', 'Recipes', false),
      tab('starters', 'Starters', false),
      tab('swaps', 'Swaps', false)
    )
  );
}

/* ------------------------------------------------------------ one phone */

function Phone({ p, T, C }) {
  // --- Sam's body: squash, stretch, hop, settle (authored seconds) ---
  const breathe = 0.014 * Math.sin(T * 4.2) * MOTION.fade({ from: 1, to: 0, start: 0.32, end: 0.46 })(T);
  const sy = kf(T, [[0.40, 1, 'fade'], [0.52, 0.90, 'fade'], [0.66, 1.14, 'pop'], [0.78, 0.94, 'fade'], [0.90, 1.03, 'pop'], [1.00, 1, 'pop']]) + breathe;
  const sx = kf(T, [[0.40, 1, 'fade'], [0.52, 1.08, 'fade'], [0.66, 0.92, 'pop'], [0.78, 1.06, 'fade'], [0.90, 0.98, 'pop'], [1.00, 1, 'pop']]) - breathe;
  const hop = kf(T, [[0.52, 0, 'fade'], [0.66, -26, 'pop'], [0.78, 0, 'fade'], [0.87, -5, 'pop'], [1.00, 0, 'pop']]);
  const rot = kf(T, [[0.60, 0, 'fade'], [0.68, -2.4, 'pop'], [0.82, 1.6, 'pop'], [1.00, 0, 'pop']]);
  const settleIn = kf(T, [[0, 0.92, 'fade'], [0.34, 1, 'pop']]);

  // --- faces: asleep → eyes open → blink → happy ---
  const sleepy = Math.max(win(T, -1, 0.42, 0.04), win(T, 0.545, 0.585, 0.02));
  const awake = Math.min(win(T, 0.40, 0.545, 0.03), 1 - win(T, 0.545, 0.585, 0.02));
  const happy = win(T, 0.60, 99, 0.05);
  const zzz = {
    o: MOTION.fade({ from: 1, to: 0, start: 0.30, end: 0.42 })(T) * (0.72 + 0.28 * Math.sin(T * 5.2)),
    y: -8 + 6 * Math.sin(T * 2.6) + MOTION.fade({ from: 0, to: -14, start: 0.30, end: 0.44 })(T),
  };

  // --- handoff: the splash ground becomes the tomato answer card ---
  const H0 = C.Handoff, H1 = C.Handoff + 0.42;
  const m = (a, b) => MOTION.ease({ from: a, to: b, start: H0, end: H1 })(T);
  const panel = { x: m(0, HERO.x), y: m(0, HERO.y), w: m(PHONE_W, HERO.w), h: m(PHONE_H, HERO.h), r: m(0, HERO.r) };
  const panelBorder = MOTION.fade({ from: 0, to: 2, start: H0 + 0.24, end: H1 })(T);

  const samScale = MOTION.ease({ from: 1, to: 0.46, start: H0, end: H0 + 0.28 })(T);
  const samOpacity = 1 - MOTION.fade({ from: 0, to: 1, start: H0 + 0.04, end: H0 + 0.22 })(T);
  const samY = MOTION.ease({ from: 0, to: -96, start: H0, end: H0 + 0.30 })(T);

  const wordOpacity = Math.min(
    MOTION.fade({ from: 0, to: 1, start: C.Wordmark + 0.02, end: C.Wordmark + 0.22 })(T),
    1 - MOTION.fade({ from: 0, to: 1, start: H0, end: H0 + 0.14 })(T)
  );
  const wordY = kf(T, [[C.Wordmark + 0.02, 18, 'fade'], [C.Wordmark + 0.26, 0, 'pop']]);

  const chromeO = MOTION.fade({ from: 0, to: 1, start: H0 + 0.08, end: H0 + 0.30 })(T);
  const chromeY = MOTION.fade({ from: 12, to: 0, start: H0 + 0.08, end: H0 + 0.34 })(T);
  const cardO = MOTION.fade({ from: 0, to: 1, start: H0 + 0.16, end: H0 + 0.40 })(T);
  const cardY = MOTION.fade({ from: 22, to: 0, start: H0 + 0.16, end: H0 + 0.44 })(T);
  const bottomO = MOTION.fade({ from: 0, to: 1, start: H0 + 0.20, end: H0 + 0.44 })(T);
  const bottomY = MOTION.fade({ from: 26, to: 0, start: H0 + 0.20, end: H0 + 0.46 })(T);

  const answerO = MOTION.fade({ from: 0, to: 1, start: H1 - 0.06, end: H1 + 0.16 })(T);
  const answerS = kf(T, [[H1 - 0.06, 0.86, 'fade'], [H1 + 0.18, 1, 'pop']]);

  return R.createElement('div', {
    style: {
      position: 'relative', width: PHONE_W, height: PHONE_H, borderRadius: 42,
      overflow: 'hidden', background: p.bgCanvas, isolation: 'isolate',
    },
  },
    // ---- the app underneath ----
    R.createElement('div', { style: { position: 'absolute', inset: 0, opacity: chromeO } },
      R.createElement('div', { style: { transform: `translateY(${chromeY}px)` } },
        R.createElement(StatusBar, { p }),
        R.createElement(Header, { p }),
        R.createElement(ModeRow, { p })
      )
    ),
    R.createElement('div', {
      style: {
        position: 'absolute', left: GUTTER, right: GUTTER, top: HERO.y + HERO.h + 14,
        opacity: cardO, transform: `translateY(${cardY}px)`,
      },
    }, R.createElement(InputCard, { p })),
    R.createElement(BottomChrome, { p, opacity: bottomO, ty: bottomY }),

    // ---- the splash ground, morphing into the answer card ----
    R.createElement('div', {
      style: {
        position: 'absolute', left: panel.x, top: panel.y, width: panel.w, height: panel.h,
        borderRadius: panel.r, background: p.primary, overflow: 'hidden',
        border: `${panelBorder}px solid ${p.ink ? p.outline : p.primary}`, boxSizing: 'border-box',
      },
    },
      // Sam, sleeping then waking, centred on the splash
      R.createElement('div', {
        style: {
          position: 'absolute', left: '50%', top: 400, opacity: samOpacity,
          transform: `translate(-50%, -50%) translateY(${samY}px) scale(${samScale * settleIn})`,
        },
      },
        R.createElement('div', {
          style: {
            transform: `translateY(${hop}px) rotate(${rot}deg) scale(${sx}, ${sy})`,
            transformOrigin: '50% 92%',
          },
        }, R.createElement(Sam, {
          width: 258, crust: p.samCrustPale, ink: p.samOutline, sleepy, awake, happy, zzz,
        }))
      ),
      // wordmark
      R.createElement('div', {
        style: {
          position: 'absolute', left: 0, right: 0, top: 546, textAlign: 'center',
          opacity: wordOpacity, transform: `translateY(${wordY}px)`,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, lineHeight: '44px',
          letterSpacing: -0.84, color: p.onPrimary,
        },
      }, 'Doughmate'),
      // the answer, once the card has arrived
      R.createElement('div', {
        style: {
          position: 'absolute', inset: 0, padding: 18, opacity: answerO,
          display: 'grid', gap: 10, alignContent: 'start', justifyItems: 'start',
          transform: `scale(${answerS})`, transformOrigin: '10% 40%',
        },
      },
        R.createElement('div', { style: { ...LABEL, color: p.onPrimarySoft } }, 'That is'),
        R.createElement('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10 } },
          R.createElement('div', {
            style: {
              fontFamily: NUM, fontWeight: 700, fontSize: 76, lineHeight: '72px',
              letterSpacing: -2.28, color: p.onPrimary,
            },
          }, '120'),
          R.createElement('div', {
            style: {
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, lineHeight: '24px', color: p.onPrimarySoft,
            },
          }, 'g')
        ),
        R.createElement('div', {
          style: {
            marginTop: 4, borderRadius: 999, background: p.accentButter,
            border: `2px solid ${p.ink ? p.outline : p.accentButter}`, padding: '7px 14px',
            fontFamily: BODY, fontWeight: 800, fontSize: 14, lineHeight: '18px', color: p.onButter,
          },
        }, '1 cup All purpose flour')
      )
    )
  );
}

/* ------------------------------------------------------------ the piece */

function BootPiece({ themes, notes }) {
  const { T, CUES } = useComposition();
  const stamp = `t=${T.toFixed(1)}s`;
  // The board keeps breathing through the app hold, so no frame is dead still.
  const drift = MOTION.fade({ from: 1, to: 1.035, start: CUES.App - 0.2, end: CUES.App + 1.8 })(T);

  const frame = (p, label, left) => R.createElement('div', {
    key: label,
    style: { position: 'absolute', left, top: 150 },
  },
    R.createElement('div', {
      style: {
        position: 'absolute', left: 2, top: -40, fontFamily: BODY, fontWeight: 800,
        fontSize: 24, letterSpacing: 1.6, textTransform: 'uppercase', color: L.textSoft,
      },
    }, label),
    R.createElement('div', {
      style: {
        position: 'relative', borderRadius: 48, padding: 3, background: L.outline,
        boxShadow: `10px 10px 0 0 rgba(36,22,17,0.22)`,
      },
    }, R.createElement(Phone, { p, T, C: CUES }))
  );

  return R.createElement('div', {
    'data-screen-label': stamp,
    style: { position: 'absolute', inset: 0, background: L.bgSunken, overflow: 'hidden' },
  },
    notes === false ? null : R.createElement('div', { style: { position: 'absolute', left: 72, top: 88 } },
      R.createElement('div', {
        style: {
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, lineHeight: '46px',
          letterSpacing: -0.9, color: L.textInk,
        },
      }, 'Cold start'),
      R.createElement('div', {
        style: {
          marginTop: 10, maxWidth: 300, fontFamily: BODY, fontWeight: 400,
          fontSize: 24, lineHeight: '34px', color: L.textSoft,
        },
      }, 'Sam wakes up in 1.2 seconds, then hands off to Convert.'),
      R.createElement('div', {
        style: {
          marginTop: 26, fontFamily: NUM, fontWeight: 700, fontSize: 26,
          letterSpacing: -0.4, color: L.primaryText,
        },
      }, stamp)
    ),
    R.createElement('div', {
      style: { position: 'absolute', inset: 0, transform: `scale(${drift})`, transformOrigin: '52% 52%' },
    },
      themes === 'Dark' ? null : frame(L, 'Light', themes === 'Both' ? 560 : 765),
      themes === 'Light' ? null : frame(D, 'Dark', themes === 'Both' ? 1090 : 765)
    )
  );
}

function DoughmateColdStart() {
  const [tw, setTweak] = window.useTweaks(window.TWEAK_DEFAULTS);
  const { TweaksPanel, TweakSection, TweakToggle, TweakRadio } = window;
  return R.createElement(R.Fragment, null,
    R.createElement(CompositionStage, {
      width: 1920, height: 1080, bg: L.bgSunken,
      scenes: window.OM_SCENES, playback: window.OM_PLAYBACK,
    }, R.createElement(BootPiece, { themes: tw.themes, notes: tw.notes })),
    R.createElement(TweaksPanel, null,
      R.createElement(TweakSection, { label: 'Board' }),
      R.createElement(TweakRadio, {
        label: 'Themes', value: tw.themes, options: ['Light', 'Dark', 'Both'],
        onChange: (v) => setTweak('themes', v),
      }),
      R.createElement(TweakToggle, {
        label: 'Spec notes', value: tw.notes, onChange: (v) => setTweak('notes', v),
      }),
      R.createElement(TweakSection, { label: 'Timeline' }),
      R.createElement(TweakToggle, {
        label: 'Motion editor', value: tw.motionEditor,
        onChange: (v) => setTweak('motionEditor', v),
      })
    )
  );
}

window.DoughmateColdStart = DoughmateColdStart;
