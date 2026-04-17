<template>
  <div class="login w-100 h-100-vh flex-center-zy">
    <div />
    <div class="login-box flex-down" :class="themeClass('box-bg')">
      <n-form ref="formRef" :model="formData" :rules="rules" @keyup.enter="handleSubmit">
        <div class="mt-30 mb-20 ft-28 ls-1 ft-style" style="text-align: center">账号登录</div>
        <n-form-item path="phone">
          <n-input v-model:value="formData.phone" type="text" size="large" :maxlength="11" clearable placeholder="请输入手机号码">
            <template #prefix>
              <n-icon :component="PhonePortraitOutline" />
            </template>
          </n-input>
        </n-form-item>
        <n-form-item path="password">
          <n-input v-model:value="formData.password" type="password" size="large" clearable show-password-on="mousedown" placeholder="请输入密码">
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>
        <n-button class="mt-20 w-100 ft-20" type="info" size="large" @click="handleSubmit">登 录</n-button>
      </n-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhonePortraitOutline, LockClosedOutline } from '@vicons/ionicons5';
import { themeClass, tips } from '~/utils/naiveUiUtil';
import { sha256Encrypt } from '~/utils/cryptoUtil';
import { login as loginApi } from '~/api/admin';

const router = useRouter();
const userStore = useUserStore();

const formData = reactive({
  phone: '',
  password: ''
});
const formRef = ref();

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号',
      trigger: ['input', 'blur']
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
    // {
    //   min: 6,
    //   max: 15,
    //   message: '密码长度为6-15位',
    //   trigger: ['input', 'blur']
    // },
    // {
    //   pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,20}$/,
    //   message: '密码必须包含英文字母和数字',
    //   trigger: ['input', 'blur']
    // }
  ]
};

async function handleSubmit() {
  try {
    await formRef.value.validate();
    const data = { ...formData };
    data.password = await rsaUtils.encrypt(formData.password);
    const res = await loginApi(data);
    userStore.setToken(res.data);
    tips('success', '登录成功');
    await userStore.getUserInfo();
    setTimeout(() => {
      router.push('/home');
    });
  } catch (error: any) {
    console.error(error, 'login error');
    tips('error', error?.message ?? '登录失败');
    userStore.logout();
    return;
  }
}
</script>

<style lang="scss" scoped>
@use '~/assets/css/nh';

.ft-style {
  font-family: cursive;
  font-weight: 600;
}

.login-box {
  height: $px-560;
  width: $px-480;
  border-radius: $px-12;
  box-shadow: 0 0 $px-10 0 #670c0c38;
  padding: $px-64;
  box-sizing: border-box;
}

.login {
  background: #f5f5f5;
  padding: 0 $px-240;
  box-sizing: border-box;
}
</style>
