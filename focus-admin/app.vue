<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
        <div style="overflow: hidden" v-if="route.path !== '/'">
          <AppHeader @changeTheme="changeThemeEmit" />
          <div class="flex w-100" style="height: calc(100vh - 48px)">
            <AppLeftNav :chooseRightMenu="chooseRightMenu" @chooseMenu="chooseMenuEmit" />
            <div class="flex-1">
              <AppRightNav :nowMenu="nowMenu" @chooseRightMenu="chooseRightMenuEmit" />
              <div class="pd-6 app-main over-auto" :class="theme ? 'main-bg-dark' : 'main-bg'">
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
import type { GlobalTheme } from 'naive-ui';
import { dateZhCN, zhCN, darkTheme } from 'naive-ui';

const store = useStore();
const theme = ref<GlobalTheme | null>(null);
const route = useRoute();

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

const changeThemeEmit = (value: boolean) => {
  theme.value = value ? darkTheme : null;
};

provide('theme', theme);

const hasTheme = () => {
  theme.value = store.darkTheme ? darkTheme : null;
};

onMounted(() => {
  hasTheme();
});
</script>
<style lang="scss" scoped>
@use '~/assets/css/nh';

.app-main {
  height: calc(100vh - $px-48 - $px-48);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.2s;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translate(50px, 0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translate(-50px, 0);
}

body {
  padding: 0;
  margin: 0;
}
</style>
