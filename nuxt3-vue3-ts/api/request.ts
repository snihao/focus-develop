import axios from 'axios';
import { createDiscreteApi } from 'naive-ui';
import type { Ref } from 'vue';
import type { UseFetchOptions } from 'nuxt/app';
import { sha256 } from '~/util/sha256';
import { v4 as uuidv4 } from 'uuid';

const BASE_URL = 'http://127.0.0.1:0509/';
const SECRET_KEY = 'a05ed3cfc27746dc532405a7bdd75f52c2971ccd9dc520b3c780ce4f4bbdee0b';
/**
 * @description: 服务端渲染请求
 * @param data 请求数据
 * @param options 请求配置
 */
export const ssrApi = <T>(
  data: { method: string; url: string; data?: any },
  options?: UseFetchOptions<T>
): { data: Ref<T | null>; error: Ref<Error | null>; refresh: () => Promise<void> } => {
  const store = localStorage.getItem('home');
  // @ts-ignore
  return useFetch(data.url, {
    ...options,
    baseURL: getUrl('API_URL', BASE_URL),
    timeout: 20000,
    method: data.method,
    headers: {
      "focus-sa-token": store && JSON.parse(store).token ? JSON.parse(store).token : 'null'
    },
    params: data?.data,
    $fetch: useNuxtApp().$api as typeof $fetch
  } as UseFetchOptions<T>);
};

/**
 * @description: 客户端请求
 */
const { notification } = createDiscreteApi(['notification']);
const { loadingBar } = createDiscreteApi(['loadingBar']);
const requests = axios.create({
  baseURL: BASE_URL,
  timeout: 20000
});

const errorTips = ['网络服务出错啦', '开发被外星人抓走了👾'];
/**
 * @description: 错误提示
 */
const errorNotification = () => {
  notification['error']({
    content: errorTips[0],
    meta: errorTips[1],
    duration: 2500,
    keepAliveOnHover: true
  });
};

const methodMap = {
  get: 'GET',
  post: 'POST',
  put: 'PUT',
  delete: 'DELETE',
  patch: 'PATCH',
  options: 'OPTIONS',
  head: 'HEAD'
};

/**
 * 签名加密函数
 * @param config axios请求配置对象
 * @description 根据请求参数生成签名，用于API安全验证
 */
function signEncrypt(config: any) {
  const timestamp = Date.now();
  const urlParts = config.url.split('?');
  const urlPath = urlParts[0];
  const url = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
  const nonce = uuidv4();
  const sign = `URI=/api${url}&Method=${methodMap[config.method as keyof typeof methodMap]}&Timestamp=${timestamp}&Nonce=${nonce}`;
  config.headers['x-Sign'] = sha256(SECRET_KEY + sign);
  config.headers['x-Nonce'] = nonce;
  config.headers['x-Timestamp'] = timestamp;
}

requests.interceptors.request.use(
  (config: any) => {
    config.baseURL = getUrl('API_URL', BASE_URL);
    const store = localStorage.getItem('home');
    config.headers['focus-sa-token'] = store && JSON.parse(store).token ? JSON.parse(store).token : 'null';
    signEncrypt(config);
    loadingBar.start();
    return config;
  },
  (error: any) => {
    errorNotification();
    loadingBar.error();
    setTimeout(() => loadingBar.finish());
    return Promise.reject(new Error(errorTips[0]));
  }
);

requests.interceptors.response.use(
  (response: any) => {
    loadingBar.finish();
    return response.data;
  },
  (error: any) => {
    loadingBar.error();
    setTimeout(() => loadingBar.finish());
    errorNotification();
    return error.request;
  }
);

export function getUrl(key: string, defaultValue?: string) {
  if (import.meta.server) {
    return process.env['NUXT_PUBLIC_' + key] || defaultValue;
  } else {
    const {
      public: { [key]: value }
    } = useRuntimeConfig();
    return value;
  }
}

export default requests;
