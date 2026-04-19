<template>
  <header
    class="relative z-[12] h-12 flex items-center justify-between px-6 bg-paper dark:bg-ink text-ink dark:text-paper border-b border-ink/15 dark:border-paper/10 max-sm:px-4">
    <!-- 品牌签名：复刻登录页的双色衬线标识 -->
    <div class="flex items-baseline gap-1.5 font-display leading-none tracking-[-0.02em] select-none">
      <span class="text-[22px] font-normal text-ink dark:text-paper">Focus</span>
      <span class="text-[22px] font-black italic text-accent">Admin.</span>
    </div>

    <!-- 右侧操作 -->
    <div class="flex items-center gap-4 max-sm:gap-2">
      <!-- 主题切换 -->
      <button
        ref="themeButtonRef"
        type="button"
        class="group inline-flex items-center gap-2 px-3 py-1.5 border border-ink/25 dark:border-paper/25 hover:border-ink dark:hover:border-paper text-[11px] font-mono tracking-[0.2em] text-ink-mid dark:text-paper/60 hover:text-ink dark:hover:text-paper transition-colors duration-200"
        :aria-label="active ? '切换到象牙模式' : '切换到墨夜模式'"
        @click="handleThemeToggle">
        <n-icon :component="active ? Moon : Sunny" size="14" />
        <span class="max-sm:hidden">{{ active ? '墨夜' : '象牙' }}</span>
      </button>

      <!-- 用户弹出层 -->
      <n-popover trigger="click" placement="bottom-end" :show-arrow="false" :raw="true">
        <template #trigger>
          <button
            type="button"
            class="flex items-center gap-2 p-1 pr-3 border border-ink/20 dark:border-paper/20 hover:border-ink dark:hover:border-paper transition-colors max-sm:pr-1">
            <img
              v-if="avatarLoaded && userStore.userInfo?.photo"
              class="w-7 h-7 rounded-full border border-ink/15 dark:border-paper/15 object-cover"
              :src="userStore.userInfo.photo"
              alt="头像"
              @error="avatarLoaded = false" />
            <div
              v-else
              class="w-7 h-7 rounded-full border border-ink/15 dark:border-paper/15 bg-ink dark:bg-paper text-paper dark:text-ink flex items-center justify-center font-display italic text-sm font-bold leading-none"
              aria-hidden="true">
              {{ nameInitial }}
            </div>
            <span class="font-mono text-[11px] tracking-[0.12em] text-ink-mid dark:text-paper/70 max-sm:hidden">
              {{ userStore.userInfo?.name ?? 'focus' }}
            </span>
          </button>
        </template>
        <div class="min-w-[200px] border border-ink/15 dark:border-paper/15 bg-paper dark:bg-ink-raised text-ink dark:text-paper">
          <div class="px-4 py-3 border-b border-ink/10 dark:border-paper/10">
            <div class="font-display text-base text-ink dark:text-paper">{{ userStore.userInfo?.name ?? '某某某' }}</div>
            <div class="mt-0.5 font-mono text-[10px] tracking-[0.16em] uppercase text-ink-soft dark:text-paper/40">FOCUS · ADMIN</div>
          </div>
          <button
            type="button"
            class="w-full text-left flex items-center gap-3 px-4 py-2.5 text-ink dark:text-paper hover:bg-paper-deep dark:hover:bg-ink-soft2 transition-colors">
            <n-icon size="16" :component="SettingsOutline" />
            <span class="font-display text-sm">账号设置</span>
          </button>
          <button
            type="button"
            class="w-full text-left flex items-center gap-3 px-4 py-2.5 text-ink dark:text-paper hover:bg-paper-deep dark:hover:bg-ink-soft2 transition-colors"
            @click="changePwd">
            <n-icon size="16" :component="LockOpenOutline" />
            <span class="font-display text-sm">修改密码</span>
          </button>
          <button
            type="button"
            class="w-full text-left flex items-center gap-3 px-4 py-2.5 text-accent hover:bg-accent/10 transition-colors border-t border-ink/10 dark:border-paper/10"
            @click="logout">
            <n-icon size="16" :component="LogOutOutline" />
            <span class="font-display text-sm">退出登录</span>
          </button>
        </div>
      </n-popover>
    </div>

    <!-- 修改密码弹窗 -->
    <n-modal v-model:show="visible" preset="card" title="修改密码" style="width: 400px">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item path="oldPwd">
          <n-input v-model:value="formData.oldPwd" type="password" size="large" clearable placeholder="请输入旧密码">
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item path="newPwd">
          <n-input v-model:value="formData.newPwd" type="password" size="large" clearable placeholder="请输入新密码">
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="flex justify-end">
          <n-button type="primary" size="large" @click="handleSubmit">确定</n-button>
        </div>
      </template>
    </n-modal>
  </header>
