<template>
  <div class="w-full h-full bg-paper dark:bg-ink-deep font-display text-ink dark:text-paper/90 overflow-auto p-8 max-sm:p-5">
    <!-- 欢迎抬头 -->
    <header class="mb-10 max-sm:mb-6">
      <div class="flex items-center gap-3 font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-ink-mid dark:text-paper/50 mb-3">
        <span class="text-accent">01</span>
        <span aria-hidden="true" class="inline-block w-1 h-1 bg-accent rounded-full" />
        <span>DASHBOARD · 首页</span>
      </div>
      <h1 class="font-display text-[clamp(36px,6vw,64px)] leading-[0.95] tracking-[-0.035em] text-ink dark:text-paper max-w-2xl">
        Welcome back,
        <span class="block text-accent font-black italic">{{ displayName }}.</span>
      </h1>
      <p class="font-display text-base leading-[1.8] text-ink-mid dark:text-paper/60 mt-5 max-w-2xl tracking-[0.02em]">
        今天是
        <span class="font-mono text-ink dark:text-paper">{{ today }}</span>
        。这里是一份仅供演示的后台骨架，所有数据存放在
        <span class="font-mono text-ink dark:text-paper">localStorage</span>
        ，刷新或重启浏览器后仍会保留你的修改。
      </p>
    </header>

    <!-- 快速入口 -->
    <section class="mb-10 max-sm:mb-6">
      <div class="flex items-center gap-4 mb-5 font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-ink-mid dark:text-paper/50">
        <span class="w-10 h-px bg-ink dark:bg-paper/40" />
        <span>QUICK ACCESS · 常用入口</span>
      </div>
      <div class="grid grid-cols-3 gap-5 max-lg:grid-cols-1">
        <button
          v-for="(entry, idx) in entries"
          :key="entry.route"
          class="group relative text-left p-7 bg-white/55 dark:bg-ink-raised border-[1.5px] border-ink dark:border-paper/30 transition-[padding,background-color,border-color] duration-300 ease-out enabled:hover:pl-9 enabled:hover:bg-paper-deep dark:enabled:hover:bg-ink-soft2 dark:enabled:hover:border-paper/60"
          :style="{ animationDelay: `${150 + idx * 120}ms` }"
          @click="navigateTo(entry.route)">
          <div class="flex items-center justify-between mb-4">
            <span class="font-mono text-[11px] font-bold tracking-[0.22em] text-accent uppercase">0{{ idx + 2 }}</span>
            <span
              aria-hidden="true"
              class="font-mono text-[14px] text-ink-soft dark:text-paper/40 inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:-translate-y-0.5 group-hover:text-accent">
              ↗
            </span>
          </div>
          <div class="font-display text-2xl tracking-[-0.01em] text-ink dark:text-paper mb-2">{{ entry.title }}</div>
          <div class="font-display text-sm text-ink-mid dark:text-paper/55 leading-[1.7] tracking-[0.02em]">{{ entry.desc }}</div>
          <div aria-hidden="true" class="absolute top-2 right-2 w-4 h-4 border-t-[2px] border-r-[2px] border-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div aria-hidden="true" class="absolute bottom-2 left-2 w-4 h-4 border-b-[2px] border-l-[2px] border-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>
      </div>
    </section>

    <!-- 系统清单 -->
    <section class="grid grid-cols-2 gap-10 max-lg:grid-cols-1">
      <div>
        <div class="flex items-center gap-4 mb-5 font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-ink-mid dark:text-paper/50">
          <span class="w-10 h-px bg-ink dark:bg-paper/40" />
          <span>STACK · 技术栈</span>
        </div>
        <ul class="border-t border-ink/15 dark:border-paper/15">
          <li
            v-for="(item, idx) in stack"
            :key="item.name"
            class="flex items-center justify-between py-3.5 border-b border-ink/10 dark:border-paper/10">
            <div class="flex items-center gap-3">
              <span class="font-mono text-[11px] font-bold text-accent tracking-[0.1em]">0{{ idx + 1 }}</span>
              <span class="font-display text-base text-ink dark:text-paper">{{ item.name }}</span>
            </div>
            <span class="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft dark:text-paper/40">{{ item.role }}</span>
          </li>
        </ul>
      </div>
      <div>
        <div class="flex items-center gap-4 mb-5 font-mono text-[11px] font-bold tracking-[0.22em] uppercase text-ink-mid dark:text-paper/50">
          <span class="w-10 h-px bg-ink dark:bg-paper/40" />
          <span>COLOPHON · 版本信息</span>
        </div>
        <dl class="border-t border-ink/15 dark:border-paper/15">
          <div v-for="item in colophon" :key="item.label" class="flex items-center justify-between py-3.5 border-b border-ink/10 dark:border-paper/10">
            <dt class="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-soft dark:text-paper/40">{{ item.label }}</dt>
            <dd class="font-display text-ink dark:text-paper">{{ item.value }}</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const userStore = useUserStore();

const displayName = computed(() => userStore.userInfo?.name || 'focus');

const today = computed(() => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
});

const entries = [
  { route: '/menu', title: '菜单管理', desc: '维护目录、页面、按钮三级树，驱动侧栏与权限。' },
  { route: '/role', title: '角色管理', desc: '将菜单打包为角色，再分配给员工。' },
  { route: '/user', title: '员工管理', desc: '管理登录账号、角色指派与启用状态。' }
];

const stack = [
  { name: 'Nuxt 3', role: 'Framework' },
  { name: 'Vue 3', role: 'UI Engine' },
  { name: 'Naive UI', role: 'Component Kit' },
  { name: 'Tailwind CSS', role: 'Design Tokens' },
  { name: 'Pinia', role: 'State' }
];

const colophon = [
  { label: 'Project', value: 'Focus Admin' },
  { label: 'License', value: 'MIT' },
  { label: 'Persistence', value: 'localStorage (mock)' },
  { label: 'Theme', value: 'Editorial / Brutalist' }
];
</script>
