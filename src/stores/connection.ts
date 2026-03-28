import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OBSClient, type OBSConnectionState } from '../obs/client'
import { useStreamingStore } from './streaming'
import { useScenesStore } from './scenes'
import { useStatsStore } from './stats'
import { useAudioStore } from './audio'

const CONFIG_KEY = 'obs_config'

interface Config {
  host: string
  port: number
  password: string
}

export const useConnectionStore = defineStore('connection', () => {
  const state = ref<OBSConnectionState>('disconnected')
  const error = ref<string | undefined>()
  const config = ref<Config>(loadConfig())
  let client: OBSClient | null = null
  let statsTimer: ReturnType<typeof setInterval> | null = null

  function loadConfig(): Config {
    try {
      const saved = localStorage.getItem(CONFIG_KEY)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { host: 'localhost', port: 4455, password: '' }
  }

  function saveConfig() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config.value))
  }

  function connect() {
    if (client) client.disconnect()
    saveConfig()
    const { host, port, password } = config.value
    client = new OBSClient({
      url: `ws://${host}:${port}`,
      password,
      onStateChange: (s, err) => {
        state.value = s
        error.value = err
        if (s === 'connected') onConnected()
        if (s === 'disconnected' || s === 'error') onDisconnected()
      },
      onEvent: handleEvent,
    })
    client.connect()
  }

  function disconnect() {
    client?.disconnect()
    client = null
  }

  async function onConnected() {
    const streaming = useStreamingStore()
    const scenes = useScenesStore()
    const stats = useStatsStore()
    const audio = useAudioStore()

    // Initial refresh
    await Promise.all([
      streaming.refresh(client!),
      scenes.refresh(client!),
      stats.refresh(client!),
      audio.refresh(client!),
    ])

    // Periodic refresh every 2 seconds
    statsTimer = setInterval(() => {
      if (client) {
        stats.refresh(client)
        streaming.refresh(client)
      }
    }, 2000)
  }

  function onDisconnected() {
    if (statsTimer) { clearInterval(statsTimer); statsTimer = null }
    useAudioStore().reset()
  }

  function handleEvent(eventType: string, data: unknown) {
    const streaming = useStreamingStore()
    const scenes = useScenesStore()
    const audio = useAudioStore()
    switch (eventType) {
      case 'StreamStateChanged':
        streaming.onStreamEvent(data as Record<string, unknown>)
        break
      case 'RecordStateChanged':
        streaming.onRecordEvent(data as Record<string, unknown>)
        break
      case 'CurrentProgramSceneChanged':
        scenes.onSceneChanged(data as Record<string, unknown>)
        break
      case 'SceneListChanged':
        scenes.refresh(client!)
        break
      case 'InputMuteStateChanged':
        audio.onMuteEvent(data as Record<string, unknown>)
        break
      case 'InputVolumeMeters':
        audio.onVolumeMeters(data as Record<string, unknown>)
        break
    }
  }

  function getClient() { return client }

  return { state, error, config, connect, disconnect, getClient }
})
