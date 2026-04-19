import type { Role } from '~/api/role';

// 初始角色数据
// menuIdList 是该角色能访问的菜单 id 列表，驱动侧栏可见性与权限位；
// id = 1 的超管角色不可删除（业务上默认保留）。
export const initialRoles: Role[] = [
  {
    id: 1,
    name: '超级管理员',
    mark: 'admin',
    description: '拥有所有菜单与按钮权限，演示环境默认账号。',
    status: 1,
    menuIdList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
    createDate: '2026-01-01 00:00:00',
    updateDate: '2026-01-01 00:00:00'
  },
  {
    id: 2,
    name: '内容编辑',
    mark: 'editor',
    description: '可维护菜单与角色的基础信息，但不能删除或禁用。',
    status: 1,
    menuIdList: [1, 2, 3, 4, 5, 8, 9, 10, 13, 14, 15],
    createDate: '2026-01-02 09:10:00',
    updateDate: '2026-01-05 14:32:00'
  },
  {
    id: 3,
    name: '只读访客',
    mark: 'viewer',
    description: '仅可查看列表数据，不提供任何写操作。',
    status: 1,
    menuIdList: [1, 2, 3, 8, 13],
    createDate: '2026-01-03 10:20:00',
    updateDate: '2026-01-03 10:20:00'
  },
  {
    id: 4,
    name: '审计员',
    mark: 'auditor',
    description: '负责查看日志与操作记录的角色（演示用）。',
    status: 0,
    menuIdList: [1, 2],
    createDate: '2026-02-01 11:00:00',
    updateDate: '2026-02-18 16:40:00'
  }
];
