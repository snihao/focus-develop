# focus-admin 迁移与重构操作记录

## 一、本次操作目标

将内部项目 `E:\ego\focus-admin`（基于 Nuxt 3 的 EGO 后台管理系统）重构为开源可复用的通用后台管理骨架 `focus-admin`，并纳入 `focus-develop` 开源合集仓库（Gitee）。

## 二、已完成工作

### 1. 业务剥离
删除所有与 EGO 业务耦合的模块：

- **业务页面**：`activity/*`、`agent/*`、`analyse/*`、`product*`、`model-*`、`dictionary`、`feedback`、`file`、`companyNews`、`invite-new-rank`、`members`、`user-down`、`notification-message`、`sms-template`、`qa-*`、`assemble-clamp-range`、`custom-configuration`、`product-import-excel`
- **业务组件**：`components/activity/*`、`components/company/*`、`components/dictionary/*`（仅保留 SystemDictionaryModel，最终也一并移除）、`components/home/*`、`components/modelParameter/*`、`components/product/*`、`components/common/CustomConfigurationModel.vue`
- **业务 API**：`api/index.ts`、`activity.ts`、`agent.ts`、`rag.ts`、`companyNews.ts`、`customConfigure.ts`、`dict.ts`、`notification.ts`、`modelParameterapi.ts`、`product.ts`、`permission.ts`、`user.ts`、`userLog.ts`、`system.ts`（OSS 上传）
- **业务工具**：`utils/dictionaryUtil.ts`、`utils/modelUtil.js`、`constant/dict.ts`、`types/echarts-gl.d.ts`
- **业务依赖**：`echarts`、`echarts-gl`、`echarts-map`、`xlsx`、`jszip`、`@types/jszip`、`build`
- **public 资源**：`login-bg.png`、`logo.png`、`logo-dark.png`、`里程碑.png`、`china.json`、`world.json`

### 2. 品牌替换

| 位置 | 原值 | 新值 |
|------|------|------|
| `package.json` name | `nuxt-app` | `focus-admin` |
| `nuxt.config.ts` title | `EGO后台管理` | `Focus Admin` |
| Pinia store id | `ego` | `focus` |
| Header 标题 | `成都伊高后台管理系统` | `Focus Admin` |
| 类型声明文件 | `ego.d.ts` | `focus.d.ts` |
| README | EGO 项目描述 | focus-develop 模板化开源介绍 |

### 3. 配置通用化

- 请求工具 `utils/requestUtil.ts` 删除硬编码的 `aigtcl.toolsera.cn` / `192.168.1.101:17000` 分支 URL，删除 `FILE_URL` 常量
- 加密工具 `utils/cryptoUtil.ts` 的 RSA 公钥改为从环境变量 `NUXT_PUBLIC_RSA_PUBLIC_KEY` 注入
- `.env.*` 文件去除 EGO 接口地址，新增 `.env.example` 模板
- `nuxt.config.ts` 移除 `/productImport` 路由规则和 EGO favicon 引用

### 4. 通用组件命名

`components/common/` 下公共组件迁移至 `components/focus/` 并加 `Focus` 前缀（Nuxt 自动导入前缀随目录变化）：

- `EditModal.vue` → `FocusEditModal.vue`
- `FilterForm.vue` → `FocusFilterForm.vue`
- `ImageUpload.vue` → `FocusImageUpload.vue`
- `MarkdownEditor.vue` → `FocusMarkdownEditor.vue`（同时移除对业务 API `uploadNewsPToOss` 的依赖，改为 `uploadReq` prop 注入）
- `MarkdownModal.vue` → `FocusMarkdownModal.vue`

### 5. 页面调整

- `pages/user.vue`：从前台用户管理（含 T 币充值业务）重写为后台员工管理，基于 `api/admin.ts` 的 RBAC 接口
- `pages/home.vue`：清空业务内容，保留占位欢迎页
- `pages/system-dictionary.vue`：连同 `api/dict.ts` 一并删除（应用户要求不保留字典功能）

### 6. 保留的核心能力

| 模块 | 文件 |
|------|------|
| 路由鉴权 | `middleware/permission.global.ts` + `middleware/01.page.global.ts` |
| 权限指令 | `plugins/permission-directive.ts`（`v-permission`） |
| 权限 Hook | `composables/usePermission.ts` |
| 用户/全局 Store | `composables/useUserStore.ts` + `composables/store.ts` |
| 分页 Hook | `composables/usePagination.ts` |
| 请求封装 | `utils/requestUtil.ts` |
| 加密工具 | `utils/cryptoUtil.ts`（SHA256 / MD5 / RSA） |
| 格式化工具 | `utils/formatUtil.ts` |
| 校验工具 | `utils/validateUtil.ts` |
| 表单构建器 | `utils/formFilterUtil.ts` |
| Naive 辅助 | `utils/naiveUiUtil.ts`（`getTableActions` / `tips` / 主题） |
| 通用工具 | `utils/commonUtil.ts`（防抖/节流/文件校验/buildTree 等） |
| 布局 | `components/app/Header.vue` + `LeftNav.vue` + `RightNav.vue`（已丢失，见事故记录） |
| 基础组件 | `components/of/Icon.vue` + `Svg.vue` + `VirtualScroll.vue`（已丢失） |
| 业务组件 | `components/focus/Focus*`（已丢失） |
| 页面 | 登录 / 首页 / 菜单 / 角色 / 员工 / 403 / 404 / develop / reload |
| API | `admin.ts`（登录/员工）+ `menu.ts` + `role.ts` |

