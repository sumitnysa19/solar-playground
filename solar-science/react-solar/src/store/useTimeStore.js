import { create } from 'zustand'

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export const useTimeStore = create((set, get) => ({
  timeScale: 1,
  minScale: 0.05,
  maxScale: 1,
  setTimeScale: (next) => {
    const { minScale, maxScale, timeScale } = get()
    const clamped = clamp(next, minScale, maxScale)
    if (Math.abs(clamped - timeScale) < 0.0001) return
    set({ timeScale: clamped })
  },
  setRange: (minScale, maxScale) =>
    set((state) => ({
      minScale,
      maxScale,
      timeScale: clamp(state.timeScale, minScale, maxScale),
    })),
}))
