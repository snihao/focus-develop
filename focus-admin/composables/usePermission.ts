import { createDiscreteApi } from 'naive-ui';

const { notification } = createDiscreteApi(['notification']);

/**
 * 权限验证(v-if使用)
 * @param permissions 权限列表
 * @returns [hasPermission, handlePermissionCheck]
 * @returns hasPermission 权限是否满足
 * @returns handlePermissionCheck 权限校验函数
 */
export function usePermission(permissions: Ref<string[]> | string[]) {
  const userStore = useUserStore();

  const hasPermission = computed(() => {
    const currentPermissions = unref(permissions);
    return userStore.hasPermissions(currentPermissions);
  });

  function handlePermissionCheck(callback: () => void) {
    if (hasPermission.value) {
      callback();
      return;
    } else {
      notification.warning({ content: '您没有执行此操作的权限' });
    }
  }

  return [hasPermission, handlePermissionCheck];
}
