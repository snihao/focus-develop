<template>
  <div class="app-header pd-6 flex-center over-auto w-100">
    <n-tag
      v-for="item in nav"
      :key="item.key"
      class="mr-6 hover-pointer"
      :type="item.active ? 'success' : 'default'"
      :closable="item.key !== 'home'"
      @click="handleClick(item)"
      @close="handleClose(item)">
      {{ item.label }}
    </n-tag>
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

const HOME = {
  label: '首页',
  key: 'home',
  active: true
};
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
    const index = nav.value.findIndex((i: any) => i.key === lastNav.value.key);
    if (index !== -1) nav.value[index].active = false;
  }
  lastNav.value = item;
};

watch(
  () => props.nowMenu,
  (newVal, oldVal) => {
    setNav(newVal);
  }
);
</script>

<style lang="scss" scoped>
@use '~/assets/css/nh';

.app-header {
  box-shadow: 0.2px 0.2px 0.2px 0.2px #b2b2b2;
  height: $px-48;
}
</style>
