import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OBSClient } from '../obs/client'

interface Scene {
  sceneName: string
  sceneIndex: number
}

export const useScenesStore = defineStore('scenes', () => {
  const scenes = ref<Scene[]>([])
  const currentScene = ref<string | undefined>()

  async function refresh(client: OBSClient) {
    const data = await client.request<Record<string, unknown>>('GetSceneList')
    scenes.value = (data['scenes'] as Scene[]).slice().reverse()
    currentScene.value = data['currentProgramSceneName'] as string
  }

  function onSceneChanged(data: Record<string, unknown>) {
    currentScene.value = data['sceneName'] as string
  }

  async function switchScene(client: OBSClient, sceneName: string) {
    await client.request('SetCurrentProgramScene', { sceneName })
  }

  return { scenes, currentScene, refresh, onSceneChanged, switchScene }
})
