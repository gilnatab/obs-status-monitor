# 变更日志

## [0.2.0] - 2026-03-29

### 新增
- 音频输入监控（`src/stores/audio.ts` + `src/components/AudioStatus.vue`）
  - 自动过滤音频类型输入源（WASAPI / CoreAudio / PulseAudio / ALSA / JACK）
  - 静音状态实时同步（InputMuteStateChanged 事件）
  - 实时电平表，dB 换算，三段配色（绿/橙/红）
  - 事件驱动：InputVolumeMeters 推送（含多声道 L/R/CHn）
- 工具模块 `src/obs/utils.ts`（`safeNum` / `safeString` 类型安全辅助函数）

---

## [0.1.0] - 2026-03-29

### 初始化
- Vite 5 + Vue 3 + TypeScript + Pinia 项目脚手架
- obs-websocket v5 原生 WebSocket 客户端（`src/obs/client.ts`）
- SHA256 认证模块（`src/obs/sha256.ts`，基于 `crypto.subtle`）
- 连接管理 store，支持配置持久化和自动重连
- 推流/录制状态 store 与控制
- 场景列表 store 与切换
- Stats 统计 store（CPU/FPS/内存/丢帧），2 秒轮询
- 深色主题 UI，CSS Variables 语义色彩系统
- 全部组件：ConnectionPanel, StreamControls, SceneSwitcher, StatsDisplay
