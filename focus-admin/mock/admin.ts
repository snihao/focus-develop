import type { EmpInfo } from '~/api/admin';

// 头像：内联 SVG，避免外部依赖与国内网络问题
const avatar = (letter: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231a1a1a'/><text x='20' y='27' text-anchor='middle' fill='%23f4efe7' font-size='18' font-weight='700' font-family='Georgia, serif' font-style='italic'>${letter}</text></svg>`;

// 初始员工数据
// roles 字段会在列表接口返回前通过角色表 join 生成，初始数据可省略。
export const initialAdmins: EmpInfo[] = [
  {
    id: 1,
    name: 'Focus',
    phone: 'focus',
    gender: 1,
    status: 1,
    photo: avatar('F'),
    createDate: '2026-01-01 00:00:00',
    updateDate: '2026-01-01 00:00:00',
    roles: []
  },
  {
    id: 2,
    name: '林晓',
    phone: '13800000001',
    gender: 0,
    status: 1,
    photo: avatar('林'),
    createDate: '2026-01-04 09:20:00',
    updateDate: '2026-01-10 11:32:00',
    roles: []
  },
  {
    id: 3,
    name: '沈舟',
    phone: '13800000002',
    gender: 1,
    status: 1,
    photo: avatar('沈'),
    createDate: '2026-01-05 10:10:00',
    updateDate: '2026-01-05 10:10:00',
    roles: []
  },
  {
    id: 4,
    name: '周野',
    phone: '13800000003',
    gender: 1,
    status: 0,
    photo: avatar('周'),
    createDate: '2026-02-02 12:15:00',
    updateDate: '2026-03-14 08:40:00',
    roles: []
  },
  {
    id: 5,
    name: '苏砚',
    phone: '13800000004',
    gender: 0,
    status: 1,
    photo: avatar('苏'),
    createDate: '2026-03-06 15:00:00',
    updateDate: '2026-03-06 15:00:00',
    roles: []
  }
];

// 员工与角色的多对多映射（mock 用 map 表模拟）
// key 为 adminId，value 为 roleId 数组。
export const initialAdminRoles: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [1, 2],
  5: [2, 3]
};
