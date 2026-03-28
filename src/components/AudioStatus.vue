<script setup lang="ts">
import { useAudioStore } from '../stores/audio'

const audio = useAudioStore()

function dbToPercent(db: number): number {
  return Math.max(0, Math.min(100, ((db + 60) / 60) * 100))
}

function dbColor(db: number): string {
  if (db >= -6) return 'var(--color-level-peak, #f44336)'
  if (db >= -18) return 'var(--color-level-warn, #ff9800)'
  return 'var(--color-level-ok, #4caf50)'
}

const statusLabel: Record<string, string> = {
  muted: '静音',
  idle: '待机',
  active: '活跃',
}
</script>

<template>
  <section class="panel audio-panel">
    <h2>音频输入</h2>
    <div v-if="audio.inputs.length === 0" class="empty">无音频输入</div>
    <ul v-else class="audio-list">
      <li v-for="input in audio.inputs" :key="input.name" class="audio-item">
        <div class="audio-header">
          <span class="audio-name">{{ input.name }}</span>
          <span class="audio-badge" :class="input.status">{{ statusLabel[input.status] }}</span>
        </div>
        <div v-if="input.levels.length > 0" class="meters">
          <div v-for="(db, i) in input.levels" :key="i" class="meter-row">
            <span class="ch-label">{{ i === 0 ? 'L' : i === 1 ? 'R' : `CH${i+1}` }}</span>
            <div class="meter-track">
              <div
                class="meter-fill"
                :style="{ width: dbToPercent(db) + '%', background: dbColor(db) }"
              />
            </div>
            <span class="db-val">{{ db.toFixed(1) }} dB</span>
          </div>
        </div>
        <div v-else class="meters">
          <div class="meter-row">
            <span class="ch-label">—</span>
            <div class="meter-track"><div class="meter-fill" style="width:0%" /></div>
            <span class="db-val">-60.0 dB</span>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.audio-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.audio-item {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  background: var(--color-surface-2, #2a2a2a);
}
.audio-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.4rem;
}
.audio-name {
  flex: 1;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.audio-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  font-weight: 600;
}
.audio-badge.active {
  background: var(--color-badge-active-bg, #1a4a1a);
  color: var(--color-badge-active-fg, #4caf50);
}
.audio-badge.idle {
  background: var(--color-badge-idle-bg, #2a2a1a);
  color: var(--color-badge-idle-fg, #aaa);
}
.audio-badge.muted {
  background: var(--color-badge-muted-bg, #3a2a1a);
  color: var(--color-badge-muted-fg, #ff9800);
}
.meters {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.meter-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.ch-label {
  width: 1.4rem;
  font-size: 0.7rem;
  color: var(--color-text-muted, #888);
  text-align: right;
}
.meter-track {
  flex: 1;
  height: 8px;
  background: var(--color-surface-3, #1a1a1a);
  border-radius: 4px;
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.05s linear;
}
.db-val {
  font-size: 0.7rem;
  color: var(--color-text-muted, #888);
  width: 5rem;
  text-align: right;
  font-family: monospace;
}
.empty {
  color: var(--color-text-muted, #888);
  font-size: 0.9rem;
}
</style>
