// Lets TypeScript understand `import Sam from './sam.svg'` as a React component.
declare module '*.svg' {
  import type * as React from 'react';
  import type { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Global CSS is a web-only side-effect import (ignored on native by Expo).
declare module '*.css';
