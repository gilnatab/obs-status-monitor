# OBS Control Panel — 开发宪法

## 核心原则

### 1. 单一数据源
- OBS WebSocket 事件是状态真相的唯一来源
- UI 状态必须由 Pinia store 驱动，禁止组件内维护本地副本
- 连接配置唯一持久化位置：`localStorage`（key: `obs_config`）

### 2. 分层架构（禁止跨层直接调用）
```
UI 组件
  ↓ 只调用 store 方法
Pinia Stores
  ↓ 只调用 OBSClient
OBSClient (src/obs/client.ts)
  ↓ 只操作
WebSocket
```
- 组件禁止直接操作 WebSocket
- Store 禁止直接操作 DOM
- OBSClient 禁止导入任何 Vue/Pinia 依赖

### 3. 错误处理边界
- 所有 OBS 请求必须有 try/catch 或 Promise 错误处理
- 连接错误必须更新 `connection.state` 到 `'error'`，并填写 `error` 字段
- 组件层不直接 throw，通过 store 的响应式状态反映错误

### 4. 类型安全
- 禁止使用 `any`，用 `unknown` + 类型断言代替
- OBS 协议消息字段通过 `Record<string, unknown>` 接收后断言
- 新增功能必须有对应 TypeScript 类型定义

## 禁止事项
- 禁止硬编码 OBS 地址（必须从 config store 读取）
- 禁止在组件内直接 `fetch` 或创建 `WebSocket`
- 禁止在 OBSClient 内使用 `console.log`（调试完后清理）
- 禁止 copy-paste 重复的请求处理逻辑（抽取到 store 方法）
- 禁止提交包含密码明文的任何文件

## 新增功能规范

### 新增 OBS 控制功能
1. 在对应 store 添加状态字段和方法
2. 在 `connection.ts` 的 `handleEvent` 中订阅相关事件
3. 在 `onConnected` 中添加初始化快照请求
4. 创建或修改对应组件

### 新增组件
1. 组件只通过 `useXxxStore()` 获取数据
2. 控制操作通过 `store.method(conn.getClient()!)` 调用
3. 样式使用现有 CSS Variables，不引入新的颜色硬编码

## 代码风格
- Vue 3 `<script setup>` 语法
- Composition API，禁止 Options API
- 函数命名：动词开头（`fetchScenes`, `toggleStream`）
- 响应式变量：`const x = ref()` 而非 `let x`
