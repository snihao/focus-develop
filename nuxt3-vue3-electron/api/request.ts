import axios from 'axios';
import { createDiscreteApi } from 'naive-ui';

const BASE_URL = process.env.NUXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

/**
 * 获取 API 基础 URL
 */
export function getApiUrl(): string {
  if (import.meta.server) {
    return process.env.NUXT_PUBLIC_API_URL || BASE_URL;
  } else {
    const { public: { API_URL } } = useRuntimeConfig();
    return API_URL || BASE_URL;
  }
}

const { notification } = createDiscreteApi(['notification']);
const { loadingBar } = createDiscreteApi(['loadingBar']);

const errorTips = ['网络请求失败', '请检查网络连接后重试'];

const errorNotification = () => {
  notification['error']({
    content: errorTips[0],
    meta: errorTips[1],
    duration: 2500,
    keepAliveOnHover: true
  });
};

const requests = axios.create({
  baseURL: BASE_URL,
  timeout: 20000
});

requests.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
    loadingBar.start();
    return config;
  },
  (error) => {
    errorNotification();
    loadingBar.error();
    setTimeout(() => loadingBar.finish());
    return Promise.reject(new Error(errorTips[0]));
  }
);

requests.interceptors.response.use(
  (response) => {
    loadingBar.finish();
    return response.data;
  },
  (error) => {
    loadingBar.error();
    setTimeout(() => loadingBar.finish());
    errorNotification();
    return error.request;
  }
);

export default requests;
