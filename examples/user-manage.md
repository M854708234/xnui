# 端到端示例：用户管理页

一个完整的「用户管理」业务页，含搜索 / 表格 / 新增 / 编辑 / 删除 / 多选。

## 完整代码

```vue
<!-- src/views/system/user/index.vue -->
<script setup lang="ts">
import {
  BaseLayout,
  ReSearchBar,
  RePageTable,
  ReTableAction,
  useTable
} from "xnui";
import { listUsers, deleteUser, type IdentityUser } from "@/api/user";
import UserForm from "./components/UserForm.vue";
import { DIALOG, searchFields, columns } from "./options";

defineOptions({ name: "UserManage" });

type QueryParams = { keyword: string };

const api = {
  list: async (
    page: number,
    size: number,
    q: QueryParams
  ): Promise<{ list: IdentityUser[]; total: number }> => {
    const res = await listUsers(page, size, { filter: q.keyword?.trim() || undefined });
    return { list: res.items ?? [], total: res.totalCount ?? 0 };
  }
};

const { query, selected, tableRef, getList, trigger, reload } = useTable<
  IdentityUser,
  QueryParams
>({
  searchFields,
  fetchList: (page, size, q) => api.list(page, size, q)
});

function onClearSelection() {
  const elTable = tableRef.value?.getTableRef?.() as any;
  elTable?.clearSelection?.();
}
</script>

<template>
  <BaseLayout>
    <template #header>
      <ReSearchBar
        v-model="query"
        :fields="searchFields"
        @search="trigger"
        @reset="trigger"
      />
    </template>

    <template #handle>
      <el-button type="primary" @click="onAdd">新增用户</el-button>
      <el-button :disabled="!selected.length" @click="onClearSelection">
        清空选中
      </el-button>
      <span class="selected-info">已选 {{ selected.length }} 条</span>
    </template>

    <RePageTable
      ref="tableRef"
      :columns="columns"
      :get-list="getList"
      v-model:selected="selected"
    >
      <template #action="{ row }">
        <ReTableAction
          mode="edit"
          :form-component="UserForm"
          :row="row"
          :dialog="DIALOG.edit"
          @success="reload"
        />
        <ReTableAction
          mode="delete"
          :row="row"
          :delete-api="(r) => deleteUser(r.id)"
          :dialog="DIALOG.delete"
          @success="reload"
        />
      </template>
    </RePageTable>
  </BaseLayout>
</template>

<style scoped>
.selected-info {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
```

```ts
<!-- src/views/system/user/options.ts -->
import type { SearchField } from "xnui";
import type { TableColumns } from "@pureadmin/table";

export const DIALOG = {
  edit:   { title: "编辑用户", width: "560px" },
  delete: { title: "删除用户", width: "420px" }
};

export const searchFields: SearchField[] = [
  { prop: "keyword", type: "input", props: { placeholder: "用户名 / 邮箱" } }
];

export const columns: TableColumns[] = [
  { type: "selection", width: 50 },
  { label: "用户名", prop: "userName", minWidth: 120 },
  { label: "邮箱",   prop: "email",   minWidth: 180 },
  { label: "创建时间", prop: "creationTime", width: 180 },
  { label: "操作",   prop: "action", width: 180, fixed: "right" }
];
```

## 涉及 API 一览

| 资产 | 用途 |
| --- | --- |
| `BaseLayout` | 业务页整体框架 |
| `ReSearchBar` | 搜索栏 |
| `RePageTable` | 表格 |
| `ReTableAction` | 行内编辑 / 删除按钮 |
| `useTable` | 联动 query / tableRef / getList / trigger |
| `@pureadmin/table` 的 `TableColumns` | 列定义类型 |

## 行数统计

- **传统写法**：~150 行（含 5+ 个 reactive / ref / watch / emit）
- **用 xnui**：~80 行（业务代码 100%，无样板）

## 下一步

- 跑 `pnpm dev` 启动
- 浏览器打开用户管理页验证：搜索 / 重置 / 新增 / 编辑 / 删除 / 多选 / 清空
- 看控制台无报错
