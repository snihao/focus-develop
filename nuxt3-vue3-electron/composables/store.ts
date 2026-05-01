import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    token: '' as string,
    theme: 'light' as 'light' | 'dark',
    locale: 'zh-CN' as string,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    clearToken() {
      this.token = '';
    },
    setTheme(theme: 'light' | 'dark') {
      this.theme = theme;
    },
    setLocale(locale: string) {
      this.locale = locale;
    }
  },
  persist: {
    storage: localStorage
  }
});
