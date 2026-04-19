# 👋focus-develop <专注开发>

Focus-Develop
是一套多语言、多场景覆盖的开源项目集合，旨在为开发者提供“开箱即用”的项目框架与工具，帮助用户跳过繁琐的基础搭建环节，快速进入核心业务逻辑开发。其核心设计理念是​​极简主义​​与​​模块化​​，通过分层架构、标准化协议和灵活的扩展机制，适配云端、移动端、微服务等主流开发场景，同时兼容多种编程语言和工具链。

***"Focus-Develop 不仅是工具集合，更是开发理念的实践——让技术回归业务本质。"***

**开源地址**：[GitHub](https://github.com/sniHao/focus-develop)
&nbsp;&nbsp;&nbsp;[Gitee](https://gitee.com/snihao/focus-develop)

# 🥪nuxt3-vue3-ts

## 🥘项目介绍

使用 `nuxt3` 搭建的 `vue3` 项目，包含了对接口的封装、pinia的配置、基础scss封装、路由鉴权、主题统一配置等等。可根据自身需求进行其他包的引入，专注业务模块迭代，无需陷入基建琐碎。

## 🥢技术栈

|                      框架                      |            说明            |   版本   |                              指南                               |
|:--------------------------------------------:|:------------------------:|:------:|:-------------------------------------------------------------:|
|         [Nuxt3](https://nuxt.com.cn)         |   让基于 Vue.js 的全栈开发变得直观   | 3.17.1 |  [文档](https://nuxt.com.cn/docs/getting-started/introduction)  |
|         [Vue3](https://cn.vuejs.org)         |    渐进式 JavaScript 框架     | 3.5.13 |      [文档](https://cn.vuejs.org/guide/introduction.html)       |
| [TypeScript](https://www.typescriptlang.org) | 基于 JavaScript 构建的强类型编程语言 |   -    | [文档](https://www.typescriptlang.org/docs/handbook/intro.html) |
|     [Naive UI](https://www.naiveui.com)      |        Vue 3 组件库         | 2.41.0 |  [文档](https://www.naiveui.com/zh-CN/light/components/button)  |
|       [Pinia](https://www.naiveui.com)       |    符合直觉的 Vue.js 状态管理库    | 3.0.2  |      [文档](https://pinia.vuejs.org/zh/introduction.html)       |
|    [tailwindcss](https://tailwindcss.com)    |   快速建立现代网站，而不离开你的HTML    | 4.1.10 |  [文档](https://tailwindcss.com/docs/installation/using-vite)   |
|        [Sass](https://sass-lang.com)         |       强化 CSS 的辅助工具       | 1.87.0 |               [文档](https://sass-lang.com/guide)               |
|      [Axios](https://www.axios-http.cn)      |    基于 promise 的网络请求库     | 1.9.0  |        [文档](https://www.axios-http.cn/docs/api_intro)         |

## ☕运行配置

建议所配环境差距不大，否则可能会出现运行异常。

| 依赖                               | 版本      |
|----------------------------------|---------|
| [node](https://nodejs.org/zh-cn) | 18.20.7 |
| npm                              | 10.8.2  | 
| pnpm                             | 10.6.4  |

## 🚴快速开始

### 🏀克隆项目

注：git版本需要大于2.25以上才能使用以下命令(稀疏检出)，若小于此版本可以选择clone全部文件，手动选出所需要的项目文件。

```bash
git clone --filter=blob:none --sparse https://gitee.com/snihao/focus-develop.git .
git sparse-checkout set nuxt3-vue3-ts
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
# nuxt
nuxt dev

# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

启动后服务地址： `http://localhost:3000`

### 🏐构建项目

```bash
# nuxt
nuxt build

# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

## 🐒项目部署(Linux)

官网地址： https://nuxt.com.cn/docs/getting-started/deployment

### 🦦推荐部署方式(pm2)：

- 安装 pm2

```bash
npm install pm2 -g
```

- 添加配置文件(ecosystem.config.js)

```js
module.exports = {
    apps: [
        {
            // 应用名称
            name: 'focus-develop',
            // 应用监听端口
            port: '3000',
            // 多进程模式
            exec_mode: 'cluster',
            instances: 'max',
            // 注意这里的路径（当前配置文件是与构建产物".output"同级）
            script: './.output/server/index.mjs'
        }
    ]
}
```

- 启动应用

```bash
pm2 start ecosystem.config.js
```

- 查看应用状态

```bash
pm2 l
```

- 停止应用

```bash
pm2 stop focus-develop
```

## 🔋项目基础结构

```markdown
nuxt3-vue3-ts
├── api // 接口
├── assets // 资源（CSS、SASS、字体等）
├── components // 组件
├── composables // 组合式函数（自动导入到应用）
├── middleware // 路由中间件
├── pages // 页面
├── plugins // 插件
├── public // 静态资源
├── util // 工具类
├── app.vue // 根组件
├── diy.d.ts // 类型声明
└── error.vue // 错误页面
```

详情参考：[官网文档](https://nuxt.com.cn/docs/guide/directory-structure/nuxt/)