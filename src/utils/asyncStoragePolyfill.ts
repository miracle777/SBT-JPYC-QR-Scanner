// React Native Async Storage のWeb用ポリフィル
// MetaMask SDK の React Native 依存関係を解決するため

const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined') {
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
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.warn('LocalStorage write failed:', e);
      }
    }
  },

  removeItem: async (key: string): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.warn('LocalStorage remove failed:', e);
      }
    }
  },

  clear: async (): Promise<void> => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.clear();
      } catch (e) {
        console.warn('LocalStorage clear failed:', e);
      }
    }
  },

  getAllKeys: async (): Promise<string[]> => {
    if (typeof window !== 'undefined') {
      try {
        return Object.keys(window.localStorage);
      } catch (e) {
        console.warn('LocalStorage keys access failed:', e);
        return [];
      }
    }
    return [];
  },
};

export default AsyncStorage;