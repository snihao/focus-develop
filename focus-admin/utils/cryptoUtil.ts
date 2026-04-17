import CryptoJS from 'crypto-js';

/**
 * SHA256 加密
 * @param message 内容
 * @returns 加密值
 */
export const sha256Encrypt = (message: string): string => {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
};
/**
 * md5 加密
 * @param message 内容
 * @returns 加密值
 */
export const md5Encrypt = (message: string): string => {
  return CryptoJS.MD5(message).toString(CryptoJS.enc.Hex);
};

export class RsaUtils {
  private static instance: RsaUtils;
  private jsencrypt: any = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): RsaUtils {
    if (!RsaUtils.instance) {
      RsaUtils.instance = new RsaUtils();
    }
    return RsaUtils.instance;
  }

  /**
   * 动态加载并初始化 JSEncrypt（仅在客户端）
   * @param publicKey 可选，传入自定义公钥
   */
  private async initJSEncrypt(publicKey?: string): Promise<boolean> {
    if (!import.meta.client) return false;
    if (this.jsencrypt) return true;

    try {
      const { default: JSEncrypt } = await import('jsencrypt');
      this.jsencrypt = new JSEncrypt();
      const key = publicKey || useRuntimeConfig().public.RSA_PUBLIC_KEY as string || '';
      this.jsencrypt.setPublicKey(key);
      return !!key;
    } catch (error) {
      return false;
    }
  }

  /**
   * 执行加密操作
   */
  private performEncrypt(data: any): string {
    if (!this.jsencrypt) return '';
    const dataString = typeof data === 'object' ? JSON.stringify(data) : String(data);
    const encrypted = this.jsencrypt.encrypt(dataString);
    return encrypted ? base64ToHex(encrypted) : '';
  }

  /**
   * RSA加密（异步版本）
   */
  public async encrypt(data: any): Promise<string> {
    if (!import.meta.client) return '';
    const initialized = await this.initJSEncrypt();
    if (!initialized) return '';
    return this.performEncrypt(data);
  }
}

/**
 * 将 base64 转换为十六进制字符串
 */
export function base64ToHex(base64: string): string {
  const raw = atob(base64);
  let hex = '';
  for (let i = 0; i < raw.length; i++) {
    const charCode = raw.charCodeAt(i).toString(16).padStart(2, '0');
    hex += charCode;
  }
  return hex.toUpperCase();
}

export const rsaUtils = RsaUtils.getInstance();
