import React, { useEffect, useRef, useState } from 'react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import DeleteButton from '../ui/deleteButton/deleteButton'
import { TMediaGridArea } from './mediaGrid.type'
import './mediaGridArea.css'

export default function MediaGridArea({
  area,
  onDeleteContent,
  onDeleteArea,
  onSelectContent
}: {
  area: TMediaGridArea
  onDeleteContent?: (area: TMediaGridArea) => void
  onDeleteArea?: (area: TMediaGridArea) => void
  onSelectContent?: (area: TMediaGridArea) => Promise<any>
}) {
  const $root = useRef<HTMLDivElement>(null)

  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const deleteContent = (area: TMediaGridArea) => {
    onDeleteContent?.(area)
  }

  const deleteArea = (area: TMediaGridArea) => {
    onDeleteArea?.(area)
  }

  let resizeTimeout

  useEffect(() => {
    clearTimeout(resizeTimeout)

    resizeTimeout = setTimeout(() => {
      let width =
        ($root.current?.offsetWidth ?? 0) * (window.devicePixelRatio ?? 1)
      let height =
        ($root.current?.offsetHeight ?? 0) * (window.devicePixelRatio ?? 1)

      // round with at 50 pixels
      width = Math.round(width / 50) * 50
      height = Math.round(height / 50) * 50

      setWidth(width)
      setHeight(height)
    }, 500)
  }, [$root.current, $root.current?.offsetWidth, $root.current?.offsetHeight])

  return (
    <div
      ref={$root}
      key={area.id}
      className="media-grid-area"
      onClick={(e) => {
        if (!e.metaKey) {
          return
        }
        if (area.content) {
          deleteContent(area)
        } else {
          deleteArea(area)
        }
      }}
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
      <div className="media-grid-area_controls">
        {area.content && (
          <DeleteButton
            className="media-grid-area_delete-button"
            label=""
            onConfirm={() => {
              deleteContent(area)
            }}
          />
        )}
        {!area.content && (
          <DeleteButton
            className="media-grid-area_delete-button"
            label=""
            onConfirm={() => {
              deleteArea(area)
            }}
          />
        )}
      </div>

      {!area.content && (
        <button
          className="media-grid-area_select-content-button"
          onClick={async (e) => {
            if (e.metaKey) {
              return
            }
            onSelectContent?.(area)
          }}
        >
          Select content
        </button>
      )}
      {area.content && width && height && area.content.type === 'image' && (
        <img
          className="media-grid-area_image"
          src={`${area.content.url}?w=${width}&h=${height}&fit=crop`}
        />
      )}
      {area.content && area.content.type === 'video' && (
        <video
          className="media-grid-area_video"
          src={area.content.url}
          loop
          muted
          playsInline
        />
      )}
    </div>
  )
}
