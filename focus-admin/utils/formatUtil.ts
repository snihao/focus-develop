/**
 * 时间格式化
 * @param d 时间，默认当前时间
 * @param fmt 事件格式类型 ，默认yyyy-MM-dd HH:mm:ss
 * @returns
 */
export const getDateFormat = (d?: string | number, fmt?: string): string => {
  if (!d) {
    return '';
  }
  fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
  const date = d ? new Date(d) : new Date();
  let o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  } as any;
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (let k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
  return fmt;
};

export const parseTreeData = (data: [], param: any) => {
  param = param || {};
  const pProp = param?.pProp || 'pId';
  const cProp = param?.cProp || 'id';
  const sortProp = param?.sortProp || 'sort';
  return data.map((item) => {
    const children = data.filter((obj) => item[cProp] === obj[pProp]);
    // @ts-ignore
    item.children = children.length ? children.sort((o1, o2) => o1[sortProp] - o2[sortProp]) : null;
    return item;
  });
};

/**
 * 手机号脱敏
 * @param phone 手机号
 * @returns 脱敏后的手机号
 */
export function maskPhoneNumber(phoneNumber: string): string {
  return phoneNumber;
  // 检查输入是否有效
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber === 'null' || phoneNumber === 'undefined') {
    return '';
  }

  // 提取所有数字和+号，用于确定脱敏规则
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  if (cleaned.length === 0) {
    return '';
  }

  // 分析号码结构
  const isInternational = cleaned.startsWith('+');
  const digits = isInternational ? cleaned.slice(1) : cleaned;
  let keepStart, keepEnd;

  // 根据号码长度确定需要保留的位数
  if (digits.length <= 7) {
    keepStart = 2;
    keepEnd = 2;
  } else if (digits.length <= 10) {
    keepStart = 3;
    keepEnd = 3;
  } else {
    keepStart = 3;
    keepEnd = 4;
  }

  // 需要保留的数字部分
  const startDigits = digits.slice(0, keepStart);
  const endDigits = digits.slice(-keepEnd);
  const totalMask = digits.length - keepStart - keepEnd;

  // 构建脱敏后的数字序列
  let maskedDigits = '';
  if (isInternational) maskedDigits += '+';
  maskedDigits += startDigits;
  maskedDigits += '*'.repeat(Math.max(0, totalMask));
  maskedDigits += endDigits;

  // 将脱敏后的数字放回原始格式中
  let digitIndex = 0;
  let result = '';

  for (const char of phoneNumber) {
    if (/[\d+]/.test(char)) {
      // 是数字或+号，使用处理后的字符
      result += maskedDigits[digitIndex] || char;
      digitIndex++;
    } else {
      // 非数字和+号，保留原始字符
      result += char;
    }
  }

  return result;
}

/**
 * 邮箱脱敏
 * @param email 原始邮箱地址（支持空值、非字符串）
 * @param keepPrefix 用户名部分保留的前缀位数，默认2位
 * @returns 脱敏后的邮箱 | 占位符"-"（非法/空值时）
 */
export function desensitizeEmail(email: string | null | undefined, keepPrefix: number = 2): string {
  return email || '-';
  // 1. 处理空值、非字符串情况
  if (!email || typeof email !== 'string' || email === 'null' || email === 'undefined') {
    return '-';
  }

  // 2. 简单校验邮箱格式（包含@和域名后缀）
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailReg.test(email)) {
    return '-';
  }

  // 3. 拆分邮箱用户名和域名部分
  const [username, domain] = email.split('@');
  // 兜底：防止拆分后无域名/用户名的异常情况
  if (!username || !domain) {
    return '-';
  }

  // 4. 计算保留位数（避免保留位数超过用户名长度）
  const actualKeepLength = Math.min(Math.max(1, keepPrefix), username.length);
  // 5. 生成脱敏字符串：保留前缀 + 星号 + @域名
  const prefixStr = username.slice(0, actualKeepLength);
  const starStr = '*'.repeat(Math.max(1, username.length - actualKeepLength)); // 至少1个星号

  return `${prefixStr}${starStr}@${domain}`;
}
