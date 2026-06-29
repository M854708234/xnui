# ReDialog

弹框组件：基于 `element-plus` `el-dialog` 二次封装，提供 `addDialog` / `closeDialog` 编程式 API。

> 本组件为 **ReTableAction 内部依赖**，一般业务代码不直接使用。如需弹框表单，推荐直接用 [ReTableAction](/components/ReTableAction)。

## 基础用法

```ts
import { addDialog, closeDialog } from "xnui";

addDialog({
  title: "编辑用户",
  width: "560px",
  contentRenderer: () => h(UserForm, { row }),
  beforeSure: async ({ options }) => {
    // options 是 dialog 内部状态
    const formRef = options.formRef;
    return await formRef.value?.submit();
  }
});
```

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

_无 props_

## Events

_无 events_

## Slots

_无 slots_


<!-- END: 自动生成段结束 -->
