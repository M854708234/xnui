# ReSelect

下拉选择器:支持全量加载 / 滚动分页加载,字段映射可自定义,带请求前置拦截器,回填项自动去重。透传 `el-select` 全部属性与事件。

## 两种数据模式

| 模式             | `paginated`  | 行为                                     |
| ---------------- | ------------ | ---------------------------------------- |
| **全量加载**     | `false`      | 单次接口拉全量,弹层不监听滚动            |
| **滚动分页加载** | `true`(默认) | 首次拉第 1 页,弹层滚动到底自动加载下一页 |

## 基础用法(全量)

```vue
<script setup lang="ts">
import { ref, provide } from "vue";
import { ReSelect } from "xnui";
import axios from "axios";

const value = ref();
const name = ref("");

// 提供全局 fetch 适配器
provide(Symbol.for("xnui:fetch"), async ({ url, method, params }) => {
  return axios.request({ url, method, params });
});
</script>

<template>
  <ReSelect
    v-model:value="value"
    v-model:value-name="name"
    api="/api/users/all"
    :paginated="false"
  />
</template>
```

## 滚动分页加载

```vue
<template>
  <ReSelect
    v-model:value="userId"
    v-model:value-name="userName"
    api="/api/users/page"
    :page-size="20"
    :paginated="true"
  />
</template>
```

弹层滚动到底部时,自动拉下一页数据,直到 `total` 字段达到上限。

## 两种分页语义:`page` 与 `offset`

`paginationType` 控制分页参数语义,适配不同后端接口:

| `paginationType` | 适用场景                              | `pageField` 含义           | 真实请求示例 (pageSize=20)             |
| ---------------- | ------------------------------------- | -------------------------- | -------------------------------------- |
| `"page"`(默认)   | 页码风格接口(`pageNum=1, pageNum=2…`) | 页码,从 **1** 开始         | `{ pageNum: 1, pageSize: 20 }`         |
| `"offset"`       | 偏移量风格接口(`skipCount=20`)        | 跳过条数 = page × pageSize | `{ skipCount: 0, maxResultCount: 20 }` |

### 典型场景:ABP / `skipCount + maxResultCount` 接口

```vue
<template>
  <ReSelect
    v-model:value="roleId"
    v-model:value-name="roleName"
    api="/api/identity/roles"
    pagination-type="offset"
    page-field="skipCount"
    size-field="maxResultCount"
    key-code="keyCode"
    :page-size="20"
  />
</template>
```

| 加载阶段    | 请求参数                                             |
| ----------- | ---------------------------------------------------- |
| 初次 / 搜索 | `{ keyCode: '', skipCount: 0, maxResultCount: 20 }`  |
| 滚动第 2 页 | `{ keyCode: '', skipCount: 20, maxResultCount: 20 }` |
| 滚动第 3 页 | `{ keyCode: '', skipCount: 40, maxResultCount: 20 }` |

内部统一使用 **0 基 page** 计算 `pageField`,只会在最终拼接请求参数时按 `paginationType` 区分：

- `"page"` → 拼 `page + 1`
- `"offset"` → 拼 `page * pageSize`

> 即使某一页后端少返回了几条,下一轮仍能正确推进(用 `page * pageSize` 而不是「已加载条数」,避免跳数据)。

## 搜索框输入触发远端搜索

`keyCode` 是搜索字段名——业务侧在输入框敲字后,组件会把查询词按 `keyCode` 作为 key 提交给后端,**自动远端搜索**。

- 默认 `keyCode="keyCode"` → 请求参数为 `{ keyCode: 'xxx' }`
- 后端按 `?keyCode=xxx` 模糊匹配 → 接口返回匹配项
- el-select `filterable` + `remote` 自动启用,无需业务自己监听

```vue
<template>
  <ReSelect
    v-model:value="userId"
    v-model:value-name="userName"
    api="/api/users/page"
    key-code="name"  <!-- 输入"张"→请求 ?name=张 -->
    :paginated="true"
  />
</template>
```

