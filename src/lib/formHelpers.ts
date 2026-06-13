export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

export function asPercent(value: number): number {
  return value * 100
}

export function fromPercent(value: number): number {
  return value / 100
}
