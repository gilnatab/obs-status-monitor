import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OBSClient } from '../obs/client'
import { safeNum, safeString } from '../obs/utils'

export const useStreamingStore = defineStore('streaming', () => {
  const streamActive = ref(false)
  const streamReconnecting = ref(false)
  const streamTimecode = ref<string | undefined>()
  const streamDuration = ref(0)
  const streamBytes = ref(0)
  const streamBitrate = ref(0)
  const streamSkippedFrames = ref(0)
  const streamTotalFrames = ref(0)
  const streamCongestion = ref(0)

  const recordActive = ref(false)
  const recordPaused = ref(false)
  const recordTimecode = ref<string | undefined>()
  const recordDuration = ref(0)
  const recordBytes = ref(0)
  const recordBitrate = ref(0)
  const recordSkippedFrames = ref(0)
  const recordTotalFrames = ref(0)
  const recordPath = ref('')
  const recordPaths = ref<string[]>([])

  const isStreamLoading = ref(false)
  const isRecordLoading = ref(false)

  let lastStreamBytes = 0
  let lastRecordBytes = 0
  let lastRefreshTime = 0

  async function refresh(client: OBSClient) {
    const [s, r] = await Promise.all([
      client.request<Record<string, unknown>>('GetStreamStatus'),
      client.request<Record<string, unknown>>('GetRecordStatus'),
    ])

    const now = Date.now()
    const dt = lastRefreshTime ? (now - lastRefreshTime) / 1000 : 0
    lastRefreshTime = now

    // Stream
    streamActive.value = s['outputActive'] as boolean
    streamReconnecting.value = s['outputReconnecting'] as boolean
    streamTimecode.value = s['outputTimecode'] as string | undefined
    streamDuration.value = safeNum(s['outputDuration'])
    streamCongestion.value = safeNum(s['outputCongestion'])
    streamSkippedFrames.value = safeNum(s['outputSkippedFrames'])
    streamTotalFrames.value = safeNum(s['outputTotalFrames'])
    
    const sBytes = safeNum(s['outputBytes'])
    if (dt > 0 && streamActive.value) {
      streamBitrate.value = Math.round(((sBytes - lastStreamBytes) * 8 / 1000) / dt)
    } else {
      streamBitrate.value = 0
    }
    streamBytes.value = sBytes
    lastStreamBytes = sBytes

    // Record
    recordActive.value = r['outputActive'] as boolean
    recordPaused.value = r['outputPaused'] as boolean
    recordTimecode.value = r['outputTimecode'] as string | undefined
    recordDuration.value = safeNum(r['outputDuration'])
    recordSkippedFrames.value = safeNum(r['outputSkippedFrames'])
    recordTotalFrames.value = safeNum(r['outputTotalFrames'])
    recordPath.value = safeString(r['outputPath'])
    
    const rBytes = safeNum(r['outputBytes'])
    if (dt > 0 && recordActive.value && !recordPaused.value) {
      recordBitrate.value = Math.round(((rBytes - lastRecordBytes) * 8 / 1000) / dt)
    } else {
      recordBitrate.value = 0
    }
    recordBytes.value = rBytes
    lastRecordBytes = rBytes
  }

  function onStreamEvent(data: Record<string, unknown>) {
    streamActive.value = data['outputActive'] as boolean
    streamTimecode.value = data['outputTimecode'] as string | undefined
    if (!streamActive.value) {
      streamBitrate.value = 0
      lastStreamBytes = 0
      streamSkippedFrames.value = 0
      streamTotalFrames.value = 0
    }
  }

  function onRecordEvent(data: Record<string, unknown>) {
    recordActive.value = data['outputActive'] as boolean
    recordPaused.value = data['outputPaused'] as boolean ?? false
    recordTimecode.value = data['outputTimecode'] as string | undefined
    
    const path = safeString(data['outputPath'])
    if (path) {
      recordPath.value = path
      if (!recordPaths.value.includes(path)) {
        recordPaths.value.push(path)
      }
    }
    
    if (!recordActive.value) {
      recordBitrate.value = 0
      lastRecordBytes = 0
      recordSkippedFrames.value = 0
      recordTotalFrames.value = 0
      recordPath.value = ''
    }
  }

  async function toggleStream(client: OBSClient) {
    isStreamLoading.value = true
    try {
      await client.request('ToggleStream')
    } finally {
      isStreamLoading.value = false
    }
  }

  async function toggleRecord(client: OBSClient) {
    isRecordLoading.value = true
    try {
      await client.request('ToggleRecord')
    } finally {
      isRecordLoading.value = false
    }
  }

  async function pauseRecord(client: OBSClient) {
    isRecordLoading.value = true
    try {
      await client.request(recordPaused.value ? 'ResumeRecord' : 'PauseRecord')
    } finally {
      isRecordLoading.value = false
    }
  }

  return {
    streamActive, streamReconnecting, streamTimecode, streamDuration, 
    streamBytes, streamBitrate, streamSkippedFrames, streamTotalFrames, streamCongestion,
    recordActive, recordPaused, recordTimecode, recordDuration, recordBytes, recordBitrate,
    recordSkippedFrames, recordTotalFrames, recordPath, recordPaths,
    isStreamLoading, isRecordLoading,
    refresh, onStreamEvent, onRecordEvent, toggleStream, toggleRecord, pauseRecord,
  }
})
