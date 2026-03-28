<script setup lang="ts">
import { useStatsStore } from '../stores/stats'
import { useStreamingStore } from '../stores/streaming'
import { computed } from 'vue'

const stats = useStatsStore()
const streaming = useStreamingStore()

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDiskSpace = (mb: number) => {
  if (mb <= 0) return '0 B'
  return formatBytes(mb * 1024 * 1024)
}

const formatBitrate = (kbps: number) => {
  if (kbps < 1000) return `${kbps} kbps`
  return `${(kbps / 1000).toFixed(2)} Mbps`
}

const renderSkippedPercent = computed(() => {
  if (stats.renderTotalFrames === 0) return 0
  return (stats.renderSkippedFrames / stats.renderTotalFrames * 100).toFixed(1)
})

const outputSkippedPercent = computed(() => {
  if (stats.outputTotalFrames === 0) return 0
  return (stats.outputSkippedFrames / stats.outputTotalFrames * 100).toFixed(1)
})

const streamSkippedPercent = computed(() => {
  if (streaming.streamTotalFrames === 0) return '0.0'
  return (streaming.streamSkippedFrames / streaming.streamTotalFrames * 100).toFixed(1)
})

const recordSkippedPercent = computed(() => {
  if (streaming.recordTotalFrames === 0) return '0.0'
  return (streaming.recordSkippedFrames / streaming.recordTotalFrames * 100).toFixed(1)
})

</script>

<template>
  <section class="panel">
    <h2>OBS 状态</h2>
    
    <div class="stats-section">
      <h3>常规</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">CPU</span>
          <span class="stat-value" :class="{ warn: stats.cpuUsage > 70, error: stats.cpuUsage > 90 }">
            {{ stats.cpuUsage }}%
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">帧率</span>
          <span class="stat-value">{{ stats.activeFps }} fps</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">内存</span>
          <span class="stat-value">{{ stats.memoryUsage }} MB</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">录制用磁盘剩余</span>
          <span class="stat-value" :class="{ error: stats.availableDiskSpace < 512, warn: stats.availableDiskSpace >= 512 && stats.availableDiskSpace < 1024 }">
            {{ formatDiskSpace(stats.availableDiskSpace) }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">渲染时长</span>
          <span class="stat-value" :class="{ warn: stats.averageFrameRenderTime > 13 }">
            {{ stats.averageFrameRenderTime }} ms
          </span>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <h3>渲染 & 输出</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">丢帧 (渲染)</span>
          <div class="stat-value-group">
            <span class="stat-value" :class="{ error: stats.renderSkippedFrames > 0 }">
              {{ stats.renderSkippedFrames }}
            </span>
            <span class="stat-sub-value" v-if="stats.renderTotalFrames > 0">
              ({{ renderSkippedPercent }}%)
            </span>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-label">丢帧 (编码器)</span>
          <div class="stat-value-group">
            <span class="stat-value" :class="{ error: stats.outputSkippedFrames > 0 }">
              {{ stats.outputSkippedFrames }}
            </span>
            <span class="stat-sub-value" v-if="stats.outputTotalFrames > 0">
              ({{ outputSkippedPercent }}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-section" v-if="streaming.streamActive">
      <h3>推流直播</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">码率</span>
          <span class="stat-value">{{ formatBitrate(streaming.streamBitrate) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">时长</span>
          <span class="stat-value">{{ streaming.streamTimecode }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">网络丢帧</span>
          <div class="stat-value-group">
            <span class="stat-value" :class="{ error: streaming.streamSkippedFrames > 0 }">
              {{ streaming.streamSkippedFrames }}
            </span>
            <span class="stat-sub-value" v-if="streaming.streamTotalFrames > 0">
              ({{ streamSkippedPercent }}%)
            </span>
          </div>
        </div>
        <div class="stat-item">
          <span class="stat-label">拥塞</span>
          <span class="stat-value" :class="{ warn: streaming.streamCongestion > 0.1, error: streaming.streamCongestion > 0.5 }">
            {{ (streaming.streamCongestion * 100).toFixed(0) }}%
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已发送</span>
          <span class="stat-value">{{ formatBytes(streaming.streamBytes) }}</span>
        </div>
        <div class="stat-item" v-if="streaming.streamReconnecting">
          <span class="stat-label">状态</span>
          <span class="stat-value error">重连中...</span>
        </div>
      </div>
    </div>

    <div class="stats-section" v-if="streaming.recordActive">
      <h3>录制</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">码率</span>
          <span class="stat-value">{{ formatBitrate(streaming.recordBitrate) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">时长</span>
          <span class="stat-value">{{ streaming.recordTimecode }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">已保存</span>
          <span class="stat-value">{{ formatBytes(streaming.recordBytes) }}</span>
        </div>
        <div class="stat-item" v-if="streaming.recordPaused">
          <span class="stat-label">状态</span>
          <span class="stat-value warn">暂停中</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">录制丢帧</span>
          <div class="stat-value-group">
            <span class="stat-value" :class="{ error: streaming.recordSkippedFrames > 0 }">
              {{ streaming.recordSkippedFrames }}
            </span>
            <span class="stat-sub-value" v-if="streaming.recordTotalFrames > 0">
              ({{ recordSkippedPercent }}%)
            </span>
          </div>
        </div>
      </div>
    </div>

<div class="stats-section" v-if="stats.webSocketIncoming >= 0">
      <h3>调试</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">WS 收</span>
          <span class="stat-value">{{ stats.webSocketIncoming }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">WS 发</span>
          <span class="stat-value">{{ stats.webSocketOutgoing }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.record-paths-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-path-item {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.record-path-index {
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.record-path-value {
  font-size: 12px;
  color: var(--text);
  word-break: break-all;
}

.stats-section {
  margin-top: 1.5rem;
}

.stats-section h3 {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: bold;
  font-family: monospace;
}

.stat-value-group {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.stat-sub-value {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.warn {
  color: #e67e22;
}

.error {
  color: #e74c3c;
}
</style>
