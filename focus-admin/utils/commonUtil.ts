import { createDiscreteApi } from 'naive-ui';

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 延迟时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number = 300, immediate: boolean = false): (...args: Parameters<T>) => void {
  let timer: number | null | NodeJS.Timeout = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    // 清除之前的定时器
    if (timer) clearTimeout(timer);

    if (immediate) {
      // 立即执行模式
      if (!timer) func.apply(this, args);
      timer = setTimeout(() => {
        timer = null;
      }, wait);
    } else {
      // 延迟执行模式
      timer = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    }
  };
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param wait 延迟时间（毫秒）
 * @param immediate 是否立即执行
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, wait: number = 300, immediate: boolean = false): (...args: Parameters<T>) => void {
  let timer: number | null | NodeJS.Timeout = null;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (timer) return;
    if (immediate) {
      timer = setTimeout(() => {
        timer = null;
      }, wait);
      func.apply(this, args);
    } else {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, wait);
    }
  };
}

/**
 * 下载
 * @param url 下载链接
 * @param fileName 文件名
 */
export function downLoad(url: string, fileName?: string) {
  let link = document.createElement('a');
  link.style.display = 'none';
  link.target = '_blank';
  link.href = url;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * 通过fetch下载文件并指定文件名
 * @param url 文件下载链接
 * @param fileName 指定的文件名（可选）
 */
export async function downLoadByBlob(url: string, fileName?: string) {
  try {
    // 从URL中提取文件后缀
    const urlPath = new URL(url).pathname;
    const urlExtension = urlPath.substring(urlPath.lastIndexOf('.'));

    // 处理文件名
    let finalFileName: string;
    if (fileName) {
      // 检查传入的文件名是否包含文件后缀
      const hasExtension = fileName.includes('.');
      if (hasExtension) {
        finalFileName = fileName;
      } else {
        // 如果没有后缀，添加从URL提取的后缀
        finalFileName = fileName + urlExtension;
      }
    } else {
      // 如果没有传入文件名，直接使用URL中的文件名
      const urlFileName = urlPath.substring(urlPath.lastIndexOf('/') + 1);
      finalFileName = urlFileName || 'download' + urlExtension;
    }

    // 通过fetch获取文件内容
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 将响应转换为blob
    const blob = await response.blob();

    // 创建下载链接
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = downloadUrl;
    link.download = finalFileName;

    // 执行下载
    document.body.appendChild(link);
    link.click();

    // 清理资源
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('下载失败:', error);
    throw error;
  }
}

export const isNull = (val: any) => {
  return val === null || val === undefined;
};
export const isNotNull = (val: any) => !isNull(val);

export const toStr = (val: any) => {
  if (isNull(val)) {
    return '';
  }
  return String(val);
};

/**
 * 构造对象参数
 * @param obj 要构造的对象
 * @returns 构造后的对象参数,若为空，返回空字符串
 */
export function constructorObjParams(obj: Record<string, any>) {
  Object.keys(obj).forEach((key) => {
    if (
      obj[key] === '' ||
      obj[key] === null ||
      obj[key] === undefined ||
      (Array.isArray(obj[key]) && obj[key].length === 0) ||
      JSON.stringify(obj[key]) === '{}'
    ) {
      delete obj[key];
    }
  });
  return Object.keys(obj).length === 0 ? '' : obj;
}

/**
 * 将对象中的数组转换为逗号分隔的字符串
 * @param obj 要处理的对象
 * @param keys 要处理的键名数组
 * @returns 处理后的对象
 */
export function objArrayToString(obj: Record<string, any>, keys?: string[]) {
  if (!keys) {
    keys = Object.keys(obj);
  }
  keys.forEach((key) => {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].join(',');
    }
  });
  return obj;
}

/**
 * 构建树形结构
 * @param data 要处理的对象
 * @param filterField 父级字段
 * @param keyField 主键字段
 * @param startFilterKey 开始字段
 * @returns 处理后的对象
 */
export function buildTree<T = any, P extends T = T>({
  data,
  filterField = 'parentId' as keyof T,
  keyField = 'id' as keyof T,
  startFilterKey = null
}: {
  data: T[]; // 原始数据
  filterField?: keyof T; // 父级字段
  keyField?: keyof T; // 主键字段
  startFilterKey?: number | null; // 开始字段
}): P[] {
  // 预先按parentId分组，避免每次递归都遍历整个数组
  const groupedByParent = new Map<number | null, T[]>();

  // 将所有节点按parentId分组
  data.forEach((item) => {
    const parentId = item[filterField] as number | null;
    if (!groupedByParent.has(parentId)) {
      groupedByParent.set(parentId, []);
    }
    groupedByParent.get(parentId)!.push(item);
  });

  // 递归构建树形结构的内部函数
  const buildNode = (parentId: number | null): P[] | undefined => {
    const children = groupedByParent.get(parentId) || [];
    return children
      .map((item) => ({
        ...item,
        children: buildNode(item[keyField] as number | null)
      }))
      .map((node) => {
        if (node.children && node.children.length === 0) {
          node.children = undefined;
        }
        return node;
      }) as P[];
  };

  return buildNode(startFilterKey) || [];
}

