import type { FetchResponse, SearchParameters } from 'ofetch';
import { createDiscreteApi } from 'naive-ui';

const { message, notification, loadingBar } = createDiscreteApi(['message', 'notification', 'loadingBar']);

const errorTips = [
  ['访问过于频繁，请稍候再试', '别搞别搞别搞😟'],
  ['网络服务出错啦', '开发被外星人抓走了👾']
];

const handleError = <T>(response: FetchResponse<Result<T>> & FetchResponse<ResponseType>) => {
  // 安全地结束 loadingBar
  if (loadingBar && typeof loadingBar.error === 'function') {
    loadingBar.error();
  }
  // 安全地结束 loadingBar
  if (loadingBar && typeof loadingBar.finish === 'function') {
    setTimeout(() => loadingBar.finish());
  }
  const err = (text: string) => {
    if (message && typeof message.error === 'function') {
      message.error(response?._data?.msg ?? text);
    }
  };
  const errNotification = (text?: string) => {
    if (notification && typeof notification.error === 'function') {
      notification['error']({
        content: text ?? errorTips[1][0],
        meta: errorTips[1][1],
        duration: 2500,
        keepAliveOnHover: true
      });
    }
  };
  if (!response._data) {
    err('请求超时，服务器无响应！');
    return;
  }
  const userStore = useUserStore();
  if (response._data?.code === 'A0300' || response._data?.code === '401') {
    err('登录状态已过期，需要重新登录');
    userStore.logout();
    return;
  }
  switch (response.status) {
    case 404:
      errNotification('服务器资源不存在');
      break;
    case 500:
      errNotification('服务器内部错误');
      break;
    case 403:
      errNotification('没有权限访问该资源');
      break;
    case 401:
      errNotification('登录状态已过期，需要重新登录');
      userStore.logout();
      break;
    // default:
    //   err(response._data?.msg ?? '未知错误！');
    //   break;
  }
};

const createApiError = (response: FetchResponse<any>) => {
  const message = response?._data?.msg ?? '请求失败';
  const err = new Error(message);
  return err;
};

const fetch = $fetch.create({
  // 请求拦截器
  onRequest({ options }: any) {
    const {
      public: { API_URL }
    } = useRuntimeConfig();
    options.baseURL = API_URL as string;
    options.timeout = 1000 * 60 * 5;

    // 添加请求头,如果已登录则携带token
    const userStore = useUserStore();
    // 初始化headers对象
    options.headers = new Headers(options.headers);
    // 只有在用户已登录时才添加 Authorization 头
    options.headers.set('Authorization', userStore.token || 'null');

    if (options.body) {
      if (options.body instanceof FormData) {
        // FormData会自动设置正确的Content-Type，包括boundary
        // 不需要手动设置Content-Type
      }
      // 如果明确指定了form-urlencoded类型，进行转换
      else if (options.headers.get('content-type')?.includes('application/x-www-form-urlencoded') && typeof options.body === 'object') {
        // 将对象转换为URLSearchParams格式
        const params = new URLSearchParams();
        Object.entries(options.body).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        options.body = params.toString();
      }
      // 如果是普通对象且没有指定Content-Type，默认为JSON
      else if (typeof options.body === 'object' && !options.headers.get('content-type')) {
        options.headers.set('Content-Type', 'application/json');
      }
    }

    // 安全地启动 loadingBar
    if (loadingBar && typeof loadingBar.start === 'function') {
      loadingBar.start();
    }
  },
  // 响应拦截
  onResponse({ response }) {
    // 安全地结束 loadingBar
    if (loadingBar && typeof loadingBar.finish === 'function') {
      loadingBar.finish();
    }
    // 处理文件下载
    if (response.headers.get('content-disposition') && response.status === 200) return response;
    const code = response._data?.code;
    const isSuccess = Number(code) === 200 || response._data?.success;
    if (!isSuccess) {
      handleError(response);
      return Promise.reject(createApiError(response));
    }
    // 成功返回
    return response._data;
  },
  // 错误处理
  onResponseError({ response }) {
    handleError(response);
    return Promise.reject(createApiError(response));
  }
});

// 定义请求配置接口
interface RequestConfig {
  url: string;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  data?: any;
  params?: any;
  headers?: HeadersInit;
  timeout?: number;
  custom?: { [key: string]: any };
}

export const request = <T>(config: RequestConfig) => {
  const { url, method = 'get', data, params, headers, timeout, custom } = config;
  const options: any = {
    method,
    headers,
    timeout,
    custom
  };

  // 根据请求方法设置数据
  if (method === 'get') {
    options.params = data || params;
  } else {
    options.body = data;
    if (params) {
      options.params = params;
    }
  }

  return fetch<T>(url, options);
};

export const getByForm = ({ url, param }: { url: string; param: any }) => {
  url = url + '?' + new URLSearchParams(param).toString();
  return request({
    url,
    method: 'get'
  });
};

export const postByForm = <T = any>({ url, data }: { url: string; data: any }): Promise<Result<T>> =>
  request({
    url,
    method: 'post',
    data,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' }
  });
