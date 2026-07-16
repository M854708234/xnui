# sso — 统一登录授权

> xnui 库内置的 OAuth2 统一登录工具类（**纯 JS，零运行时依赖**）

统一封装"授权中心跳转 → 回调 code 解析 → token 交换 → 写 token → 跳转首页"三步流程，业务侧可继承、可替换。

## 特性

- **纯 JS** — 零运行时依赖（`fetch` / `URLSearchParams` 都是浏览器原生）
- **可独立打包成 JS** — `pnpm build:sso` 输出 IIFE/ESM，业务侧直接 `<script>` 引用或 `import`
- **可继承 / 可替换** — 存储 / 请求 / token 写入 / 钩子全部通过接口暴露
- **兼容现有 `src/utils/auth.ts`** — 内置 `createAuthTsAdapter`，一行对接 `setToken / getToken / removeToken`

## 三步流程

```
0. (自动) 归一回跳 URL（hash 路由项目）
   授权中心 302 → /callback?code=xxx&state=xxx（path-only）
                       │
                       ▼  normalizeCallbackUrl() (handleCallback 入口自动触发)
   /#/callback?code=xxx&state=xxx（hash 形式,Vue Router 接管）

1. redirectToAuthorize()
   GET authorizeUrl
       ?response_type=code
       &client_id=...
       &redirect_uri=...
       &scope=...
       &state=<random>

2. 授权中心 302 → redirect_uri?code=...&state=...

3. (回调页 onMounted) handleCallback()
       → 步骤 0 自动归一（如未关闭）
       → 校验 state
       → exchangeToken() POST tokenUrl  (grant_type=PortalCodeTokenExtensionGrant)
       → tokenAdapter.setToken(token)
       → 跳首页 + reload
```

## 基础用法

### 1. 登录入口

```ts
// src/views/login/index.vue
<script setup lang="ts">
import { createSsoAuth, createAuthTsAdapter } from "xnui/sso";
import { setToken, getToken, removeToken } from "@/utils/auth";

const sso = createSsoAuth(
  {
    authorizeUrl: "https://crm-test.xinning.com.cn/Portal_GC_Host/connect/authorize",
    tokenUrl:     "https://crm-test.xinning.com.cn/Portal_GC_Host/connect/token",
    clientId:     "MDM_App",
    redirectUri:  `${location.origin}/#/callback`,
    scope:        "MDM"
  },
  createAuthTsAdapter({ setToken, getToken, removeToken })
);

function goSsoLogin() {
  sso.redirectToAuthorize();
}
</script>
```

### 2. 回调页

```ts
// src/views/callback/index.vue
<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { createSsoAuth, createAuthTsAdapter } from "xnui/sso";
import { setToken, getToken, removeToken } from "@/utils/auth";

const router = useRouter();

const sso = createSsoAuth(
  { /* 同上 */ },
  createAuthTsAdapter({ setToken, getToken, removeToken, homePath: "/" })
);

onMounted(async () => {
  const res = await sso.handleCallback();
  if (!res.ok) {
    router.replace("/login");
  }
});
</script>
```

### 3. 独立打包使用（不引 xnui 整个库）

```bash
# 在 xnui 库中构建独立 JS 产物
pnpm build:sso
# 产物：dist-sso/index.{js,cjs,d.ts}    （npm subpath import 用）
#       dist-sso/xnui-sso.iife.js       （<script> 引用，挂 window.XnuiSso）
```

业务侧直接 `<script>` 引用：

```html
<script src="/static/xnui-sso.iife.js"></script>
<script>
  const { createSsoAuth, createAuthTsAdapter } = window.XnuiSso;
  const sso = createSsoAuth(
    config,
    createAuthTsAdapter({ setToken, getToken, removeToken }),
  );
  sso.redirectToAuthorize();
