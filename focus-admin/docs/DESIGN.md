# Focus Admin · RBAC 按钮级权限控制设计方案

> 适用范围：`focus-admin` 及基于此骨架进行二次开发的所有后台项目。
> 读者对象：接手项目的开发者、审查 PR 的同学、Fork 仓库做业务定制的工程师、做权限审计的同学。
> 规范强度：**必须** / **禁止** 为硬约束，违反需在 PR 描述中说明；**推荐** / **可选** 为软约束。

---

## 〇、设计目标

**一张菜单表驱动整套权限体系。**

- **RBAC 模型**：经典三段式 `User → Role → Permission`，但 Permission 直接复用菜单节点，不维护独立的权限表。
- **三级菜单**：目录（`type=0`）、菜单（`type=1`）、按钮（`type=2`）共享一张扁平表，通过 `parentId` 构建树。
- **权限粒度到按钮**：每一个受控操作（新增 / 编辑 / 删除 / 启用停用 / 导出 …）都落地为一条 `type=2` 的菜单记录，拥有独立的 `mark`。
- **前端三重校验**：路由守卫 + 渲染条件 + 交互禁用，缺任一层都视为兜底缺失。
- **Mock-first 演示**：所有接口由 `utils/mockStore.ts` 替换为 `localStorage` 持久化实现，用于骨架期前端自测与交接；切到真实后端只需恢复 `api/*.ts` 的请求调用，前端代码零改动。

---

## 一、核心数据模型

### 1.1 实体关系

```
┌──────────┐  多对多   ┌────────┐   多对多   ┌────────────────┐
│  Admin   │ ────────► │  Role  │ ─────────► │ Menu（含按钮） │
│  员工    │           │  角色  │            │  菜单树节点    │
└──────────┘           └────────┘            └────────────────┘
   adminId              roleId                id / parentId
```

- `Admin × Role`：关联表 `admin-roles`（mock 中以 `Record<adminId, roleId[]>` 存储）。
- `Role × Menu`：`roles[i].menuIdList`（mock 中直接内嵌在 Role 实体）。
- `Menu` 自引用：通过 `parentId` 构建「目录 → 菜单 → 按钮」三层树。

### 1.2 Menu（`api/menu.ts` · `Menu` 接口）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 是 | 主键，递增 |
| `parentId` | number | 是 | 父级 id；根节点填 `0` |
| `name` | string | 是 | 展示名称（中文） |
| `icon` | string | 是 | 图标名；从 `@vicons/ionicons5` 动态解析（按钮类型可空） |
| `order` | number | 是 | 同级排序，小的在前 |
| `mark` | string | 是 | 权限标识，详见 §二 |
| `route` | string | 是 | 前端路由；目录 / 按钮可空 |
| `type` | number | 是 | `0=目录` / `1=菜单` / `2=按钮` |
| `status` | number | 是 | `1=启用` / `0=禁用`（禁用即对侧栏隐藏） |
| `createDate` | string | 自动 | `yyyy-MM-dd HH:mm:ss` |
| `updateDate` | string | 自动 | 同上 |

**约束**
- `mark` **必须**全局唯一，命名符合 §二。
- `id=1` 保留为默认首页菜单，**禁止**删除或禁用。
- 禁用一个目录（`type=0`）会连带隐藏其所有子孙节点（`buildTree` 过滤自动生效）。
- 按钮类型（`type=2`）**禁止**携带 `route`，它只是权限点、不参与路由。
- 新增按钮节点时 **必须**隶属于某个 `type=1` 菜单，而不是目录。

### 1.3 Role（`api/role.ts` · `Role` 接口）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 是 | 主键 |
| `name` | string | 是 | 角色中文名 |
| `mark` | string | 是 | 角色英文标识（`admin` / `editor` / `auditor` …），与 Menu.mark 无关 |
| `description` | string | 否 | 角色用途说明 |
| `menuIdList` | number[] | 是 | 关联的 Menu id 集合；同时包含目录、菜单、按钮三种 id |
| `status` | number | 是 | `1=启用` / `0=禁用` |
| `createDate` / `updateDate` | string | 自动 | |

**约束**
- `id=1` 保留为**超级管理员**，`menuIdList` **必须**覆盖全部菜单；**禁止**删除。
- `menuIdList` **必须**包含所选按钮的父链节点（菜单 + 目录），否则 `buildTree` 会断层，侧栏无法渲染。
- 被禁用（`status=0`）的角色不会出现在 `eqBaseRole`（员工角色指派下拉）中，但仍对历史员工生效，直到手动解绑。

