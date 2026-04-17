export default defineNuxtRouteMiddleware((to, from) => {
  const filterRoutes = getUrl('FILTER_ROUTES', '') as string;
  if (!filterRoutes) return;
  const routes = filterRoutes.split(',');
  if (routes.includes(to.path)) return navigateTo('/home');
});

function getUrl(key: string, defaultValue?: string) {
  if (process.server) {
    return process.env['NUXT_PUBLIC_' + key] || defaultValue;
  } else {
    const {
      public: { [key]: value }
    } = useRuntimeConfig();
    return value;
  }
}
