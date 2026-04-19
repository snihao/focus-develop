<h1 align="center">👋focus-develop <专注开发></h1>

Focus-Develop
是一套多语言、多场景覆盖的开源项目集合，旨在为开发者提供"开箱即用"的项目框架与工具，帮助用户跳过繁琐的基础搭建环节，快速进入核心业务逻辑开发。其核心设计理念是​​极简主义​​与​​模块化​​，通过分层架构、标准化协议和灵活的扩展机制，适配云端、移动端、微服务等主流开发场景，同时兼容多种编程语言和工具链。

***"Focus-Develop 不仅是工具集合，更是开发理念的实践——让技术回归业务本质。"***

**开源地址**：[GitHub](https://github.com/sniHao/focus-develop) &nbsp;&nbsp;&nbsp;[Gitee](https://gitee.com/snihao/focus-develop)

# 🥪focus-admin

## 🥘项目介绍

基于 Nuxt 3 + Naive UI + Pinia + TailwindCSS 构建的开箱即用后台管理系统骨架。内置路由级鉴权、按钮级权限指令、菜单/角色/员工 RBAC 管理、通用筛选表单/编辑弹窗/图片上传/Markdown 编辑器等公共组件，以及请求封装、分页 Hook、表单配置构建器、表格操作列生成器等工具链，适合快速搭建企业级中后台项目。

## 🥢技术栈

| 框架/工具                                                          | 说明 | 版本 | 指南 |
|----------------------------------------------------------------|-----|-----|-----|
| [Nuxt 3](https://nuxt.com/)                                    | 基于 Vue.js 的全栈开发框架 | 3.17+ | [文档](https://nuxt.com/docs/getting-started/introduction) |
| [Vue 3](https://vuejs.org/)                                    | 渐进式 JavaScript 框架 | 3.5+ | [文档](https://vuejs.org/guide/introduction.html) |
| [Naive UI](https://www.naiveui.com/)                           | Vue 3 组件库 | 2.41+ | [文档](https://www.naiveui.com/zh-CN/os-theme/docs/introduction) |
| [Pinia](https://pinia.vuejs.org/)                              | Vue 状态管理库 | 3.0+ | [文档](https://pinia.vuejs.org/zh/introduction.html) |
| [TailwindCSS](https://tailwindcss.com/)                        | 原子化 CSS 框架 | 3.4+ | [文档](https://tailwindcss.com/docs) |
| [TypeScript](https://www.typescriptlang.org/)                  | JavaScript 超集 | 5.9+ | [文档](https://www.typescriptlang.org/docs/) |

## ☕运行配置

建议开发环境保持一致以避免兼容性问题

| 依赖               | 版本要求   |
|-------------------|----------|
| Node.js           | 18.17+   |
| pnpm              | 8.0+     |
| 浏览器            | Chrome 90+ / Edge 90+ / Firefox 90+ |

## 🚴快速开始

### 🏀克隆项目

注：git版本需要大于2.25以上才能使用以下命令(稀疏检出)，若小于此版本可以选择clone全部文件，手动选出所需要的项目文件。

```bash
git clone --filter=blob:none --sparse https://gitee.com/snihao/focus-develop.git .
git sparse-checkout set focus-admin
```

### 📦安装依赖

```bash
cd focus-admin
pnpm install
```

### ⚙️环境变量配置

复制 `.env.example` 为 `.env.development` 并填入后端接口地址等信息：

```bash
cp .env.example .env.development
```

| 变量名                          | 说明                            |
|------------------------------|-------------------------------|
| `NUXT_PUBLIC_API_URL`        | 后端接口基础地址                      |
| `NUXT_PUBLIC_ENV`            | 环境标识：`development` / `production` |
| `NUXT_PUBLIC_FILTER_ROUTES`  | 需要过滤重定向到首页的路由（逗号分隔）           |
| `NUXT_PUBLIC_RSA_PUBLIC_KEY` | RSA 公钥，用于登录密码加密               |

### 🚀启动开发

```bash
# 开发环境（使用 .env.development）
pnpm dev

# 以生产环境变量启动
pnpm dev:prod
```

### 🏗️构建部署

```bash
# 生产构建
pnpm build

# 开发环境构建
pnpm build:dev

# 预览构建产物
pnpm preview
```

## 🧩核心能力

- **路由鉴权**：`middleware/permission.global.ts` 全局守卫，基于菜单权限标记自动校验
- **按钮鉴权**：`v-permission` 指令 + `usePermission` composable，支持隐藏/禁用/回调三种策略
- **RBAC 管理**：菜单（目录/菜单/按钮）、角色、员工三级权限模型，开箱即用
- **公共组件**：`FocusFilterForm` 筛选表单、`FocusEditModal` 编辑弹窗、`FocusImageUpload` 图片上传、`FocusMarkdownEditor` Markdown 编辑器
- **表单配置器**：`FormFieldBuilder` 链式 API 快速声明表单字段
- **请求封装**：基于 `$fetch` 的统一请求拦截、错误提示、loading 进度条
- **分页 Hook**：`usePagination` 一行代码接入分页列表，自动处理页码/页容量/参数响应
- **表格操作列**：`getTableActions` 一键生成查看/编辑/删除/自定义按钮

## 📁目录结构

```
focus-admin/
├── api/              # 接口定义（admin / menu / role）
├── assets/css/       # 全局样式
├── components/
│   ├── app/          # 布局组件（Header / LeftNav / RightNav）
│   ├── focus/        # 公共业务组件（Focus 前缀）
│   └── of/           # 基础 UI 组件
├── composables/      # Pinia store / 权限 / 分页 hook
├── middleware/       # 路由守卫与过滤
├── pages/            # 页面（登录 / 首页 / 菜单 / 角色 / 员工 / 403 / 404）
├── plugins/          # Nuxt 插件（Naive UI / 权限指令 / Pinia）
├── utils/            # 工具函数（请求 / 加密 / 格式化 / 校验）
├── focus.d.ts        # 全局类型声明
└── nuxt.config.ts    # Nuxt 配置
```
