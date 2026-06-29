# 组件总览

## 基础组件

| 组件 | 说明 | 文档 |
| --- | --- | --- |
| `BaseLayout` | 业务页布局容器（header / handle / main / footer 插槽） | [查看](/components/BaseLayout) |
| `ReDialog` | 弹框（依赖组件，ReTableAction 内部用） | [查看](/components/ReDialog) |
| `RePureTableBar` | 表格工具栏（RePageTable 内部用） | [查看](/components/RePureTableBar) |

## 业务组件

| 组件 | 说明 | 文档 |
| --- | --- | --- |
| `ReSearchBar` | 通用搜索栏：配置表 + 栅格布局 + 展开收起 | [查看](/components/ReSearchBar) |
| `RePageTable` | 通用分页表格：自管分页 / loading / 多选 / 透传 | [查看](/components/RePageTable) |
| `ReTableAction` | 表格行操作按钮：add / edit / delete 三态内置 | [查看](/components/ReTableAction) |

## 选型指引

| 你要做的 | 用这个 |
| --- | --- |
| 一个搜索栏（任意字段组合） | `ReSearchBar` |
| 一个表格（分页 + 多选 + 列定义） | `RePageTable` |
| 表格行内"编辑/删除"按钮 + 弹框 | `ReTableAction` |
| 业务页整体框架（顶部 header + 操作区 + 内容 + 页脚） | `BaseLayout` |
| 把"搜索栏 + 表格"联动起来（一行 useTable()） | `useTable` 组合式 |
