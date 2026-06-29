/**
 * xn-ui 文档站 - 主题入口
 *
 * 当前无自定义，复用 VitePress 默认主题。
 * VitePress 1.x 必须存在 theme/index.{ts,js} 文件，
 * 直接写 `export default {}` 会导致 RawTheme 为空 → VitePressApp 渲染时 vnode 拿到 undefined。
 * 正确做法是 re-export 默认主题。
 */
import DefaultTheme from "vitepress/theme";

export default DefaultTheme;
