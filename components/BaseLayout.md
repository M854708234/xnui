# BaseLayout

业务页布局容器：header / handle / main / footer 四个插槽。

## 基础用法

```vue
<template>
  <BaseLayout>
    <template #header>
      <h2>用户管理</h2>
    </template>
    <template #handle>
      <ReSearchBar v-model="query" :fields="fields" @search="trigger" />
    </template>
    <RePageTable :columns="columns" :get-list="getList" />
  </BaseLayout>
</template>
```

## API

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `title` | `string` | `""` |  |  |
| `headerHeight` | `string` | `"64px"` |  |  |
| `handleHeight` | `string` | `"60px"` |  |  |

## Events

_无 events_

## Slots

| 插槽 | 说明 |
| --- | --- |
| `header` |  |
| `handle` |  |
| `default` |  |
| `footer` |  |


<!-- END: 自动生成段结束 -->

## Slots

| 插槽 | 说明 |
| --- | --- |
| `header` | 顶部标题区（默认 64px 高） |
| `handle` | 操作区（默认 60px 高） |
| `default` | 主内容区（自适应） |
| `footer` | 页脚（可选） |
