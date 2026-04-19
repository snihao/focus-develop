// 本文件是 mock 数据的持久化工具：
// - 静态初始值来自 mock/*.ts；
// - 运行时 CRUD 结果同步到 localStorage，刷新页面后仍保留；
// - SSR 场景下（window 未定义）回退到返回静态初始值的深拷贝，避免污染并发请求。

const KEY_PREFIX = 'focus-mock:';
const SCHEMA_VERSION = 'v1';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * 当前时间，格式 yyyy-MM-dd HH:mm:ss。
 */
export function nowString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 模拟异步：将数据包装为 Promise，并添加一个很短的延迟，避免 UI loading 闪烁。
 */
export function mockOk<T>(data: T, ms = 80): Promise<Result<T>> {
  const payload: Result<T> = { code: '200', data, msg: 'success', success: true };
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
}

/**
 * 失败响应。
 */
export function mockFail<T = null>(msg: string, data: T = null as unknown as T, ms = 60): Promise<Result<T>> {
  const payload: Result<T> = { code: '500', data, msg, success: false };
  return new Promise((resolve) => setTimeout(() => resolve(payload), ms));
}

function storageKey(key: string): string {
  return `${KEY_PREFIX}${SCHEMA_VERSION}:${key}`;
}

/**
 * 读取 mock 数据：优先 localStorage；若未初始化则写入初始值并返回深拷贝。
 * SSR 场景下（无 window）直接返回初始值的深拷贝。
 */
export function readList<T>(key: string, initial: T[]): T[] {
  if (typeof window === 'undefined') {
    return clone(initial);
  }

  const full = storageKey(key);
  const raw = window.localStorage.getItem(full);
  if (!raw) {
    window.localStorage.setItem(full, JSON.stringify(initial));
    return clone(initial);
  }
  try {
    return JSON.parse(raw) as T[];
  } catch {
    window.localStorage.setItem(full, JSON.stringify(initial));
    return clone(initial);
  }
}

/**
 * 写入 mock 数据到 localStorage；SSR 场景下是空操作。
 */
export function writeList<T>(key: string, list: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(key), JSON.stringify(list));
}

/**
 * 清除 mock 数据（调试用）。
 */
export function resetList(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(key));
}

/**
 * 读取通用 mock 键值对（比如 adminId -> roleIds 的映射）。
 */
export function readMap<V>(key: string, initial: Record<number, V>): Record<number, V> {
  if (typeof window === 'undefined') {
    return clone(initial);
  }
  const full = storageKey(key);
  const raw = window.localStorage.getItem(full);
  if (!raw) {
    window.localStorage.setItem(full, JSON.stringify(initial));
    return clone(initial);
  }
  try {
    return JSON.parse(raw) as Record<number, V>;
  } catch {
    window.localStorage.setItem(full, JSON.stringify(initial));
    return clone(initial);
  }
}

/**
 * 写入通用 mock 键值对。
 */
export function writeMap<V>(key: string, map: Record<number, V>): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey(key), JSON.stringify(map));
}

/**
 * 生成下一个递增 id。
 */
export function nextId<T extends { id: number }>(list: T[]): number {
  if (!list.length) return 1;
  return Math.max(...list.map((item) => item.id)) + 1;
}

/**
 * 简单字符串模糊匹配（大小写不敏感）。
 * 用于 mock 层对名称、手机号等字段进行筛选。
 */
export function includesText(source: unknown, keyword: unknown): boolean {
  if (keyword === '' || keyword === null || keyword === undefined) return true;
  if (source === null || source === undefined) return false;
  return String(source).toLowerCase().includes(String(keyword).toLowerCase());
}

/**
 * 等值匹配；空（''、null、undefined）视为不过滤。
 */
export function equalsLoose(source: unknown, keyword: unknown): boolean {
  if (keyword === '' || keyword === null || keyword === undefined) return true;
  return String(source) === String(keyword);
}

/**
 * 对扁平数组做分页切片。
 */
export function paginate<T>(list: T[], page = 1, size = 10): { records: T[]; total: number } {
  const total = list.length;
  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(size) || 10);
  const start = (safePage - 1) * safeSize;
  return {
    records: list.slice(start, start + safeSize),
    total
  };
}
