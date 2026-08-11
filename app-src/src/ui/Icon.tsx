// Proof icon. Renders the extracted design system glyphs. 24x24, 2pt round stroke.
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';

import { ICONS, type IconName } from './iconData';

export type { IconName };

export interface IconProps {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, color, strokeWidth = 2 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name].map((el, i) => {
        const a = el.attrs;
        switch (el.tag) {
          case 'path':
            return <Path key={i} d={String(a.d)} />;
          case 'circle':
            return <Circle key={i} cx={a.cx} cy={a.cy} r={a.r} />;
          case 'rect':
            return <Rect key={i} x={a.x} y={a.y} width={a.width} height={a.height} rx={a.rx} />;
          case 'ellipse':
            return <Ellipse key={i} cx={a.cx} cy={a.cy} rx={a.rx} ry={a.ry} />;
          case 'line':
            return <Line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />;
          default:
            return null;
        }
      })}
    </Svg>
  );
}

export default Icon;
