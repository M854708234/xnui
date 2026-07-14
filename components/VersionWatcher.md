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

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| `enabled` | `boolean` | `true` |  | 总开关 |
| `checkUrl` | `string` | `"/index.html"` |  | 探测的远端 URL（默认走当前站点 /index.html） |
| `scriptPattern` | `RegExp` | `() =&gt; /\/static\/js\/index-([\w-]+)\.js/` |  | 从 HTML 中提取入口 hash 的正则，需命中第一个捕获组（hash 字符串） |
| `currentScriptPattern` | `RegExp` | `() =&gt; /\/static\/js\/index-([\w-]+)\.js/` |  | 兜底：从当前 document 提取当前 hash 的正则（默认同 scriptPattern） |
| `pollMs` | `number` | `5 * 60 * 1000` |  | 定时轮询（毫秒）。设为 0 表示关闭，默认 5 分钟 |
| `skipDurationMs` | `number` | `30 * 60 * 1000` |  | 「稍后」冷却时间（毫秒），默认 30 分钟 |
| `skipKey` | `string` | `"__version_watcher_skip__"` |  | localStorage 跳过记录的 key，便于多站并存 |
| `autoRefresh` | `boolean` | `false` |  | true 时检测到新版本直接 reload，不弹框 |
| `onUpdate` | `TSFunctionType` | `undefined` |  | 检测到新版本时触发；返回 Promise resolve 后再决定弹框/reload |
| `title` | `string` | `"检测到新版本"` |  | 弹框标题 |
| `content` | `string` | `"系统已发布新版本，是否立即刷新以获取最新功能？"` |  | 弹框正文 |
| `laterText` | `string` | `"稍后再说"` |  | 弹框「稍后」按钮文案 |
| `refreshText` | `string` | `"立即刷新"` |  | 弹框「立即刷新」按钮文案 |

## Events

_无 events_

## Slots

_无 slots_


<!-- END: 自动生成段结束 -->
