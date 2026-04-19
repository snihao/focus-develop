# Focus Admin 设计与开发规范

> 适用范围：`focus-admin` 及基于此骨架进行二次开发的所有项目。
> 读者对象：未来加入项目的开发者、审查 PR 的同学、Fork 仓库做业务定制的工程师。
> 规范强度：**必须** / **禁止** 为硬约束，违反需在 PR 描述中说明；**推荐** / **可选** 为软约束。

---

## 〇、设计哲学

**编辑杂志 × 极简野兽派。** 我们不做又一个"紫蓝渐变 + 毛玻璃"的管理后台骨架。核心定位是：

- **沉静而有力量**：象牙纸底 + 墨黑为主，仅保留朱砂红作为唯一强调色（面积 ≤ 10%）。
- **文学感的克制**：Fraunces 衬线做显示标题、JetBrains Mono 做元数据与编号、Noto Serif SC 承接中文正文。杜绝 Inter / Roboto / Space Grotesk 等 AI 默认字体。
- **结构外显**：编号（№ 01 / 01·02）、分隔短横、四角 `+` 标记、硬阴影、底线式输入框——用排版语言暴露信息层级。
- **Tailwind-first**：所有样式通过 utility class 与 `tailwind.config.ts` 表达。禁止在 `<style>` 块内手写 CSS。

---

## 一、视觉系统

所有颜色、字体、阴影、动画的单一真源为 `tailwind.config.ts`。新增主题值**必须**扩展到该文件，**禁止**在组件内硬编码数值。

### 1.1 色彩

| 语义 | Tailwind 类 | 色值 | 用途 |
|------|-------------|------|------|
| 纸底主色 | `bg-paper` / `text-paper` | `#f4efe7` | 全局背景、深色按钮文字反白 |
| 纸底深阶 | `bg-paper-deep` | `#ebe4d6` | 表格斑马线、卡片悬浮态 |
| 墨黑主文 | `text-ink` / `bg-ink` | `#1a1a1a` | 标题、正文、主按钮、硬阴影 |
| 墨灰次文 | `text-ink-mid` | `#4a4a4a` | 描述、副标题 |
| 墨浅辅助 | `text-ink-soft` | `#8c8478` | 占位文字、元数据、装饰符 |
| 朱砂强调 | `text-accent` / `bg-accent` | `#c8372d` | 编号、危险操作、按钮 hover、装饰角 |

**色彩配比铁律**

- 纸底占 60%+ ，墨黑占 30%，朱砂 ≤ 10%。
- 单屏**最多**出现 3 处朱砂元素。超出必须合并或降级为墨色。
- 禁止引入第 4 种色相（蓝、绿、紫、橙皆不可）。状态提示（成功 / 警告 / 错误）由 Naive UI 自带主题承载，不参与主设计语言。

**透明通道**：使用 Tailwind 原生的 `色号/数字` 语法（如 `text-ink/45`、`border-ink/20`、`bg-accent/[0.08]`），不再单独定义灰阶变量。

### 1.2 字体

| 角色 | Tailwind 类 | 字体栈 | 使用场景 |
|------|-------------|--------|----------|
| 显示衬线 | `font-display` | `Fraunces, Noto Serif SC, Songti SC, STSong, georgia, serif` | 页面大标题、品牌区、区块标题 |
| 等宽 | `font-mono` | `JetBrains Mono, SF Mono, menlo, consolas, monospace` | 编号、元数据、标签、链接括号、时间戳 |

**字号刻度**（优先使用 Tailwind 默认值，否则用任意值 `text-[Xpx]`）

- 巨型标题：`text-[clamp(72px,12vw,196px)]`（仅登录/门面页）
- 页面主标题：`text-3xl` / `text-4xl`
- 区块标题：`text-xl` / `text-2xl`
- 正文：`text-base` / `text-lg`
- 元数据：`text-[10px]` / `text-[11px]` / `text-xs`（仅等宽使用）

