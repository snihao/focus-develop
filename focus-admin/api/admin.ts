import { equalsLoose, includesText, mockFail, mockOk, nextId, nowString, paginate, readList, readMap, writeList, writeMap } from '~/utils/mockStore';
import { initialAdminRoles, initialAdmins } from '~/mock/admin';
import { initialRoles } from '~/mock/role';
import type { Role } from '~/api/role';

export interface LoginParams {
  phone: string;
  password: string;
}

export interface EmpListParams {
  name?: string;
  phone?: string;
  status?: number;
  page?: number;
  size?: number;
  current?: number;
}

export interface EmpInfoParams {
  id?: number;
  name: string;
  phone: string;
  gender: number;
  status: number;
  roleIds: number[];
}

export interface EmpInfoResult {
  id: number;
  name: string;
  phone: string;
  photo: string;
  roleIds: number[];
  roleNames: string[];
}

export interface RoleInfo {
  adminId: number;
  roleId: number;
  name: string;
  mark: string;
}

export interface EmpInfo {
  id: number;
  name: string;
  phone: string;
  gender: number;
  status: number;
  photo: string;
  createDate: string;
  updateDate: string;
  roles: RoleInfo[];
}

export interface EmpListResult {
  total: number;
  records: EmpInfo[];
  data?: EmpInfo[];
}

export interface EmpAddParams {
  name: string;
  phone: string;
  gender?: number;
  status?: number;
  roleIds: number[];
}

export interface EmpUpdateParams {
  id: number;
  name: string;
  phone: string;
  gender: number;
  status: number;
  roleIds: number[];
}

const ADMIN_KEY = 'admins';
const ADMIN_ROLE_KEY = 'admin-roles';

function readAdmins(): EmpInfo[] {
  return readList<EmpInfo>(ADMIN_KEY, initialAdmins);
}

function readAdminRoles(): Record<number, number[]> {
  return readMap<number[]>(ADMIN_ROLE_KEY, initialAdminRoles);
}

function buildRoles(adminId: number, roleTable: Role[], roleMap: Record<number, number[]>): RoleInfo[] {
  const ids = roleMap[adminId] ?? [];
  const byId = new Map(roleTable.map((r) => [r.id, r]));
  return ids
    .map((rid) => {
      const role = byId.get(rid);
      if (!role) return null;
      return { adminId, roleId: role.id, name: role.name, mark: role.mark };
    })
    .filter(Boolean) as RoleInfo[];
}

/**
 * mock 登录（演示页面已在 pages/index.vue 自行处理，仅保留返回接口兼容性）。
 */
export const login = (data: LoginParams): Promise<Result<string>> => {
  if (data.phone === 'focus' && data.password === 'focus') {
    return mockOk('focus-mock-token-' + Date.now());
  }
  return mockFail('账号或密码错误', '');
};

/**
 * 修改密码（mock 永远返回成功）。
 */
export const updatePwd = (_data: { oldPwd: string; newPwd: string }): Promise<Result<string>> => {
  return mockOk('ok');
};

/**
 * 获取当前员工信息（取第一个员工作为当前账号）。
 */
export const getEmpInfo = (): Promise<Result<EmpInfoResult>> => {
  const admins = readAdmins();
  const current = admins[0];
  if (!current) return mockFail('当前登录员工不存在', null as unknown as EmpInfoResult);
  const roleTable = readList<Role>('roles', initialRoles);
  const roleMap = readAdminRoles();
  const roles = buildRoles(current.id, roleTable, roleMap);
  return mockOk({
    id: current.id,
    name: current.name,
    phone: current.phone,
    photo: current.photo,
    roleIds: roles.map((r) => r.roleId),
    roleNames: roles.map((r) => r.name)
  });
};

/**
 * 分页查询员工列表，自动拼接角色信息。
 */
export const getEmpList = (data: EmpListParams = {}): Promise<Result<EmpListResult>> => {
  const admins = readAdmins();
  const roleTable = readList<Role>('roles', initialRoles);
  const roleMap = readAdminRoles();

  const hydrated = admins.map((admin) => ({
    ...admin,
    roles: buildRoles(admin.id, roleTable, roleMap)
  }));

  const filtered = hydrated.filter((admin) => {
    if (!includesText(admin.name, data.name)) return false;
    if (!includesText(admin.phone, data.phone)) return false;
    if (!equalsLoose(admin.status, data.status)) return false;
    return true;
  });

  const page = data.current ?? data.page ?? 1;
  const size = data.size ?? 10;
  const { records, total } = paginate(filtered, page, size);
  return mockOk({ records, total, data: records });
};

/**
 * 新增员工
 */
export const addEmp = (data: EmpAddParams): Promise<Result<null>> => {
  const admins = readAdmins();
  const id = nextId(admins);
  const now = nowString();
  const initial = initialAdmins[0]?.photo ?? '';
  const next: EmpInfo = {
    id,
    name: data.name,
    phone: data.phone,
    gender: Number(data.gender ?? 1),
    status: Number(data.status ?? 1),
    photo: initial,
    createDate: now,
    updateDate: now,
    roles: []
  };
  writeList(ADMIN_KEY, [...admins, next]);

  const roleMap = readAdminRoles();
  roleMap[id] = Array.isArray(data.roleIds) ? [...data.roleIds] : [];
  writeMap(ADMIN_ROLE_KEY, roleMap);
  return mockOk(null);
};

/**
 * 批量删除员工（id=1 保留为演示账号，不可删除）
 */
export const delEmp = (ids: number[]): Promise<Result<null>> => {
  const admins = readAdmins();
  const idSet = new Set(ids.filter((id) => id !== 1));
  const rest = admins.filter((admin) => !idSet.has(admin.id));
  writeList(ADMIN_KEY, rest);
  const roleMap = readAdminRoles();
  idSet.forEach((id) => delete roleMap[id]);
  writeMap(ADMIN_ROLE_KEY, roleMap);
  return mockOk(null);
};

/**
 * 启用/禁用员工
 */
export const disableEmp = (ids: number[]): Promise<Result<null>> => {
  const admins = readAdmins();
  const idSet = new Set(ids);
  const now = nowString();
  const next = admins.map((admin) => (idSet.has(admin.id) ? { ...admin, status: Number(admin.status) === 1 ? 0 : 1, updateDate: now } : admin));
  writeList(ADMIN_KEY, next);
  return mockOk(null);
};

/**
 * 更新员工
 */
export const updateEmp = (data: EmpUpdateParams): Promise<Result<null>> => {
  const admins = readAdmins();
  const idx = admins.findIndex((admin) => admin.id === Number(data.id));
  if (idx < 0) return mockFail('员工不存在');
  const prev = admins[idx];
  const next: EmpInfo = {
    ...prev,
    name: data.name ?? prev.name,
    phone: data.phone ?? prev.phone,
    gender: Number(data.gender ?? prev.gender),
    status: Number(data.status ?? prev.status),
    updateDate: nowString()
  };
  const cloned = [...admins];
  cloned[idx] = next;
  writeList(ADMIN_KEY, cloned);

  const roleMap = readAdminRoles();
  roleMap[next.id] = Array.isArray(data.roleIds) ? [...data.roleIds] : roleMap[next.id] ?? [];
  writeMap(ADMIN_ROLE_KEY, roleMap);
  return mockOk(null);
};
