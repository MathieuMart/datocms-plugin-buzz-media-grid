// @ts-nocheck

import { get } from '@blackbyte/sugar/object'
import { upperFirst } from '@blackbyte/sugar/string'
import { buildClient } from '@datocms/cma-client-browser'
import { Canvas, FieldGroup, SelectField, TextField } from 'datocms-react-ui'

import { useState } from 'react'
import { MEDIA_GRID_DEFAULTS } from '../config/config'
import './mediaGrid.css'
import { TMediaGridGrid } from './mediaGrid.type'
import MediaGridSortableGrid from './mediaGridSortableGrid'

export default function MediaGridField({ ctx }) {
  const parameters = ctx.parameters
  const apiToken = ctx.currentUserAccessToken
  const config = (ctx.plugin.attributes.parameters ?? {}) as TConfig
  const currentValueRaw = get(ctx.formValues, ctx.fieldPath) ?? '{}'
  const client = buildClient({ apiToken, environment: ctx.environment })
  const [layouts, setLayouts] = useState(JSON.parse(currentValueRaw))

  const layoutsOptions = (config.layouts ?? []).map((layout) => ({
    label: upperFirst(layout),
    value: layout
  }))
  const [layout, setLayout] = useState(layoutsOptions[0])

  const initNewGrid = (): TMediaGridGrid => {
    layouts[layout.value] = {
      columns: parameters[layout.value]?.columns ?? MEDIA_GRID_DEFAULTS.columns,
      // rows: parameters[layout.value]?.rows ?? MEDIA_GRID_DEFAULTS.rows,
      areas: []
    }
    return layouts[layout.value]
  }

  const [currentGrid, setCurrentGrid] = useState<TMediaGridGrid>(
    layouts[layout.value]
  )
  if (!currentGrid) {
    setCurrentGrid(initNewGrid())
  }

  let changeGridLayoutTimeout
  const [tempColumns, setTempColumns] = useState()

  const setGrid = (layoutId: string, newGrid: TMediaGridGrid) => {
    // set then new value
    const newLayouts = {
      ...layouts,
      [layoutId]: newGrid
    }

    setLayouts(newLayouts)
    ctx.setFieldValue(ctx.fieldPath, JSON.stringify(layouts))
  }

  const switchToLayout = (layoutId: string) => {
    setLayout(layoutsOptions.find((l) => l.value === layoutId))
    if (!layouts[layoutId]) {
      const newLayouts = {
        ...layouts,
        [layoutId]: initNewGrid()
      }
      setLayouts({ ...layouts })
    }

    setCurrentGrid(layouts[layoutId])
  }

  return (
    <Canvas ctx={ctx}>
      <div className={`media-grid-field`}>
        {(config.layouts ?? []).length > 1 && (
          <FieldGroup
            style={{
              marginBottom: 'var(--spacing-l)'
            }}
          >
            <SelectField
              id="layout"
              name="layout"
              label="Layout"
              value={layout}
              onChange={async (newValue) => {
                switchToLayout(newValue.value)
              }}
              selectInputProps={{
                options: layoutsOptions
              }}
            />
          </FieldGroup>
        )}

        {currentGrid && (
          <>
            <MediaGridSortableGrid
              key={layout.value}
              grid={currentGrid}
              onUpdate={(newGrid) => {
                setCurrentGrid(newGrid)
                setGrid(layout.value, newGrid)
              }}
              selectContent={async () => {
                const upload = await ctx.selectUpload({ multiple: false })
                return {
                  type: upload.attributes.mime_type?.startsWith('video/')
                    ? 'video'
                    : 'image',
                  url: upload.attributes.url,
                  width: upload.attributes.width,
                  height: upload.attributes.height,
                  thumbhash: upload.attributes.thumbhash,
                  alt: upload.attributes.default_field_metadata?.[ctx.locale]
                    ?.alt,
                  title:
                    upload.attributes.default_field_metadata?.[ctx.locale]
                      ?.title
                }
              }}
            ></MediaGridSortableGrid>

            {parameters[layout.value].allowCustomizeGrid && (
              <FieldGroup className="media-grid-field_grid-settings">
                <TextField
                  id="columns"
                  name="columns"
                  type="number"
                  label="Columns count"
                  value={tempColumns ?? currentGrid.columns}
                  textInputProps={{
                    onBlur: (e) => {
                      if (!tempColumns) {
                        return
                      }
                      if (currentGrid.areas?.length) {
                        const confirm = window.confirm(
                          'Are you sure? This will reset the grid areas.'
                        )
                        if (!confirm) {
                          setTempColumns(undefined)
                          return
                        }
                      }
                      setCurrentGrid({
                        ...currentGrid,
                        columns: parseInt(tempColumns),
                        areas: []
                      })
                      setTempColumns(undefined)
                    }
                  }}
                  onChange={(newValue) => {
                    setTempColumns(newValue)
                  }}
                />
              </FieldGroup>
            )}
          </>
        )}
      </div>
    </Canvas>
  )
}
