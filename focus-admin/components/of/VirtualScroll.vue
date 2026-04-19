// VirtualScroll.vue
<template>
  <div ref="container" class="virtual-container" @scroll="handleScroll">
    <div class="content" :style="contentStyle">
      <div v-for="item in visibleData" :key="item.id" class="item" :style="itemStyle">
        <slot :item="item" :index="item.__index" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  data: { type: Array, required: true },
  itemHeight: { type: Number, default: 50 },
  containerHeight: { type: Number, default: 500 }
});

const container = ref(null);
const scrollTop = ref(0);

// 为数据项添加原始索引
const processedData = computed(() => props.data.map((item, index) => ({ ...item, __index: index })));

const totalHeight = computed(() => processedData.value.length * props.itemHeight);
const visibleCount = computed(() => Math.ceil(props.containerHeight / props.itemHeight) + 2);
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight));
const endIndex = computed(() => Math.min(startIndex.value + visibleCount.value, processedData.value.length));
const visibleData = computed(() => processedData.value.slice(startIndex.value, endIndex.value));
const contentStyle = computed(() => ({
  height: `${totalHeight.value}px`,
  position: 'relative'
}));
const itemStyle = computed(() => ({
  position: 'absolute',
  width: '100%',
  height: `${props.itemHeight}px`,
  transform: `translateY(${scrollTop.value}px)`
}));

function handleScroll() {
  scrollTop.value = container.value.scrollTop;
}

// 确保容器高度正确
onMounted(() => {
  if (container.value) {
    container.value.style.height = `${props.containerHeight}px`;
  }
});
</script>

<style scoped>
.virtual-container {
  overflow-y: auto;
  position: relative;
  border: 1px solid #ccc;
}

.content {
  position: relative;
}

.item {
  position: absolute;
  left: 0;
  right: 0;
}
</style>
