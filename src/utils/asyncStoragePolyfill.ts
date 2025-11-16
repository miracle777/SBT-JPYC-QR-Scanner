// React Native Async Storage のWeb用ポリフィル
// MetaMask SDK の React Native 依存関係を解決するため

interface AsyncStorageStatic {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet?(keys: string[]): Promise<[string, string | null][]>;
  multiSet?(keyValuePairs: [string, string][]): Promise<void>;
  multiRemove?(keys: string[]): Promise<void>;
}

const AsyncStorage: AsyncStorageStatic = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.warn('LocalStorage access failed:', e);
        return null;
      }
    }
    return null;
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('LocalStorage write failed:', e);
      }
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn('LocalStorage remove failed:', e);
      }
    }
  },

  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.warn('LocalStorage clear failed:', e);
      }
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return Object.keys(window.localStorage);
      } catch (e) {
        console.warn('LocalStorage keys access failed:', e);
        return [];
      }
    }
    return [];
  },

  multiGet: async (keys: string[]): Promise<[string, string | null][]> => {
    const result: [string, string | null][] = [];
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      result.push([key, value]);
    }
    return result;
  },

  multiSet: async (keyValuePairs: [string, string][]): Promise<void> => {
    for (const [key, value] of keyValuePairs) {
      await AsyncStorage.setItem(key, value);
    }
  },

  multiRemove: async (keys: string[]): Promise<void> => {
    for (const key of keys) {
      await AsyncStorage.removeItem(key);
    }
  },
};

// デフォルトエクスポートとネームドエクスポートの両方を提供
export default AsyncStorage;
export { AsyncStorage };