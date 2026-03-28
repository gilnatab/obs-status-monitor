<script setup lang="ts">
import { useConnectionStore } from './stores/connection'
import ConnectionPanel from './components/ConnectionPanel.vue'
import StreamControls from './components/StreamControls.vue'
import SceneSwitcher from './components/SceneSwitcher.vue'
import StatsDisplay from './components/StatsDisplay.vue'
import AudioStatus from './components/AudioStatus.vue'

const conn = useConnectionStore()
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <span class="app-title">OBS 控制面板</span>
        <span class="conn-badge" :class="conn.state">{{ conn.state }}</span>
      </div>
    </header>

    <main class="main">
      <ConnectionPanel />
      <div v-if="conn.state === 'connected'" class="dashboard">
        <StreamControls />
        <SceneSwitcher />
        <AudioStatus />
        <StatsDisplay />
      </div>
      <div v-else-if="conn.state !== 'disconnected'" class="status-msg">
        <span v-if="conn.state === 'connecting'">正在连接...</span>
        <span v-else-if="conn.state === 'error'" class="error">{{ conn.error }}</span>
      </div>
    </main>
  </div>
</template>
