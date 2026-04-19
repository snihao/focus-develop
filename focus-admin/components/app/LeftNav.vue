<template>
  <div class="h-full app-left-nav shadow-[0_0.2px_0.2px_0.2px_#b2b2b2] z-[9]">
    <n-layout has-sider class="h-full">
      <n-layout-sider bordered collapse-mode="width" :collapsed-width="64" :width="240" style="height: 100%" show-trigger>
        <n-menu
          ref="menuInstRef"
          :value="menu.key"
          default-value="home"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="store.menuOptions"
          @update:value="chooseMenu" />
      </n-layout-sider>
    </n-layout>
  </div>
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

const menu = ref({} as any);

const renderIcon = (iconName: string) => {
  // 检查 iconName 是否有效且存在于 Icons 中
  const iconComp = Icons[iconName as keyof typeof Icons];
  if (!iconComp) return undefined;
  return () => h(NIcon, null, { default: () => h(iconComp) });
};

const { data: menuList, refresh: refreshMenuList } = useAsyncData('empMenuList', getEmpMenuList, {
  default: () => ({
    data: []
  })
});

onMounted(() => {
  if (!menuList.value.data.length) {
    refreshMenuList();
  }
});

watch(menuList, (newVal) => {
  if (newVal.data.length) {
    store.setMenuList(newVal.data);
  }
});

const findMenuOption = (opts: MenuOption[], key: string | number): MenuOption | undefined => {
  for (const opt of opts) {
    if (opt.key === key) {
      return opt;
    }
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

      // 尝试恢复选中的菜单（为了恢复 icon）
      if (store.chooseNav && store.chooseNav.key) {
        const foundOption = findMenuOption(options, store.chooseNav.key);
        if (foundOption) {
          // 更新选中的菜单，恢复 icon
          store.setChooseNav(foundOption);
          // 同时也更新当前组件内的 menu 状态，确保高亮正确
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

// 处理权限
function handlePermissions(list: Menu[] = []) {
  const permissions = new Set<string>();

  // 递归处理菜单项及其子菜单，收集所有权限标记
  const collectPermissions = (menuItems: Menu[]) => {
    if (!Array.isArray(menuItems)) return;

    menuItems.forEach((item) => {
      // 添加当前菜单项的权限标记
      if (item.mark && typeof item.mark === 'string' && item.mark.trim() !== '') {
        permissions.add(item.mark);
      }

      // 递归处理子菜单
      if (Array.isArray(item.children) && item.children.length > 0) {
        collectPermissions(item.children);
      }
    });
  };

  // 优先使用传入的 list，否则尝试使用 menuList.value.data
  const dataToProcess = list.length > 0 ? list : (menuList.value?.data as Menu[]);

  // 开始递归处理菜单数据
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

  // 检查路由是否存在，如果不存在则跳转到404页面
  let targetPath = item.route || '';

  if (targetPath && !targetPath.startsWith('/') && !/^https?:\/\//.test(targetPath)) {
    targetPath = '/' + targetPath;
  }

  const routeExists = router.resolve(targetPath).matched.length > 0;

  if (routeExists) {
    navigateTo(targetPath);
  } else {
    // 路由不存在，跳转到404页面
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
    // 尝试从当前的 menuOptions 中查找对应的菜单项，以确保获取到带有 icon 的最新对象
    const foundOption = store.menuOptions && store.menuOptions.length ? findMenuOption(store.menuOptions, store.chooseNav.key) : undefined;
    if (foundOption) {
      chooseMenu(foundOption.key as string, foundOption);
    } else {
      // 降级处理：如果没有找到（可能是数据还没加载完），只能先使用 store.chooseNav
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

<style lang="scss" scoped>
:deep(.n-layout-toggle-button) {
  right: 0.375rem;
}
</style>
