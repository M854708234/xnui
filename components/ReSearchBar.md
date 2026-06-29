# ReSearchBar

通用搜索栏：配置表 + h 函数渲染 + 栅格布局 + 展开收起。

## 基础用法

```vue
<script setup>
import { ref } from "vue";
import { ReSearchBar } from "xnui";

const query = ref({ keyword: "", status: undefined });
const fields = [
  { prop: "keyword", type: "input", props: { placeholder: "用户名 / 邮箱" } },
  {
    prop: "status",
    type: "select",
    options: [
      { label: "启用", value: 1 },
      { label: "禁用", value: 0 },
    ],
  },
];

function onSearch() {
  /* 触发查询 */
}
function onReset() {
  /* 触发重置 */
}
</script>

<template>
  <ReSearchBar
    v-model="query"
    :fields="fields"
    @search="onSearch"
    @reset="onReset"
  />
</template>
```

## 字段配置

每个字段 `SearchField` 支持：

| 字段      | 说明                                   |
| --------- | -------------------------------------- |
| `prop`    | 双向绑定的 query key                   |
| `type`    | `input` / `select` / `date` / `custom` |
| `label`   | 显示文本（可选）                       |
| `span`    | 栅格占位（1-24，默认 8）               |
| `props`   | 透传给 el-input / el-select 的 props   |
| `options` | select 的选项                          |
| `render`  | 自定义渲染（`type: 'custom'` 时用）    |

## beforeSearch 拦截

点击「查询」前可改 query / 补字段：

```ts
function beforeSearch(q: Record<string, any>) {
  q.keyword = q.keyword?.trim();
  q.fullPath = location.pathname; // 追加业务字段
}

<ReSearchBar :before-search="beforeSearch" ... />
```

## 事件

| 事件                | 回调参数  | 说明                                              |
| ------------------- | --------- | ------------------------------------------------- |
| `search`            | `(query)` | 点击「查询」时触发（beforeSearch 后）             |
| `reset`             | `()`      | 点击「重置」时触发（query 已合并回 defaultQuery） |
| `update:modelValue` | `(query)` | v-model 双向同步                                  |

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `modelValue` | `Record<string, any>` | `-` | ✅ | v-model 双向绑定的 query 对象（响应式） |
| `fields` | `SearchField[]` | `-` | ✅ | 字段配置表 |
| `beforeSearch` | `(query: Record<string, any>) => void` | `-` |  | 搜索前置拦截：可修改 query、补充字段。 由于 modelValue 通常是 reactive 对象，直接 mutate 即可触发筛选刷新。 |
| `defaultQuery` | `Record<string, any>` | `() => ({})` |  | 默认值：点击「重置」时合并回 modelValue。 组件内部完成重置，无需业务侧再监听 reset 事件来调 hook.reset。 |

## Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `update:modelValue` | `()` |  |
| `search` | `()` |  |
| `reset` | `()` |  |

## Slots

_无 slots_


<!-- END: 自动生成段结束 -->