**手动触发搜索(ref):**

```vue
<script setup>
import { ref, getCurrentInstance } from "vue";

const rsRef = ref();
function trigger() {
  // 业务侧主动按某关键词拉数据
  rsRef.value?.search("张三");
}
</script>

<template>
  <ReSelect ref="rsRef" api="/api/users" />
</template>
```

## 自定义字段映射

接口返回的字段名不一定是 `label` / `value`,可通过 `props` 自定义:

```vue
<template>
  <ReSelect
    api="/api/departments"
    :props="{ label: 'deptName', value: 'deptId' }"
    :paginated="false"
  />
</template>
```

返回数据形如 `[{deptId: 1, deptName: '研发'}]`,组件内部会按 `deptName → label`、`deptId → value` 映射。

## `showType`:拼接选中项的展示文本

`showType` 是**字段名组合**,按顺序读取,中间用 `-` 连接,**单个字段不分割**。

```ts
// 接口返回:{ id: 5, name: '张三', code: 'zhangsan', deptName: '研发' }
```

| `showType` 传值   | 选中后展示        |
| ----------------- | ----------------- |
| 不传              | 空白(不展示)      |
| `"name"`          | `张三`            |
| `"name-code"`     | `张三-zhangsan`   |
| `"deptName-name"` | `研发-张三`       |
| `"id-name-code"`  | `5-张三-zhangsan` |

```vue
<template>
  <ReSelect api="/api/users" show-type="name-code" />
</template>
```

## 拦截器:请求前置校验

`interceptorFun` 在每次接口请求发起前调用,**异步**返回 `{bool, message}` 决定是否放行:

- `bool: true` → 继续请求
- `bool: false` → 终止请求 + `ElMessage.error(message)`

```vue
<script setup lang="ts">
import { ref } from "vue";

const hasPermission = ref(false);

const interceptorFun = async () => {
  if (!hasPermission.value) {
    return { bool: false, message: "当前账号无权限查看用户列表" };
  }
  return { bool: true, message: "" };
};
</script>

<template>
  <ReSelect api="/api/users" :interceptor-fun="interceptorFun" />
</template>
```

## 回填项(`defaultOption`):编辑场景专用

编辑表单时,接口未加载完前**先显示回填值**,避免下拉框空白。接口返回后自动去重:

- 回填值 `value` 已在接口结果里 → 跳过,不重复
- 回填值 `value` 不在接口结果里(被筛选条件过滤) → 置顶保留

```vue
<script setup lang="ts">
import { ref } from "vue";

const userId = ref(5);
const userName = ref("张三"); // 编辑表单初始值

// 接口:GET /api/users?userId=5
// 返回的列表里不含 userId=5(被某筛选条件过滤掉)
// 此时回填项会置顶展示,不会消失
</script>

<template>
  <ReSelect
    v-model:value="userId"
    v-model:value-name="userName"
    api="/api/users"
    :default-option="{ value: 5, label: '张三' }"
  />
</template>
```

## 全局 fetch 注入

ReSelect 不耦合具体 HTTP 库,默认走 `window.fetch`。业务侧可通过 `provide` 替换为 `axios` / `umi-request` / `useRequest`:

```ts
// main.ts
import { createApp } from "vue";
import axios from "axios";

const app = createApp(App);
app.provide(Symbol.for("xnui:fetch"), async ({ url, method, params }) => {
  return axios.request({ url, method, params });
});
```

## 透传 `el-select` 全部属性 / 事件

`inheritAttrs: false` + `v-bind="$attrs"` 已内置,所有 `el-select` 属性与事件可写在组件上:

```vue
<ReSelect
  api="/api/users"
  filterable
  clearable
  multiple
  collapse-tags
  @change="onChange"
  @visible-change="onVisibleChange"
/>
```

