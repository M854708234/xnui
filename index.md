---
layout: home
title: xn-ui
hero:
  name: xn-ui
  text: 企业内部项目组件库
  tagline: 聚焦搜索栏 / 表格 / 行操作 / 业务布局等高频场景的统一 UI 资产
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/getting-started
    - theme: alt
      text: 组件总览
      link: /components/
features:
  - title: 通用搜索栏
    icon: 🔍
    details: 配置表 + 栅格布局 + 展开收起 + 拦截器，业务搜索页一行搞定
  - title: 通用分页表格
    icon: 📊
    details: 自管理分页 / 加载 / 多选，配合 useTable 组合式实现零样板 CRUD 页
  - title: 行操作按钮
    icon: ⚡
    details: 新增 / 编辑 / 删除三态内置弹框 + 表单组件插槽
  - title: 业务布局
    icon: 📐
    details: header / handle / main / footer 插槽式业务页容器
  - title: TypeScript 优先
    icon: 🟦
    details: 完整 .d.ts 产出，泛型组件在主项目享受类型推导
  - title: VitePress 文档
    icon: 📖
    details: API 段由 vue-docgen-api 自动从源码生成，永不脱节
---

## 包含组件（v0.1.0）

| 组件 / Composable | 类别 | 说明 |
| --- | --- | --- |
| [ReSearchBar](/components/ReSearchBar) | 业务组件 | 通用搜索栏 |
| [RePageTable](/components/RePageTable) | 业务组件 | 通用分页表格 |
| [ReTableAction](/components/ReTableAction) | 业务组件 | 行操作按钮 |
| [BaseLayout](/components/BaseLayout) | 基础组件 | 业务页布局容器 |
| [useTable](/composables/useTable) | 组合式 | 搜索栏 + 表格联动 |
| [ReDialog](/components/ReDialog) | 基础组件 | 弹框（依赖） |
| [RePureTableBar](/components/RePureTableBar) | 基础组件 | 表格工具栏（依赖） |

## 一段代码看 xnui

```vue
<template>
  <BaseLayout>
    <template #header>
      <ReSearchBar v-model="query" :fields="fields" @search="trigger" @reset="trigger" />
    </template>

    <RePageTable
      ref="tableRef"
      :columns="columns"
      :get-list="getList"
      v-model:selected="selected"
    >
      <template #action="{ row }">
        <ReTableAction mode="edit"   :form-component="UserForm" :row="row" @success="reload" />
        <ReTableAction mode="delete" :row="row" :delete-api="deleteUser" @success="reload" />
      </template>
    </RePageTable>
  </BaseLayout>
</template>
```

## 加入开发

- 仓库：`https://github.com/M854708234/xnui`
- 新增组件：见 [贡献指南](/guide/contributing)
- 发版流程：见 [安装与发版](/guide/installation#发版)
