// @ts-nocheck
import { upperFirst } from '@blackbyte/sugar/string'
import { Canvas, FieldGroup, SwitchField, TextField } from 'datocms-react-ui'
import { useEffect, useState } from 'react'
import './config.css'
import { type TConfig } from './config.type'

let updateTimeout

export const MEDIA_GRID_DEFAULTS = {
  layouts: ['desktop'],
  columns: 12,
  rows: 12,
  allowCustomizeGrid: true
}

export default function Config({ ctx }) {
  const parameters = (ctx.plugin.attributes.parameters ?? {}) as TConfig

  const [layouts, setLayouts] = useState(
    parameters.layouts ?? MEDIA_GRID_DEFAULTS.layouts
  )

  const [layoutsSettings, setLayoutsSettings] = useState(
    parameters.layoutsSettings ?? {}
  )

  function updateParameters(newParameters: Partial<TConfig>): void {
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      ctx.updatePluginParameters({
        ...parameters,
        ...newParameters
      })
      ctx.notice('Config updated successfully!')
    }, 1000)
  }

  // first install
  useEffect(() => {
    if (!Object.keys(parameters).length) {
      const layoutsSettingsInit = {}
      MEDIA_GRID_DEFAULTS.layouts.forEach((layout) => {
        layoutsSettingsInit[layout] = {
          columns: MEDIA_GRID_DEFAULTS.columns,
          rows: MEDIA_GRID_DEFAULTS.rows,
          allowCustomizeGrid: MEDIA_GRID_DEFAULTS.allowCustomizeGrid
        }
      })

      setLayouts(MEDIA_GRID_DEFAULTS.layouts)
      setLayoutsSettings(layoutsSettingsInit)
      updateParameters({
        layouts: MEDIA_GRID_DEFAULTS.layouts,
        layoutsSettings: layoutsSettingsInit
      })
    }
  }, [])

  return (
    <Canvas ctx={ctx}>
      <div className="config">
        <FieldGroup>
          <TextField
            required
            hint="Define here the layouts you want to use in the media grid. Layouts can be any string value, usually they represent your media queries breakpoints (e.g. mobile, tablet, desktop)."
            textInputProps={{ monospaced: true }}
            label="Layouts (comma separated)"
            defaultValue="deskop,mobile"
            value={layouts.join(',')}
            onChange={(value) => {
              setLayouts(value.split(',').map((item) => item.trim()))
              updateParameters({
                layouts: value.split(',').map((item) => item.trim())
              })
            }}
          />
        </FieldGroup>

        {layouts.map((layout) => (
          <FieldGroup key={layout}>
            <h3 className="typo-h3">
              <span className="typo-bold">{upperFirst(layout)}</span> layout
              defaults
            </h3>

            <TextField
              id="columns"
              name="columns"
              type="number"
              label="Default columns count"
              hint="This is the default. It can ben overridden in the media grid field configuration."
              defaultValue={MEDIA_GRID_DEFAULTS.columns}
              value={
                layoutsSettings[layout]?.columns ?? MEDIA_GRID_DEFAULTS.columns
              }
              onChange={(newValue) => {
                if (!layoutsSettings[layout]) {
                  layoutsSettings[layout] = {}
                }
                layoutsSettings[layout].columns = Number(newValue)
                setLayoutsSettings({ ...layoutsSettings })
                updateParameters({
                  layoutsSettings: { ...layoutsSettings }
                })
              }}
            />
            <TextField
              id="rows"
              name="rows"
              type="number"
              label="Default rows count"
              hint="This is the default. It can ben overridden in the media grid field configuration."
              defaulValue={MEDIA_GRID_DEFAULTS.rows}
              value={layoutsSettings[layout]?.rows ?? MEDIA_GRID_DEFAULTS.rows}
              onChange={(newValue) => {
                if (!layoutsSettings[layout]) {
                  layoutsSettings[layout] = {}
                }
                layoutsSettings[layout].rows = Number(newValue)
                setLayoutsSettings({ ...layoutsSettings })
                updateParameters({
                  layoutsSettings: { ...layoutsSettings }
                })
              }}
            />
            <SwitchField
              name="allowCustomizeGrid"
              id="allowCustomizeGrid"
              label="Allow customizing grid?"
              hint="Enable users to customize the grid layout (columns and rows). This is the default. It can ben overridden in the media grid field configuration."
              value={
                layoutsSettings[layout]?.allowCustomizeGrid ??
                MEDIA_GRID_DEFAULTS.allowCustomizeGrid
              }
              onChange={(newValue) => {
                if (!layoutsSettings[layout]) {
                  layoutsSettings[layout] = {}
                }
                layoutsSettings[layout].allowCustomizeGrid = newValue
                setLayoutsSettings({ ...layoutsSettings })
                updateParameters({
                  layoutsSettings: { ...layoutsSettings }
                })
              }}
            />
          </FieldGroup>
        ))}
      </div>
    </Canvas>
  )
}
