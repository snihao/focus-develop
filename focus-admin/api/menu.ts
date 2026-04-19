import { buildTree } from '~/utils/commonUtil';
import { equalsLoose, includesText, mockFail, mockOk, nextId, nowString, readList, writeList } from '~/utils/mockStore';
import { initialMenus } from '~/mock/menu';

export enum MenuType {
  DIRECTORY = 0, // 目录
  MENU = 1, // 菜单
  BUTTON = 2 // 按钮
}

export interface Menu {
  id: number;
  parentId: number; // 父菜单ID
  name: string; // 菜单名称
  icon: string; // 菜单图标
  order: number; // 菜单排序
  mark: string; // 菜单标记
  route: string; // 路由地址
  type: number; // 菜单类型 0：目录 1：菜单 2：按钮
  children?: Menu[];
  createDate: string;
  updateDate: string;
  status: number;
}

const MENU_KEY = 'menus';

// 读取扁平菜单数组。
function readMenuList(): Menu[] {
  return readList<Menu>(MENU_KEY, initialMenus);
}

// 根据筛选条件得到扁平结果。
function filterMenus(list: Menu[], params: MenuQueryParams): Menu[] {
  return list.filter((item) => {
    if (!includesText(item.name, params.name)) return false;
    if (!includesText(item.mark, params.mark)) return false;
    if (!equalsLoose(item.status, params.state)) return false;
    if (!equalsLoose(item.type, params.type)) return false;
    return true;
  });
}

// 以给定扁平数组构建树（按 order 排序）。
function toTree(list: Menu[]): Menu[] {
  const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return buildTree<Menu>({ data: sorted, filterField: 'parentId', keyField: 'id', startFilterKey: 0 });
}

// 按 id 收集自身 + 所有后代 id。
function collectDescendants(list: Menu[], ids: number[]): Set<number> {
  const result = new Set<number>(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of list) {
      if (result.has(item.parentId) && !result.has(item.id)) {
        result.add(item.id);
        changed = true;
      }
    }
  }
  return result;
}

/**
 * 获取员工菜单列表（侧栏用，过滤禁用项，按树返回）。
 */
export const getEmpMenuList = (): Promise<Result<Menu[]>> => {
  const list = readMenuList().filter((m) => Number(m.status) === 1);
  return mockOk(toTree(list));
};

/**
 * 获取基础菜单列表（角色分配权限用，按树返回）。
 */
export const getBaseMenuList = (): Promise<Result<Menu[]>> => {
  return mockOk(toTree(readMenuList()));
};

export interface MenuParams {
  id?: number;
  parentId: number;
  name: string;
  icon: string;
  order: number;
  mark: string;
  route: string;
  type: number;
}

/**
 * 新增菜单
 */
export const addMenu = (data: MenuParams): Promise<Result<null>> => {
  const list = readMenuList();
  const id = nextId(list);
  const now = nowString();
  const item: Menu = {
    id,
    parentId: Number(data.parentId ?? 0) || 0,
    name: data.name,
    icon: data.icon ?? '',
    order: Number(data.order ?? 0) || 0,
    mark: data.mark ?? '',
    route: data.route ?? '',
    type: Number(data.type ?? 0),
    createDate: now,
    updateDate: now,
    status: 1
  };
  writeList(MENU_KEY, [...list, item]);
  return mockOk(null);
};

/**
 * 批量删除菜单（同时删除其后代节点）
 */
export const delMenu = (ids: number[]): Promise<Result<number>> => {
  const list = readMenuList();
  const targets = collectDescendants(list, ids);
  const rest = list.filter((m) => !targets.has(m.id));
  writeList(MENU_KEY, rest);
  return mockOk(targets.size);
};

export interface MenuQueryParams {
  state?: number;
  status?: number;
  type?: number;
  name?: string;
  mark?: string;
}

/**
 * 查询菜单树（支持名称/标识/类型/状态过滤）。
 * 为了保持树结构完整，任一命中节点会连带其祖先一并返回。
 */
export const queryMenuList = (data: MenuQueryParams = {}): Promise<Result<Menu[]>> => {
  const list = readMenuList();
  // 兼容老接口的 state 字段命名
  const normalized: MenuQueryParams = { ...data, state: data.state ?? data.status };

  const isEmpty = (v: unknown): boolean => v === undefined || v === null || v === '';
  const noFilter = isEmpty(normalized.name) && isEmpty(normalized.mark) && isEmpty(normalized.type) && isEmpty(normalized.state);

  if (noFilter) {
    return mockOk(toTree(list));
  }

  const matched = filterMenus(list, normalized);
  // 带上祖先节点，保证树不断层
  const ids = new Set(matched.map((m) => m.id));
  const byId = new Map(list.map((m) => [m.id, m]));
  matched.forEach((item) => {
    let current = item;
    while (current.parentId && byId.has(current.parentId)) {
      if (ids.has(current.parentId)) break;
      ids.add(current.parentId);
      current = byId.get(current.parentId)!;
    }
  });
  const expanded = list.filter((m) => ids.has(m.id));
  return mockOk(toTree(expanded));
};

/**
 * 更新菜单
 */
export const upMenu = (data: MenuParams): Promise<Result<number>> => {
  const list = readMenuList();
  const idx = list.findIndex((m) => m.id === Number(data.id));
  if (idx < 0) return mockFail('菜单不存在', 0);
  const prev = list[idx];
  const next: Menu = {
    ...prev,
    parentId: Number(data.parentId ?? prev.parentId) || 0,
    name: data.name ?? prev.name,
    icon: data.icon ?? prev.icon,
    order: Number(data.order ?? prev.order) || 0,
    mark: data.mark ?? prev.mark,
    route: data.route ?? prev.route,
    type: Number(data.type ?? prev.type),
    updateDate: nowString()
  };
  const cloned = [...list];
  cloned[idx] = next;
  writeList(MENU_KEY, cloned);
  return mockOk(1);
};

/**
 * 切换启用/禁用状态（在启用与禁用之间翻转）。
 */
export const disableMenu = (ids: number[]): Promise<Result<number>> => {
  const list = readMenuList();
  const idSet = new Set(ids);
  const now = nowString();
  const next = list.map((m) => (idSet.has(m.id) ? { ...m, status: Number(m.status) === 1 ? 0 : 1, updateDate: now } : m));
  writeList(MENU_KEY, next);
  return mockOk(ids.length);
};
