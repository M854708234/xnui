# 组件总览

## 基础组件

| 组件             | 说明                                                   | 文档                               |
| ---------------- | ------------------------------------------------------ | ---------------------------------- |
| `BaseLayout`     | 业务页布局容器（header / handle / main / footer 插槽） | [查看](/components/BaseLayout)     |
| `ReDialog`       | 弹框（依赖组件，ReTableAction 内部用）                 | [查看](/components/ReDialog)       |
| `RePureTableBar` | 表格工具栏（RePageTable 内部用）                       | [查看](/components/RePureTableBar) |

## 业务组件

| 组件            | 说明                                                     | 文档                              |
| --------------- | -------------------------------------------------------- | --------------------------------- |
| `ReSearchBar`   | 通用搜索栏：配置表 + 栅格布局 + 展开收起                 | [查看](/components/ReSearchBar)   |
| `RePageTable`   | 通用分页表格：自管分页 / loading / 多选 / 透传           | [查看](/components/RePageTable)   |
| `ReTableAction` | 表格行操作按钮：add / edit / delete 三态内置             | [查看](/components/ReTableAction) |
| `DictSelect`    | 字典下拉选择器：按 typeNo 自动加载 + 透传 el-select      | [查看](/components/DictSelect)    |
| `DictTag`       | 字典标签展示：按 code 自动渲染名称 + 自动着色            | [查看](/components/DictTag)       |
| `ReSelect`      | 接口驱动下拉：全量 / 滚动分页 + 字段映射 + 拦截器 + 回填 | [查看](/components/ReSelect)      |

## 选型指引

| 你要做的                                             | 用这个                        |
| ---------------------------------------------------- | ----------------------------- |
| 一个搜索栏（任意字段组合）                           | `ReSearchBar`                 |
| 一个表格（分页 + 多选 + 列定义）                     | `RePageTable`                 |
| 表格行内"编辑/删除"按钮 + 弹框                       | `ReTableAction`               |
| 业务页整体框架（顶部 header + 操作区 + 内容 + 页脚） | `BaseLayout`                  |
| 把"搜索栏 + 表格"联动起来（一行 useTable()）         | `useTable` 组合式             |
| 一个按字典编号自动加载的下拉                         | `DictSelect`                  |
| 表格里展示字典名称（启用=绿、禁用=红）               | `DictTag`                     |
| 在任意地方读字典 / 自定义键查                        | `useDict` 组合式              |
| 接口拉数据下拉（全量/分页），字段映射可配，编辑回填  | `ReSelect`                    |
| 请求前异步校验，无权限时阻止 + 报错                  | `ReSelect` + `interceptorFun` |
