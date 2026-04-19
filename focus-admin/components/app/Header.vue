<template>
  <div class="app-header pd-6 flex-center-zy pd-zy-12">
    <img class="logo" :src="`/${active ? 'logo-dark.png' : 'logo.png'}`" alt="logo" />
    <div class="ft-20 ft-style" :class="themeClass('ft-color')">Focus Admin</div>
    <div class="flex-center">
      <n-switch v-model:value="active" :rail-style="railStyle" size="large" class="mr-12" :on-update:value="changeTheme">
        <template #checked-icon>
          <n-icon :component="Moon" color="#6565b5" />
        </template>
        <template #unchecked-icon>
          <n-icon :component="Sunny" color="#ecb100" />
        </template>
      </n-switch>
      <n-popover trigger="click">
        <template #trigger>
          <img class="app-header-image hover-pointer" :src="userStore.userInfo?.photo" alt="头像" />
        </template>
        <template #header>
          <div class="flex-center-center ft-18 ft-b">{{ userStore.userInfo?.name ?? '某某某' }}</div>
        </template>
        <n-list hoverable clickable>
          <n-list-item>
            <div class="flex-center hover-pointer">
              <n-icon class="mr-6" size="20" :component="SettingsOutline" />
              账号设置
            </div>
          </n-list-item>
          <n-list-item>
            <div class="flex-center hover-pointer" @click="changePwd">
              <n-icon class="mr-6" size="20" :component="LockOpenOutline" />
              修改密码
            </div>
          </n-list-item>
          <n-list-item>
            <div class="flex-center hover-pointer" @click="logout">
              <n-icon class="mr-6" size="20" :component="LogOutOutline" />
              退出登录
            </div>
          </n-list-item>
        </n-list>
      </n-popover>
    </div>

    <n-modal v-model:show="visible" preset="card" title="修改密码" style="width: 400px">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item path="oldPassword">
          <n-input v-model:value="formData.oldPwd" type="password" size="large" clearable placeholder="请输入旧密码">
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item path="newPassword">
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
  </div>
</template>

<script setup lang="ts">
import { LogOutOutline, Moon, SettingsOutline, Sunny, LockOpenOutline, LockClosedOutline } from '@vicons/ionicons5';
import { themeClass, tips } from '~/utils/naiveUiUtil';
import { updatePwd } from '~/api/admin';

const store = useStore();
const userStore = useUserStore();
const router = useRouter();
const emit = defineEmits(['changeTheme']);

// 推出登录
const logout = () => {
  userStore.logout();
  router.push('/');
  tips('success', '退出成功');
};

// 切换主题
const active = ref(false);
const changeTheme = (value: boolean) => {
  active.value = value;
  store.setDarkTheme(value);
  emit('changeTheme', value);
};

const railStyle = ({ focused, checked }: { focused: boolean; checked: boolean }) => {
  const style = {} as any;
  if (checked) {
    style.background = '#6565b5';
    if (focused) style.boxShadow = '0 0 0 2px #6565b540';
  } else {
    style.background = '#ecb100';
    if (focused) style.boxShadow = '0 0 0 2px #ecb10040';
  }
  return style;
};

onMounted(() => {
  active.value = !!store.darkTheme;
});

const formRef = ref();
const formData = ref({
  oldPwd: '',
  newPwd: ''
});
const rules = ref({
  oldPwd: {
    required: true,
    message: '请输入旧密码',
    trigger: 'blur'
  },
  newPwd: {
    required: true,
    message: '请输入新密码',
    trigger: 'blur'
  }
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
    const res = await updatePwd({
      oldPwd,
      newPwd
    });
    if (Number(res.code) === 200) {
      tips('success', '修改成功');
      visible.value = false;
    } else {
      throw new Error(res.msg);
    }
  } catch (error) {
    return;
  }
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/nh';

.logo {
  height: $px-36;
}

.ft-style {
  font-family: cursive;
  font-weight: 600;
}

.app-header {
  position: relative;
  z-index: 12;
  box-shadow: 0.2px 0.2px 0.2px 0.2px #b2b2b2;
  height: $px-48;

  &-image {
    width: $px-32;
    height: $px-32;
    border-radius: 50%;
    border: 1px solid #a8a8a8;
  }
}
</style>
