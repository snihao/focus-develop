# 更新日志

本项目的所有重要更改都将记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- API 接口统一封装 (api/request.ts, api/index.ts)
- Pinia 状态管理模块 (composables/store.ts)
- 工具函数库 (util/dateUtil.ts, util/domUtil.ts, util/naiveUiUtil.ts)
- 全局类型声明 (diy.d.ts)
- 错误页面 (error.vue)
- 项目重构为标准开源结构

### 变更
- 重构 README.md 为标准开源项目文档格式
- 更新 package.json 依赖和配置

## [1.0.0] - 2026-04-30

### 新增
- 初始项目结构
- Nuxt 3 + Vue 3 + TypeScript 基础框架
- TailwindCSS 集成
- Naive UI 组件库集成
- Electron 桌面应用支持
- 文件操作功能（打开、保存、读取、写入）
- 跨平台支持（Windows、macOS、Linux）
- 暗色模式支持
- 自定义标题栏
- 标签页管理
- 文件树组件
- 开发环境热重载
- 生产环境打包脚本
- ESLint + Prettier 代码规范
- TypeScript 类型支持

---

## 版本说明

- **新增**: 新功能
- **变更**: 现有功能的变更
- **废弃**: 即将移除的功能
- **移除**: 已移除的功能
- **修复**: Bug 修复
- **安全**: 安全相关的更新
