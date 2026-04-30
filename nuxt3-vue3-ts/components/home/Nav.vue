<template>
  <div>
    <h1 class="text-3xl font-bold text-center">你好~👋</h1>
    <n-button type="primary" dashed @click="toggleToLight($event)">
      白天
    </n-button>
    <span class="ml-[10px] mr-[10px]" :class="themeClass('ft-color')">不懂</span>
    <n-button type="info" dashed @click="toggleToDark($event)">
      夜的黑
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { themeClass } from '~/util/naiveUiUtil'

const handleThemeToggle = inject('handleThemeToggle') as (
  event: MouseEvent,
  targetDark?: boolean
) => Promise<void>

const toggleToLight = (event: MouseEvent) => {
  handleThemeToggle(event, false)
}

const toggleToDark = (event: MouseEvent) => {
  handleThemeToggle(event, true)
}
</script>

<style lang="scss" scoped></style>
