# ReTableAction

表格行操作按钮：add / edit / delete 三态内置弹框与调用。

## 基础用法

```vue
<script setup>
import { ReTableAction } from "xnui";
import UserForm from "./UserForm.vue";
import { deleteUser, createUser, updateUser } from "@/api/user";

function onSuccess(mode) {
  // mode: 'add' | 'edit' | 'delete'
  tableRef.value?.reload();
}
</script>

<template>
  <!-- 新增（不需要 row） -->
  <ReTableAction mode="add" :form-component="UserForm" @success="onSuccess" />

  <!-- 编辑（需要 row） -->
  <ReTableAction
    mode="edit"
    :form-component="UserForm"
    :row="row"
    @success="onSuccess"
  />

  <!-- 删除（需要 row + deleteApi） -->
  <ReTableAction
    mode="delete"
    :row="row"
    :delete-api="(r) => deleteUser(r.id)"
    @success="onSuccess"
  />
</template>
```

## 表单组件约定

`formComponent` 必须 `expose` 一个 `submit(): Promise<boolean>` 方法：

```vue
<!-- UserForm.vue -->
<script setup>
import { ref } from "vue";

const formRef = ref();
const submitting = ref(false);

async function submit() {
  // 返回 true = 提交成功（关闭弹框 + emit('success')）
  // 返回 false = 校验未过 / 提交失败（保持弹框开启）
  if (!validateForm()) return false;
  try {
    submitting.value = true;
    await api.saveFormData(form);
    return true;
  } finally {
    submitting.value = false;
  }
}

defineExpose({ submit });
</script>
```

## 自定义弹框

```ts
<ReTableAction
  mode="edit"
  :form-component="UserForm"
  :row="row"
  :dialog="{ title: '编辑员工信息', width: '720px' }"
  @success="reload"
/>
```

## 事件

| 事件      | 回调参数                              | 说明           |
| --------- | ------------------------------------- | -------------- |
| `success` | `(mode: 'add' \| 'edit' \| 'delete')` | 业务完成后触发 |

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `mode` | `TableActionMode` | `-` | ✅ | 操作类型 |
| `formComponent` | `Component` | `undefined` |  | 表单组件（仅 add / edit 使用） 必须 expose 一个 `submit(): Promise<boolean>` 方法 |
| `deleteApi` | `TSFunctionType` | `undefined` |  | 删除 API（仅 delete 使用） 接收 row 作为入参，返回 Promise<void> 即视为成功 |
| `deleteLabel` | `string` | `undefined` |  | 删除确认弹框中显示的"目标"文案（仅 delete 使用） 传了直接用；不传则按 row 字段自动推断（surname+name → userName → name） |
| `row` | `Record` | `undefined` |  | edit / delete 必传；add 忽略 |
| `dialog` | `object` | `() => ({})` |  | 弹框配置（部分覆盖） 支持字段：title、width、top、sureBtnLoading 未传时按 mode 走 DEFAULT_DIALOG |
| `type` | `union` | `"primary"` |  | 按钮变体（element-plus type） |
| `text` | `string` | `"操作"` |  | 按钮文案 |

## Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `success` | `()` | create / update / delete 成功后通知父级 reload 表格 |

## Slots

_无 slots_


<!-- END: 自动生成段结束 -->
