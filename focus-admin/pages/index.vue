<template>
  <div class="relative min-h-screen w-full bg-paper text-ink font-display overflow-hidden flex flex-col">
    <!-- 纸张噪点纹理 -->
    <div aria-hidden="true" class="absolute inset-0 z-[1] pointer-events-none opacity-35 mix-blend-multiply bg-paper-grain" />
    <!-- 细网格 -->
    <div aria-hidden="true" class="absolute inset-0 z-[1] pointer-events-none bg-grid-lines bg-[length:80px_80px]" />

    <!-- 四角装饰 -->
    <span aria-hidden="true" class="absolute top-6 left-7 z-[4] font-mono text-sm text-ink/45 max-sm:hidden">+</span>
    <span aria-hidden="true" class="absolute top-6 right-7 z-[4] font-mono text-sm text-ink/45 max-sm:hidden">+</span>
    <span aria-hidden="true" class="absolute bottom-6 left-7 z-[4] font-mono text-sm text-ink/45 max-sm:hidden">+</span>
    <span aria-hidden="true" class="absolute bottom-6 right-7 z-[4] font-mono text-sm text-ink/45 max-sm:hidden">+</span>

    <!-- 顶部栏 -->
    <header class="relative z-[5] flex justify-between items-center px-[72px] pt-9 font-mono text-[11px] tracking-[0.08em] animate-fade-in max-lg:px-10 max-sm:flex-col max-sm:gap-4 max-sm:items-start max-sm:px-7 max-sm:pt-6">
      <div class="flex items-center gap-3 uppercase text-ink">
        <span class="font-bold">№ 01</span>
        <span aria-hidden="true" class="inline-block w-1 h-1 bg-accent rounded-full" />
        <span class="text-ink-mid">登录 · FOCUS ADMIN</span>
      </div>
      <nav class="flex gap-7 max-sm:gap-5">
        <a
          href="https://gitee.com/snihao/focus-develop"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-0.5 no-underline text-ink font-mono text-[11px] font-medium tracking-[0.1em] uppercase py-1.5 px-0.5 border-b border-transparent transition-all duration-300 ease-out hover:text-accent hover:border-b-accent">
          <span class="text-ink-soft transition-colors duration-300 group-hover:text-accent">[</span>
          <span class="mx-1">GITHUB</span>
          <span class="ml-0.5 text-[10px] inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
          <span class="text-ink-soft transition-colors duration-300 group-hover:text-accent">]</span>
        </a>
        <a
          href="https://gitee.com/snihao/focus-develop"
          target="_blank"
          rel="noopener noreferrer"
          class="group inline-flex items-center gap-0.5 no-underline text-ink font-mono text-[11px] font-medium tracking-[0.1em] uppercase py-1.5 px-0.5 border-b border-transparent transition-all duration-300 ease-out hover:text-accent hover:border-b-accent">
          <span class="text-ink-soft transition-colors duration-300 group-hover:text-accent">[</span>
          <span class="mx-1">GITEE</span>
          <span class="ml-0.5 text-[10px] inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
          <span class="text-ink-soft transition-colors duration-300 group-hover:text-accent">]</span>
        </a>
      </nav>
    </header>

    <!-- 主舞台 -->
    <main class="relative z-[5] grid grid-cols-[1.25fr_1fr] gap-20 px-[72px] pt-[60px] pb-10 flex-1 items-center max-lg:grid-cols-1 max-lg:gap-14 max-lg:p-10 max-sm:p-7">
      <!-- 左侧：英雄区 -->
      <section class="max-w-[720px]">
        <div class="flex items-center gap-4 mb-10 font-mono text-[11px] font-medium tracking-[0.14em] uppercase text-ink-mid opacity-0 animate-fade-up [animation-delay:150ms]">
          <span class="w-12 h-px bg-ink" />
          <span>一款开源的后台管理骨架</span>
        </div>

        <h1 class="font-display text-[clamp(72px,12vw,196px)] leading-[0.82] tracking-[-0.045em] m-0 mb-12 text-ink">
          <span class="block opacity-0 font-normal animate-slide-up [animation-delay:250ms]">Focus</span>
          <span class="block opacity-0 font-black text-accent pl-[0.55em] animate-slide-up [animation-delay:400ms] max-lg:pl-[0.3em]"><em>Admin.</em></span>
        </h1>

        <p class="font-display text-lg leading-[1.75] text-ink-mid max-w-[520px] m-0 mb-11 tracking-[0.02em] opacity-0 animate-fade-up [animation-delay:650ms]">
          <span class="block text-ink-mid">一款现代的 Nuxt 3 后台管理骨架——</span>
          <span class="block mt-2 font-normal text-ink font-display tracking-[0.08em]">专注 · 现代 · 为清晰而构建。</span>
        </p>

        <div class="flex flex-wrap gap-2 opacity-0 animate-fade-up [animation-delay:800ms]">
          <span class="px-3 py-[7px] bg-transparent border border-ink/20 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-mid uppercase">NUXT 3</span>
          <span class="px-3 py-[7px] bg-transparent border border-ink/20 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-mid uppercase">NAIVE UI</span>
          <span class="px-3 py-[7px] bg-transparent border border-ink/20 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-mid uppercase">TAILWIND</span>
          <span class="px-3 py-[7px] bg-transparent border border-ink/20 font-mono text-[10px] font-medium tracking-[0.12em] text-ink-mid uppercase">SA-TOKEN</span>
        </div>
      </section>

      <!-- 右侧：登录卡 -->
      <section
        class="relative pt-[52px] px-11 pb-10 bg-white/55 border-[1.5px] border-ink shadow-brutal max-w-[440px] w-full justify-self-end opacity-0 animate-fade-up [animation-delay:500ms] before:content-[''] before:absolute before:-top-0.5 before:-right-0.5 before:w-9 before:h-9 before:border-t-[3px] before:border-r-[3px] before:border-accent after:content-[''] after:absolute after:-bottom-0.5 after:-left-0.5 after:w-9 after:h-9 after:border-b-[3px] after:border-l-[3px] after:border-accent max-lg:justify-self-auto max-lg:mx-auto max-lg:shadow-brutal-sm max-sm:pt-10 max-sm:px-7 max-sm:pb-8">
        <div class="flex items-center gap-3 mb-10 font-mono">
          <span class="text-xs font-bold text-accent tracking-[0.05em]">02</span>
          <span class="w-7 h-0.5 bg-ink" />
          <span class="text-xs font-medium tracking-[0.22em] uppercase text-ink">管理员登录</span>
        </div>

        <form class="block" novalidate @submit.prevent="handleSubmit">
          <!-- 账号 -->
          <div class="mb-7 relative">
            <label class="flex items-baseline gap-2 mb-2 font-mono text-sm tracking-[0.06em] text-ink-mid cursor-pointer" for="f-username">
              <span class="font-medium">账号</span>
            </label>
            <input
              id="f-username"
              v-model="formData.username"
              type="text"
              class="w-full pt-2.5 pb-2 bg-transparent border-0 border-b font-display text-xl font-normal text-ink outline-none transition-[border-color,padding] duration-300 ease-out placeholder:text-ink-soft placeholder:italic placeholder:opacity-60 focus:border-b-2 focus:pb-[7px] focus:border-ink"
              :class="errors.username ? '!border-accent !border-b-2 !pb-[7px]' : 'border-ink/25'"
              placeholder="focus"
              autocomplete="username"
              @input="errors.username = ''" />
            <span v-if="errors.username" class="block mt-1.5 font-mono text-[10px] text-accent tracking-[0.1em] uppercase">// {{ errors.username }}</span>
          </div>

          <!-- 密码 -->
          <div class="mb-7 relative">
            <label class="flex items-baseline gap-2 mb-2 font-mono text-sm tracking-[0.06em] text-ink-mid cursor-pointer" for="f-password">
              <span class="font-medium">密码</span>
            </label>
            <input
              id="f-password"
              v-model="formData.password"
              type="password"
              class="w-full pt-2.5 pb-2 bg-transparent border-0 border-b font-display text-xl font-normal text-ink outline-none transition-[border-color,padding] duration-300 ease-out placeholder:text-ink-soft placeholder:italic placeholder:opacity-60 focus:border-b-2 focus:pb-[7px] focus:border-ink"
              :class="errors.password ? '!border-accent !border-b-2 !pb-[7px]' : 'border-ink/25'"
              placeholder="••••••"
              autocomplete="current-password"
              @input="errors.password = ''" />
            <span v-if="errors.password" class="block mt-1.5 font-mono text-[10px] text-accent tracking-[0.1em] uppercase">// {{ errors.password }}</span>
          </div>

          <!-- 记住我 + 忘记密码 -->
          <div class="flex justify-between items-center mb-8">
            <label class="inline-flex items-center gap-2.5 cursor-pointer select-none relative">
              <input v-model="remember" type="checkbox" class="peer sr-only" />
              <span
                class="w-3.5 h-3.5 border-[1.5px] border-ink relative transition-colors after:content-[''] after:absolute after:inset-[2px] after:bg-accent after:opacity-0 after:transition-opacity after:duration-200 peer-checked:after:opacity-100" />
              <span class="font-mono text-[11px] tracking-[0.1em] text-ink-mid uppercase">记住我</span>
            </label>
            <button
              type="button"
              class="bg-transparent border-0 p-0 font-mono text-[11px] tracking-[0.12em] text-ink-soft uppercase cursor-pointer transition-colors duration-200 hover:text-accent"
              @click="onForgot">
              忘记密码？
            </button>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            :disabled="loading"
            class="group w-full flex items-center justify-between px-7 py-5 bg-ink text-paper border-0 font-mono text-[13px] font-bold tracking-[0.28em] uppercase cursor-pointer transition-[background-color,padding,color] duration-300 ease-out enabled:hover:bg-accent enabled:hover:pl-[34px] disabled:opacity-55 disabled:cursor-not-allowed">
            <span>{{ loading ? '登 录 中 …' : '登   录' }}</span>
            <span class="text-[18px] font-normal inline-block transition-transform duration-300 ease-out group-hover:translate-x-2.5">→</span>
          </button>

          <!-- 默认提示 -->
          <div class="flex items-center justify-center gap-1.5 mt-[22px] font-mono text-[10px] tracking-[0.14em] text-ink-soft">
            <span>默认账号</span>
            <code class="px-2 py-0.5 bg-accent/[0.08] text-accent font-mono text-[10px] font-medium border border-accent/20">focus</code>
            <span class="text-ink-soft">/</span>
            <code class="px-2 py-0.5 bg-accent/[0.08] text-accent font-mono text-[10px] font-medium border border-accent/20">focus</code>
          </div>
        </form>
      </section>
    </main>

    <!-- 底部栏 -->
    <footer class="relative z-[5] flex justify-between items-center px-[72px] pb-9 font-mono text-[10px] tracking-[0.14em] text-ink-soft uppercase max-lg:px-10 max-sm:flex-col max-sm:gap-3 max-sm:items-start max-sm:px-7 max-sm:pb-6">
      <span>二〇二六 · 开源项目 · MIT 协议</span>
      <span class="flex-1 h-px bg-ink/15 mx-6 max-sm:hidden" />
      <span class="text-ink font-medium">focus — develop ◀</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { tips } from '~/utils/naiveUiUtil';

