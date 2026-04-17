<template>
  <!--刷新路由-->
</template>

<script setup lang="ts">
const router = useRouter();
onMounted(() => {
  router.go(-1);
});
</script>
<style lang="scss" scoped>
@use '~/assets/css/nh';
</style>
