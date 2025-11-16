import { create } from 'zustand'

const normalizeCoords = (position) => {
  if (!position) return { x: 0, y: 0, z: 0 }
  if (position.isVector3) {
    return { x: position.x, y: position.y, z: position.z }
  }
  if (Array.isArray(position)) {
    const [x = 0, y = 0, z = 0] = position
    return { x, y, z }
  }
  const { x = 0, y = 0, z = 0 } = position
  return { x, y, z }
}

export const useCameraTargetStore = create((set) => ({
  targetId: 'earth',
  target: { x: 0, y: 0, z: 0 },
  setTarget: (id, position) =>
    set(() => ({
      targetId: id,
      target: normalizeCoords(position),
    })),
}))
