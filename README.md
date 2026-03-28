# OBS Control Panel

本地运行的 OBS Studio 控制面板，通过 **obs-websocket v5** 实时监控和控制 OBS。

**在线体验（需本机运行 OBS）**：`https://gilnatab.github.io/obs-status-monitor/`

## 功能

- 连接状态监控（自动重连，3 秒间隔）
- 推流 / 录制控制与状态显示
- 场景列表与一键切换（跟踪当前节目场景）
- 实时统计：CPU、帧率、内存占用、丢帧数
- 音频输入监控：静音状态、实时电平表（dB）

## 技术栈

| 项目 | 版本 |
|------|------|
| Vue 3 (Composition API) | ^3.x |
| TypeScript | ^5.x |
| Vite | ^5.x |
| Pinia | ^2.x |

无第三方 OBS 库，直接使用原生 `WebSocket` + `crypto.subtle`。

## 前提条件

1. 安装并运行 OBS Studio（≥ 28.x，内置 obs-websocket v5）
2. OBS → 工具 → WebSocket 服务器设置 → 启用，默认端口 `4455`

## 快速开始

```bash
npm install
npm run dev
```

打开 `http://localhost:5173`，在连接面板填入 OBS 的 host / port / password 后点击连接。

## 构建

```bash
npm run build    # 输出到 dist/
npm run preview  # 本地预览构建产物
```

## 配置持久化

连接配置（host / port / password）保存在 `localStorage`，刷新页面后自动恢复。

## 项目结构

```
src/
  obs/
    client.ts           # WebSocket 客户端核心（握手、重连、请求队列、事件分发）
    sha256.ts           # SHA256+Base64 认证（Web Crypto API）
    utils.ts            # 类型安全工具函数（safeNum / safeString）
  stores/
    connection.ts       # 连接状态 + 配置持久化 + Stats 轮询
    streaming.ts        # 推流/录制状态与控制
    scenes.ts           # 场景列表与切换
    stats.ts            # 实时统计数据
    audio.ts            # 音频输入列表、静音状态、电平（InputVolumeMeters）
  components/
    ConnectionPanel.vue # 连接配置表单
    StreamControls.vue  # 推流/录制控制
    SceneSwitcher.vue   # 场景切换网格
    StatsDisplay.vue    # 统计数据展示
    AudioStatus.vue     # 音频输入电平表与静音状态
  App.vue               # 主布局
  main.ts               # 应用入口
  style.css             # 全局深色主题样式
```

## OBS WebSocket v5 协议

| OpCode | 方向 | 含义 |
|--------|------|------|
| 0 | Server → Client | Hello（含认证挑战） |
| 1 | Client → Server | Identify（含认证响应） |
| 2 | Server → Client | Identified（认证成功） |
| 5 | Server → Client | Event（状态变更推送） |
| 6 | Client → Server | Request |
| 7 | Server → Client | RequestResponse |
