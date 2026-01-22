// @ts-nocheck

import { uniqid } from '@blackbyte/sugar/string'
import { createRef, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TMediaGridArea, TMediaGridGrid } from './mediaGrid.type'
import './mediaGridMockupGrid.css'

function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

export default function MediaGridMockupGrid({
  grid,
  onNewArea
}: {
  grid: TMediaGridGrid
  onNewArea?: (area: TMediaGridArea) => void
}) {
  const $root = createRef<HTMLDivElement>()
  const isPointerDown = useRef(false)

  const [width, setWidth] = useState(600)
  const [selecting, setSelecting] = useState(false)
  const [startArea, setStartArea] = useState<[number, number] | null>(null)
  const [endArea, setEndArea] = useState<[number, number] | null>(null)
  const [areaSize, setAreaSize] = useState(800 / grid.columns)
  const [cellsCount, setCellsCount] = useState(grid.columns * 1)
  const [rowsCount, setRowsCount] = useState(1)
  const [windowWidth, windowHeight] = useWindowSize()

  useEffect(() => {
    setWidth($root.current?.offsetWidth)
    setRowsCount(Math.ceil($root.current.clientHeight / areaSize))
    setCellsCount(rowsCount * grid.columns)
  }, [windowHeight, windowWidth])

  useEffect(() => {
    setAreaSize(width / grid.columns)
  }, [width, grid.columns])

  const addArea = (start: [number, number], end: [number, number]) => {
    onNewArea?.({
      id: uniqid(),
      position: [
        Math.min(start[0], end?.[0] ?? start[0]),
        Math.min(start[1], end?.[1] ?? start[1]),
        Math.max(start[0], end?.[0] ?? start[0]),
        Math.max(start[1], end?.[1] ?? start[1])
      ],
      content: null
    })
  }

  const getAreaById = (id: string): TMediaGridArea | null => {
    for (let area of grid.areas) {
      if (area.id === id) {
        return area
      }
    }
    return null
  }

  const onGridCellPointerDown = (e: MouseEvent) => {
    if (!e.target.classList.contains('media-grid-mockup_cell')) {
      return
    }

    e.preventDefault

    const $cell = e.target as HTMLElement
    const cellPosition = getCellPosition($cell)

    setSelecting(true)
    setStartArea(cellPosition)
  }

  const onGridCellPointerUp = (e: PointerEvent) => {
    e.preventDefault

    addArea(startArea, endArea)

    setSelecting(false)
    setStartArea(null)
    setEndArea(null)
  }

  const getCellPosition = ($cell: HTMLElement): [number, number] => {
    const index = Array.from(
      $root.current.querySelectorAll('.media-grid-mockup_cell')
    ).indexOf($cell)

    const row = Math.floor(index / grid.columns)
    const column = index % grid.columns
    return [row, column]
  }

  const onPointerEnter = (e: PointerEvent) => {
    if (!selecting) {
      return
    }

    // get the cell position in the grid
    const $cell = e.target as HTMLElement
    const cellPosition = getCellPosition($cell)

    // if the is not already in an area, set it
    if (getArea(cellPosition[0], cellPosition[1]) !== -1) {
      return
    }

    // set the end area
    setEndArea(cellPosition)
  }

  const isInSelectingArea = (row: number, column: number): boolean => {
    if (!startArea || !endArea) {
      return false
    }

    const startRow = Math.min(startArea[0], endArea[0])
    const endRow = Math.max(startArea[0], endArea[0])
    const startCol = Math.min(startArea[1], endArea[1])
    const endCol = Math.max(startArea[1], endArea[1])

    return (
      row >= startRow && row <= endRow && column >= startCol && column <= endCol
    )
  }

  const getArea = (row: number, column: number): number => {
    for (let i in grid.areas) {
      const area = grid.areas[i]
      const [startRow, startCol, endRow, endCol] = area.position
      if (
        row >= startRow &&
        row <= endRow &&
        column >= startCol &&
        column <= endCol
      ) {
        return parseInt(i)
      }
    }
    return -1
  }

  return (
    <div
      ref={$root}
      key={grid.columns + 'x' + grid.rows}
      className={`media-grid-mockup ${selecting ? '-selecting' : ''}`}
    >
      <div
        className="media-grid-mockup_grid"
        onPointerDown={onGridCellPointerDown}
        onPointerUp={onGridCellPointerUp}
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: `repeat(9999, 1fr)`
        }}
      >
        {[...Array(cellsCount)].map((_, index) => (
          <div
            key={index}
            onPointerEnter={onPointerEnter}
            className={`media-grid-mockup_cell ${
              isInSelectingArea(
                Math.floor(index / grid.columns),
                index % grid.columns
              )
                ? '-in-selection'
                : ''
            }`}
          ></div>
        ))}
      </div>
    </div>
  )
}
