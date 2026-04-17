export interface LoginParams {
  phone: string;
  password: string;
}

export interface EmpListParams {
  name: string;
  phone: string;
  status: number;
  page: number;
  size: number;
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
  data: EmpInfo[];
}

export interface EmpAddParams {
  name: string;
  phone: string;
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

/**
 * 登录
 * @param data 登录参数
 * @returns 登录结果
 */
export const login = (data: LoginParams): Promise<Result<string>> => {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
};

/**
 * 更新密码
 * @param data 更新密码参数
 * @returns 更新密码结果
 */
export const updatePwd = (data: { oldPwd: string; newPwd: string }): Promise<Result<string>> => {
  return request({
    url: '/admin/updatePwd',
    method: 'post',
    data
  });
};

/**
 * 获取员工基本信息
 * @returns 员工基本信息
 */
export const getEmpInfo = (): Promise<Result<EmpInfoResult>> => {
  return request({
    url: '/admin/eqInfo',
    method: 'get'
  });
};

/**
 * 获取员工列表
 * @returns 员工列表
 */
export const getEmpList = (data: EmpListParams): Promise<Result<EmpListResult>> => {
  return request({
    url: '/admin/eqAdmin',
    method: 'post',
    data
  });
};

/**
 * 添加员工
 * @param data 员工信息
 * @returns 员工信息
 */
export const addEmp = (data: EmpAddParams): Promise<Result<EmpListResult>> => {
  return request({
    url: '/admin/addAdmin',
    method: 'post',
    data
  });
};

/**
 * 删除员工
 * @param id 员工id
 * @returns 员工信息
 */
export const delEmp = (data: number[]): Promise<Result<EmpListResult>> => {
  return request({
    url: '/admin/delAdmin',
    method: 'post',
    data
  });
};

/**
 * 禁用员工
 * @param id 员工id
 * @returns 员工信息
 */
export const disableEmp = (data: number[]): Promise<Result<EmpInfoResult>> => {
  return request({
    url: '/admin/disableAdmin',
    method: 'post',
    data
  });
};

/**
 * 更新员工
 * @param data 员工信息
 * @returns 员工信息
 */
export const updateEmp = (data: EmpUpdateParams): Promise<Result<EmpInfoResult>> => {
  return request({
    url: '/admin/updateAdmin',
    method: 'post',
    data
  });
};
