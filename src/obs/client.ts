import { createSHA256 } from './sha256'

export type OBSConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface OBSClientOptions {
  url: string
  password?: string
  onStateChange: (state: OBSConnectionState, error?: string) => void
  onEvent: (eventType: string, data: unknown) => void
}

interface RequestEntry {
  resolve: (data: unknown) => void
  reject: (err: Error) => void
}

export class OBSClient {
  private ws: WebSocket | null = null
  private pending = new Map<string, RequestEntry>()
  private opts: OBSClientOptions
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private closed = false

  constructor(opts: OBSClientOptions) {
    this.opts = opts
  }

  connect() {
    this.closed = false
    this._open()
  }

  disconnect() {
    this.closed = true
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    for (const entry of this.pending.values()) {
      entry.reject(new Error('Disconnected'))
    }
    this.pending.clear()
    this.ws?.close()
    this.ws = null
    this.opts.onStateChange('disconnected')
  }

  private _open() {
    this.opts.onStateChange('connecting')
    const ws = new WebSocket(this.opts.url)
    this.ws = ws

    ws.onopen = () => { /* wait for Hello */ }

    ws.onmessage = async (ev) => {
      try {
        const msg = JSON.parse(ev.data as string)
        await this._handleMessage(msg)
      } catch (e) {
        this.opts.onStateChange('error', `消息处理错误: ${e instanceof Error ? e.message : e}`)
      }
    }

    ws.onerror = () => {
      this.opts.onStateChange('error', 'WebSocket 连接错误')
    }

    ws.onclose = () => {
      if (!this.closed) {
        this.opts.onStateChange('disconnected')
        this.reconnectTimer = setTimeout(() => this._open(), 3000)
      }
    }
  }

  private async _handleMessage(msg: Record<string, unknown>) {
    const op = msg['op'] as number
    const d = msg['d'] as Record<string, unknown>

    if (op === 0) {
      // Hello
      const auth = d['authentication'] as Record<string, string> | undefined
      let authPayload: Record<string, string> | undefined
      if (auth && this.opts.password) {
        const secret = await createSHA256(this.opts.password + auth['salt'])
        const response = await createSHA256(secret + auth['challenge'])
        authPayload = { response }
      }
      this._send(1, {
        rpcVersion: 1,
        ...(authPayload ? { authentication: authPayload.response } : {}),
        eventSubscriptions: 0x3FF | (1 << 16),
      })
    } else if (op === 2) {
      // Identified
      this.opts.onStateChange('connected')
    } else if (op === 5) {
      // Event
      this.opts.onEvent(d['eventType'] as string, d['eventData'])
    } else if (op === 7) {
      // RequestResponse
      const id = d['requestId'] as string
      const entry = this.pending.get(id)
      if (entry) {
        this.pending.delete(id)
        const status = d['requestStatus'] as Record<string, unknown>
        if (status['result']) {
          entry.resolve(d['responseData'])
        } else {
          entry.reject(new Error(String(status['comment'] ?? 'Request failed')))
        }
      }
    }
  }

  request<T = unknown>(type: string, data?: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('Not connected'))
        return
      }
      const id = crypto.randomUUID()
      this.pending.set(id, {
        resolve: resolve as (d: unknown) => void,
        reject,
      })
      this._send(6, { requestType: type, requestId: id, requestData: data ?? {} })
    })
  }

  private _send(op: number, d: unknown) {
    this.ws?.send(JSON.stringify({ op, d }))
  }
}