### 1.4 Admin（`api/admin.ts` · `EmpInfo` 接口）

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 主键 |
| `name` | string | 员工姓名 |
| `phone` | string | 登录账号（演示账号 `focus` 是特例） |
| `gender` | number | `1=男` / `0=女` |
| `status` | number | `1=启用` / `0=禁用` |
| `photo` | string | 头像 URL 或 data URI |
| `roles` | `RoleInfo[]` | 列表接口自动 join，形如 `{ adminId, roleId, name, mark }` |

**约束**
- 员工的权限集合 = 所有关联角色的 `menuIdList` 并集对应 Menu 的 `mark` 集合。
- `id=1` 为演示账号，**禁止**删除。
- 头像加载失败时 UI 会回退为姓名首字母占位，`photo` 允许空。

---

## 二、权限标识（Mark）规范

### 2.1 格式

```
{模块}:{动作}
```

- **模块**：小写英文或下划线，对应业务域（`menu` / `role` / `user` / `product` / `order_log` …）。
- **动作**：从白名单动词里取，见 §2.2。
- **分隔符**：单冒号 `:`，**禁止**多段拼接（如 `a:b:c` 非法）。

### 2.2 动作白名单（必须只用以下动词）

| 动作 | 语义 | 典型触发点 |
|------|------|-----------|
| `view` | 查看列表与详情 | 路由守卫 `definePageMeta({ permissions: ['xxx:view'] })` |
| `add` | 新增 | `FocusFilterForm` 的新增按钮、表格行"新增下级"按钮 |
| `update` | 编辑 | 表格行"编辑"按钮 |
| `delete` | 删除 | 表格行"删除"、过滤栏批量删除 |
| `disable` | 启用 / 禁用切换 | 表格行状态开关 |
| `export` | 导出 | 预留 |
| `import` | 导入 | 预留 |

**禁止**为"启用"与"禁用"拆两个 mark；两者共用 `xxx:disable`，由业务层在当前状态基础上翻转。

### 2.3 命名约束

- `mark` **必须**全局唯一，不与任何其它菜单重名。
- 模块名 **禁止**复数化（用 `menu` 而非 `menus`）。
- **禁止**造新动词（`:enable` / `:modify` / `:remove` / `:check` 等均违规）。
- **禁止**出现中文、空格、连字符、大小写混用。

---

## 三、前端权限落地

### 3.1 登录到权限集合的链路

```
pages/index.vue                     components/app/LeftNav.vue
┌────────────────────┐              ┌────────────────────────┐
│ 1. login(...)      │  token       │ 3. getEmpMenuList()    │
│ 2. setToken        │ ───────────► │ 4. handlePermissions() │
│    setUserInfo     │              │    → setPermissions    │
└────────────────────┘              └────────────────────────┘
                                             │
                                             ▼
                                     userStore.permissions = Set<mark>
```

- **登录阶段**（`pages/index.vue`）：调用 `login` → 写入 `userStore.token` / `userStore.userInfo`。
- **侧栏挂载**（`components/app/LeftNav.vue`）：拉取 `getEmpMenuList()` 得到当前员工可见菜单树。
- **权限提取**（`handlePermissions()`）：递归遍历菜单树，把所有非空 `mark` 收入 Set → `userStore.setPermissions([...])`。
- **后续使用**：页面通过 `userStore.hasPermission('xxx:yyy')` 或 `hasPermissions(['a','b'])` 做判断。

**必须**：权限点的唯一真源是菜单 `mark`。前端 **禁止**在代码里硬编码权限常量列表（mock 演示账号的兜底除外）。

### 3.2 三级校验

所有受控入口 **必须**同时经过以下三层校验，任何一层缺失都视为漏洞：

```
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ① 路由守卫     │ →  │ ② 渲染条件       │ →  │ ③ 交互禁用       │
│ meta.permissions │  │ v-if / :show / 条件渲染 │  │ :disabled / 点击拦截 │
└───────────────┘    └─────────────────┘    └─────────────────┘
```

**① 路由级**

```ts
definePageMeta({
  permissions: ['product:view']
});
```

由 `middleware/permission.global.ts` 统一校验；无权限跳转 `/403`。

**② 渲染级**

模板内直接 `v-if`：

```vue
<n-button v-if="userStore.hasPermissions(['product:add'])" @click="handleAdd">
  新增
</n-button>
```

或传入 `FocusFilterForm` 的显示开关：

```vue
<FocusFilterForm
  :add="userStore.hasPermissions(['product:add'])"
  :delete="userStore.hasPermissions(['product:delete'])"
  ... />
```

**③ 交互级**

表格操作列通过 `getTableActions` 的 `show` / `showFn`：