**行高与字间距**

- 标题：`leading-[0.82]` ~ `leading-tight`，`tracking-[-0.045em]` ~ `tracking-tight`
- 正文中文：`leading-[1.75]`，`tracking-[0.02em] ~ tracking-[0.08em]`
- 元数据：`tracking-[0.1em] ~ tracking-[0.22em]` + `uppercase`

**禁止**

- 禁止在任何位置引入 Inter / Roboto / Space Grotesk / Open Sans / 系统默认无衬线作为主字体。
- 禁止对中文使用 `italic`（斜体不匹配汉字结构）。中文强调改用字重或 `text-accent`。
- 禁止自行添加第三套字体族。如确有需要，先在 `tailwind.config.ts` 的 `fontFamily` 里扩展命名为 `font-sans`（如走无衬线正文），再由全员 review 通过后才可使用。

### 1.3 间距与网格

- **优先使用 Tailwind 默认间距刻度**（0, 0.5, 1, 1.5 ... 12, 14, 16, 20, 24 ...）。
- 非刻度值用任意值：`pt-[60px]`、`px-[72px]`。
- 页面外边距：桌面 `px-[72px]`，中屏 `max-lg:px-10`，手机 `max-sm:px-7`。
- 卡片内边距：`p-10` ~ `p-12` 桌面，`max-sm:p-7` 手机。
- 列表项 / 表格行：垂直节奏 `py-3` ~ `py-4`，`gap-y-2` ~ `gap-y-3`。

**响应式断点**（使用 Tailwind 默认 + 现代 range 语法）

| 断点 | 变体前缀 | 适用 |
|------|----------|------|
| `< 640px` | `max-sm:` | 手机 |
| `< 1024px` | `max-lg:` | 平板、窄桌面 |
| `≥ 1024px` | 默认（无前缀） | 桌面 |

手写媒体查询**必须**使用 `(width <= Npx)` 而非过时的 `(max-width: Npx)`（stylelint `media-feature-range-notation` 规则）。

### 1.4 阴影与边框

- 主阴影：`shadow-brutal`（`14px 14px 0 0 #1a1a1a`）——硬阴影、无模糊，体现野兽派。
- 次阴影：`shadow-brutal-sm`（`10px 10px 0 0 #1a1a1a`）——中屏降级。
- **禁止**使用 `shadow-md` / `shadow-lg` / `shadow-xl` 等 Tailwind 默认的模糊阴影。需要"悬浮感"时改用墨色硬阴影或细边框。
- 边框：主要用 `border border-ink/15` ~ `border-ink/25`；表单卡外框 `border-[1.5px] border-ink`；装饰角 `border-[3px] border-accent`。
- 圆角：**禁用**。所有卡片、按钮、输入框保持直角。这是本项目设计识别度的核心。确有圆形场景（头像、复选框打勾）单独允许。

### 1.5 动效

**节制是美德。** 动画只出现在两个时刻：

1. **页面加载**：错峰淡入，形成阅读节奏。使用预设动画：
   - `animate-fade-in`（0.6s，背景、顶栏）
   - `animate-fade-up`（0.7s，区块内容）
   - `animate-slide-up`（1s，主标题）
2. **交互反馈**：hover、focus、按下的状态切换。

**延迟叠加**用任意值：`[animation-delay:250ms]`、`[animation-delay:400ms]`。推荐阶梯值 `150ms / 250ms / 400ms / 500ms / 650ms / 800ms`。

**禁止**

- 禁止 parallax、滚动视差、鼠标跟随粒子、马赛克解码效果等装饰性动画。
- 禁止任何单次超过 `1s` 的动画。
- 禁止在列表滚动、表单输入等高频场景叠加动画。

### 1.6 装饰元素

这些符号是设计识别度的核心，**必须**在合适场景复用：

