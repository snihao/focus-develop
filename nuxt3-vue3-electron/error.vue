<template>
  <div class="error-page">
    <n-result status="error" :title="error?.message || '页面错误'" :description="error?.description">
      <template #footer>
        <n-button @click="handleError">返回首页</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup lang="ts">
import { NResult, NButton } from 'naive-ui';

const props = defineProps<{
  error: {
    message?: string;
    description?: string;
    statusCode?: number;
  };
}>();

const handleError = () => clearError({ redirect: '/' });
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
</style>