## API

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成,请勿手写此段 -->

<!-- END: 自动生成段结束 -->

## 类型补充

> 上面的 `Props` 表由 `vue-docgen-api` 自动提取,部分类型被简化(如 `union`、`Record`),完整类型如下:

| 属性             | 完整类型                                                                              |
| ---------------- | ------------------------------------------------------------------------------------- |
| `value`          | `any`                                                                                 |
| `valueName`      | `string`                                                                              |
| `params`         | `Record<string, any>`                                                                 |
| `props`          | `SelectOptionProps`                                                                   |
| `otherQuery`     | `Record<string, any>`                                                                 |
| `showType`       | `string`                                                                              |
| `interceptorFun` | `() => Promise<{bool: boolean; message: string}> \| {bool: boolean; message: string}` |
| `handleRes`      | `(res: any) => any`                                                                   |
| `defaultOption`  | `{label: string; value: any} \| null`                                                 |
| `keyCode`        | `string`                                                                              |

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | `any` | `-` |  | v-model:value 双向绑定 |
| `valueName` | `string` | `""` |  | v-model:name 双向绑定的展示文本 |
| `api` | `string` | `""` |  | 接口地址 |
| `props` | `SelectOptionProps` | `() =&gt; ({ label: "label", value: "value", key: "value" })` |  | 数据项字段映射 - label: 用于展示的字段名 - value: 用于取值的字段名（同时作为 v-model 的值） - key: 可选。v-model 实际写入的字段（默认与 value 相同） |
| `params` | `Record` | `() =&gt; ({})` |  | 静态请求参数（每次请求都会带上） |
| `otherQuery` | `Record` | `() =&gt; ({})` |  | 动态请求参数（变化时自动重新拉取,深度监听） |
| `showType` | `SelectShowType` | `""` |  | 显示形式 |
| `interceptorFun` | `TSFunctionType` | `-` |  | 请求前置拦截器（异步） - 发起请求前调用 - 返回 { bool: true, message: '' } → 继续请求 - 返回 { bool: false, message: '原因' } → 终止 + ElMessage 报错 |
| `handleRes` | `TSFunctionType` | `-` |  | 处理接口返回数据 |
| `defaultOption` | `union` | `null` |  | 回填项（编辑场景专用） - 编辑打开表单时,接口未返回前先展示该回填值,避免 el-select 显示空白 - 接口返回后自动从结果中去重:   · echo.value 已在列表里 → 跳过,不重复显示   · echo.value 不在列表里（筛选条件找不到）→ 置顶保留 |
| `pageField` | `string` | `"pageNum"` |  | 分页返回的页码字段 |
| `sizeField` | `string` | `"pageSize"` |  | 分页返回的每页大小字段 |
| `totalField` | `string` | `"total"` |  | 分页返回的总数字段 |
| `listField` | `string` | `"list"` |  | 分页返回的列表字段 |
| `keyCode` | `string` | `"keyCode"` |  | 搜索框输入提交的查询参数字段名（默认 "keyCode"） |
| `pageSize` | `number` | `20` |  | 每页大小 |
| `paginated` | `boolean` | `true` |  | 是否分页（true: 滚动加载更多；false: 全量加载） |
| `paginationType` | `union` | `"page"` |  | 分页语义类型 - "page"（默认）: 页码模式。请求参数 pageField 为页码,从 1 开始（如 pageNum=1） - "offset": 偏移量模式。请求参数 pageField 为跳过条数 = page * pageSize（如 skipCount=20）  注意：内部统一使用 0 基 page 计算,仅在最终拼接请求参数时区分。 |
| `disabled` | `boolean` | `-` |  | 是否禁用 |

## Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `update:valueName` | `()` |  |
| `change` | `()` |  |
| `select` | `()` |  |
| `load-more` | `()` |  |
| `loaded` | `()` |  |

## Slots

_无 slots_


<!-- END: 自动生成段结束 -->
