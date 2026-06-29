# 发版流程（维护者）

把 `xnui` 从 `main` 分支发布到 TFS Azure Artifacts `xn-ui-local` feed 的完整流程。

> 这一页是给**维护者**的——给消费方看的请看 [安装](./installation)。

## 0. 前置：申请 TFS PAT

1. 打开 `http://172.28.1.17:8080/tfs/PT7/_usersSettings/tokens`
2. **New Token**：
   - Name：任意（例如 `xnui-publish`）
   - Scope：勾选 **`Packaging: Read & write & manage`**（"Read only" 装不上，发布也发不出去）
   - Expiration：自定
3. **复制 token**（关闭弹窗后无法再查看，只能重置）
4. 确认你能打开 `http://172.28.1.17:8080/tfs/PT7/XNUI/_packaging?_a=feed&feed=xn-ui-local`，并已被加入 `xn-ui-local` feed 的 `Contributor` 角色

> 🪤 TFS 给出的 .npmrc 片段里 `_password` 字段是 **base64 编码**，**真 PAT 是它的 decoded 值**。直接拿 `_password` 当 PAT 用一定会 401。

## 1. 解析真 PAT

把 TFS 给你的 `_password` 字符串 base64 decode 一次：

```powershell
# 把 TFS 提供的 _password 字符串贴到 <B64>
[System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("<B64>"))
```

或者用 Node：

```bash
node -e "console.log(Buffer.from('<B64>','base64').toString())"
```

输出 52 字符的字符串就是真 PAT，**妥善保管，不要贴进任何 commit / issue / 文档 / 截图**（GitHub Secret Scanning 会自动识别并拦截推送，示例值同样会触发）。

## 2. 写入 Basic auth 凭据

TFS 这台**只吃 Basic auth，不吃 Bearer**。且 pnpm 的解析优先级是：

```
_authToken  >  _auth  >  _username + _password
```

所以**绝对不能设 `_authToken`**——一旦设了，pnpm 会优先发 Bearer，401。

> ⚠️ 还有个隐藏坑：项目级 `.npmrc` 里**禁止包含环境变量**（pnpm 11 安全策略），所以也不能用 `${XN_NPM_TOKEN}` 引用 env var。

把凭据写到 user-level pnpm config（不进项目，不进 git）：

```powershell
$pat = "<decoded PAT>"   # 上面第 1 步拿到的真 PAT
$auth = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("xn-ui-local:$pat"))

pnpm config set --location user "//172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/registry/:_auth" $auth
pnpm config set --location user "//172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/:_auth"           $auth
```

## 3. 检查项目 `.npmrc`（提交到 git）

```ini
registry=http://172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local/npm/registry/
always-auth=true
```

> ⚠️ **关键约束：`registry` 必须跟 `package.json` 的 `publishConfig.registry` 完全一致**。npm/pnpm 找 auth 是按 `.npmrc` 里 `registry` 这个 URL 匹配的，跟 `publishConfig` **无关**。如果两边不一致，set 在 publish URL 下的 auth 永远用不上，publish 一直 401。
>
> 上一次踩坑：`.npmrc` 里是 `XNUI`（已废弃的大写 feed），`publishConfig` 是 `xn-ui-local`（小写），结果 publish 一直 401 直到把 `.npmrc` 改齐。

## 4. 验证 auth 通了

```bash
pnpm view xnui versions
# 期望输出类似：
# [
#   "0.1.0",
#   "0.1.1"
# ]
```

如果这里 401，**不要继续 publish**，先回第 2 步排查 auth。

> 提示：`npm view` 不读 pnpm config，必须用 `pnpm view`。

## 5. 发版

```bash
# 1) 选个版本号
pnpm version patch       # 0.1.0 → 0.1.1
# 或
pnpm version minor       # 0.1.0 → 0.2.0
pnpm version major       # 0.1.0 → 1.0.0
pnpm version prerelease --preid=beta   # → 0.1.1-beta.0

# 这一步会自动：改 package.json + 提交 + 打 tag vX.Y.Z
```

```bash
# 2) 推 commit + tag
git push --follow-tags
```

```bash
# 3) 发到 feed
#    prepublishOnly 会自动跑 pnpm build
pnpm publish
# 期望最后一行：✔ Published package xnui@<version>
```

```bash
# 4) 验证
pnpm view xnui versions
```

## 6. 完整 release 脚本

`package.json` 里已配好：

| 脚本                 | 效果                                        |
| -------------------- | ------------------------------------------- |
| `pnpm release:patch` | bump + publish latest                       |
| `pnpm release:minor` | bump + publish latest                       |
| `pnpm release:major` | bump + publish latest                       |
| `pnpm release:beta`  | bump 到 `<ver>-beta.0` + publish beta tag   |
| `pnpm release:rc`    | bump 到 `<ver>-rc.0` + publish rc tag       |
| `pnpm release:alpha` | bump 到 `<ver>-alpha.0` + publish alpha tag |

这些脚本会跑 `pnpm version` + `pnpm publish` 但**不会** `git push`——commit 和 tag 仍需手动 `git push --follow-tags` 推到 TFS。

## 故障排查

| 现象                                                                                                          | 真因                                                                                               | 修法                                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm publish` 报 `E401 Unable to authenticate, need: Bearer, Basic, NTLM`，但 `curl -u` 测同一个 header 能通 | pnpm 配置里残留了 `_authToken`，优先级比 `_auth` 高，会先发 Bearer；这台 TFS **只吃 Basic**        | `pnpm config delete --location user/project/global ...xn-ui-local.../:_authToken` 全部清掉，只留 `_auth` |
| `pnpm publish` 报 401，curl 用 `base64("xn-ui-local:<PAT>")` 也是 401                                         | PAT 是 TFS 给的 `_password` 字段的 **base64 编码**，直接当 PAT 用了                                | 把 `_password` base64 decode 一次再当 PAT（见第 1 步）                                                   |
| `pnpm view` 成功但 `pnpm publish` 401；curl 测 URL+auth 都通                                                  | `.npmrc` 里 `registry` 跟 `publishConfig.registry` 不一致；pnpm 按 `.npmrc` 的 URL 找 auth，找不到 | 把 `.npmrc` 的 `registry` 改跟 `publishConfig.registry` 完全一致                                         |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` / `Lockfile failed supply-chain policy check` 报一堆 401             | `.npmrc` 的 registry 没 auth，pnpm 11 验证每个 lockfile entry 时拿不到凭据                         | 同上：把 registry 改对，并保证该 registry 下有可用 auth                                                  |
| `Git: Unclean working tree` 拒绝 publish                                                                      | working tree 有未提交改动（常见于发版前临时修了 `.npmrc`）                                         | 先 `git add` + `git commit` 改动；或者用 `pnpm publish --no-git-checks` 跳过                             |

## 紧急清理

auth 配置乱了的时候，一次性清掉所有 user / project / global 残留：

```powershell
$base = "//172.28.1.17:8080/tfs/PT7/_packaging/xn-ui-local"
$keys = @("/registry/:_auth", "/:auth", "/registry/:_authToken", "/:authToken",
          "/registry/:_username", "/:username", "/registry/:_password", "/:password")
$locations = @("user", "project", "global")

foreach ($loc in $locations) {
  foreach ($k in $keys) {
    pnpm config delete --location $loc "$base$($k -replace '/:auth$','/:_auth')" 2>$null
  }
}
```

清完后重新走第 2 步写入正确的 `_auth` 即可。
