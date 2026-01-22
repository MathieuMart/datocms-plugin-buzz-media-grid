import { Compactor } from 'react-grid-layout'
import { cloneLayoutItem } from 'react-grid-layout/core'

export default {
  type: 'wrap',
  allowOverlap: false,
  preventCollision: false,

  compact(layout, cols) {
    // const statics = getStatics(layout)
    const out = []

    // Sort by Y descending (process bottom items first)
    const sorted = [...layout].sort((a, b) => a.y - b.y)

    for (const item of sorted) {
      const l = cloneLayoutItem(item)
      out.push(l)
    }

    return out
  }
} as Compactor