</script>
```

## API

### `createSsoAuth(config, tokenAdapter?)` → `UnifiedSsoAuth`

#### `SsoConfig`

| 字段                   | 类型                    | 必填 | 默认                                             | 说明                     |
| ---------------------- | ----------------------- | ---- | ------------------------------------------------ | ------------------------ |
| `authorizeUrl`         | `string`                | ✓    | —                                                | 第 1 步 GET 授权中心地址 |
| `tokenUrl`             | `string`                | ✓    | —                                                | 第 2 步 POST token 端点  |
| `clientId`             | `string`                | ✓    | —                                                | OAuth2 client_id         |
| `redirectUri`          | `string`                | ✓    | —                                                | 业务回调地址             |
| `scope`                | `string`                | ✓    | —                                                | 第 1 / 第 2 步都会带上   |
| `grantType`            | `string`                |      | `"PortalCodeTokenExtensionGrant"`                | 第 2 步 grant_type       |
| `responseType`         | `string`                |      | `"code"`                                         | 第 1 步 response_type    |
| `generateState`        | `() => string`          |      | `Math.random().toString(36).substring(2,12) × 2` | state 生成函数           |
| `stateKey`             | `string`                |      | `"__sso_state"`                                  | state 存储 key           |
| `storage`              | `SsoStorage`            |      | localStorage                                     | state 存储适配器         |
| `request`              | `SsoRequest`            |      | fetch                                            | token 端点请求实现       |
| `hooks`                | `SsoHooks`              |      | —                                                | 业务侧钩子               |
| `extraTokenParams`     | `Record<string,string>` |      | `{}`                                             | token 接口额外 form 参数 |
| `extraTokenHeaders`    | `Record<string,string>` |      | `{}`                                             | token 接口额外 header    |
| `extraAuthorizeParams` | `Record<string,string>` |      | `{}`                                             | authorize URL 额外参数   |

#### `TokenAdapter`

| 方法                   | 说明                               |
| ---------------------- | ---------------------------------- |
| `setToken(data)`       | 写入 token                         |
| `getToken()`           | 读取 token（可选）                 |
| `removeToken()`        | 清除 token（可选）                 |
| `afterLogin(homePath)` | 自定义跳转；返回 `true` 表示已处理 |

#### `UnifiedSsoAuth` 实例方法

| 方法                          | 说明                                                              |
| ----------------------------- | ----------------------------------------------------------------- |
| `buildAuthorizeUrl(extra?)`   | 构造授权 URL（不跳转）                                            |
| `redirectToAuthorize(extra?)` | 直接跳转                                                          |
| `exchangeToken(code, extra?)` | 用 code 换 token，返回 `{ token, raw }`                           |
| `handleCallback(opts?)`       | 回调页一站式：解析 code → 校验 state → 换 token → 写 token → 跳转 |
| `logout()`                    | 清 token + 清 state                                               |
| `isAuthenticated()`           | 是否有 token                                                      |

### `SsoHooks`

| 钩子                                | 触发时机                                                     |
| ----------------------------------- | ------------------------------------------------------------ |
| `onState(state)`                    | 第 1 步生成 state 后                                         |
| `onCode(code, state)`               | 回调页解析到 code 后                                         |
| `onStateMismatch(expected, actual)` | state 校验失败                                               |
| `onLoginSuccess(token, raw)`        | 第 2 步成功后                                                |
| `onError(err, stage)`               | 任意一步失败，stage = `'authorize' \| 'callback' \| 'token'` |
| `beforeRedirectHome()`              | 跳转首页前最后机会                                           |
| `homePath`                          | 默认首页路径，默认 `"/"`                                     |
| `redirectHomeMode`                  | `'replace' \| 'assign' \| 'none'`                            |

## 第三方继承示例

### 替换请求为 axios

```ts
import axios from "axios";
import { UnifiedSsoAuth, type SsoRequest } from "xnui/sso";

const axiosRequest: SsoRequest = {
  async postForm<T>(url, body, headers) {
    const form = new URLSearchParams(body as any);
    const res = await axios.post<T>(url, form.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...headers,
      },
    });
    return res.data;
  },
};

const sso = new UnifiedSsoAuth({ ...config, request: axiosRequest });
```

### 用 cookie 存 state

```ts
import { createSsoAuth, createCookieAdapter } from "xnui/sso";

const sso = createSsoAuth({ ...config, storage: createCookieAdapter(0) });
```

### 子类化

```ts
import { UnifiedSsoAuth } from "xnui/sso";

class MySso extends UnifiedSsoAuth {
  protected onLogin(token: any) {
    localStorage.setItem("my-user-info", JSON.stringify(token));
  }
}
```

## 路径归一（hash 路由项目必看）

OAuth2 授权中心 302 跳到 `redirect_uri` 时通常只带 query，不带 hash：

```
/callback?code=xxx&state=xxx
```

而 Vue Router **hash 模式** 期望：

```
/#/callback?code=xxx&state=xxx
```

xnui/sso 在 `handleCallback()` 入口会自动检测当前 URL，如果命中 `callbackPathname`（默认 `/callback`）且 `location.hash` 还未对齐，会用 `location.replace()` 301 一次到 hash 形式，业务侧零感知。

### 关闭自动归一

```ts
// history 路由项目（不需要归一）
const sso = createSsoAuth({
  ...,
  callbackPathname: ""           // 关闭
});