/**
 * 将 File 对象转换为 base64 字符串
 * @param file File 对象
 * @returns base64 字符串
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const { message } = createDiscreteApi(['message']);

/**
 * 通用图片上传方法
 * @param {File} file - 要上传的文件
 * @param {string} errorMsg - 错误提示信息
 * @param {Record<string, any>} params - 上传参数
 * @param {Function} req - 上传函数
 * @returns {Promise<string | null>} 上传成功返回图片URL，失败返回null
 */
export async function uploadImageFile({
  file,
  errorMsg,
  req,
  params
}: {
  file: File;
  errorMsg: string;
  params?: Record<string, any>;
  req: (...args: any[]) => Promise<Result<string>>;
}): Promise<string | null> {
  try {
    // 处理fullName和picturePrefix参数(兼容)
    if (params && 'fullName' in params && 'picturePrefix' in params) {
      params.fullName = `${params.fullName}${params.picturePrefix || ''}_${Date.now()}_${file.name}`;
      delete params.picturePrefix;
    }
    const currentParams = {
      file: file,
      ...params
    };
    const res = await req(currentParams);
    if (Number(res.code) === 200) {
      return res.data;
    } else {
      throw new Error(res.msg || errorMsg);
    }
  } catch (error) {
    console.error(errorMsg + ':', error);
    message.error(errorMsg);
    return null;
  }
}

// 文件类型和大小限制配置
const FILE_CONFIG = {
  // 图片文件配置
  image: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    maxSize: 10 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
  },
  // 视频文件配置
  video: {
    extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
    maxSize: 1000 * 1024 * 1024,
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska']
  },
  // 音频文件配置
  audio: {
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
    maxSize: 50 * 1024 * 1024,
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/mp4']
  },
  // PDF文档配置
  pdf: {
    extensions: ['pdf'],
    maxSize: 20 * 1024 * 1024,
    mimeTypes: ['application/pdf']
  }
};

/**
 * 验证文件类型和大小
 * @param file 要验证的文件
 * @returns 验证结果对象
 */
export function validateFile(file: File) {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split('.').pop() || '';
  const fileSize = file.size;

  // 检查文件类型
  let fileType = '';
  let config = null;

  for (const [type, typeConfig] of Object.entries(FILE_CONFIG)) {
    if (typeConfig.extensions.includes(fileExtension)) {
      fileType = type;
      config = typeConfig;
      break;
    }
  }

  if (!config) {
    return {
      isValid: false,
      error: `不支持的文件类型：${fileExtension}。支持的类型：${Object.values(FILE_CONFIG)
        .flatMap((c) => c.extensions)
        .join(', ')}`
    };
  }

  // 检查文件大小
  if (fileSize > config.maxSize) {
    const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
    const fileSizeMB = Math.round((fileSize / (1024 * 1024)) * 100) / 100;
    return {
      isValid: false,
      error: `文件大小超出限制。当前文件：${fileSizeMB}MB，最大允许：${maxSizeMB}MB`
    };
  }

  // 检查MIME类型（如果浏览器支持）
  if (file.type && !config.mimeTypes.some((mimeType) => file.type.startsWith(mimeType.split('/')[0]))) {
    return {
      isValid: false,
      error: `文件MIME类型不匹配：${file.type}`
    };
  }

  return {
    isValid: true,
    fileType,
    config
  };
}

/**
 * 判断URL或路径是否为图片格式
 * @param urlOrPath 要判断的URL或路径
 * @returns 如果是图片格式则返回true，否则返回false
 */
export function isImageUrl(urlOrPath: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(urlOrPath.split('?')[0] || '');
}

/**
 *
 * @param text 是否为音频
 * @returns q是否为音频
 */
export function isAudioUrl(urlOrPath: string) {
  return /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(urlOrPath.split('?')[0] || '');
}

/**
 * 是否为视频格式
 * @param urlOrPath 要判断的URL或路径
 * @returns 如果是视频格式则返回true，否则返回false
 */
export function isVideoUrl(urlOrPath: string) {
  return /\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/i.test(urlOrPath.split('?')[0] || '');
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns 复制是否成功
 */
export async function copyToClipboard(text: string, showToast: boolean = true) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      if (showToast) {
        message.success('复制成功');
      }
      return true;
    }
    throw new Error('Clipboard API unavailable');
  } catch (error) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      if (showToast) {
        message.success('复制成功');
      }
      return true;
    } catch (err) {
      if (showToast) {
        message.error('复制失败');
      }
      console.error('复制失败:', err);
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

/**
 * 获取文件大小字符串
 * @param size 文件大小（字节），非数字时返回 '0 Bytes'
 * @returns 文件大小字符串（例如：1024 Bytes -> 1.00 KB）
 */
export function getFileSize(size: number): string {
  // 处理非数字、负数、NaN 等异常情况
  if (!Number.isFinite(size) || size < 0) {
    return '0 Bytes';
  }
  if (size === 0) {
    return '0 Bytes';
  }

  const k = 1024; // 二进制单位换算基数（1KB = 1024 Bytes）
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  // 计算单位索引：通过对数计算 size 属于哪个量级（避免循环除法）
  const i = Math.min(Math.floor(Math.log(size) / Math.log(k)), sizes.length - 1);
  // 换算成对应单位并保留 2 位小数，去除末尾无意义的 0（如 1.00 -> 1）
  const formattedSize = (size / Math.pow(k, i)).toFixed(2).replace(/\.00$/, '');
  return `${formattedSize} ${sizes[i]}`;
}
