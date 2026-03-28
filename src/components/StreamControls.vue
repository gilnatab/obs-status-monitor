<script setup lang="ts">
import { useStreamingStore } from '../stores/streaming'
import { useConnectionStore } from '../stores/connection'

const conn = useConnectionStore()
const streaming = useStreamingStore()

function client() {
  return conn.getClient()!
}
</script>

<template>
  <section class="panel">
    <h2>推流 / 录制</h2>

    <div class="controls-row">
      <!-- 推流 -->
      <div class="control-group">
        <div class="status-line">
          <span class="dot" :class="{ 'dot-live': streaming.streamActive, 'dot-warn': streaming.streamReconnecting }"></span>
          <span class="status-text" :class="{ active: streaming.streamActive }">
            {{ streaming.streamReconnecting ? '重连中' : streaming.streamActive ? '直播中' : '未推流' }}
          </span>
          <span v-if="streaming.streamActive" class="timecode">{{ streaming.streamTimecode }}</span>
        </div>
        <button
          class="btn ctrl-btn"
          :class="streaming.streamActive ? 'btn-danger' : 'btn-primary'"
          :disabled="streaming.isStreamLoading"
          @click="streaming.toggleStream(client())"
        >
          {{ streaming.isStreamLoading ? '...' : (streaming.streamActive ? '停止推流' : '开始推流') }}
        </button>
      </div>

      <!-- 录制 -->
      <div class="control-group">
        <div class="status-line">
          <span class="dot" :class="{ 'dot-rec': streaming.recordActive && !streaming.recordPaused, 'dot-warn': streaming.recordPaused }"></span>
          <span class="status-text" :class="{ active: streaming.recordActive, paused: streaming.recordPaused }">
            {{ streaming.recordActive ? (streaming.recordPaused ? '已暂停' : '录制中') : '未录制' }}
          </span>
          <span v-if="streaming.recordActive" class="timecode">{{ streaming.recordTimecode }}</span>
          <button
            v-if="streaming.recordActive"
            class="btn btn-secondary pause-btn"
            :disabled="streaming.isRecordLoading"
            @click="streaming.pauseRecord(client())"
          >
            {{ streaming.recordPaused ? '继续' : '暂停' }}
          </button>
        </div>
        <button
          class="btn ctrl-btn"
          :class="streaming.recordActive ? 'btn-danger' : 'btn-primary'"
          :disabled="streaming.isRecordLoading"
          @click="streaming.toggleRecord(client())"
        >
          {{ streaming.isRecordLoading ? '...' : (streaming.recordActive ? '停止录制' : '开始录制') }}
        </button>
      </div>
    </div>

    <!-- 录制文件历史（独立区块，视觉上与控制区分离） -->
    <div v-if="streaming.recordPaths.length > 0" class="record-history">
      <span class="record-history-title">本次录制文件</span>
      <div class="record-history-list">
        <div
          v-for="(path, i) in [...streaming.recordPaths].reverse()"
          :key="i"
          class="record-history-item"
        >
          <span class="record-idx">#{{ streaming.recordPaths.length - i }}</span>
          <span class="record-path">{{ path }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 两列等宽网格 */
.controls-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

/* 状态行：指示灯 + 文字 + 时码 + 暂停按钮 */
.status-line {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
  transition: background 0.3s;
}
.dot-live {
  background: var(--live);
  box-shadow: 0 0 6px var(--live);
  animation: pulse 1.5s ease-in-out infinite;
}
.dot-rec {
  background: var(--recording);
  box-shadow: 0 0 6px var(--recording);
  animation: pulse 1.5s ease-in-out infinite;
}
.dot-warn { background: var(--warn); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.status-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}
.status-text.active { color: var(--text); }
.status-text.paused { color: var(--warn); }

.timecode {
  margin-left: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

/* 暂停按钮：小尺寸，紧贴时码右侧 */
.pause-btn {
  padding: 2px 8px;
  font-size: 11px;
  min-height: 22px;
  flex-shrink: 0;
}

/* 主控制按钮：撑满列宽，保证两列等宽 */
.ctrl-btn {
  width: 100%;
}

/* 录制文件历史：独立区块，与控制区视觉分离 */
.record-history {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.record-history-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.record-history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-history-item {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.record-idx {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
  width: 20px;
}

.record-path {
  font-size: 12px;
  color: var(--text);
  word-break: break-all;
}

/* 移动端：单列 + 触摸友好 */
@media (max-width: 600px) {
  .controls-row {
    grid-template-columns: 1fr;
  }
  .ctrl-btn {
    min-height: 44px;
    font-size: 14px;
  }
}
</style>
