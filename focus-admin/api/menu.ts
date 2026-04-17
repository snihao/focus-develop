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
  type: number; // 菜单类型 1：目录 2：菜单 3：按钮
  children?: Menu[];
  createDate: string;
  updateDate: string;
  status: number;
}

/**
 * 获取员工菜单列表
 * @returns 菜单列表
 */
export const getEmpMenuList = (): Promise<Result<Menu[]>> => {
  return request({
    url: '/menu/eqAdminMenu',
    method: 'get'
  });
};

/**
 * 获取基础菜单列表
 * @returns 菜单列表
 */
export const getBaseMenuList = (): Promise<Result<Menu[]>> => {
  return request({
    url: '/menu/eqBaseMenu',
    method: 'get'
  });
};

export interface MenuParams {
  id?: number;
  parentId: number; // 父菜单ID
  name: string; // 菜单名称
  icon: string; // 菜单图标
  order: number; // 菜单排序
  mark: string; // 菜单标记
  route: string; // 路由地址
  type: number; // 菜单类型 1：目录 2：菜单 3：按钮
}
/**
 * 新增菜单
 * @param data 菜单参数
 * @returns 新增结果
 */
export const addMenu = (data: MenuParams): Promise<Result<null>> => {
  return request({
    url: '/menu/addMenu',
    method: 'post',
    data
  });
};

/**
 * 删除菜单
 * @param data 菜单参数
 * @returns 删除结果
 */
export const delMenu = (data: number[]): Promise<Result<number>> => {
  return request({
    url: '/menu/delMenu',
    method: 'post',
    data
  });
};

export interface MenuQueryParams {
  state?: number;
  type?: number;
  name?: string;
  mark?: string;
}
/**
 * 查询菜单列表
 * @param data 菜单参数
 * @returns 菜单详情
 */
export const queryMenuList = (data: MenuQueryParams): Promise<Result<Menu[]>> => {
  return request({
    url: '/menu/eqMenu',
    method: 'post',
    data
  });
};

/**
 * 更新菜单
 * @param data 菜单参数
 * @returns 更新结果
 */
export const upMenu = (data: MenuParams): Promise<Result<number>> => {
  return request({
    url: `/menu/upMenu/${data.id}`,
    method: 'post',
    data
  });
};

/**
 * 禁用菜单
 * @param data 菜单参数
 * @returns 禁用结果
 */
export const disableMenu = (data: number[]): Promise<Result<number>> => {
  return request({
    url: '/menu/disableMenu',
    method: 'post',
    data
  });
};