| 元素 | 用途 | 实现 |
|------|------|------|
| `№ 01` | 页面 / 区块序号 | `font-mono` + `font-bold` |
| `+` 四角标记 | 页面四角 | 绝对定位 `span`，`text-ink/45`，手机隐藏 |
| `—` 短横 | 标签前缀 | `w-12 h-px bg-ink` |
| `·` 居中圆点 | 分隔符 | 朱砂或墨色 `rounded-full w-1 h-1` |
| `[ GITHUB ↗ ]` | 外链样式 | 等宽、方括号 + 右上箭头 + 下划线 hover |
| `02 ─ 标题` | 卡片头 | 朱砂编号 + 墨色横条 + 等宽大写 |
| `// 错误文案` | 表单校验提示 | 等宽 + 朱砂 + `//` 前缀 |

---

## 二、组件规范

### 2.1 目录分层

```
components/
  of/      原子层：无业务语义，零依赖，可被任何项目直接拷走
  focus/   组合层：骨架级业务组件，绑定本项目命名与样式
  app/     应用层：绑定 router/store/layout，不在业务页中复用
```

**分层原则（必须）**

- `of/*`（前缀 `Of*`）**禁止**引入 `~/api/*`、`~/composables/*` 中的业务 store。允许依赖 Naive UI 与 Tailwind。
- `focus/*`（前缀 `Focus*`）允许依赖 `~/composables/*`、`~/utils/*`，但**禁止**引用具体业务 API（如 `~/api/menu`）。跨业务能力通过 props 注入（如 `FocusMarkdownEditor` 的 `uploadReq`）。
- `app/*`（前缀 `App*`）允许依赖任何模块，负责应用外壳与导航。

### 2.2 命名约定

- 组件文件 PascalCase：`FocusEditModal.vue`、`OfVirtualScroll.vue`。
- Nuxt 自动导入前缀与目录一致：`components/focus/FocusXxx.vue` 自动注册为 `<FocusXxx>`。
- **禁止**在 `focus/` 下新建无前缀文件（如 `Modal.vue`），会与其他目录的同名组件冲突。

### 2.3 表单输入

**底线式输入是本项目的标配**：

```vue
<input
  class="w-full pt-2.5 pb-2 bg-transparent border-0 border-b font-display text-xl text-ink outline-none transition-[border-color,padding] duration-300 ease-out placeholder:text-ink-soft placeholder:italic placeholder:opacity-60 focus:border-b-2 focus:pb-[7px] focus:border-ink"
  :class="error ? '!border-accent !border-b-2 !pb-[7px]' : 'border-ink/25'"
/>
```

需要在内部页面使用 Naive UI 的 `n-input` 时，通过 `theme-overrides` 或 `:class` 复刻该底线外观。**禁止**在列表筛选、弹窗等场景混用默认的圆角框体。

### 2.4 按钮

**主按钮（CTA）**

```vue
<button class="group flex items-center justify-between px-7 py-5 bg-ink text-paper font-mono text-[13px] font-bold tracking-[0.28em] uppercase enabled:hover:bg-accent enabled:hover:pl-[34px] transition-[background-color,padding] duration-300">
  <span>保  存</span>
  <span class="text-[18px] inline-block transition-transform duration-300 group-hover:translate-x-2.5">→</span>
</button>
```

**次按钮**：`border border-ink px-6 py-3 text-ink font-mono uppercase hover:bg-ink hover:text-paper`。

**危险按钮**：底色改为 `bg-accent text-paper`，hover 改为加深的墨色。

**禁止**

- 禁止使用 Naive UI 默认 `n-button type="primary"` 的蓝色。全局主题覆盖已经把 primary 改为墨色，但仍需视觉检查。
- 禁止圆角。

### 2.5 表格与过滤

遵循现有模板：`pages/menu.vue` / `pages/role.vue` / `pages/user.vue` 是标准参考。

```
┌─────────────────────────────────────┐
│ FocusFilterForm（sticky 顶部筛选）  │
├─────────────────────────────────────┤
│ n-data-table（无圆角 + 墨色表头）   │
└─────────────────────────────────────┘
+ FocusEditModal（新增/编辑/查看三合一）
```

