# 安装

从零搭一个 Vue 3 项目，将 `xnui` 从公司内部 TFS Azure Artifacts feed 装进来跑通。

## 0. 前置：申请 TFS PAT

> ⚠️ 这一步是**装包之前唯一需要人工做的事**，后续都是命令。

1. 打开 `http://172.28.1.17:8080/tfs/PT7/_usersSettings/tokens`
2. **New Token**：
   - Name：任意（例如 `xnui-local-dev`）
   - Scope：勾选 **`Packaging: Read & write & manage`**（仅 "Read only" 无法安装，发布也发不出去）
   - Expiration：自定
3. **复制 token**（关闭弹窗后就无法再查看，只能重置）
4. 确认你能在 TFS 网页中打开 `http://172.28.1.17:8080/tfs/PT7/XNUI/_packaging?_a=feed&feed=xn-ui-local` —— 如果看不到，请 TFS 管理员将你加入 `xn-ui-local` feed 的 `Contributor` 角色

> 🪤 **常见 401** 大多由 PAT 问题引起：scope 不够、token 复制错位、使用了他人账号的 token。

## 1. 配置 registry 和认证

TFS 走的是 **Basic auth**（而非 Bearer），并且 **auth 必须放在 user-level `~/.npmrc`，绝不能放进项目级 `.npmrc`**：

- 项目级 `.npmrc` 会被 commit 到 git，放进任何凭据都会泄漏
- pnpm 11 安全策略：项目级 `.npmrc` 中**禁止包含环境变量**（`${XN_NPM_TOKEN}` 之类），否则会持续报 `Ignored project-level auth setting` 警告

### 1.1 清理旧配置（如果之前按老文档配过）

```powershell
# 1) 清空项目级 .npmrc 中的所有 auth 行（保留 registry / always-auth）
$npmrc = ".\.npmrc"
(Get-Content $npmrc) | Where-Object { $_ -notmatch "_auth" } | Set-Content $npmrc

# 2) 打开 user-level ~/.npmrc，手动删掉任何带 _authToken / _auth / XNUI / xn-ui-local 的旧条目
notepad $env:USERPROFILE\.npmrc
```

> 这一步是消除 `Ignored project-level auth setting` 警告的前提。

### 1.2 项目级 `.npmrc`（**只放 registry**，提交到 git）

```ini
registry=http://172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/registry/
always-auth=true
```

### 1.3 在 user-level `~/.npmrc` 写入 Basic auth 凭据

```powershell
# 将 <PAT> 替换为你在 TFS 上复制的 token
$pat = "<PAT>"
$auth = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("xn-ui-local:$pat"))

# 写到 user-level ~/.npmrc —— 不进项目，不进 git，不触发 pnpm 警告
pnpm config set --location user "//172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/registry/:_auth" $auth
pnpm config set --location user "//172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/:_auth" $auth
```

> ⚠️ **user-level `~/.npmrc` 中不能有针对同一 feed 的旧 `_authToken`**：`_authToken` 优先级 > `_auth`，会覆盖 Basic auth 导致 401。
>
> 验证方式：
>
> ```powershell
> pnpm view xnui --registry http://172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/registry/
> ```
>
> 正常应看到 `authorization header: Basic ...` 而非 `Bearer ...`。

### 1.4 CI/CD 中使用 System.AccessToken

在 Azure Pipeline 中，无需手动配置 PAT。在 install 步骤前添加以下任务：

```yaml
- task: npmAuthenticate@0
  displayName: "Azure Artifacts 认证（消费 xnui）"
  inputs:
    workingFile: .npmrc
```

`npmAuthenticate@0` 会自动将 `$(System.AccessToken)` 注入 `.npmrc` 的认证槽位。

## 2. 安装包

```powershell
pnpm add xnui
```

> 推荐在 `package.json` 中锁 minor 版本：`"xnui": "^0.1.0"`

### 关于 peerDependencies

`xnui` 将以下包作为 peer 依赖，**不直接打包**，主项目必须自行安装：

| 包                 | 版本      |
| ------------------ | --------- |
| `vue`              | `^3.5.0`  |
| `element-plus`     | `^2.11.0` |
| `@pureadmin/table` | `^3.3.0`  |
| `@pureadmin/utils` | `^2.6.0`  |
| `@vueuse/core`     | `^14.0.0` |

如果你的 `package.json` 中已包含上述依赖，pnpm 11+ 会自动处理它们。如果遇到 peer dep 警告，手动安装即可。

### 常见坑：pnpm workspace 干扰

如果你的项目位于某个 monorepo 仓库的子目录中，pnpm 11 可能会将子目录视为 workspace 成员，导致 `pnpm install` 报 "Already up to date" 但不实际安装依赖。

解决方法（二选一）：

