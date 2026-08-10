// Makes t('key.path') type safe against en.json.
import 'i18next';

import type { defaultNS, resources } from './index';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
