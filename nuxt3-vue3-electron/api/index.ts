import requests from './request';

/**
 * API 接口统一管理
 */

// 示例：用户相关接口
export const userApi = {
  login: (data: { username: string; password: string }) =>
    requests.post('/api/user/login', data),
  getInfo: () =>
    requests.get('/api/user/info'),
};

// 示例：文件操作接口
export const fileApi = {
  upload: (formData: FormData) =>
    requests.post('/api/file/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  download: (id: string) =>
    requests.get(`/api/file/download/${id}`, { responseType: 'blob' }),
};