</template>

<script setup lang="ts">
import { LogOutOutline, Moon, SettingsOutline, Sunny, LockOpenOutline, LockClosedOutline } from '@vicons/ionicons5';
import { tips } from '~/utils/naiveUiUtil';
import { updatePwd } from '~/api/admin';

const store = useStore();
const userStore = useUserStore();
const router = useRouter();
const emit = defineEmits(['changeTheme']);

// 主题状态
const active = ref(false);
const themeButtonRef = ref<HTMLButtonElement | null>(null);

// 头像加载状态：加载失败时退化为用姓名首字母占位
const avatarLoaded = ref(true);
const nameInitial = computed(() => {
  const name = userStore.userInfo?.name?.trim();
  if (!name) return 'F';
  // 取第一个字符（中英通用），英文字母转大写
  const ch = Array.from(name)[0] ?? 'F';
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : ch;
});

// 用户信息/头像地址变化时重置加载状态，允许重新尝试加载新图
watch(
  () => userStore.userInfo?.photo,
  () => {
    avatarLoaded.value = true;
  }
);

function applyTheme(isDark: boolean) {
  active.value = isDark;
  store.setDarkTheme(isDark);
  emit('changeTheme', isDark);
}

/**
 * 使用 View Transitions API 做圆形缩放过渡。
 * 以主题按钮中心作为圆心，半径取到视口最远角的距离。
 * - 切换到暗色：裁剪 old（亮色快照）从 100% 收缩到 0%，露出底层新暗色
 * - 切换到亮色：裁剪 new（亮色新视图）从 0% 扩散到 100%
 * 不支持 View Transitions 时直接切换（Safari 旧版等）。
 */
async function handleThemeToggle(event: MouseEvent) {
  const targetDark = !active.value;

  const hasViewTransitions = typeof document !== 'undefined' && typeof (document as any).startViewTransition === 'function';

  if (!hasViewTransitions) {
    applyTheme(targetDark);
    return;
  }

  const button = themeButtonRef.value;
  const rect = button?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : event.clientX;
  const y = rect ? rect.top + rect.height / 2 : event.clientY;
  const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transition = (document as any).startViewTransition(async () => {
    applyTheme(targetDark);
    await nextTick();
  });

  transition.ready.then(() => {
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];
    document.documentElement.animate(
      {
        clipPath: targetDark ? [...clipPath].reverse() : clipPath
      },
      {
        duration: 520,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        pseudoElement: targetDark ? '::view-transition-old(root)' : '::view-transition-new(root)'
      }
    );
  });
}

onMounted(() => {
  active.value = !!store.darkTheme;
});

// 退出登录
const logout = () => {
  userStore.logout();
  router.push('/');
  tips('success', '退出成功');
};

// 修改密码
const formRef = ref();
const formData = ref({ oldPwd: '', newPwd: '' });
const rules = ref({
  oldPwd: { required: true, message: '请输入旧密码', trigger: 'blur' },
  newPwd: { required: true, message: '请输入新密码', trigger: 'blur' }
});
const visible = ref(false);

function changePwd() {
  visible.value = true;
}

async function handleSubmit() {
  try {
    await formRef.value.validate();
    const oldPwd = await rsaUtils.encrypt(formData.value.oldPwd);
    const newPwd = await rsaUtils.encrypt(formData.value.newPwd);
    const res = await updatePwd({ oldPwd, newPwd });
    if (Number(res.code) === 200) {
      tips('success', '修改成功');
      visible.value = false;
    } else {
      throw new Error(res.msg);
    }
  } catch {
    return;
  }
}
</script>
