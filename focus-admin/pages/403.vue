<template>
  <div class="h-full flex justify-center items-center">
    <div class="text-center">
      <div class="text-6xl font-bold mb-4">403</div>
      <div class="text-xl">抱歉，您没有权限访问此页面</div>
      <n-button class="mt-10" type="primary" @click="navigateTo('/home')">回到首页</n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// useHead({
//   title: '403 - 权限不足'
// });
</script>
