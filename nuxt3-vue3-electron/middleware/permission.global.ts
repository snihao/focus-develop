/**
 * 全局权限中间件
 * 可在此处添加路由守卫逻辑
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // 示例：检查用户是否已登录
  // const store = useAppStore();
  // if (!store.token && to.path !== '/login') {
  //   return navigateTo('/login');
  // }
});
