# 快速上手

## 适用场景

`xn-ui` 是企业内部沉淀的通用 UI 资产，**专为"搜索 + 表格 + 行操作"型业务页设计**：

- 用户管理、角色管理、组织架构、权限分配等后台 CRUD 页
- 业务主数据维护（物料、客户、供应商等）
- 任何"列表 + 筛选 + 增删改查"的后台页

如果你正在写一个**全新业务页**，有 1 个搜索栏 + 1 个表格 + N 个行操作按钮，用 `xnui` 可以把样板代码从 100+ 行压到 30 行以内。

## 5 分钟接入

### 1. 安装

```bash
# 内部 Azure Artifacts 配置好后
pnpm add xnui
```

### 2. 注册全局组件（main.ts，可选）

如果想在 template 里直接用 `<ReSearchBar>`、`<BaseLayout>` 而不显式 import：

```ts
import { createApp } from "vue";
import App from "./App.vue";
import { registerGlobalComponents } from "@/components";  // 你的注册中心

const app = createApp(App);
registerGlobalComponents(app);
app.mount("#app");
```

```ts
// src/components/index.ts
import {
  ReSearchBar,
  RePageTable,
  ReTableAction,
  BaseLayout
} from "xnui";

export function registerGlobalComponents(app: App) {
  app.component("ReSearchBar", ReSearchBar);
  app.component("RePageTable", RePageTable);
  app.component("ReTableAction", ReTableAction);
  app.component("BaseLayout", BaseLayout);
  // 其它全局组件...
}
```

### 3. 写一个用户管理页

完整示例见 [用户管理页](/examples/user-manage)。

## 下一步

- [查看组件总览](/components/)
- [查看安装与发版](/guide/installation)
- [查看贡献指南](/guide/contributing)