## 三、事故记录

### 事故：components/ 目录丢失

**时间**：迁移执行期间

**操作**：执行批量 `mv` 将清理后的项目从 `E:\ego\focus-admin` 移动到 `E:\a-nihao\a\focus-develop\focus-admin`，随后 `rm -rf` 删除源目录。

**错误链路**：

```bash
mv components E:/a-nihao/a/focus-develop/focus-admin/
# → mv: cannot move 'components': Permission denied  (IDE 占用文件导致)

# 循环继续处理后续 item，忽略了上一个 mv 的失败

rm -rf focus-admin
# 第一次：Device or resource busy（IDE 仍占用）
# shell 立即收到其他信号后，文件锁释放，第二次隐式重试或外部操作生效，
# 目录最终被清空，components/ 与 auto-imports.d.ts、components.d.ts 等一并删除
```

**丢失的文件（共 11 个组件，未提交到任何 git）**：

- `components/app/Header.vue`
- `components/app/LeftNav.vue`
- `components/app/RightNav.vue`
- `components/focus/FocusEditModal.vue`
- `components/focus/FocusFilterForm.vue`
- `components/focus/FocusImageUpload.vue`
- `components/focus/FocusMarkdownEditor.vue`
- `components/focus/FocusMarkdownModal.vue`
- `components/of/Icon.vue`
- `components/of/Svg.vue`
- `components/of/VirtualScroll.vue`

**根因**：

1. 源项目 `E:\ego\focus-admin` 不是 git 仓库，没有本地版本快照
2. 批量 `mv` 脚本未做失败兜底，`set -e` 未开启，前一个命令失败不会阻断后续删除动作
3. 未先 `cp -a` 复制再核对一致性，直接用了 `mv` + `rm -rf` 组合
4. 没有检测到 IDE（WebStorm/VSCode）正在占用 `components/` 中的文件
5. 风险前未主动建议用户关闭 IDE 或先将源目录 `git init` 作为保险

### 影响

- `components/` 整个目录永久丢失（WSL/Git Bash 的 `rm -rf` 绕过 Windows 回收站）
- 推送到 Gitee 的代码是**残缺**的：页面 / 中间件 / 插件 / API 仍引用 `FocusFilterForm`、`FocusEditModal`、`AppHeader`、`AppLeftNav`、`AppRightNav`、`OfIcon` 等组件，缺失后 `pnpm build` 会报错，`pnpm dev` 无法渲染

### 缓解

- 本次 commit message 会显式标注 "components 目录缺失，待恢复"
- 根据迁移过程中读取记录，以下组件有完整源码可恢复（须人工核对）：
  - `Header.vue`、`LeftNav.vue`、`RightNav.vue`、`FilterForm` 原文 / `EditModal` 原文（可 diff 成 Focus 前缀版）
  - `FocusMarkdownEditor.vue` 最终版本的修改有完整记录
- 以下组件**无完整内容记录**，必须从 IDE 本地历史或其他途径恢复：
  - `ImageUpload.vue`、`MarkdownModal.vue`、`of/Icon.vue`、`of/Svg.vue`、`of/VirtualScroll.vue`

## 四、下次优化清单

1. **先备份再操作**：对非 git 仓库，动手前先 `cp -a src src.bak` 或 `git init && git add -A && git commit -m "snapshot"`，再执行任何破坏性移动
2. **用 cp + 校验代替 mv**：`cp -a src dst && diff -r src dst && rm -rf src`，校验一致后再删源
3. **脚本启用 `set -euo pipefail`**：任一命令失败立即退出，避免错误被掩盖后继续执行删除
4. **前置检查占用**：`lsof`（Linux）或提示用户关闭 IDE / 停用文件监听再操作
5. **大块操作拆阶段**：
   - 阶段 A：复制到目标
   - 阶段 B：运行目标目录编译 / 类型检查，确认完整
   - 阶段 C：提交 git（形成安全点）
   - 阶段 D：最后删除源目录
6. **本地先做完整性验证再 push**：`pnpm install && pnpm build` 通过后再 `git push`，避免推送残缺代码
7. **生成文件排除表前置声明**：要排除的 `.idea/`、`.stylelintcache`、`auto-imports.d.ts`、`components.d.ts`、`node_modules/`、`.nuxt/`、`.output/` 提前写进 `rsync --exclude` 规则，避免逐项 mv 时漏错
8. **在 CLAUDE.md 中新增操作守则**：任何 `rm -rf` / 批量 `mv` 必须先完成目标校验；目标目录 `ls` 对比来源 `ls` 的差异，确认无遗漏再删源
