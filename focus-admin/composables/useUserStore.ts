import { getEmpInfo, type EmpInfoResult } from '~/api/admin';

const COOKIE_KEY = 'admin-user-store-token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const useUserStore = defineStore(
  'user',
  () => {
    const token = useCookie(COOKIE_KEY, { default: () => '', maxAge: COOKIE_MAX_AGE });

    const store = useStore();

    const permissions = ref<string[]>([]);

    const userInfo = ref<EmpInfoResult | null>(null);

    const isLogin = computed(() => {
      return Boolean(token.value);
    });

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function clearToken() {
      token.value = '';
    }

    function clearPermissions() {
      permissions.value = [];
    }

    function setPermissions(newPermissions: string[]) {
      permissions.value = newPermissions ?? [];
    }

    function hasPermission(permission: string) {
      return permissions.value.includes(permission);
    }

    function hasPermissions(values: string[]) {
      return values.every((value) => hasPermission(value));
    }

    async function getUserInfo() {
      const res = await getEmpInfo();
      if (Number(res.code) === 200) {
        userInfo.value = res.data;
      }
    }

    function clearUserInfo() {
      userInfo.value = null;
    }

    async function clear() {
      clearToken();
      clearPermissions();
      clearUserInfo();
      store.clearMenuOptions();
    }

    async function logout() {
      await clear();
      navigateTo('/');
    }

    return {
      token,
      permissions,
      isLogin,
      userInfo,
      setToken,
      clearToken,
      clearPermissions,
      setPermissions,
      hasPermission,
      hasPermissions,
      getUserInfo,
      clearUserInfo,
      logout,
      clear
    };
  },
  {
    persist: import.meta.client && {
      storage: localStorage,
      key: 'admin-user-store'
    }
  }
);
