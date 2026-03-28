<script setup lang="ts">
import { useConnectionStore } from '../stores/connection'

const conn = useConnectionStore()
</script>

<template>
  <section class="panel connection-panel">
    <!-- 已连接：只显示信息 + 断开按钮 -->
    <template v-if="conn.state === 'connected'">
      <div class="conn-info">
        <span class="conn-addr">{{ conn.config.host }}:{{ conn.config.port }}</span>
        <button class="btn btn-danger" @click="conn.disconnect()">断开</button>
      </div>
    </template>

    <!-- 未连接：显示完整表单 -->
    <template v-else>
      <h2>连接设置</h2>
      <div class="fields">
        <label>主机
          <input v-model="conn.config.host" type="text" placeholder="localhost" />
        </label>
        <label>端口
          <input v-model.number="conn.config.port" type="number" placeholder="4455" />
        </label>
        <label>密码
          <input v-model="conn.config.password" type="password" placeholder="（可选）" />
        </label>
      </div>
      <div class="actions">
        <button
          class="btn btn-primary"
          :disabled="conn.state === 'connecting'"
          @click="conn.connect()"
        >{{ conn.state === 'connecting' ? '连接中...' : '连接' }}</button>
      </div>
      <p v-if="conn.error" class="error-msg">{{ conn.error }}</p>
    </template>
  </section>
</template>

<style scoped>
.conn-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.conn-addr {
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--color-text-muted, #aaa);
}
</style>
