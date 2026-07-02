# useDict

字典组合式 API:按 `typeNo` 加载字典、命中 store 缓存则不重复请求,`options` 响应式。

## 一次性注册数据源

同 `DictSelect`,在 `main.ts` 注入 fetcher(详见 [DictSelect 文档](../components/DictSelect#一次性注册数据源))。

## 基础用法

```ts
import { useDict } from "xnui";

const { options, items, loading, getName, getItem } = useDict("user_status");

// options.value = [{ label: '启用', value: '1' }, ...]
```

## 动态 typeNo

`typeNo` 接收字符串或 `() => string`,函数形式会自动 `watch`,typeNo 变化时重新加载。

```ts
const dictType = ref("user_status");
const { options } = useDict(() => dictType.value);

watch(dictType, v => {
  /* options 自动重载 */
});
```

## 强制刷新 / 失效

```ts
const { refresh, invalidate } = useDict("user_status");

// 重新拉一次（绕过缓存）
await refresh();

// 清缓存，下次再读时重新拉
invalidate();
```

## 按 code 查名称 / 字典项

```ts
const { getName, getItem } = useDict("user_status");

getName("1");       // => "启用"
getItem("1");       // => { code:'1', name:'启用', isActive:true, ... }
```

## 在 useTable / 搜索栏里配合

```ts
import { useDict } from "xnui";
import { useTable } from "xnui";

const statusDict = useDict("user_status");

const { query, ... } = useTable({
  searchFields: [
    {
      prop: "status",
      type: "select",
      options: statusDict.options.value // 直接喂给 ReSearchBar
    }
  ],
  fetchList: ...
});
```

## Options

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `immediate` | `boolean` | `true` | 挂载时立即加载,设为 `false` 时需手动调 `load()` |
| `force` | `boolean` | `false` | 初始加载时强制刷新（绕过缓存） |

## 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `options` | `ComputedRef<DictSelectOption[]>` | 已转成 `{ label, value }` 形态,直接喂给 `el-select` |
| `items` | `ComputedRef<DictItem[]>` | 原始字典项列表(按 `orderBy` 排序) |
| `loading` | `Ref<boolean>` | 是否加载中 |
| `error` | `Ref<unknown>` | 最近一次错误 |
| `getName` | `(code) => string` | 通过 code 查名称 |
| `getItem` | `(code) => DictItem \| undefined` | 通过 code 查完整字典项 |
| `refresh` | `() => Promise<void>` | 强制刷新（清缓存再加载） |
| `invalidate` | `() => void` | 清缓存,下次读时再加载 |

## 内部机制

- `useDict` 内部使用 [dictStore](../components/DictSelect#一次性注册数据源) (`src/dict/store.ts` 模块级 `reactive` 单例)
- 二级索引 `code -> DictItem`,查找 O(1)
- `loadingMap` 防止并发重复请求
- 数据源通过 `setDictFetcher` 注入,`xnui` 不直接依赖 `@/api`