```powershell
# 方案 A：安装时跳过 workspace 模式
pnpm install --ignore-workspace

# 方案 B：在父仓库的 pnpm-workspace.yaml 中添加 packages: [] 显式声明空 workspace
```

## 3. 注册全局组件

> ⚠️ **这一步极易遗漏**，遗漏会导致表格渲染为空白，或控制台报 `Failed to resolve component: pure-table`。

`xnui` 故意不代为注册 `<pure-table>`（避免重复注册），你需要在 `src/main.ts` 中手动挂载一次：

```ts
// src/main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { PureTable } from "@pureadmin/table";
import "element-plus/dist/index.css";
import "xnui/style.css";

import App from "./App.vue";

const app = createApp(App);
app.use(ElementPlus, { locale: zhCn });
app.use(PureTable); // ← 关键：xnui 的 RePageTable / RePureTableBar 内部依赖 <pure-table>
app.mount("#app");
```

## 4. 编写第一个页面

以下是一个最小可运行示例，包含搜索栏和分页表格：

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from "vue";
import {
  BaseLayout,
  ReSearchBar,
  RePageTable,
  useTable,
  type SearchField,
} from "xnui";

type User = { id: number; name: string; status: 0 | 1 };
const FULL: User[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `user-${i + 1}`,
  status: i % 3 === 0 ? 0 : 1,
}));

const fields: SearchField[] = [
  {
    prop: "keyword",
    type: "input",
    default: "",
    props: { placeholder: "姓名" },
  },
];

const { query, selected, getList } = useTable<User, { keyword: string }>({
  searchFields: fields,
  fetchList: async (page, size, q) => {
    const list = q.keyword
      ? FULL.filter((u) => u.name.includes(q.keyword))
      : FULL;
    return {
      list: list.slice((page - 1) * size, page * size),
      total: list.length,
    };
  },
});

const columns = [
  { type: "selection", width: 50 },
  { prop: "id", label: "ID", width: 80 },
  { prop: "name", label: "姓名", minWidth: 120 },
  { prop: "status", label: "状态", width: 90 },
];
</script>

<template>
  <BaseLayout>
    <ReSearchBar
      v-model="query"
      :fields="fields"
      @search="getList"
      @reset="getList"
    />
    <RePageTable
      :columns="columns"
      :get-list="getList"
      v-model:selected="selected"
    />
  </BaseLayout>
</template>
```

## 5. Vite 配置

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: { port: 5174, strictPort: true, host: "127.0.0.1" },
});
```

## 6. 启动

```powershell
pnpm dev
# → http://127.0.0.1:5174/
# 应看到 BaseLayout 布局 + 搜索栏 + 47 条模拟用户数据的分页表格
```

## 故障排查

| 现象                                                     | 真因                                                                         | 修法                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `[WARN] Ignored project-level auth setting ... env vars` | 项目级 `.npmrc` 里残留 `_authToken=${XN_NPM_TOKEN}` 这类带环境变量的 auth 行 | 运行 1.1 节清理脚本删掉项目级 `_auth` 行；auth 必须放 user-level `~/.npmrc`      |
| `pnpm install` 报 "Already up to date" 但未安装          | 父目录 `pnpm-workspace.yaml` 缺少 `packages: []`                             | 添加 `packages: []` 或使用 `pnpm install --ignore-workspace`                     |
| `ERR_PNPM_FETCH_401` 报 Bearer `yyjw...`                 | user-level `~/.npmrc` 中存在旧 `_authToken` 优先级高于 `_auth`               | 移除 user-level `~/.npmrc` 中针对同 feed 的 `_authToken=...` 行                  |
| 表格空白，看不到数据行                                   | 未注册 `PureTable` 全局组件                                                  | 在 `main.ts` 中添加 `app.use(PureTable)`                                         |
| 401 with Basic auth                                      | PAT scope 缺少 `Packaging: write & manage`                                   | 重新生成 PAT，勾选完整 packaging 权限                                            |
| `ERR_PNPM_SQLITE unable to open database file`           | pnpm store 索引损坏                                                          | 执行 `pnpm store prune`；若无效，删除 `D:\.pnpm-store\v11` 后重试                |
| `Access is denied` 修改 `C:\Users\Administrator\.npmrc`  | 沙箱权限限制                                                                 | 通过 `pnpm config set --location user` 间接修改；或者让管理员在 GUI 环境手动编辑 |

## 升级 / 降级

```powershell
# 升级到最新版本
pnpm update xnui --latest

# 安装特定版本
pnpm add xnui@0.2.0

# 升级到最新 beta 版本（QA 验证用）
pnpm add xnui@beta
```

发布版本由 [xnui 仓库](https://github.com/M854708234/xnui) 维护者本地执行 `pnpm release:<kind>` 发到 Azure Artifacts `xn-ui-local` feed；消费方只需修改 `package.json` 中的版本范围并执行 `pnpm install`。
