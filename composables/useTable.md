# useTable

「搜索栏 + 表格」联动组合式：把分散在父组件的 5 件事打包成一行 `useTable()`。

## 解决的问题

父组件原本要写：

```ts
const query = reactive({ ... });
const selected = ref([]);
const tableRef = ref();
const getList = async (page, size) => {
  const res = await api.list(page, size, query);
  return { list: res.items, total: res.total };
};
function trigger() {
  if (tableRef.value?.pagination.currentPage !== 1) {
    tableRef.value.pagination.currentPage = 1;
  } else {
    tableRef.value?.reload();
  }
}
```

用 `useTable` 之后：

```ts
const { query, selected, tableRef, getList, trigger, reload } = useTable({
  searchFields,
  fetchList: (page, size, q) => api.list(page, size, q)
});
```

## 基础用法

```ts
import { useTable } from "xnui";
import { listUsers, type IdentityUser } from "@/api/user";

const searchFields = [
  { prop: "keyword", type: "input", props: { placeholder: "用户名" } }
];

type QueryParams = { keyword: string };

const { query, selected, tableRef, getList, trigger, reload } = useTable<
  IdentityUser,
  QueryParams
>({
  searchFields,
  fetchList: async (page, size, q) => {
    const res = await listUsers(page, size, { filter: q.keyword });
    return { list: res.items ?? [], total: res.totalCount ?? 0 };
  }
});
```

模板：

```vue
<template>
  <ReSearchBar v-model="query" :fields="searchFields" @search="trigger" @reset="trigger" />
  <RePageTable
    ref="tableRef"
    :columns="columns"
    :get-list="getList"
    v-model:selected="selected"
  />
</template>
```

## CRUD 闭环示例

```ts
function onActionSuccess() {
  // add / edit / delete 成功后刷新
  reload();
}
```

```vue
<template>
  <ReTableAction mode="edit" :form-component="UserForm" :row="row" @success="onActionSuccess" />
</template>
```

## API

<!-- 由 scripts/gen-docs.ts 自动填充，请勿手写此段 -->

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `query` | `Q` | 搜索条件（v-model 给 ReSearchBar） |
| `selected` | `Ref<T[]>` | 选中行（v-model:selected 给 RePageTable） |
| `tableRef` | `Ref<RePageTableInstance<T> \| undefined>` | RePageTable 实例 |
| `getList` | `RePageTableLoader<T>` | 包装好的 loader（已注入 query） |
| `trigger` | `() => void` | 搜索 / 重置统一触发（跳首页） |
| `reload` | `() => Promise<void>` | 手动 reload（CRUD 后调用） |

## Options

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `searchFields` | `SearchField[]` | ✅ | 搜索字段配置（用于推导 query 初值） |
| `fetchList` | `(page, size, query) => Promise<{ list, total }>` | ✅ | 数据加载器（已自动注入 query） |
| `defaultQuery` | `Q` | | 显式默认值（覆盖 searchFields 推导） |
| `pageSize` | `number` | | 初始每页大小（默认 10） |
