# VersionWatcher

前端静态资源刷新检测器。前端发布后，用户浏览器可能仍缓存着旧版 `index.html` 与入口脚本。`VersionWatcher` 在运行期拉取一次远端 `index.html`，提取其入口 hash 与当前已加载的 script src 对比，命中变化时弹出强制刷新弹框。

> 设计目标：拷贝到任何 **Vue3 + Vite / Webpack / Rspack** 项目都能用，零业务依赖、零 UI 框架依赖、零全局状态依赖。

## 基础用法

```vue
<!-- App.vue -->
<template>
  <router-view />
  <VersionWatcher />
</template>

<script setup>
import { VersionWatcher } from "xnui";
</script>
```

## 多打包器适配

```vue
<!-- Vite 默认即可（产物路径 /static/js/index-[hash].js） -->
<VersionWatcher />

<!-- Webpack / Rspack（产物路径 app.[hash].js） -->
<VersionWatcher :script-pattern="/app\.([\w-]+)\.js/" />
```

## 演示：手动触发

```vue
<script setup>
import { ref } from "vue";
import { VersionWatcher } from "xnui";

const vwRef = ref();
function checkManually() {
  vwRef.value?.manualCheck();
}
</script>

<template>
  <VersionWatcher ref="vwRef" />
  <el-button @click="checkManually">手动检测一次</el-button>
</template>
```

## 行为模式

- **首登**：`onMounted` 静默比对一次，记下当前 hash
- **后台恢复**：监听 `visibilitychange` + `window.focus`，切回前台时检测
- **长会话**：默认 5min 轮询，可关闭
- **命中变化**：
  - `autoRefresh=false`（默认）：弹框让用户选
  - `autoRefresh=true`：直接 `window.location.reload()`
- **冷却**：点「稍后」会写 localStorage，同一远端 hash 在 `skipDurationMs` 内不重复弹

## 部署要求

确保 `index.html` 不被强缓存。建议 nginx：

```nginx
location = /index.html {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

开发期组件自动旁路（`import.meta.env.DEV === true` 时不启用）。

<!-- BEGIN: 由 scripts/gen-docs.ts 自动生成，请勿手写此段 -->

## Props

| 名称                   | 类型                                      | 默认值                                           | 说明                                     |
| ---------------------- | ----------------------------------------- | ------------------------------------------------ | ---------------------------------------- |
| `enabled`              | `boolean`                                 | `true`                                           | 总开关，false 时整段禁用                 |
| `checkUrl`             | `string`                                  | `"/index.html"`                                  | 探测的远端 URL                           |
| `scriptPattern`        | `RegExp`                                  | vite 默认路径正则                                | 从 HTML 提取 hash 的正则，需带一个捕获组 |
| `currentScriptPattern` | `RegExp`                                  | 同 `scriptPattern`                               | 兜底：当前已加载 hash 的正则             |
| `pollMs`               | `number`                                  | `300000` (5min)                                  | 兜底定时轮询周期，`0` 表示关闭           |
| `skipDurationMs`       | `number`                                  | `1800000` (30min)                                | 「稍后」冷却时间                         |
| `skipKey`              | `string`                                  | `"__version_watcher_skip__"`                     | localStorage key                         |
| `autoRefresh`          | `boolean`                                 | `false`                                          | true 时直接 reload，不弹框               |
| `onUpdate`             | `(info: { from; to }) => void \| Promise` | -                                                | 检测到变化时触发                         |
| `title`                | `string`                                  | "检测到新版本"                                   | 弹框标题                                 |
| `content`              | `string`                                  | "系统已发布新版本，是否立即刷新以获取最新功能？" | 弹框正文                                 |
| `laterText`            | `string`                                  | "稍后再说"                                       | 「稍后」按钮文案                         |
| `refreshText`          | `string`                                  | "立即刷新"                                       | 「立即刷新」按钮文案                     |

## Events

_无内置 events，使用 `defineExpose` 暴露方法：`manualCheck()`、`clearSkip()`_

## Slots

_无 slots_

<!-- END: 自动生成段结束 -->