```ts
getTableActions<Product>({
  viewBtn: { onClick: handleView },
  editBtn: { onClick: handleEdit, show: userStore.hasPermissions(['product:update']) },
  deleteBtn: { show: userStore.hasPermissions(['product:delete']), onClick: handleDelete }
});
```

状态开关的 `disabled` 必须挂权限位：

```ts
h(NSwitch, {
  value: Number(row.status),
  disabled: !userStore.hasPermissions(['product:disable']),
  ...
});
```

**禁止**只做 `v-if` 不做 `disabled`，或反之——前端两者都是防御性兜底；真正的拦截仍在服务端。

### 3.3 侧栏菜单渲染规则

`components/app/LeftNav.vue` 的 `convertToMenuOptions` 按节点类型路由：

| 类型 | 渲染行为 |
|------|----------|
| `type=0`（目录） | 有子节点 → 渲染分组节点；无子节点 → 丢弃。 |
| `type=1`（菜单） | 渲染为可点击导航项，点击触发 `navigateTo(route)`。 |
| `type=2`（按钮） | **不渲染**；仅被 `handlePermissions` 收集 mark。 |

**禁止**在侧栏组件里写死菜单树；后端（或 mock）**必须**是菜单的单一数据源。

### 3.4 路由跳转与 404 兜底

- 菜单点击后，`LeftNav` 先检查 `router.resolve(targetPath).matched.length > 0`：
  - 存在匹配 → `navigateTo(targetPath)`。
  - 不存在 → 跳 `/develop`（"待开发"占位页），避免白屏。
- 直接访问不存在的路由由 `pages/404.vue` 兜底。
- 权限不足的合法路由由 `pages/403.vue` 兜底。

---

## 四、管理流程与落地清单

### 4.1 新增业务模块（以"商品管理"为例）

- [ ] 后台（或 `mock/menu.ts`）录入：
  - 菜单 `商品管理` `route=product` `mark=product:view` `type=1`。
  - 按钮子节点：
    - `新增` `mark=product:add` `type=2`
    - `编辑` `mark=product:update` `type=2`
    - `删除` `mark=product:delete` `type=2`
    - `启用停用` `mark=product:disable` `type=2`
- [ ] `api/product.ts` 定义 `ProductListParams` / `ProductInfo` / CRUD 函数。
- [ ] 新建 `pages/product.vue`，从 `pages/role.vue` 复制起点。
- [ ] `definePageMeta({ permissions: ['product:view'] })`。
- [ ] 筛选栏 `:add` / `:delete` 绑定对应权限。
- [ ] 操作列 `editBtn.show` / `deleteBtn.show` 绑定对应权限。
- [ ] 状态开关 `:disabled` 绑定 `product:disable`。
- [ ] 把该模块所需菜单 id 追加到目标角色的 `menuIdList` 中。
- [ ] **自检**：未授权账号登录后，侧栏不出现该模块、直接访问路由被拦截、按钮不可见也不可点。

### 4.2 新增角色

- [ ] 角色管理页 → 新增 → 填 `name` / `mark` / `description`。
- [ ] 勾选 `menuIdList`：**必须**同时勾选按钮对应的菜单与目录父链，否则侧栏断层。
- [ ] 将已有员工指派到此角色（员工管理页）。
- [ ] 超管角色（`id=1`）不可删除、不可降权。

### 4.3 新增 / 维护员工

- [ ] 员工管理页 → 新增 → 填 `name` / `phone` / `gender` / `status`。
- [ ] 指派角色（多选），员工的实际权限集合为「所有关联角色的 `menuIdList` 并集」→ 取对应 Menu 的 `mark` 集合。
- [ ] 演示账号 `id=1`（`focus / focus`）不可删除。
- [ ] 禁用员工后，其已登录会话不会立即失效（演示版），生产接入时 **必须**在服务端联动吊销 token。

---

## 五、Mock 数据与持久化层

演示版本所有接口都被 `utils/mockStore.ts` 替换为 `localStorage` 持久化。前端代码结构与真实后端接入保持一致，切到真实后端时只需重写 `api/*.ts` 内的函数体。

### 5.1 数据源

| 文件 | 内容 |
|------|------|
| `mock/menu.ts` | 初始菜单扁平数组（17 项：1 首页 + 1 系统管理目录 + 3 业务菜单 + 12 按钮权限点） |
| `mock/role.ts` | 4 个初始角色（超管 / 内容编辑 / 只读访客 / 审计员） |
| `mock/admin.ts` | 5 个初始员工 + `initialAdminRoles` 多对多映射 |

### 5.2 存储约定

- 命名空间：`focus-mock:v1:*`
- 具体键：`focus-mock:v1:menus` / `:roles` / `:admins` / `:admin-roles`
- Schema 版本位于 `utils/mockStore.ts` 的 `SCHEMA_VERSION`。**破坏性结构变更必须升级版本号**，旧数据对新代码自动不可见（重新注入初始值）。