// 加载字体：Fraunces（显示衬线）+ JetBrains Mono（等宽）+ Noto Serif SC（中文衬线）
useHead({
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&display=swap'
    }
  ]
});

const router = useRouter();
const userStore = useUserStore();

const formData = reactive({ username: '', password: '' });
const errors = reactive({ username: '', password: '' });
const remember = ref(false);
const loading = ref(false);

const DEFAULT_ACCOUNT = 'focus';
const DEFAULT_PASSWORD = 'focus';

// 内联 SVG 头像，避免外部依赖
const MOCK_AVATAR =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231a1a1a'/><text x='20' y='27' text-anchor='middle' fill='%23f4efe7' font-size='18' font-weight='700' font-family='Georgia, serif' font-style='italic'>F</text></svg>";

function validate(): boolean {
  let ok = true;
  if (!formData.username.trim()) {
    errors.username = '请输入账号';
    ok = false;
  }
  if (!formData.password) {
    errors.password = '请输入密码';
    ok = false;
  }
  return ok;
}

async function handleSubmit() {
  if (!validate()) return;

  loading.value = true;

  await new Promise((resolve) => setTimeout(resolve, 450));

  if (formData.username !== DEFAULT_ACCOUNT || formData.password !== DEFAULT_PASSWORD) {
    tips('error', '账号或密码错误（默认：focus / focus）');
    loading.value = false;
    return;
  }

  userStore.setToken('focus-mock-token-' + Date.now());
  userStore.$patch({
    userInfo: {
      id: 1,
      name: 'Focus',
      phone: 'focus',
      photo: MOCK_AVATAR,
      roleIds: [1],
      roleNames: ['admin']
    }
  });
  userStore.setPermissions([
    'menu:add',
    'menu:update',
    'menu:delete',
    'menu:disable',
    'role:add',
    'role:update',
    'role:delete',
    'role:disable',
    'user:add',
    'user:update',
    'user:delete',
    'user:disable'
  ]);

  tips('success', '登录成功');
  loading.value = false;
  router.push('/home');
}

function onForgot() {
  tips('info', '开源骨架默认账号：focus / focus');
}
</script>