// 或
const sso = createSsoAuth({
  ...,
  autoNormalizeCallback: false
});
```

### 手动调用（在 main.ts 顶部）

如果想在 `handleCallback` 之前同步归一（不依赖 Vite import 提升），可以直接在 main.ts 顶部调用：

```ts
// main.ts
import { normalizeCallbackUrl } from "xnui/sso";
normalizeCallbackUrl();
```

或 `<script>` 标签引用 IIFE 产物：

```html
<script src="/static/xnui-sso.iife.js"></script>
<script>
  XnuiSso.normalizeCallbackUrl();
</script>
```

### API

```ts
// 单参：传 pathname 字符串
normalizeCallbackUrl("/callback"); // 兼容旧调用

// 多参：传对象
normalizeCallbackUrl({
  pathname: "/auth/callback", // 自定义回调路径
  mode: "replace", // 'replace' | 'assign'
});

// 仅检测，不跳转
isPathOnlyCallbackUrl(window.location, "/callback"); // true / false
```

<!-- BEGIN: 由 scripts/gen-sso-docs.ts 自动生成，请勿手写此段 -->

## 公共 API

> 本段由 `pnpm docs:gen:sso` 从 `src/sso/src/*.ts` 自动生成，请勿手写。

### 配置

### `SsoConfig`
SSO 全部可配置项

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `authorizeUrl` | `string` | ✓ | 第 1 步：授权中心地址（GET），如 https://crm-test.xinning.com.cn/Portal_GC_Host/connect/authorize |
| `tokenUrl` | `string` | ✓ | 第 2 步：token 交换地址（POST），如 https://crm-test.xinning.com.cn/Portal_GC_Host/connect/token |
| `clientId` | `string` | ✓ | OAuth2 client_id |
| `redirectUri` | `string` | ✓ | 业务回调页地址，必须与 authorizeUrl 里 redirect_uri 一致 |
| `scope` | `string` | ✓ | 授权 scope，第 1 / 第 2 步都会带上 |
| `grantType` | `string?` |  | 第 2 步 grant_type，默认 "PortalCodeTokenExtensionGrant"（业务可覆盖） |
| `responseType` | `string?` |  | response_type，默认 "code" |
| `generateState` | `() =&gt; string?` |  | state 生成函数，默认 Math.random().toString(36).substring(2,12) × 2 |
| `stateKey` | `string?` |  | 存储 state 的 key（localStorage / cookie），默认 "__sso_state" |
| `storage` | `SsoStorage?` |  | 自定义存储适配器（默认 localStorage） |
| `request` | `SsoRequest?` |  | 自定义请求实现（默认 fetch + x-www-form-urlencoded） |
| `hooks` | `SsoHooks?` |  | 业务侧钩子 |
| `extraTokenParams` | `Record&lt;string, string&gt;?` |  | token 端点额外 form 参数（如 tenantId） |
| `extraTokenHeaders` | `Record&lt;string, string&gt;?` |  | token 端点额外 header（如 __tenant） |
| `extraAuthorizeParams` | `Record&lt;string, string&gt;?` |  | 是否在授权 URL 上额外追加 prompt=consent 等参数 |
| `callbackPathname` | `string?` |  | 回调页 pathname（用于自动归一 path-only → hash 形式） |
| `autoNormalizeCallback` | `boolean?` |  | 归一化时是否真的触发跳转（默认 true） 仅在 normalize 阶段为 false 时 handleCallback 不会自动跳，但代码逻辑不变。 业务侧一般不需要改。 |
| `callbackNormalizeMode` | `"replace" \| "assign"?` |  | 归一化时跳转方式：默认 "replace"（不污染 history） 可改 "assign" |

### 存储适配器

### `SsoStorage`
抽象存储接口 —— 业务侧可继承/实现 localStorage / cookie / sessionStorage / localforage 等 与现有 src/utils/auth.ts 中的 setToken / getToken / removeToken 兼容： 业务侧可在 hooks.onLoginSuccess 里自行调用 setToken，本接口只用于 state 暂存

**方法**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `getItem` | `getItem(key: string): string \| null` | - |
| `setItem` | `setItem(key: string, value: string): void` | - |
| `removeItem` | `removeItem(key: string): void` | - |

### 请求适配器

### `SsoRequest`
自定义 HTTP 请求接口 —— 第三方可以传入自家 axios 实例 / 拦截器 默认实现是 fetch + x-www-form-urlencoded

**方法**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `postForm` | `postForm(url: string, body: Record&lt;string, string&gt;, headers?: Record&lt;string, string&gt;): Promise&lt;T&gt;` | 发送表单 POST 请求 |

### Token 响应

### `TokenResponse`
标准化后的 token 响应（兼容 OAuth2 标准字段，PortalCodeGrant 不一定都返回） 业务侧在 onLoginSuccess 拿到此对象后，可以直接 setToken / Cookies.set / 等任意方式

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `access_token` | `string?` |  | - |
| `token_type` | `string?` |  | - |
| `expires_in` | `number?` |  | - |
| `refresh_token` | `string?` |  | - |
| `scope` | `string?` |  | - |

### 业务钩子

### `SsoHooks`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `homePath` | `string?` |  | 默认首页路径，默认 "/" |
| `redirectHomeMode` | `"replace" \| "assign" \| "none"?` |  | 跳转首页的方式，默认 "location.replace"；可改 "location.href" 或返回 false 表示业务侧自行跳转 |

**方法**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `onState` | `onState(state: string): void` | 第 1 步：生成 state 后回调（默认行为：写入 storage.stateKey） |
| `onCode` | `onCode(code: string, state: string): void` | 回调页：解析到 code 后、调 token 接口前（可用于埋点） |
| `onStateMismatch` | `onStateMismatch(expected: string, actual: string): void` | 回调页：state 校验失败（默认行为：触发 onError） |
| `onLoginSuccess` | `onLoginSuccess(token: TokenResponse, raw: unknown): void` | 第 2 步：登录成功后 业务侧在这里 setToken / Cookies.set / sessionStorage.setItem 都行， 然后跳转业务首页 + location.reload()。 也可以选择不写本钩子，自己在 exchangeToken() 拿到返回值后处理。 |
| `onError` | `onError(err: Error, stage: SsoStage): void` | 任意一步失败 |
| `beforeRedirectHome` | `beforeRedirectHome(): void \| Promise&lt;void&gt;` | 跳转业务首页前的最后机会（用于清缓存、改 store、埋点等） |

### Token 适配器

### `TokenAdapter`
Token 写入 / 读取 / 清除接口 与 src/utils/auth.ts 的 setToken / getToken / removeToken 完全对应

**方法**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `setToken` | `setToken(data: TokenResponse & Record&lt;string, any&gt;): void` | 写入 token（登录成功时调用） |
| `getToken` | `getToken(): unknown` | 读取当前 token（可选，业务侧校验是否已登录） |
| `removeToken` | `removeToken(): void` | 清除 token（登出 / state 校验失败时调用） |
| `afterLogin` | `afterLogin(homePath: string): boolean \| void \| Promise&lt;boolean \| void&gt;` | 业务侧登录成功后的跳转行为（默认：location.replace(homePath)） 返回 false 表示业务侧已经自行跳转，不需要再处理 |

### 辅助类

### `class SsoHttpError`
自定义错误类型，附带响应信息便于业务侧定位

**构造函数**：`new SsoHttpError(message: string, status: number, body: unknown)`

**属性**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `status` | `number` | - |
| `body` | `unknown` | - |

### 主类

### `class UnifiedSsoAuth`

**构造函数**：`new UnifiedSsoAuth(config: SsoConfig, tokenAdapter?: TokenAdapter)`

**属性**

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `config` | `function` | 合并 + 规范化后的配置（只读快照） |
| `tokenAdapter` | `TokenAdapter` | 业务侧鉴权适配器（兼容 setToken / getToken） |

**方法**

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `buildAuthorizeUrl` | `buildAuthorizeUrl(extra?: Record&lt;string, string&gt;): string` | 构造授权中心完整 URL（含 state），并自动持久化 state 业务侧可拿到 URL 自行处理（埋点 / iframe 等），不一定要跳转 |
| `redirectToAuthorize` | `redirectToAuthorize(extra?: Record&lt;string, string&gt;): void` | 直接跳转授权中心（一行完成第 1 步） |
| `exchangeToken` | `exchangeToken(code: string, extra?: Record&lt;string, string&gt;): Promise&lt;{ token: TokenResponse; raw: unknown }&gt;` | 用 code 换取 access_token 返回原始响应 + 标准化后的 TokenResponse，业务侧完全控制写 token 的方式 |
| `handleCallback` | `handleCallback(opts?: { cbUrl?: string; tokenExtra?: Record&lt;string, string&gt;; }): Promise&lt;...&gt;` | 回调页 `onMounted` 里直接调用：解析 code / state → 校验 → 换 token → 写 token → 跳转 |
| `logout` | `logout(): void` | 主动登出（清 token + 清 state） |
| `isAuthenticated` | `isAuthenticated(): boolean` | 是否已登录（业务侧可自定：有 token 就算） |

### 工厂函数

### `createSsoAuth(config: SsoConfig, tokenAdapter?: TokenAdapter): UnifiedSsoAuth`
工厂函数 —— 推荐业务侧用这个，不用 new

**参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `config` | `SsoConfig` | ✓ | - |
| `tokenAdapter` | `TokenAdapter` |  | - |

**返回**：`UnifiedSsoAuth`

### `createLocalStorageAdapter(): SsoStorage`
默认 localStorage 适配器

**返回**：`SsoStorage`

### `createSessionStorageAdapter(): SsoStorage`
默认 sessionStorage 适配器

**返回**：`SsoStorage`

### `createCookieAdapter(defaultDays?: any): SsoStorage`
Cookie 适配器（零依赖，自己序列化）

**参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `defaultDays` | `any` |  | - |

**返回**：`SsoStorage`

### `createMemoryAdapter(): SsoStorage`
内存适配器（SSR / 测试 / Node 环境兜底） - 不持久化，刷新即丢

**返回**：`SsoStorage`

### `createFetchRequest(): SsoRequest`
默认 fetch 实现 - 不带任何 cookie（credentials: 'omit'），与 OAuth2 token 端点一致，避免 CSRF 中间件误判 - Content-Type: application/x-www-form-urlencoded

**返回**：`SsoRequest`

### `createAuthTsAdapter(deps: object): TokenAdapter`
把现有 src/utils/auth.ts 的 setToken 包装成 TokenAdapter

**参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `deps` | `object` | ✓ | - |

**返回**：`TokenAdapter`

### `createDefaultTokenAdapter(opts?: { storageKey?: string; homePath?: string; redirectMode?: "replace" | "assign"; }): TokenAdapter`
默认 TokenAdapter（适合没有 auth.ts 的第三方项目） - 仅写 sessionStorage（关闭浏览器即失效） - 跳转用 location.assign

**参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `opts` | `{ storageKey?: string; homePath?: string; redirectMode?: "replace" \| "assign"; }` |  | - |

**返回**：`TokenAdapter`

### `createCookieTokenAdapter(opts?: { tokenKey?: string; userKey?: string; homePath?: string; }): TokenAdapter`
Cookie TokenAdapter（零依赖，自己序列化） - 与 src/utils/auth.ts 中基于 js-cookie 的写入格式一致： Cookies.set("authorized-token", JSON.stringify({ accessToken, expires, refreshToken }))

**参数**

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `opts` | `{ tokenKey?: string; userKey?: string; homePath?: string; }` |  | - |

**返回**：`TokenAdapter`


<!-- END: 自动生成段结束 -->

## 目录结构

```
src/sso/
├── README.md          # 本文档
├── index.ts           # xnui 库 sso subpath 出口
└── src/
    ├── types.ts         # SsoConfig / SsoStorage / SsoRequest / SsoHooks / TokenResponse
    ├── storage.ts       # localStorage / sessionStorage / cookie / memory
    ├── request.ts       # 默认 fetch + URLSearchParams + SsoHttpError
    ├── auth-adapter.ts  # TokenAdapter + 3 个工厂（auth.ts / 默认 / cookie）
    ├── normalize.ts     # normalizeCallbackUrl / isPathOnlyCallbackUrl  (path-only → hash 归一)
    ├── iife-entry.ts    # IIFE 入口：window.XnuiSso
    └── index.ts         # UnifiedSsoAuth + createSsoAuth + 重导出
```
