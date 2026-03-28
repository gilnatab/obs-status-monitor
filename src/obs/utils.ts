export function safeNum(v: unknown, fallback = 0): number {
  return Number.isFinite(v) ? (v as number) : fallback
}

export function safeString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}
