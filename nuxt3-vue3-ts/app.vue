<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <NuxtPage />
    <n-global-style />
  </n-config-provider>
</template>

<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui'
import { useThemeTransition } from '~/composables/useThemeTransition'

const { theme, isDark, handleThemeToggle, switchTheme } = useThemeTransition()

provide('theme', theme)
provide('isDark', isDark)
provide('switchTheme', switchTheme)
provide('handleThemeToggle', handleThemeToggle)
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}

/* View Transition 圆形裁剪动画样式 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none !important;
  mix-blend-mode: normal;
}

/* 切换到 dark mode: 旧视图(亮)在上层，执行收缩动画 */
.theme-transition-to-dark::view-transition-old(root) {
  z-index: 2147483646;
}

.theme-transition-to-dark::view-transition-new(root) {
  z-index: 1;
}

/* 切换到 light mode: 新视图(亮)在上层，执行展开动画 */
.theme-transition-to-light::view-transition-old(root) {
  z-index: 1;
}

.theme-transition-to-light::view-transition-new(root) {
  z-index: 2147483646;
}
</style>
