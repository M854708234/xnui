# xnui 文档站（GitHub Pages 部署仓库）

本仓库托管 [xnui](https://github.com/M854708234/xnui) 组件库的文档站，
通过 GitHub Actions 自动构建并部署到 <https://M854708234.github.io/xnui/>。

## 数据来源

本仓库的 **所有文档内容**（`.vitepress/`、`components/`、`composables/`、
`guide/`、`examples/`、`index.md` 等）由主仓库通过 **snapshot 方式**同步：
主仓库维护者运行 `pnpm docs:publish`，脚本把当前的 `docs-site/` 内容**作为单个
commit** 推送到本仓库，**不带历史**。

> 为什么不直接 `git subtree push`：subtree 会把子树历史（含老 commit 中残留的
> 文档内容）一并推送，老历史若含敏感字符串（如示例 PAT）会被 GitHub Secret
> Scanning 拦截。snapshot 模式只携带 HEAD 时刻的内容，干净可控。

**请勿在本仓库手动编辑内容** —— 下次 snapshot 推送会被覆盖。

本仓库只维护：

- `package.json` —— VitePress 构建依赖
- `.github/workflows/docs.yml` —— GitHub Pages 部署 workflow
- `.gitignore`
- `README.md`（本文件）

## 主仓库维护者操作流程

```bash
# 1. 在主仓库编辑 docs-site/ 内容
# 2. 修改了组件时必须跑：
pnpm docs:gen
# 3. 编辑完文档后：
pnpm docs:publish
#    脚本会：拉取 docs 仓库到本地（首次）→ 清空除 .git 外的所有文件 →
#            拷贝当前 docs-site/ 内容 + 辅助文件（package.json 等）→
#            单 commit → 推送到 GitHub main
# 4. 等待本仓库的 GitHub Actions 触发自动部署
```

`pnpm docs:publish` 的工作目录（docs 仓库本地 clone）由 `DOCS_REPO_DIR` 环境
变量控制，默认 `D:\magic\xnui-docs\`（脚本会自动 `git clone`）。

## 仓库设置

本仓库需要首次在 GitHub Web 端做一次配置：

- **Settings → Pages → Build and deployment → Source**：
  选 **GitHub Actions**（默认即可，workflow 已写好）

## License

UNLICENSED - 企业内部使用
