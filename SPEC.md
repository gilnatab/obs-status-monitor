# OBS Control Panel — 功能规格说明

## 产品定位
本地网页工具，运行于浏览器，通过 obs-websocket v5 API 实时监控和控制 OBS Studio。

## 功能范围

### 已实现 (v0.1)

#### 连接管理
- [x] 配置 WebSocket 地址（host + port）
- [x] 配置认证密码
- [x] 连接/断开控制
- [x] 自动重连（断线后 3 秒重试）
- [x] 连接状态展示（disconnected / connecting / connected / error）
- [x] 配置持久化到 localStorage

#### 推流控制
- [x] 显示当前推流状态（直播中 / 未推流）
- [x] 显示推流时长（timecode）
- [x] 开始/停止推流
- [x] 实时事件驱动状态同步（StreamStateChanged）

#### 录制控制
- [x] 显示当前录制状态（录制中 / 已暂停 / 未录制）
- [x] 显示录制时长（timecode）
- [x] 开始/停止录制
- [x] 暂停/继续录制
- [x] 实时事件驱动状态同步（RecordStateChanged）

#### 场景管理
- [x] 获取并展示全部场景列表
- [x] 高亮当前活动场景
- [x] 一键切换场景
- [x] 实时同步场景变更（CurrentProgramSceneChanged / SceneListChanged）

#### 统计信息
- [x] CPU 占用率（%）
- [x] 活跃帧率（fps）
- [x] 内存占用（MB）
- [x] 渲染丢帧数
- [x] 输出丢帧数
- [x] 每 2 秒自动刷新
- [x] 高值警告（CPU > 80% / 丢帧 > 0 变色）

### 已实现 (v0.2)

#### 音频监控
- [x] 列出音频输入设备（跨平台：WASAPI / CoreAudio / PulseAudio / ALSA / JACK）
- [x] 静音状态显示（实时事件同步）
- [x] 实时音频电平表（dB，多声道 L/R/CHn）
- [x] 三段配色电平指示（正常 / 警告 / 峰值）

### 待实现 (Backlog)

#### 音频控制
- [ ] 静音/取消静音操作
- [ ] 音量调节

#### 来源管理
- [ ] 列出当前场景的来源
- [ ] 显示/隐藏来源

#### 输出信息
- [ ] 当前推流码率
- [ ] 网络丢包率

#### UI 增强
- [ ] 操作按钮 loading 状态（等待 RequestResponse）
- [ ] 推流/录制计时器（本地计时，不依赖 OBS timecode）
- [ ] 连接历史记录（多个 OBS 实例快速切换）
- [ ] 快捷键绑定

## 接受标准

### 连接
- 连接成功后 1 秒内完成初始状态同步
- 断线后自动重连，重连成功后状态自动刷新
- 密码错误时展示明确错误信息

### 控制
- 推流/录制控制操作后，状态变更通过事件驱动更新（不依赖手动刷新）
- 场景切换后高亮立即反映

### 统计
- Stats 数据延迟不超过 3 秒
- 丢帧数大于 0 时以警告色（橙色）展示

## 技术约束
- 无后端服务，纯浏览器运行
- 兼容 OBS Studio 28+（obs-websocket v5）
- 不依赖 obs-websocket-js 第三方库
- 使用原生 `crypto.subtle` 处理 SHA256 认证
