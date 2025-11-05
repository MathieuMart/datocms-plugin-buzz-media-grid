// @ts-nocheck

import { uniqid } from '@blackbyte/sugar/string'
import { createRef, useEffect, useRef, useState } from 'react'
import DeleteButton from '../ui/deleteButton/deleteButton'
import './mediaGrid.css'
import { TMediaGridArea, TMediaGridGrid } from './mediaGrid.type'

export default function MediaGridGrid({
  grid,
  onUpdate,
  selectContent
}: {
  grid: TMediaGridGrid
  onUpdate?: (newGrid: TMediaGridGrid) => void
  selectContent?: () => Promise<{ type: 'image' | 'video'; url: string }>
}) {
  const $root = createRef<HTMLDivElement>()
  const isPointerDown = useRef(false)

  const [selecting, setSelecting] = useState(false)
  const [areas, setAreas] = useState<TMediaGridArea[]>(grid.areas ?? [])
  const [startArea, setStartArea] = useState<[number, number] | null>(null)
  const [endArea, setEndArea] = useState<[number, number] | null>(null)

  useEffect(() => {
    onUpdate?.({
      ...grid,
      areas
    })
  }, [areas])

  const addArea = (start: [number, number], end: [number, number]) => {
    const newAreas = [...(areas ?? [])]
    newAreas.push({
      id: uniqid(),
      position: [
        Math.min(start[0], end?.[0] ?? start[0]),
        Math.min(start[1], end?.[1] ?? start[1]),
        Math.max(start[0], end?.[0] ?? start[0]),
        Math.max(start[1], end?.[1] ?? start[1])
      ],
      content: null
    })
    setAreas(newAreas)
  }

  const getAreaById = (id: string): TMediaGridArea | null => {
    for (let area of areas) {
      if (area.id === id) {
        return area
      }
    }
    return null
  }

  const onGridCellPointerDown = (e: MouseEvent) => {
    if (!e.target.classList.contains('media-grid-field_cell')) {
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
      $root.current.querySelectorAll('.media-grid-field_cell')
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
    for (let i in areas) {
      const area = areas[i]
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

  const deleteContent = (area: TMediaGridArea) => {
    area.content = null
    const newAreas = [...areas]
    setAreas(newAreas)
  }

  const deleteArea = (area: TMediaGridArea) => {
    const newAreas = areas.filter((a) => a.id !== area.id)
    setAreas(newAreas)
  }

  return (
    <div
      ref={$root}
      key={grid.columns + 'x' + grid.rows}
      className={`media-grid-field_grid-container ${selecting ? '-selecting' : ''}`}
    >
      <div
        className="media-grid-field_grid"
        onPointerDown={onGridCellPointerDown}
        onPointerUp={onGridCellPointerUp}
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`
        }}
      >
        {[...Array(grid.rows * grid.columns)].map((_, index) => (
          <div
            key={index}
            onPointerEnter={onPointerEnter}
            className={`media-grid-field_cell ${
              getArea(
                Math.floor(index / grid.columns),
                index % grid.columns
              ) !== -1
                ? '-occupied'
                : ''
            } ${
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

      <div
        className="media-grid-field_areas"
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
          gridTemplateRows: `repeat(${grid.rows}, 1fr)`
        }}
      >
        {areas.map((area, i) => (
          <div
            key={i}
            className="media-grid-field_area"
            style={{
              gridColumnStart: area.position[1] + 1,
              gridColumnEnd: area.position[3] + 2,
              gridRowStart: area.position[0] + 1,
              gridRowEnd: area.position[2] + 2
            }}
          >
            <div className="media-grid-field_area-controls">
              {area.content && (
                <DeleteButton
                  className="media-grid-field_area-delete-button"
                  label=""
                  onConfirm={() => {
                    deleteContent(area)
                  }}
                />
              )}
              {!area.content && (
                <DeleteButton
                  className="media-grid-field_area-delete-button"
                  label=""
                  onConfirm={() => {
                    deleteArea(area)
                  }}
                />
              )}
            </div>

            {!area.content && (
              <button
                className="media-grid-field_area-select-content-button"
                onClick={async () => {
                  if (!selectContent) {
                    return
                  }
                  area.content = await selectContent()
                  const newAreas = [...areas]
                  newAreas[i] = area
                  setAreas(newAreas)
                }}
              >
                Select content
              </button>
            )}
            {area.content && area.content.type === 'image' && (
              <img
                className="media-grid-field_area-image"
                src={area.content.url}
              />
            )}
            {area.content && area.content.type === 'video' && (
              <video
                className="media-grid-field_area-video"
                src={area.content.url}
                loop
                muted
                playsInline
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
