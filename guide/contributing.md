# 贡献指南

请阅读 [CONTRIBUTING.md](https://github.com/M854708234/xnui/blob/main/CONTRIBUTING.md) 获取完整规范。

下面是关键要点速览：

## 目录约定

```
src/
├── components/<Name>/
│   ├── src/index.vue         # 组件实现
│   ├── src/type.ts           # 对外类型
│   ├── index.ts              # withInstall 导出
│   └── README.md             # 组件文档
└── composables/<useXxx>/
    ├── src/index.ts
    ├── index.ts
    └── README.md
```

## 新组件 PR 检查清单

- [ ] 目录结构符合规范
- [ ] `index.ts` 走 `withInstall`
- [ ] `defineOptions.name` 已设置
- [ ] props / events / slots 有 JSDoc 注释
- [ ] scoped 样式（不污染全局）
- [ ] `README.md` 已写（基础用法段）
- [ ] `pnpm build` / `typecheck` / `lint` 通过
- [ ] `pnpm docs:build` 通过
- [ ] `src/index.ts` 已导出
- [ ] `docs-site/.vitepress/config.ts` 侧边栏已追加

## 依赖边界

**允许**：`vue` / `element-plus` / `@pureadmin/*` / `dayjs` / `sortablejs` 等通用库
**禁止**：业务主项目路径（`@/views/*`、`@/api/*` 等）

## 文档站维护

- API 段由 `pnpm docs:gen` 自动从源码生成
- 修改组件 props/events 后**必须**重新跑 `pnpm docs:gen` 再 `pnpm docs:build`
