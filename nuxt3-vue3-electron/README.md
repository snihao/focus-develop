# 👋focus-develop <专注开发>

Focus-Develop
是一套多语言、多场景覆盖的开源项目集合，旨在为开发者提供"开箱即用"的项目框架与工具，帮助用户跳过繁琐的基础搭建环节，快速进入核心业务逻辑开发。其核心设计理念是极简主义与模块化，通过分层架构、标准化协议和灵活的扩展机制，适配云端、移动端、微服务等主流开发场景，同时兼容多种编程语言和工具链。

***"Focus-Develop 不仅是工具集合，更是开发理念的实践——让技术回归业务本质。"***

**开源地址**：[GitHub](https://github.com/sniHao/focus-develop)
&nbsp;&nbsp;&nbsp;[Gitee](https://gitee.com/snihao/focus-develop)

# 🥪nuxt3-vue3-electron

## 🥘项目介绍

基于 `Nuxt 3` + `Vue 3` + `TypeScript` 构建的 `Electron` 桌面应用模板。集成了 Naive UI 组件库、Pinia 状态管理、Tailwind CSS、主题切换过渡动画（View Transition API）、SCSS 样式体系等，支持 Web 端与桌面端双模式运行。可根据自身需求进行其他包的引入，专注业务模块迭代，无需陷入基建琐碎。

## 🥢技术栈

|                      框架                      |            说明            |   版本   |                              指南                               |
|:--------------------------------------------:|:------------------------:|:------:|:-------------------------------------------------------------:|
|         [Nuxt3](https://nuxt.com.cn)         |   让基于 Vue.js 的全栈开发变得直观   | 3.17.1 |  [文档](https://nuxt.com.cn/docs/getting-started/introduction)  |
|         [Vue3](https://cn.vuejs.org)         |    渐进式 JavaScript 框架     | 3.5.13 |      [文档](https://cn.vuejs.org/guide/introduction.html)       |
| [TypeScript](https://www.typescriptlang.org) | 基于 JavaScript 构建的强类型编程语言 |   -    | [文档](https://www.typescriptlang.org/docs/handbook/intro.html) |
|     [Naive UI](https://www.naiveui.com)      |        Vue 3 组件库         | 2.41.0 |  [文档](https://www.naiveui.com/zh-CN/light/components/button)  |
|       [Pinia](https://pinia.vuejs.org)       |    符合直觉的 Vue.js 状态管理库    | 3.0.4  |      [文档](https://pinia.vuejs.org/zh/introduction.html)       |
|    [tailwindcss](https://tailwindcss.com)    |   快速建立现代网站，而不离开你的HTML    | 4.1.10 |  [文档](https://tailwindcss.com/docs/installation/using-vite)   |
|        [Sass](https://sass-lang.com)         |       强化 CSS 的辅助工具       | 1.99.0 |               [文档](https://sass-lang.com/guide)               |
|      [Axios](https://www.axios-http.cn)      |    基于 promise 的网络请求库     | 1.9.0  |        [文档](https://www.axios-http.cn/docs/api_intro)         |
|      [Electron](https://electronjs.org)      |     使用 JavaScript 构建跨平台桌面应用      | 33.0.0 |        [文档](https://www.electronjs.org/docs)         |

## ☕运行配置

建议所配环境差距不大，否则可能会出现运行异常。

| 依赖                               | 版本      |
|----------------------------------|---------|
| [node](https://nodejs.org/zh-cn) | 24.15.0 |
| npm                              | 11.12.1 |

## 🚴快速开始

### 🏀克隆项目

注：git版本需要大于2.25以上才能使用以下命令(稀疏检出)，若小于此版本可以选择clone全部文件，手动选出所需要的项目文件。

```bash
git clone --filter=blob:none --sparse https://gitee.com/snihao/focus-develop.git .
git sparse-checkout set nuxt3-vue3-electron
```

### ⚽拉取依赖

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

### 🏓运行项目

```bash
# Web 开发模式
npm run dev

# Electron 开发模式（自动等待 Nuxt 启动后打开桌面窗口）
npm run electron:dev

# Electron 开发模式（简易版，需手动等待）
npm run electron:dev:simple
```

Web 端启动后服务地址： `http://localhost:3000`

### 🏐构建项目

```bash
# 仅构建 Web 端
npm run build

# 构建 Electron 桌面应用（当前平台）
npm run electron:build

# 构建 Windows 安装包
npm run electron:build:win

# 构建 macOS 安装包
npm run electron:build:mac

# 构建 Linux 安装包
npm run electron:build:linux
```

构建产物输出到 `release/` 目录。

## 🔋项目基础结构

```markdown
nuxt3-vue3-electron
├── api // 接口
├── assets // 资源（CSS、SASS、字体等）
├── build // Electron 构建资源（图标等）
├── components // 组件
├── composables // 组合式函数（自动导入到应用）
├── electron // Electron 主进程代码
├── layouts // 布局组件
├── middleware // 路由中间件
├── pages // 页面
├── plugins // 插件
├── public // 静态资源
├── util // 工具类
├── app.vue // 根组件
├── electron-dev.js // Electron 开发模式启动脚本
├── diy.d.ts // 类型声明
└── error.vue // 错误页面
```

详情参考：[官网文档](https://nuxt.com.cn/docs/guide/directory-structure/nuxt/)
