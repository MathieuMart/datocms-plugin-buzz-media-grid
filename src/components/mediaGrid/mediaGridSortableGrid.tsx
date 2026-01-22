import React, { useEffect, useState } from 'react'
import ReactGridLayout, {
  Layout,
  LayoutItem,
  useContainerWidth
} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import mediaGridCompactor from './compactor/mediaGridCompactor'
import { TMediaGridArea, TMediaGridGrid } from './mediaGrid.type'
import MediaGridArea from './mediaGridArea'
import MediaGridMockupGrid from './mediaGridMockupGrid'

export default function MediaGridSortableGrid({
  grid,
  onUpdate,
  selectContent
}: {
  grid: TMediaGridGrid
  onUpdate?: (newGrid: TMediaGridGrid) => void
  selectContent?: () => Promise<{ type: 'image' | 'video'; url: string }>
}) {
  const { width, containerRef, mounted } = useContainerWidth()
  const layout = []

  const [areas, setAreas] = useState<TMediaGridGrid['areas']>(grid.areas)
  const [areaSize, setAreaSize] = useState(800 / grid.columns)
  const [currentLayoutItem, setCurrentLayoutItem] = useState<LayoutItem | null>(
    null
  )
  const [displayInfoType, setDisplayInfoType] = useState<'position' | 'size'>(
    'position'
  )

  const ASPECT_RATIOS_MAP = {
    '1:1': 1,
    '4:3': 4 / 3,
    '3:4': 3 / 4,
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '21:9': 21 / 9,
    '9:21': 9 / 21,
    '2:1': 2,
    '1:2': 1 / 2,
    '3:2': 3 / 2,
    '2:3': 2 / 3,
    '5:4': 5 / 4,
    '4:5': 4 / 5
  }

  useEffect(() => {
    setAreaSize(Math.ceil(width / grid.columns))
  }, [
    containerRef.current,
    containerRef.current?.offsetHeight,
    width,
    grid.columns
  ])

  useEffect(() => {
    // get the larger row number used
    let maxRow = 0
    for (let area of areas) {
      if (area.position[2] > maxRow) {
        maxRow = area.position[2]
      }
    }

    // notify the parent about the change
    onUpdate?.({
      ...grid,
      rows: maxRow + 1,
      areas
    })
  }, [areas])

  const getAreaById = (id: string): TMediaGridArea | null => {
    for (let area of areas) {
      if (area.id === id) {
        return area
      }
    }
    return null
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

  const getAspectRatioNameFromValue = (width: number, height): string => {
    let value = width / height

    value = Math.round(value * 100) / 100 // round to 2 decimals

    for (let [name, val] of Object.entries(ASPECT_RATIOS_MAP)) {
      val = Math.round(val * 100) / 100 // round to 2 decimals

      if (val === value) {
        return name
      }
    }
    return `${width}:${height}`
  }
  return (
    <div
      ref={containerRef}
      className="media-grid-field_grid"
      style={{
        '--area-size': `${areaSize}px` as string
      }}
    >
      {mounted && (
        <>
          <MediaGridMockupGrid
            grid={grid}
            onNewArea={(area: TMediaGridArea) => {
              const newAreas = [...areas]
              newAreas.push(area)
              setAreas(newAreas)
            }}
          />
          <ReactGridLayout
            compactor={{
              ...mediaGridCompactor
              // preventCollision: true
            }}
            layout={layout}
            width={width}
            gridConfig={{
              cols: grid.columns,
              rowHeight: width / grid.columns,
              margin: [0, 0]
            }}
            dragConfig={{
              bounded: true
            }}
            resizeConfig={{
              handles: ['e', 'n', 'ne', 'nw', 's', 'se', 'sw', 'w']
            }}
            onDrag={(
              layout: Layout,
              oldItem: LayoutItem,
              newItem: LayoutItem
            ) => {
              setCurrentLayoutItem(newItem)
              setDisplayInfoType('position')
            }}
            onDragStop={() => {
              setCurrentLayoutItem(null)
            }}
            onResize={(
              layout: Layout,
              oldItem: LayoutItem,
              newItem: LayoutItem
            ) => {
              setCurrentLayoutItem(newItem)
              setDisplayInfoType('size')
            }}
            onResizeStop={() => {
              setCurrentLayoutItem(null)
            }}
            onLayoutChange={(newLayout: any) => {
              const newAreas = []

              for (let layout of newLayout) {
                const area = getAreaById(layout.i)

                if (!area) {
                  continue
                }

                newAreas.push({
                  id: layout.i,
                  content: area?.content || null,
                  position: [
                    layout.y,
                    layout.x,
                    layout.y + layout.h - 1,
                    layout.x + layout.w - 1
                  ]
                })
              }

              setAreas(newAreas)
            }}
          >
            {grid.areas.map((area, i) => (
              <div
                key={area.id}
                className="media-grid-field_area"
                data-grid={{
                  i: area.id,
                  x: area.position[1],
                  y: area.position[0],
                  w: area.position[3] - area.position[1] + 1,
                  h: area.position[2] - area.position[0] + 1
                }}
                style={{
                  '--aspect-ratio': `${
                    (area.position[3] - area.position[1] + 1) /
                    (area.position[2] - area.position[0] + 1)
                  }` as string
                }}
              >
                <MediaGridArea
                  key={area.id}
                  area={area}
                  onDeleteArea={deleteArea}
                  onDeleteContent={deleteContent}
                  onSelectContent={async (area: TMediaGridArea) => {
                    if (!selectContent) {
                      return
                    }
                    area.content = await selectContent()
                    const newAreas = [...areas]
                    newAreas[i] = area
                    setAreas(newAreas)
                  }}
                />
                {currentLayoutItem?.i === area.id && (
                  <div className="media-grid-field_area-overlay">
                    {/* <div>
                      <span className="media-grid-field_area-overlay-label">
                        Position:
                      </span>{' '}
                      <span className="media-grid-field_area-overlay-value">
                        {currentLayoutItem.x}, {currentLayoutItem.y}
                      </span>
                    </div> */}
                    {/* <div>
                      <span className="media-grid-field_area-overlay-label">
                        Size:
                      </span>{' '}
                      <span className="media-grid-field_area-overlay-value">
                        {currentLayoutItem.w} x {currentLayoutItem.h}
                      </span>
                    </div> */}
                    {displayInfoType === 'position' && (
                      <div>
                        <span className="media-grid-field_area-overlay-label">
                          Position:
                        </span>{' '}
                        <span className="media-grid-field_area-overlay-value">
                          {currentLayoutItem.x + 1}:{currentLayoutItem.y + 1}
                        </span>
                      </div>
                    )}
                    {displayInfoType === 'size' && (
                      <div>
                        <span className="media-grid-field_area-overlay-label">
                          Aspect ratio:
                        </span>{' '}
                        <span className="media-grid-field_area-overlay-value">
                          {getAspectRatioNameFromValue(
                            currentLayoutItem.w,
                            currentLayoutItem.h
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              // <div
              //   key={area.id}
              //   className="media-grid-field_area"
              //   data-grid={{
              //     i: area.id,
              //     x: area.position[1],
              //     y: area.position[0],
              //     w: area.position[3] - area.position[1] + 1,
              //     h: area.position[2] - area.position[0] + 1
              //   }}
              //   style={{
              //     '--aspect-ratio': `${
              //       (area.position[3] - area.position[1] + 1) /
              //       (area.position[2] - area.position[0] + 1)
              //     }` as string
              //   }}
              // >
              //   <div className="media-grid-field_area-controls">
              //     {area.content && (
              //       <DeleteButton
              //         className="media-grid-field_area-delete-button"
              //         label=""
              //         onConfirm={() => {
              //           deleteContent(area)
              //         }}
              //       />
              //     )}
              //     {!area.content && (
              //       <DeleteButton
              //         className="media-grid-field_area-delete-button"
              //         label=""
              //         onConfirm={() => {
              //           deleteArea(area)
              //         }}
              //       />
              //     )}
              //   </div>

              //   {!area.content && (
              //     <button
              //       className="media-grid-field_area-select-content-button"
              //       onClick={async () => {
              //         if (!selectContent) {
              //           return
              //         }
              //         area.content = await selectContent()
              //         const newAreas = [...areas]
              //         newAreas[i] = area
              //         setAreas(newAreas)
              //       }}
              //     >
              //       Select content
              //     </button>
              //   )}
              //   {area.content && area.content.type === 'image' && (
              //     <img
              //       className="media-grid-field_area-image"
              //       src={area.content.url}
              //     />
              //   )}
              //   {area.content && area.content.type === 'video' && (
              //     <video
              //       className="media-grid-field_area-video"
              //       src={area.content.url}
              //       loop
              //       muted
              //       playsInline
              //     />
              //   )}

              //
              // </div>
            ))}
          </ReactGridLayout>
        </>
      )}
    </div>
  )
}
