<template>
  <aside class="h-full relative z-[9] bg-paper-deep dark:bg-ink text-ink dark:text-paper border-r border-ink/15 dark:border-paper/10">
    <n-layout has-sider class="h-full !bg-transparent">
      <n-layout-sider
        :native-scrollbar="false"
        :collapse-mode="'width'"
        :collapsed-width="64"
        :width="240"
        :style="siderCssVars"
        class="h-full !bg-transparent"
        show-trigger>
        <n-menu
          ref="menuInstRef"
          :value="menu.key"
          default-value="home"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="store.menuOptions"
          :theme-overrides="menuThemeOverrides"
          @update:value="chooseMenu" />
      </n-layout-sider>
    </n-layout>
  </aside>
</template>

<script setup lang="ts">
import type { MenuOption, MenuInst } from 'naive-ui';
import { NIcon } from 'naive-ui';
import * as Icons from '@vicons/ionicons5';
import { getEmpMenuList, type Menu } from '~/api/menu';

const props = defineProps({
  chooseRightMenu: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['chooseMenu']);

const store = useStore();
const router = useRouter();
const userStore = useUserStore();
const theme = inject<Ref<boolean>>('theme');

const menu = ref({} as any);

// 侧栏 Naive UI 的背景色用 CSS 变量覆盖，保持纸色或墨色
const siderCssVars = computed(() => ({
  '--n-color': theme?.value ? '#1a1a1a' : '#ebe4d6',
  '--n-border-color': theme?.value ? 'rgba(244, 239, 231, 0.1)' : 'rgba(26, 26, 26, 0.15)',
  '--n-toggle-button-color': theme?.value ? '#1f1f24' : '#f4efe7',
  '--n-toggle-button-icon-color': theme?.value ? '#f4efe7' : '#1a1a1a'
}));

// n-menu 的主题覆盖：墨/纸色系 + 朱砂激活
const menuThemeOverrides = computed(() => {
  const isDark = !!theme?.value;
  return {
    itemTextColor: isDark ? '#c5bdb1' : '#4a4a4a',
    itemIconColor: isDark ? '#c5bdb1' : '#4a4a4a',
    itemTextColorHover: isDark ? '#f4efe7' : '#1a1a1a',
    itemIconColorHover: isDark ? '#f4efe7' : '#1a1a1a',
    itemColorActive: isDark ? 'rgba(200, 55, 45, 0.15)' : 'rgba(200, 55, 45, 0.08)',
    itemColorActiveCollapsed: isDark ? 'rgba(200, 55, 45, 0.15)' : 'rgba(200, 55, 45, 0.08)',
    itemColorActiveHover: isDark ? 'rgba(200, 55, 45, 0.2)' : 'rgba(200, 55, 45, 0.12)',
    itemTextColorActive: '#c8372d',
    itemTextColorActiveHover: '#c8372d',
    itemIconColorActive: '#c8372d',
    itemIconColorActiveHover: '#c8372d',
    itemTextColorChildActive: '#c8372d',
    itemIconColorChildActive: '#c8372d',
    itemTextColorChildActiveHover: '#c8372d',
    itemIconColorChildActiveHover: '#c8372d',
    arrowColor: isDark ? '#c5bdb1' : '#4a4a4a',
    arrowColorActive: '#c8372d',
    fontSize: '14px',
    borderRadius: '0px'
  };
});

const renderIcon = (iconName: string) => {
  const iconComp = Icons[iconName as keyof typeof Icons];
  if (!iconComp) return undefined;
  return () => h(NIcon, null, { default: () => h(iconComp) });
};

const { data: menuList, refresh: refreshMenuList } = useAsyncData('empMenuList', getEmpMenuList, {
  default: () => ({ data: [] })
});

onMounted(() => {
  // 客户端挂载时强制刷新，保证读取到 localStorage 的最新菜单
  if (import.meta.client) refreshMenuList();
});

watch(menuList, (newVal) => {
  if (newVal.data.length) {
    store.setMenuList(newVal.data);
  }
});

const findMenuOption = (opts: MenuOption[], key: string | number): MenuOption | undefined => {
  for (const opt of opts) {
    if (opt.key === key) return opt;
    if (opt.children) {
      const found = findMenuOption(opt.children, key);
      if (found) return found;
    }
  }
  return undefined;
};

// 监听 store.menuList 的变化，并处理初始化逻辑
watch(
  () => store.menuList,
  (newVal) => {
    if (newVal && newVal.length) {
      const options = convertToMenuOptions(newVal);
      store.setMenuOptions(options);

      handlePermissions(newVal);

      if (store.chooseNav && store.chooseNav.key) {
        const foundOption = findMenuOption(options, store.chooseNav.key);
        if (foundOption) {
          store.setChooseNav(foundOption);
          menu.value = foundOption;
        }
      }
    }
  },
  { immediate: true, deep: true }
);

// 递归处理菜单项，转换为 MenuOption 格式
function convertToMenuOptions(menuItems: Menu[]): MenuOption[] {
  if (!Array.isArray(menuItems)) return [];

  return menuItems.reduce((acc: MenuOption[], item) => {
    if (item.type === 2) return acc;

    const menuOption: MenuOption = {
      label: item.name,
      key: item.id,
      route: item.route,
      icon: renderIcon(item.icon)
    };

    if (Array.isArray(item.children) && item.children.length > 0) {
      const childOptions = convertToMenuOptions(item.children);
      if (childOptions.length > 0) {
        menuOption.children = childOptions;
      }
    }

    acc.push(menuOption);
    return acc;
  }, []);
}

// 收集菜单 mark 作为权限集合
function handlePermissions(list: Menu[] = []) {
  const permissions = new Set<string>();

  const collectPermissions = (menuItems: Menu[]) => {
    if (!Array.isArray(menuItems)) return;
    menuItems.forEach((item) => {
      if (item.mark && typeof item.mark === 'string' && item.mark.trim() !== '') {
        permissions.add(item.mark);
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        collectPermissions(item.children);
      }
    });
  };

  const dataToProcess = list.length > 0 ? list : (menuList.value?.data as Menu[]);

  if (Array.isArray(dataToProcess) && dataToProcess.length > 0) {
    collectPermissions(dataToProcess);
  }

  userStore.setPermissions([...permissions]);
}

const menuInstRef = ref<MenuInst | null>(null);
const chooseMenu = (key: string, item: MenuOption) => {
  menu.value = item;
  emit('chooseMenu', item);
  store.setChooseNav(item);
  menuInstRef.value?.showOption(key);

  let targetPath = item.route || '';

  if (targetPath && !targetPath.startsWith('/') && !/^https?:\/\//.test(targetPath)) {
    targetPath = '/' + targetPath;
  }

  const routeExists = router.resolve(targetPath).matched.length > 0;

  if (routeExists) {
    navigateTo(targetPath);
  } else {
    navigateTo('/develop');
  }
};

watch(
  () => props.chooseRightMenu,
  (newVal) => {
    chooseMenu(newVal.key, newVal);
  }
);

const storeChoose = () => {
  if (store.chooseNav && store.chooseNav.key) {
    const foundOption = store.menuOptions && store.menuOptions.length ? findMenuOption(store.menuOptions, store.chooseNav.key) : undefined;
    if (foundOption) {
      chooseMenu(foundOption.key as string, foundOption);
    } else {
      chooseMenu(store.chooseNav.key, store.chooseNav);
    }
  } else {
    store.menuOptions && store.menuOptions[0] && chooseMenu(store.menuOptions[0].key!.toString(), store.menuOptions[0]);
  }
};

onMounted(() => {
  storeChoose();
});
</script>
