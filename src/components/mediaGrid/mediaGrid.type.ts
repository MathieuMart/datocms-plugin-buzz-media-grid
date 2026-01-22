export type TMediaGridParameter = {
  columns: number
  // rows: number
}

export type TMediaGridGrid = {
  columns: number
  rows: number
  areas: TMediaGridArea[]
  allowCustomizeGrid: boolean
}

export type TMediaGrid = {
  [layout: string]: TMediaGridGrid
}

export type TMediaGridArea = {
  id: string
  position: [number, number, number, number]
  content: {
    type: 'video' | 'image'
    url: string
    width?: number
    height?: number
    thumbhash?: string
    alt?: string
    title?: string
  }
}
