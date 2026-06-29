# RePageTable

通用分页表格：自管理分页 / loading / 多选，父组件只关心列定义 + 数据 loader。

## 基础用法

```vue
<script setup lang="ts" generic="T extends Record<string, any>">
import { ref } from "vue";
import {
  RePageTable,
  type RePageTableInstance,
  type RePageTableLoader,
} from "xnui";

const tableRef = ref<RePageTableInstance<T>>();

const columns = [
  { label: "用户名", prop: "userName" },
  { label: "邮箱", prop: "email" },
  { label: "创建时间", prop: "creationTime", width: 180 },
];

const getList: RePageTableLoader<T> = async (page, size) => {
  const res = await api.list(page, size);
  return { list: res.items ?? [], total: res.totalCount ?? 0 };
};
</script>

<template>
  <RePageTable
    ref="tableRef"
    :columns="columns"
    :get-list="getList"
    v-model:selected="selected"
  >
    <!-- 列插槽：与 pure-admin 一致 -->
    <template #email="{ row }">
      <a :href="`mailto:${row.email}`">{{ row.email }}</a>
    </template>
  </RePageTable>
</template>
```

## 关键概念

### 数据加载器

```ts
type RePageTableLoader<T> = (
  page: number,
  size: number,
) => Promise<{ list: T[]; total: number }>;
```

- 组件 mount / 分页变化时自动调用
- 返回 `{ list, total }` 即可，组件自管分页

### 实例方法

```ts
const tableRef = ref<RePageTableInstance<T>>();

// 重新加载（CRUD 后调用）
await tableRef.value?.reload();

// 拿到当前页数据
const rows = tableRef.value?.getList();

// 跳首页
tableRef.value!.pagination.currentPage = 1;

// 清空选中
tableRef.value?.getTableRef()?.clearSelection();
```

### 透传

`RePageTable` 透传 `el-table` 的所有属性 / 事件：

```vue
<RePageTable
  :columns="columns"
  :get-list="getList"
  height="600"
  stripe
  @row-click="onRowClick"
  @sort-change="onSortChange"
/>
```

## 事件

| 事件               | 回调参数                      | 说明                           |
| ------------------ | ----------------------------- | ------------------------------ |
| `update:selected`  | `(rows: T[])`                 | 复选框变化（v-model:selected） |
| `paginationChange` | `({ currentPage, pageSize })` | 分页变化                       |
| `loaded`           | `(list, total)`               | 数据加载完成                   |

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | `"列表"` |  | 工具栏左侧标题 |
| `columns` | `Array` | `-` | ✅ | 列定义（与 pure-admin 一致） |
| `getList` | `RePageTableLoader` | `-` | ✅ | 数据加载器：返回 { list, total } - 自动调用时机：mount / pagination 变化 - 查询条件由父组件用闭包传给 loader（见 RePageTableLoader 类型注释） - 搜索条件变化时，父组件 watch 后调 pageTableRef.value?.reload() 即可 |
| `rowKey` | `string` | `"id"` |  | 表格行 key 字段名 |
| `tableSize` | `union` | `"default"` |  | 表格密度 |
| `pageSizes` | `Array` | `() =&gt; [10, 20, 50, 100]` |  | 每页大小选项 |
| `pageSize` | `number` | `10` |  | 默认每页 |
| `offsetBottom` | `number` | `110` |  | 自适应底部偏移 |
| `adaptiveConfig` | `any` | `-` |  |  |

## Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `update:selected` | `()` | 复选框变化（v-model:selected 双向） |
| `paginationChange` | `()` | 分页 / 排序 / 大小变化 |
| `loaded` | `()` | 数据加载完成 |

## Slots

| 插槽 | 说明 |
| --- | --- |
| `title` |  |
| `buttons` |  |
| `name` |  |


<!-- END: 自动生成段结束 -->
