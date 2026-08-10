// Key value storage. This is the web / default implementation (localStorage,
// with an in-memory fallback). Native uses storage.native.ts (MMKV) instead;
// Metro picks the right file per platform.
const memory = new Map<string, string>();
const hasLocalStorage =
  typeof globalThis !== 'undefined' && typeof globalThis.localStorage !== 'undefined';

export const storage = {
  getItem(key: string): string | null {
    if (hasLocalStorage) {
      return globalThis.localStorage.getItem(key);
    }
    return memory.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (hasLocalStorage) {
      globalThis.localStorage.setItem(key, value);
      return;
    }
    memory.set(key, value);
  },
};
