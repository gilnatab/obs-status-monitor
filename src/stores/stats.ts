import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OBSClient } from '../obs/client'
import { safeNum } from '../obs/utils'

export const useStatsStore = defineStore('stats', () => {
  const cpuUsage = ref(0)
  const memoryUsage = ref(0)
  const activeFps = ref(0)
  const renderSkippedFrames = ref(0)
  const renderTotalFrames = ref(0)
  const outputSkippedFrames = ref(0)
  const outputTotalFrames = ref(0)
  const averageFrameRenderTime = ref(0)
  const availableDiskSpace = ref(0)
  const webSocketIncoming = ref(-1)
  const webSocketOutgoing = ref(-1)

  async function refresh(client: OBSClient) {
    const data = await client.request<Record<string, unknown>>('GetStats')
    cpuUsage.value = Math.round(safeNum(data['cpuUsage']) * 10) / 10
    memoryUsage.value = Math.round(safeNum(data['memoryUsage']))
    activeFps.value = Math.round(safeNum(data['activeFps']) * 10) / 10
    renderSkippedFrames.value = safeNum(data['renderSkippedFrames'])
    renderTotalFrames.value = safeNum(data['renderTotalFrames'])
    outputSkippedFrames.value = safeNum(data['outputSkippedFrames'])
    outputTotalFrames.value = safeNum(data['outputTotalFrames'])
    averageFrameRenderTime.value = Math.round(safeNum(data['averageFrameRenderTime']) * 100) / 100
    availableDiskSpace.value = Math.round(safeNum(data['availableDiskSpace']))
    webSocketIncoming.value = Number.isFinite(data['webSocketSessionIncomingMessages'])
      ? (data['webSocketSessionIncomingMessages'] as number)
      : -1
    webSocketOutgoing.value = Number.isFinite(data['webSocketSessionOutgoingMessages'])
      ? (data['webSocketSessionOutgoingMessages'] as number)
      : -1
  }

  return {
    cpuUsage, memoryUsage, activeFps,
    renderSkippedFrames, renderTotalFrames,
    outputSkippedFrames, outputTotalFrames,
    averageFrameRenderTime,
    availableDiskSpace,
    webSocketIncoming, webSocketOutgoing,
    refresh
  }
})
