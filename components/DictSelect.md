# DictSelect

字典下拉选择器：按 `typeNo` 自动加载、缓存、并发去重,透传 `el-select` 全部属性与事件。

## 一次性注册数据源

`xnui` 不直接依赖业务侧 `@/api/*`,需要在 `main.ts` 里注入 fetcher:

```ts
// main.ts
import { createApp } from "vue";
import { setDictFetcher } from "xnui";
import { getDictByType } from "@/api/basItem";

const app = createApp(App);
setDictFetcher(getDictByType); // (typeNo: string) => Promise<DictItem[]>
app.mount("#app");
```

## 基础用法

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DictSelect } from "xnui";

const status = ref<number>(1);
</script>

<template>
  <DictSelect v-model="status" type-no="user_status" />
</template>
```

## 同时拿到 label(name)

支持 `v-model:name`,选中后会自动同步字典项名称:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DictSelect } from "xnui";

const status = ref<number>();
const statusName = ref("");
</script>

<template>
  <DictSelect
    v-model="status"
    v-model:name="statusName"
    type-no="user_status"
    placeholder="请选择状态"
  />
</template>
```

## 透传 el-select 全部属性 / 事件

`inheritAttrs: false` + `v-bind="$attrs"` 已内置,所有 `el-select` 属性与事件可直接写在组件上:

```vue
<DictSelect
  v-model="status"
  type-no="user_status"
  filterable
  clearable
  multiple
  collapse-tags
  @change="onChange"
  @visible-change="onVisibleChange"
/>
```

## 类型

```ts
interface DictItem {
  code: string; // 字典项编码（value）
  name: string; // 字典项名称（label）
  isActive?: boolean; // 是否启用
  orderBy?: number; // 排序
  [key: string]: any; // 业务扩展字段
}
```

## API

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性         | 类型     | 默认值 | 必填 | 说明                                     |
| ------------ | -------- | ------ | ---- | ---------------------------------------- |
| `typeNo`     | `string` | `-`    | ✅   | 字典编号（必填）                         |
| `modelValue` | `union`  | `-`    |      | v-model 绑定的值（itemCode），同 `value` |
| `value`      | `union`  | `-`    |      | v-model:value 绑定的值（itemCode）       |
| `valueName`  | `string` | `-`    |      | v-model:name 绑定的 label（itemName）    |

## Events

| 事件                | 签名                      | 说明                     |
| ------------------- | ------------------------- | ------------------------ |
| `update:modelValue` | `(v: any)`                | v-model 双向同步         |
| `update:value`      | `(v: any)`                | v-model:value 同步       |
| `update:valueName`  | `(v: string)`             | v-model:name 同步        |
| `change`            | `(v: any, name?: string)` | 选项变化（同时给出名称） |

## Slots

_无 slots_

<!-- END: 自动生成段结束 -->

## 类型补充

> 上面 `Props` 表里的 `union` 来自 vue-docgen-api 提取,完整类型如下:

| 属性         | 完整类型                                      |
| ------------ | --------------------------------------------- |
| `modelValue` | `string \| number \| Array<string \| number>` |
| `value`      | `string \| number \| Array<string \| number>` |
| `valueName`  | `string`                                      |