**必须**

- 列表页标题使用 `FormFieldBuilder` 构建字段，避免手写 schema。
- 分页使用 `usePagination` composable，不重复实现 loading / data / refresh。
- 表格 `--n-merged-th-color` 根据主题切换墨色或墨灰。
- 操作列使用 `getTableActions({ viewBtn, editBtn, deleteBtn, addBtn })` 工具。

### 2.6 弹窗与模态

- 业务新增 / 编辑：`FocusEditModal`（字段化表单）。
- 内容预览 / 富文本：`FocusMarkdownModal`（上传能力通过 `upload` prop 注入）。
- 自由布局：`n-modal preset="card"`，但外观必须复刻 `FocusEditModal` 的硬阴影 + 直角。

---

## 三、页面布局规范

### 3.1 登录页（门面）

参考 `pages/index.vue`。定位是"门面"——可以用巨型标题、浓厚装饰元素。**禁止**在内部业务页复制登录页的野兽派硬阴影 + 巨型标题组合，那是为门面独享的视觉语言。

### 3.2 后台主布局

外壳由 `AppHeader` + `AppLeftNav` + `AppRightNav` 构成，定义在 `app.vue`。所有业务页渲染在中央 `.app-main` 区域，不得直接改写外壳结构。

**顶部 Header（`AppHeader`）必须保持**

- 左侧：品牌名 `Focus Admin`（字体族 `cursive`，**仅此一处**保留 cursive 风格作为品牌签名）。
- 右侧：主题切换 + 用户弹出层（账号设置 / 修改密码 / 退出）。

**左侧菜单（`AppLeftNav`）**

- 由后端 `getEmpMenuList` 驱动，不在前端写死菜单树。
- 图标通过 `@vicons/ionicons5` 按名字动态加载——菜单数据里存字符串即可。
- 菜单 `type === 2`（按钮）仅用于权限标记收集，不渲染。

**右侧 Tab 导航（`AppRightNav`）**

- 首页 Tab 不可关闭。
- Tab 关闭后自动切到前一个 Tab。

### 3.3 列表页模板

落地新列表页**必须**按以下顺序：

1. 读取 `pages/role.vue` 作为样板。
2. 在 `api/<module>.ts` 新增 CRUD 接口。
3. 用 `FormFieldBuilder` 定义 `filterFields` 和 `editFields`。
4. 挂接 `usePagination` + `FocusFilterForm` + `n-data-table` + `FocusEditModal`。
5. 权限点：搜索栏 `:add` / `:delete`、操作列 `:update` / `:disable`、路由 `meta.permissions`。

### 3.4 表单 / 详情页

- 布局：左侧 1/3 为"编号 + 标题 + 说明"，右侧 2/3 为实际表单。
- 字段分组使用 `<h3>` + 短横线装饰，**不用**折叠面板堆叠字段。
- 提交按钮置于表单底部右侧，使用主按钮样式。

---

## 四、开发约束

### 4.1 样式：Tailwind-first（硬约束）

- **禁止**在 Vue 组件内书写 `<style>` / `<style scoped>` / `<style lang="scss">` 块。所有样式通过 utility class 或 `tailwind.config.ts` 表达。
- 复杂重复样式（如特定卡片的组合）通过**组件化**解决，而非抽 CSS class。
- 需要主题级样式变量（颜色、字体、阴影、动画、背景）时，扩展 `tailwind.config.ts` 的 `theme.extend`。
- 需要复杂背景图（SVG 纹理、多层渐变）时，在 `tailwind.config.ts` 的 `backgroundImage` 中命名后再引用。
- 对第三方组件库（Naive UI）的样式覆写，使用 `theme-overrides` prop 或 CSS 变量，而非 `:deep()` 样式穿透。