### 5.3 CRUD 辅助函数（`utils/mockStore.ts`）

- `readList<T>(key, initial)` / `writeList<T>(key, list)` — 读写扁平数组，SSR 安全（服务端返回初始值深拷贝）。
- `readMap<V>(key, initial)` / `writeMap<V>(key, map)` — 读写键值映射（用于多对多关联表）。
- `nextId(list)` — 递增主键。
- `nowString()` — 生成 `yyyy-MM-dd HH:mm:ss` 时间戳。
- `mockOk(data)` / `mockFail(msg)` — 统一响应包装，延迟 ~80ms 模拟网络耗时。
- `includesText` / `equalsLoose` — 列表过滤时对空值友好的比较。
- `paginate(list, page, size)` — 分页切片。

### 5.4 切换到真实后端

- [ ] 删除 `mock/` 与 `utils/mockStore.ts`。
- [ ] 恢复 `api/*.ts` 内的 `request(...)` 调用，保持函数签名与 `Result<T>` 返回值不变。
- [ ] 对齐后端契约：字段名、类型、枚举值、`code === '200'` 判定。
- [ ] 启用 `utils/requestUtil.ts` 的 401 拦截、token 注入（`focus-sa-token`）、RSA 密码加密（`utils/cryptoUtil.ts`）。
- [ ] 对每一条 `mark` 做一次服务端互查，确保前后端 `mark` 一致。

### 5.5 SSR 水合注意事项

- `readList` 在服务端返回初始值深拷贝，客户端挂载时 **必须**主动 `refresh()`，否则硬刷新后看不到 `localStorage` 中的本地修改。
- `components/app/LeftNav.vue` 与 `pages/{menu,role,user}.vue` 的 `onMounted` 已内置 `if (import.meta.client) refresh()`，新增业务页时同样处理。

---

## 六、默认演示数据

| 对象 | 默认值 |
|------|--------|
| 演示账号 | 手机号 `focus` / 密码 `focus` |
| 登录 token | 客户端本地生成 `focus-mock-token-<timestamp>` |
| 超级管理员 | `roleId=1` / `mark=admin` / 拥有全部 17 项菜单权限 |
| 首页菜单 | `id=1` / `route=home` / `mark=home:view`（不可删除） |

**清空演示数据**：浏览器 DevTools → Application → Local Storage → 删除 `focus-mock:v1:*` 下所有键，下次加载会重新注入初始数据。

---

## 七、反模式清单

以下行为在 code review 时直接打回：

- 在前端代码里写死权限常量表、菜单列表或路由树。
- 同一个受控操作只做 `v-if` 或只做 `:disabled`，缺一种兜底。
- 把按钮权限点（`type=2`）当成普通菜单让它出现在侧栏。
- 角色分配时只勾选按钮 mark 而不带上菜单与目录父链，造成侧栏断层。
- 登录成功后在 `pages/index.vue` 写死 `setPermissions([...])`——只能作为 mock 登录的兜底，正式流程必须走 `handlePermissions()`。
- 为新业务造新动词（`:enable` / `:modify` / `:remove` / `:check`），绕过 §二.2 白名单。
- 在 `components/of/*` 里直接读 `userStore` 做权限判断；原子层 **禁止**绑定业务权限。
- 删除或降级超管角色（`id=1`）、默认首页菜单（`id=1`）、演示账号（`id=1`）。
- 把敏感操作的入口只用"隐藏按钮"保护，而不在服务端校验——前端校验只是 UX 兜底，**不是安全边界**。
- 让真实后端返回的菜单树里混入 mock schema 的残留字段，或反之。
- 未经升级 `SCHEMA_VERSION` 就变更 mock 数据结构，导致旧端用户刷新后数据错乱。

---

## 八、变更与反馈

本文件是活文档。对 RBAC 模型、mark 约定、校验路径或权限落地链路的任何改动，**必须**通过 PR 同步更新本文件，并在变更说明中写明：

1. 变更点（增 / 改 / 删）与对应代码路径。
2. 动机（业务场景 / 兼容诉求）。
3. 影响面：
   - 是否需要迁移已录入的菜单 / 角色 / 员工数据。
   - 是否触发 `SCHEMA_VERSION` 升级。
   - 是否影响已上线页面的权限校验。
4. 回滚方案：若变更导致权限泄漏，如何快速关闭入口。

权限体系没有纯粹的"优化"——任何改动都可能让本该不可见的操作暴露。每次修改以「最小授权」为优先，以单个 PR 为粒度，用 mark 白名单作为不可逾越的红线。
