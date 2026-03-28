<script setup lang="ts">
import { useScenesStore } from '../stores/scenes'
import { useConnectionStore } from '../stores/connection'

const conn = useConnectionStore()
const scenes = useScenesStore()

function switchScene(name: string) {
  scenes.switchScene(conn.getClient()!, name)
}
</script>

<template>
  <section class="panel">
    <h2>场景切换</h2>
    <div class="scene-grid">
      <button
        v-for="scene in scenes.scenes"
        :key="scene.sceneName"
        class="scene-btn"
        :class="{ active: scene.sceneName === scenes.currentScene }"
        @click="switchScene(scene.sceneName)"
      >
        {{ scene.sceneName }}
      </button>
    </div>
  </section>
</template>
