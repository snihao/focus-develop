<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-config-provider :theme="theme" :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
        <div v-if="route.path !== '/'" class="h-screen w-full flex flex-col overflow-hidden bg-paper dark:bg-ink-deep">
          <AppHeader @changeTheme="changeThemeEmit" />
          <div class="flex flex-1 min-h-0 w-full">
            <AppLeftNav :chooseRightMenu="chooseRightMenu" @chooseMenu="chooseMenuEmit" />
            <div class="flex-1 min-w-0 flex flex-col">
              <AppRightNav :nowMenu="nowMenu" @chooseRightMenu="chooseRightMenuEmit" />
              <div class="flex-1 overflow-auto bg-paper dark:bg-ink-deep">
                <NuxtPage @chooseMenu="chooseMenuEmit" keepalive />
              </div>
            </div>
          </div>
        </div>
        <NuxtPage v-if="route.path === '/'" />
        <n-global-style />
      </n-config-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script setup lang="ts">
import type { GlobalTheme, GlobalThemeOverrides } from 'naive-ui';
import { dateZhCN, zhCN, darkTheme } from 'naive-ui';

const store = useStore();
const theme = ref<GlobalTheme | null>(null);
const route = useRoute();

// Naive UI 主题覆盖：强制墨/纸色系 + 直角
const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: '#c8372d',
    primaryColorHover: '#a82d25',
    primaryColorPressed: '#9a2920',
    primaryColorSuppl: '#c8372d',
    errorColor: '#c8372d',
    errorColorHover: '#a82d25',
    errorColorPressed: '#9a2920',
    errorColorSuppl: '#c8372d',
    borderRadius: '0px',
    borderRadiusSmall: '0px'
  },
  Button: {
    borderRadiusMedium: '0px',
    borderRadiusSmall: '0px',
    borderRadiusLarge: '0px',
    borderRadiusTiny: '0px'
  },
  Input: {
    borderRadius: '0px'
  },
  Tag: {
    borderRadius: '0px'
  },
  Card: {
    borderRadius: '0px'
  },
  Modal: {
    borderRadius: '0px'
  },
  Popover: {
    borderRadius: '0px'
  },
  Dropdown: {
    borderRadius: '0px'
  }
}));

// 左侧选中的菜单
const nowMenu = ref({} as any);
const chooseMenuEmit = (value: any) => {
  nowMenu.value = value;
};

// 右侧选择菜单
const chooseRightMenu = ref({} as any);
const chooseRightMenuEmit = (value: any) => {
  chooseRightMenu.value = value;
};

function applyDarkClass(isDark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

const changeThemeEmit = (value: boolean) => {
  theme.value = value ? darkTheme : null;
  applyDarkClass(value);
};

provide('theme', theme);

const hasTheme = () => {
  theme.value = store.darkTheme ? darkTheme : null;
  applyDarkClass(!!store.darkTheme);
};

onMounted(() => {
  hasTheme();
});
</script>