**唯一例外**：`assets/css/*.scss` 用于全局 reset、Naive UI 主题变量、Tailwind 指令入口，不得在业务页面或组件里新增 scss 文件。

### 4.2 中文优先

- 用户面向文案（按钮、标签、提示、错误信息）一律简体中文。
- 装饰性 / 结构性文本可保留英文（`LOGIN · FOCUS ADMIN`、`GITHUB ↗`、`ADMIN ACCESS`），但每个新页面的英文装饰元素**不得超过 5 处**。
- 注释、Git commit、文档、提示信息一律简体中文。代码标识符（变量、函数、类、文件名）保持英文遵循本项目原有风格。
- 日期格式：使用 `getDateFormat`（`YYYY-MM-DD HH:mm:ss`），不得在组件内自行 `toLocaleString`。

### 4.3 权限体系

- 所有需要鉴权的操作**必须**挂 `v-permission="['xxx:yyy']"` 或在代码里显式 `userStore.hasPermissions(['xxx:yyy'])`。
- 路由级权限写在 `definePageMeta({ permissions: ['xxx:yyy'] })`。
- 权限标识命名规则：`{模块}:{动作}`，动作限定在 `add / update / delete / disable / view / export / import` 范围内，**禁止**造新动词。
- 权限字符串的真源是后端菜单 `mark` 字段，前端不得硬编码权限常量列表（除非是 mock 登录场景）。

### 4.4 请求层

- 所有 HTTP 请求**必须**通过 `utils/requestUtil.ts` 的 `request` 函数，**禁止**直接 `$fetch` / `axios.create` / `fetch`。
- 接口定义集中在 `api/<module>.ts`，导出 `Params` / `Result` 类型 + 具名函数。
- 返回值统一 `Result<T>` 协议：`{ code, data, msg }`，业务代码用 `Number(res.code) === 200` 判断成功。
- 加密字段（密码、敏感参数）使用 `utils/cryptoUtil.ts` 的 `rsaUtils.encrypt`，密钥通过环境变量 `NUXT_PUBLIC_RSA_PUBLIC_KEY` 注入，**禁止**硬编码公钥。

### 4.5 状态管理

- 全局 store 使用 Pinia setup store 风格（参见 `composables/useUserStore.ts` / `composables/store.ts`）。
- 用户态（`userStore`）持久化到 `localStorage`；token 同步写入 cookie 以便 SSR 与中间件读取。
- **禁止**在组件里直接操作 `localStorage` / `cookie`，所有读写经由 store。
- 页面级局部状态用 `ref` / `reactive`；跨组件但仅限单页的状态用 `provide` / `inject`。

### 4.6 错误处理与提示

- 全局提示用 `utils/naiveUiUtil.ts` 的 `tips(type, msg)`，统一弹出位置与样式。
- 表单校验失败：取第一条错误用 `message.warning` 提示（已在 `FocusEditModal` 内部实现）。
- 接口失败：由 `requestUtil` 统一处理 401 / 403 / 5xx，业务层只处理 `code !== 200` 的业务错误。
- **禁止**使用 `alert` / `confirm` / `console.log` 向用户呈现信息。
- **禁止**在 production 环境保留 `console.log` / `console.debug`。生产构建通过 esbuild 的 `drop` 自动移除。

### 4.7 Stylelint 规则提醒

当 stylelint 报错时，**禁止**关闭规则解决问题。常见修复方式：

| 规则 | 修复 |
|------|------|
| `color-function-notation` + `alpha-value-notation` | 用 `rgb(R G B / N%)` 而非 `rgba(R, G, B, 0.N)`。迁移到 Tailwind 后不再触发 |
| `value-keyword-case` | 字体族名如 `Georgia` 改小写 `georgia`，或在 Tailwind 配置中用字符串 |
| `no-descending-specificity` | 独立选择器必须在嵌套的 `&:hover` 之前 |
| `media-feature-range-notation` | `(width <= 1024px)` 而非 `(max-width: 1024px)` |
| `dollar-variable-empty-line-before` | SCSS 变量块内部不留空行 |

