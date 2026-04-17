/**
 * 校验token是否符合jwt格式
 * @param token
 * @returns 校验结果
 */
export function validateToken(token: string) {
  // 校验token，符合jwt格式
  if (!token) {
    return false;
  }

  // JWT格式校验：应该包含三个部分，用点号分隔
  const jwtParts = token.split('.');
  if (jwtParts.length !== 3) {
    console.warn('Invalid JWT format: token does not contain 3 parts');
    return false;
  }

  try {
    // 校验header和payload是否为有效的base64编码
    const header = jwtParts[0];
    const payload = jwtParts[1];
    if (!isValidBase64(header) || !isValidBase64(payload)) {
      console.warn('Invalid JWT format: header or payload is not base64 encoded');
      return false;
    }

    const payloadJson = JSON.parse(atob(payload));
    // 检查是否有过期时间，如果有则校验是否过期
    if (payloadJson.exp && payloadJson.exp * 1000 < Date.now()) {
      console.warn('JWT token has expired', payloadJson.exp * 1000, Date.now());
      return false;
    }

    return true;
  } catch (error) {
    // 如果解析失败，说明不是有效的JWT格式
    console.warn('Invalid JWT format:', error);
    return false;
  }
}

/**
 * 校验字符串是否为有效的base64编码
 * @param str 待校验的字符串
 * @returns 是否为有效的base64编码
 */
export function isValidBase64(str: string): boolean {
  // base64字符集：A-Z, a-z, 0-9, +, /, =
  const base64Regex = /^[A-Za-z0-9+/\-_]*={0,2}$/;

  if (!base64Regex.test(str)) {
    return false;
  }

  const hasStandardBase64Chars = /[+/=]/.test(str);

  if (hasStandardBase64Chars) {
    // 如果包含标准base64字符，则必须符合4的倍数规则
    if (str.length % 4 !== 0) {
      return false;
    }

    // 检查填充字符的位置是否正确
    const paddingIndex = str.indexOf('=');
    if (paddingIndex !== -1) {
      // 如果有填充字符，它们应该只出现在末尾
      const padding = str.substring(paddingIndex);
      if (!/^={1,2}$/.test(padding)) {
        return false;
      }
    }
  }

  return true;
}
