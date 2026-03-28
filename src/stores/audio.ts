import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OBSClient } from '../obs/client'
import { safeString } from '../obs/utils'

export interface AudioInput {
  name: string
  muted: boolean
  levels: number[]
  status: 'muted' | 'idle' | 'active'
}

// multiplier → dB, clamped to -60
function toDb(mul: number): number {
  if (mul <= 0) return -60
  return Math.max(20 * Math.log10(mul), -60)
}

function calcStatus(muted: boolean, levels: number[]): AudioInput['status'] {
  if (muted) return 'muted'
  if (levels.length > 0 && levels.some(db => db > -50)) return 'active'
  return 'idle'
}

export const useAudioStore = defineStore('audio', () => {
  const inputs = ref<AudioInput[]>([])
  const inputMap = new Map<string, AudioInput>()

  async function refresh(client: OBSClient) {
    const resp = await client.request<Record<string, unknown>>('GetInputList')
    const list = resp['inputs'] as Array<Record<string, unknown>> | undefined
    if (!list) return

    const audioKinds = new Set([
      'wasapi_input_capture', 'wasapi_output_capture',
      'coreaudio_input_capture', 'coreaudio_output_capture',
      'pulse_input_capture', 'pulse_output_capture',
      'alsa_input_capture', 'jack_output_capture', 'sck_source',
    ])
    const names = list
      .filter(i => audioKinds.has(safeString(i['inputKind'])))
      .map(i => safeString(i['inputName']))
      .filter(Boolean)

    const results = await Promise.all(
      names.map(async (name) => {
        try {
          const r = await client.request<Record<string, unknown>>('GetInputMute', { inputName: name })
          const muted = r['inputMuted'] as boolean
          return { name, muted, levels: [], status: calcStatus(muted, []) } as AudioInput
        } catch {
          return null
        }
      })
    )
    const valid = results.filter((r): r is AudioInput => r !== null)
    inputMap.clear()
    for (const entry of valid) inputMap.set(entry.name, entry)
    inputs.value = valid
  }

  function onMuteEvent(data: Record<string, unknown>) {
    const name = safeString(data['inputName'])
    const entry = inputMap.get(name)
    if (!entry) return
    entry.muted = data['inputMuted'] as boolean
    entry.status = calcStatus(entry.muted, entry.levels)
  }

  // InputVolumeMeters event: data.inputs = [{inputName, inputLevelsMul: [[peak,mag,in],[...]]}]
  function onVolumeMeters(data: Record<string, unknown>) {
    const list = data['inputs'] as Array<Record<string, unknown>> | undefined
    if (!list) return
    let changed = false
    for (const item of list) {
      const entry = inputMap.get(safeString(item['inputName']))
      if (!entry) continue
      const channels = item['inputLevelsMul'] as number[][] | undefined
      if (!channels) continue
      entry.levels = channels.map(ch => toDb(ch[0] ?? 0))
      entry.status = calcStatus(entry.muted, entry.levels)
      changed = true
    }
    // trigger Vue reactivity by replacing the array reference
    if (changed) inputs.value = [...inputs.value]
  }

  function reset() {
    inputMap.clear()
    inputs.value = []
  }

  return { inputs, refresh, onMuteEvent, onVolumeMeters, reset }
})
