<template>
  <div class="h-12 flex items-center gap-2 px-6 bg-paper dark:bg-ink border-b border-ink/10 dark:border-paper/10 overflow-x-auto max-sm:px-4">
    <button
      v-for="item in nav"
      :key="item.key"
      type="button"
      class="group shrink-0 inline-flex items-center gap-2 pl-3 pr-2 py-1 border text-[11px] font-mono tracking-[0.14em] uppercase transition-[background-color,border-color,color] duration-200"
      :class="
        item.active
          ? 'border-ink dark:border-paper bg-ink dark:bg-paper text-paper dark:text-ink'
          : 'border-ink/20 dark:border-paper/20 text-ink-mid dark:text-paper/60 hover:border-ink dark:hover:border-paper hover:text-ink dark:hover:text-paper'
      "
      @click="handleClick(item)">
      <span class="py-0.5">{{ item.label }}</span>
      <span
        v-if="item.key !== 'home'"
        class="inline-flex items-center justify-center w-4 h-4 leading-none text-[10px] text-current/70 hover:text-accent hover:bg-white/10 transition-colors"
        role="button"
        tabindex="0"
        @click.stop="handleClose(item)"
        @keydown.enter.stop="handleClose(item)">
        ×
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  nowMenu: {
    type: Object,
    default: () => ({})
  }
});
const store = useStore();

const emit = defineEmits(['chooseRightMenu']);
const handleClick = (e: any) => {
  if (e.key === lastNav.value.key) return;
  emit('chooseRightMenu', e);
};

// 关闭导航
const handleClose = (e: any) => {
  const index = nav.value.findIndex((i: any) => i.key === e.key);
  if (index === -1) return;
  const state = nav.value[index].active;
  nav.value.splice(index, 1);
  if (!state) return;
  lastNav.value = {};
  emit('chooseRightMenu', nav.value[index - 1]);
};

const HOME = { label: '首页', key: 'home', active: true };
const nav = ref([HOME] as any[]);
const lastNav = ref(HOME as any);

// 设置导航
const setNav = (item: any) => {
  const index = nav.value.findIndex((i: any) => i.key === item.key);
  if (index !== -1) {
    nav.value[index].active = true;
  } else {
    item.active = true;
    if (item.key === 'home') nav.value.unshift(item);
    else nav.value.push(item);
  }
  if (lastNav.value?.key && nav.value.length > 1) {
    const idx = nav.value.findIndex((i: any) => i.key === lastNav.value.key);
    if (idx !== -1) nav.value[idx].active = false;
  }
  lastNav.value = item;
};

watch(
  () => props.nowMenu,
  (newVal) => {
    setNav(newVal);
  }
);
</script>
