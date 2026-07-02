# DictTag

字典标签展示:根据 `typeNo` + `code` 自动渲染名称,未指定 `type` 时按 `isActive` 自动着色(启用 = success,禁用 = danger)。

## 一次性注册数据源

同 `DictSelect`,在 `main.ts` 注入 fetcher(详见 [DictSelect 文档](./DictSelect#一次性注册数据源))。

## 基础用法

```vue
<script setup lang="ts">
import { DictTag } from "xnui";
</script>

<template>
  <!-- 自动按 isActive 着色 -->
  <DictTag type-no="user_status" :code="1" />

  <!-- 未命中字典时回退显示 code 原文 -->
  <DictTag type-no="user_status" :code="999" />
</template>
```

## 强制指定类型 / 主题 / 尺寸

```vue
<template>
  <DictTag
    type-no="user_status"
    :code="0"
    type="info"
    effect="dark"
    size="large"
  />
</template>
```

## 配合表格列渲染

```vue
<el-table-column label="状态">
  <template #default="{ row }">
    <DictTag type-no="user_status" :code="row.status" />
  </template>
</el-table-column>
```

## API

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性     | 类型     | 默认值    | 必填 | 说明                                          |
| -------- | -------- | --------- | ---- | --------------------------------------------- |
| `typeNo` | `string` | `-`       | ✅   | 字典编号（必填）                              |
| `code`   | `union`  | `-`       | ✅   | 字典项编码                                    |
| `type`   | `union`  | `-`       |      | 强制指定 tag 类型；不传则按 isActive 自动着色 |
| `effect` | `union`  | `"light"` |      | tag 主题                                      |
| `size`   | `union`  | `"small"` |      | tag 尺寸                                      |

## Events

_无 events_

## Slots

_无 slots_

<!-- END: 自动生成段结束 -->

## 类型补充

> 上面 `Props` 表里的 `union` 来自 vue-docgen-api 提取,完整类型如下:

| 属性     | 完整类型                                                    |
| -------- | ----------------------------------------------------------- |
| `code`   | `string \| number \| undefined \| null`                     |
| `type`   | `"primary" \| "success" \| "info" \| "warning" \| "danger"` |
| `effect` | `"light" \| "dark" \| "plain"`                              |
| `size`   | `"small" \| "default" \| "large"`                           |
