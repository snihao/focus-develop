import { defineStore } from 'pinia';

import type { MenuOption } from 'naive-ui';
import type { Menu } from '~/api/menu';

export const useStore = defineStore('focus', {
  state: () => {
    return {
      darkTheme: false as boolean,
      chooseNav: null as any,
      loginRemember: null as any,
      menuOptions: [] as MenuOption[],
      menuList: [] as Menu[]
    };
  },
  actions: {
    setDarkTheme(isDark: boolean): void {
      this.darkTheme = isDark;
    },
    setChooseNav(nav: any): void {
      this.chooseNav = nav;
    },
    setNavIsDevelop() {
      this.chooseNav.isDevelop = true;
    },
    setLoginRemember(remember: any): void {
      this.loginRemember = remember;
    },
    clearLoginRemember(): void {
      this.loginRemember = null;
    },
    setMenuOptions(options: MenuOption[]): void {
      this.menuOptions = options;
    },
    setMenuList(list: Menu[]): void {
      this.menuList = list;
    },
    clearMenuOptions(): void {
      this.menuOptions = [];
      this.menuList = [];
    }
  },
  persist: import.meta.client && {
    storage: localStorage,
    paths: ['darkTheme', 'chooseNav', 'loginRemember', 'menuList']
  }
});
