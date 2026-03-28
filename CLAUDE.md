# OBS Control Panel — Claude 上下文索引

## 项目简介
本地运行的 OBS Studio 控制面板，通过 obs-websocket v5 实时监控和控制 OBS。

## 技术栈
- **框架**: Vue 3 (Composition API) + TypeScript
- **构建**: Vite 5
- **状态**: Pinia
- **样式**: 原生 CSS Variables（深色主题）
- **协议**: obs-websocket v5，连接 localhost:4455

## 目录结构
```
src/
  obs/
    client.ts     # WebSocket 连接、握手(opcode 0/1/2)、重连、请求队列、事件分发
    sha256.ts     # crypto.subtle SHA256+Base64 认证
    utils.ts      # 类型安全工具函数（safeNum / safeString）
  stores/
    connection.ts # 连接状态管理、配置持久化(localStorage)、Stats轮询(2s)
    streaming.ts  # 推流/录制状态与控制（StartStream/StopStream/StartRecord/StopRecord）
    scenes.ts     # 场景列表、当前预览/节目场景、场景切换
    stats.ts      # CPU/FPS/内存/丢帧统计（GetStats 轮询）
    audio.ts      # 音频输入列表、静音状态、实时电平（InputVolumeMeters 事件）
  components/
    ConnectionPanel.vue  # 连接配置表单（host/port/password，持久化）
    StreamControls.vue   # 推流/录制控制按钮
    SceneSwitcher.vue    # 场景切换网格（支持预览/节目双轨）
    StatsDisplay.vue     # 实时统计展示（CPU、FPS、内存、丢帧）
    AudioStatus.vue      # 音频输入电平表与静音状态（多声道 L/R/CHn，三段配色）
  App.vue         # 主布局 + 连接状态徽章 + 顶部导航
  main.ts         # 应用入口，挂载 Pinia + App
  style.css       # 全局样式，CSS Variables 深色主题
```

## 关键决策
- 纯前端，无后端服务
- 原生 `WebSocket` + `crypto.subtle`，不依赖 obs-websocket-js 库
- 事件驱动（OpCode 5）更新推流/录制/场景/音频状态，Stats 数据每 2 秒轮询
- 配置（host/port/password）持久化到 localStorage，密码非强制保存
- 自动重连间隔 3 秒，断线后清理轮询定时器
- 场景同时跟踪 PreviewScene（预览）和 CurrentProgramScene（节目）
- 音频电平由 InputVolumeMeters 事件推送（multiplier → dB，下限 -60 dB）

## 状态流转
```
App 启动
  └─ connectionStore.connect()
       └─ OBSClient.connect(host, port, password)
            ├─ OpCode 0 (Hello) → SHA256 认证 → OpCode 1 (Identify)
            ├─ OpCode 2 (Identified) → 触发 onConnected
            │    ├─ streamingStore.fetchStatus()
            │    ├─ scenesStore.fetchScenes()
            │    ├─ audioStore.refresh()        ← 获取音频输入列表
            │    └─ connectionStore 启动 Stats 轮询
            └─ OpCode 5 (Event) → 分发到各 store 处理
```

## 事件处理（OpCode 5）
| 事件名 | 处理 store |
|--------|-----------|
| StreamStateChanged | streamingStore |
| RecordStateChanged | streamingStore |
| SceneListChanged | scenesStore |
| CurrentPreviewSceneChanged | scenesStore |
| CurrentProgramSceneChanged | scenesStore |
| InputMuteStateChanged | audioStore |
| InputVolumeMeters | audioStore |

## 开发命令
```bash
npm run dev      # 启动开发服务器 http://localhost:5173
npm run build    # 构建生产版本
npm run preview  # 预览构建产物
```

## OBS WebSocket v5 关键 OpCode
| OpCode | 含义 |
|--------|------|
| 0 | Hello（服务端→客户端，含认证挑战） |
| 1 | Identify（客户端→服务端，含认证响应） |
| 2 | Identified（认证成功确认） |
| 5 | Event（OBS 状态变更推送） |
| 6 | Request（客户端→服务端请求） |
| 7 | RequestResponse（服务端响应） |

## 模块索引
- 修改连接逻辑 / 握手 / 重连 → `src/obs/client.ts`
- 修改认证算法 → `src/obs/sha256.ts`
- 修改类型安全工具函数 → `src/obs/utils.ts`
- 修改连接配置表单 / 持久化 → `src/stores/connection.ts` + `src/components/ConnectionPanel.vue`
- 修改推流/录制控制 → `src/stores/streaming.ts` + `src/components/StreamControls.vue`
- 修改场景切换逻辑 → `src/stores/scenes.ts` + `src/components/SceneSwitcher.vue`
- 修改统计数据 → `src/stores/stats.ts` + `src/components/StatsDisplay.vue`
- 修改音频监控 → `src/stores/audio.ts` + `src/components/AudioStatus.vue`
- 修改主题/颜色 → `src/style.css`（CSS Variables 在 `:root`）
- 修改主布局 → `src/App.vue`
