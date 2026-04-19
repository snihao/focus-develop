import { equalsLoose, includesText, mockFail, mockOk, nextId, nowString, paginate, readList, writeList } from '~/utils/mockStore';
import { initialRoles } from '~/mock/role';

export interface QueryRoleParams {
  name?: string;
  mark?: string;
  status?: number;
  page?: number;
  size?: number;
  current?: number;
}

export interface RoleParams {
  id?: number;
  name: string;
  mark: string;
  description: string;
  menuIdList: number[];
}

export interface Role {
  id: number;
  name: string;
  mark: string;
  description: string;
  status: number;
  menuIdList: number[];
  createDate: string;
  updateDate: string;
}

export interface BaseRole {
  id: number;
  name: string;
  mark: string;
}

const ROLE_KEY = 'roles';

function readRoles(): Role[] {
  return readList<Role>(ROLE_KEY, initialRoles);
}

/**
 * 查询角色列表（分页）。
 * 与业务层约定的返回结构兼容两种键名：records/total 或 data/total，这里采用 records。
 */
export const eqRole = (data: QueryRoleParams = {}): Promise<Result<{ records: Role[]; total: number }>> => {
  const list = readRoles().filter((role) => {
    if (!includesText(role.name, data.name)) return false;
    if (!includesText(role.mark, data.mark)) return false;
    if (!equalsLoose(role.status, data.status)) return false;
    return true;
  });

  const page = data.current ?? data.page ?? 1;
  const size = data.size ?? 10;
  return mockOk(paginate(list, page, size));
};

/**
 * 更新角色
 */
export const upRole = (data: RoleParams): Promise<Result<null>> => {
  const list = readRoles();
  const idx = list.findIndex((role) => role.id === Number(data.id));
  if (idx < 0) return mockFail('角色不存在');
  const prev = list[idx];
  const next: Role = {
    ...prev,
    name: data.name ?? prev.name,
    mark: data.mark ?? prev.mark,
    description: data.description ?? prev.description,
    menuIdList: Array.isArray(data.menuIdList) ? [...data.menuIdList] : prev.menuIdList,
    updateDate: nowString()
  };
  const cloned = [...list];
  cloned[idx] = next;
  writeList(ROLE_KEY, cloned);
  return mockOk(null);
};

/**
 * 启用/禁用角色（翻转状态）。
 */
export const disableRole = (ids: number[]): Promise<Result<null>> => {
  const list = readRoles();
  const idSet = new Set(ids);
  const now = nowString();
  const next = list.map((role) => (idSet.has(role.id) ? { ...role, status: Number(role.status) === 1 ? 0 : 1, updateDate: now } : role));
  writeList(ROLE_KEY, next);
  return mockOk(null);
};

/**
 * 批量删除角色（id=1 保留为超管）
 */
export const delRole = (ids: number[]): Promise<Result<null>> => {
  const list = readRoles();
  const idSet = new Set(ids.filter((id) => id !== 1));
  const rest = list.filter((role) => !idSet.has(role.id));
  writeList(ROLE_KEY, rest);
  return mockOk(null);
};

/**
 * 添加角色
 */
export const addRole = (data: RoleParams): Promise<Result<null>> => {
  const list = readRoles();
  const id = nextId(list);
  const now = nowString();
  const role: Role = {
    id,
    name: data.name,
    mark: data.mark,
    description: data.description ?? '',
    menuIdList: Array.isArray(data.menuIdList) ? [...data.menuIdList] : [],
    status: 1,
    createDate: now,
    updateDate: now
  };
  writeList(ROLE_KEY, [...list, role]);
  return mockOk(null);
};

/**
 * 查询角色分配的菜单 id 列表。
 */
export const eqRoleMenu = (id: number): Promise<Result<number[]>> => {
  const role = readRoles().find((item) => item.id === Number(id));
  return mockOk(role ? [...role.menuIdList] : []);
};

/**
 * 查询基础角色（启用中，供员工选择角色）。
 */
export const eqBaseRole = (): Promise<Result<BaseRole[]>> => {
  const list = readRoles()
    .filter((role) => Number(role.status) === 1)
    .map((role) => ({ id: role.id, name: role.name, mark: role.mark }));
  return mockOk(list);
};
