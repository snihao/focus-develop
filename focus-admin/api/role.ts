export interface QueryRoleParams {
  name?: string;
  mark?: string;
  status?: number;
  page?: number;
  size?: number;
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

/**
 * 查询角色列表
 * @param data 角色参数
 * @returns 角色列表
 */
export const eqRole = (data: QueryRoleParams): Promise<Result<{ data: Role[]; total: number }>> => {
  return request({
    url: `/role/eqRole`,
    method: 'post',
    data
  });
};

/**
 * 更新角色
 * @param data 角色参数
 * @returns 角色列表
 */
export const upRole = (data: RoleParams): Promise<Result<null>> => {
  return request({
    url: `/role/upRole`,
    method: 'post',
    data
  });
};

/**
 * 禁用角色
 * @param data 角色参数
 * @returns 角色列表
 */
export const disableRole = (data: number[]): Promise<Result<null>> => {
  return request({
    url: `/role/disableRole`,
    method: 'post',
    data
  });
};

/**
 * 删除角色
 * @param data 角色参数
 * @returns 角色列表
 */
export const delRole = (data: number[]): Promise<Result<null>> => {
  return request({
    url: `/role/delRole`,
    method: 'post',
    data
  });
};

/**
 * 添加角色
 * @param data 角色参数
 * @returns 角色列表
 */
export const addRole = (data: RoleParams): Promise<Result<null>> => {
  return request({
    url: `/role/addRole`,
    method: 'post',
    data
  });
};

/**
 * 查询角色菜单
 * @param data 角色参数
 * @returns 角色列表
 */
export const eqRoleMenu = (id: number): Promise<Result<number[]>> => {
  return request({
    url: `/role/eqRoleMenu/${id}`,
    method: 'get'
  });
};

/**
 * 查询基础角色
 * @returns 角色列表
 */
export const eqBaseRole = (): Promise<Result<BaseRole[]>> => {
  return request({
    url: `/role/eqBaseRole`,
    method: 'get'
  });
};
