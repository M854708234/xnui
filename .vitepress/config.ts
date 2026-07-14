import { defineConfig } from "vitepress";

/**
 * VitePress 站点配置 —— xn-ui 文档站
 *
 * `base` 说明：
 *   - 部署到 GitHub Pages Project Pages：`/xnui/`
 *   - 也可以用 `--base <path>` CLI 参数在打包时覆盖
 *   - 本地 `vitepress dev` 不受 base 影响
 */
export default defineConfig({
  title: "xn-ui",
  description: "企业内部项目组件库（基于 Vue 3 + Element Plus + pure-admin）",
  lang: "zh-CN",
  cleanUrls: true,
  lastUpdated: true,
  // GitHub Pages Project Pages 部署路径：https://<user>.github.io/xnui/
  base: "/xnui/",

  // 站点级 head：注入 favicon、meta
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#409eff" }]
  ],

  themeConfig: {
    logo: undefined,
    siteTitle: "xn-ui",

    nav: [
      { text: "指南", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "组件", link: "/components/", activeMatch: "/components/" },
      { text: "组合式", link: "/composables/useTable", activeMatch: "/composables/" },
      { text: "工具类", link: "/utils/sso", activeMatch: "/utils/" },
      { text: "示例", link: "/examples/user-manage", activeMatch: "/examples/" }
    ],

    sidebar: {
      "/guide/": [
        {
          text: "介绍",
          items: [
            { text: "快速上手", link: "/guide/getting-started" },
            { text: "安装", link: "/guide/installation" },
            { text: "贡献指南", link: "/guide/contributing" }
          ]
        },
        {
          text: "维护者",
          items: [
            { text: "发版流程", link: "/guide/publish" }
          ]
        }
      ],
      "/components/": [
        {
          text: "总览",
          items: [
            { text: "组件总览", link: "/components/" }
          ]
        },
        {
          text: "基础组件",
          items: [
            { text: "BaseLayout", link: "/components/BaseLayout" },
            { text: "ReDialog", link: "/components/ReDialog" }
          ]
        },
        {
          text: "业务组件",
          items: [
            { text: "ReSearchBar", link: "/components/ReSearchBar" },
            { text: "RePageTable", link: "/components/RePageTable" },
            { text: "ReTableAction", link: "/components/ReTableAction" },
            { text: "RePureTableBar", link: "/components/RePureTableBar" },
            { text: "DictSelect", link: "/components/DictSelect" },
            { text: "DictTag", link: "/components/DictTag" },
            { text: "ReSelect", link: "/components/ReSelect" }
          ]
        }
      ],
      "/composables/": [
        {
          text: "组合式函数",
          items: [
            { text: "useTable", link: "/composables/useTable" },
            { text: "useDict", link: "/composables/useDict" }
          ]
        }
      ],
      "/utils/": [
        {
          text: "通用工具类（纯 JS）",
          items: [
            { text: "sso 统一登录授权", link: "/utils/sso" }
          ]
        }
      ],
      "/examples/": [
        {
          text: "端到端示例",
          items: [
            { text: "用户管理页", link: "/examples/user-manage" }
          ]
        }
      ]
    },

    // 社交链接
    socialLinks: [
      { icon: "github", link: "https://github.com/M854708234/xnui" }
    ],

    // 编辑此页（链接到 GitHub Repo，URL 由 VitePress 从 socialLinks[icon=github] 推导）
    editLink: {
      pattern: "**/*.md",
      text: "在 GitHub 编辑"
    },

    // 页脚
    footer: {
      message: "Released under the UNLICENSED License.",
      copyright: "Copyright © 2026 xnui"
    },

    // 搜索：本地搜索
    search: {
      provider: "local",
      options: {
        miniSearch: {
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            boost: { title: 4, text: 1 }
          }
        }
      }
    },

    // 中文 docsearch 占位（可后续接 algolia）
    docFooter: {
      prev: "上一篇",
      next: "下一篇"
    },

    outline: {
      level: [2, 3],
      label: "本页目录"
    }
  },

  // Markdown 扩展
  markdown: {
    lineNumbers: false,
    theme: { light: "github-light", dark: "github-dark" }
  }
});