---

## 五、新页面落地清单

每新增一个后台业务页（以"商品管理"为例），按此清单逐项完成：

- [ ] 在 `api/product.ts` 定义 `ProductListParams` / `ProductInfo` / CRUD 函数。
- [ ] 菜单表后台录入菜单项，`route` 字段为 `product`，`mark` 字段为 `product:view`，按钮子节点加入 `product:add` / `product:update` / `product:delete` / `product:disable`。
- [ ] 新建 `pages/product.vue`，拷贝 `pages/role.vue` 为起点。
- [ ] `definePageMeta({ permissions: ['product:view'] })`。
- [ ] 用 `FormFieldBuilder` 构建 `filterFields` 和 `editFields`。
- [ ] 挂 `usePagination` + `FocusFilterForm` + `n-data-table` + `FocusEditModal`。
- [ ] 所有按钮带 `userStore.hasPermissions([...])` 显示控制。
- [ ] 页面文案全部简体中文，仅保留少量英文装饰。
- [ ] 删除二次确认使用 `useDialog().warning`，不用原生 `confirm`。
- [ ] PR 自检：无手写 CSS、无硬编码颜色 / 字体、无 `console.log`、无圆角 `rounded-*` 泛滥。

---

## 六、反模式清单

以下行为会在 code review 时直接被打回：

- 在 `.vue` 文件里写 `<style>` / `<style scoped>`。
- 使用 `Inter` / `Roboto` / `Space Grotesk` / 系统默认字体族。
- 引入紫色 / 蓝色 / 绿色 / 橙色作为主色或渐变。
- 使用 Tailwind 模糊阴影 `shadow-md` / `shadow-lg` / `shadow-xl`。
- 给按钮、卡片、输入框加 `rounded-*`。
- 直接 `import axios` 或 `$fetch`。
- 在前端硬编码菜单列表或权限点常量。
- 使用 `alert` / `confirm` / 原生 `prompt`。
- 中文字体加 `italic`。
- 为新页面重新实现"分页 + 搜索 + 弹窗"三件套，而不是复用 `FocusFilterForm` / `FocusEditModal`。
- 单次动画时长 > 1s，或在滚动容器中叠加动画。
- 在 `components/of/*` 里引用 `~/api/*` 或具体业务 store。
- 用 `:deep()` 大量覆盖 Naive UI 样式，而非 `theme-overrides`。
- 不经讨论直接修改 `tailwind.config.ts` 的颜色 / 字体键名（会破坏全项目一致性）。

---

## 七、字体加载策略

当前登录页通过 Google Fonts 加载 Fraunces / JetBrains Mono / Noto Serif SC。国内网络环境下可能不稳定。后续建议迁移方案（按优先级）：

1. **本地自托管**：下载字体文件到 `public/fonts/`，通过 `@font-face` 在 `assets/css/theme.scss` 声明。
2. **国内 CDN 镜像**：切换到 `fonts.loli.net` 或字节跳动的 `lf6-cdn-tos.bytecdntp.com`。
3. **字体子集化**：仅打包本项目使用到的字符集，减少首屏加载体积（推荐搭配 `subfont` 工具）。

无论哪种方案，`font-family` 栈已包含 `Noto Serif SC / Songti SC / STSong / georgia / serif` 作回退，字体加载失败不影响可读性。

---

## 八、变更与反馈

本文档是活文档。新增主题变量、调整约束强度、引入新规范，**必须**通过 PR 更新此文件，并在变更说明中写明：

1. 变更点（增 / 改 / 删）。
2. 动机（遇到的问题 / 新需求）。
3. 影响面（是否需要同步修改已存在的页面）。
4. 迁移路径（如有破坏性变更，列出 migration 步骤）。

规范不是束缚，而是把团队的审美判断沉淀为可执行的默认值。遵守它，是为了在更高层级的决策上节省心智。
