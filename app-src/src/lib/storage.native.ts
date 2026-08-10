// Native key value storage backed by MMKV (fast, synchronous). Metro loads this
// on iOS and Android in place of storage.ts.
import { createMMKV } from 'react-native-mmkv';

const mmkv = createMMKV();

export const storage = {
  getItem(key: string): string | null {
    return mmkv.getString(key) ?? null;
  },
  setItem(key: string, value: string): void {
    mmkv.set(key, value);
  },
};
