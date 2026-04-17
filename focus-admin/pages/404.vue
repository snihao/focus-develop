<template>
  <div class="w-full h-full flex flex-col justify-center items-center">
    <!-- 404错误图标 -->
    <n-icon size="60" :component="AlertCircleOutline" />

    <!-- 404标题 -->
    <div class="text-center mt-8">
      <h1 class="text-6xl font-bold text-gray-700 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-600 mb-4">页面未找到</h2>
      <p class="text-gray-500 mb-8">抱歉，您访问的页面不存在。</p>

      <!-- 操作按钮 -->
      <div class="w-full flex justify-center gap-x-4">
        <n-button type="primary" @click="goHome">
          <template #icon>
            <n-icon :component="HomeSharp" />
          </template>
          返回首页
        </n-button>

        <n-button @click="goBack">
          <template #icon>
            <n-icon :component="ArrowBack" />
          </template>
          返回上页
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleOutline, HomeSharp, ArrowBack } from '@vicons/ionicons5';

definePageMeta({
  title: '404 - 页面未找到',
  meta: [{ name: 'description', content: '页面未找到' }]
});

const router = useRouter();

/**
 * 返回首页
 */
const goHome = () => {
  navigateTo('/home');
};

/**
 * 返回上一页
 */
const goBack = () => {
  if (router.options.history.state.back) {
    router.back();
  } else {
    navigateTo('/home');
  }
};
</script>
