import { createDiscreteApi } from 'naive-ui';

declare module 'vue-router' {
  interface RouteMeta {
    permissions?: string[] | (() => Promise<string[]> | string[]);
  }
}

const { notification } = createDiscreteApi(['notification']);

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();
  const router = useRouter();
  const store = useStore();

  const tokenCookie = useCookie('admin-user-store-token', { default: () => '', maxAge: 60 * 60 * 24 * 7 });

  const isLogin = tokenCookie.value || userStore.isLogin;

  // 排除特殊页面，避免无限重定向
  const excludePages = ['/', '/develop', '/403', '/404'];
  if (excludePages.includes(to.path)) {
    // 对于登录页面，如果已登录则跳转到首页
    if (to.path === '/' && isLogin) {
      if (store.chooseNav) return navigateTo(store.chooseNav.route ?? '/home');
      return navigateTo('/home');
    }
    return;
  }

  if (!isLogin) {
    if (notification && typeof notification.error === 'function') {
      notification.error({
        content: '请先登录',
        duration: 2500
      });
    }
    // 登录后跳转回当前页面
    return navigateTo('/?redirect=' + to.fullPath);
  }

  // 检查路由是否存在
  const routeExists = router.resolve(to.path).matched.length > 0;
  // 路由不存在,跳转到404页面
  if (!routeExists) {
    navigateTo('/develop');
  }

  // 检查路由是否需要权限
  if (to.meta?.permissions) {
    let requiredPermissions = to.meta.permissions;

    // 如果权限是函数，则动态计算
    if (typeof to.meta.permissions === 'function') {
      requiredPermissions = await to.meta.permissions();
    }

    // 检查用户是否有访问权限
    if (!userStore.hasPermissions(requiredPermissions as string[])) {
      if (notification && typeof notification.error === 'function') {
        notification.error({
          content: '您没有权限访问此页面',
          duration: 2500
        });
      }
      return navigateTo('/403');
    }
  }

  return;
});
