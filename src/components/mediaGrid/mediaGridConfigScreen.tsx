// @ts-nocheck

import { upperFirst } from '@blackbyte/sugar/string'
import {
  Canvas,
  FieldGroup,
  SelectField,
  SwitchField,
  TextField
} from 'datocms-react-ui'
import { useCallback, useEffect, useState } from 'react'
import { MEDIA_GRID_DEFAULTS } from '../config/config.js'
import { TGridParameter } from './mediaGrid.type.js'

export default function MediaGridConfigScreen({ ctx }) {
  const [formValues, setFormValues] = useState<Partial<TGridParameter>>(
    ctx.parameters
  )
  const parameters = (ctx.plugin.attributes.parameters ?? {}) as TConfig
  const defaultLayoutsOptions = parameters.layoutsOptions ?? {}
  const layoutsOptions = (
    parameters.layouts ?? MEDIA_GRID_DEFAULTS.layouts
  ).map((layout) => ({
    label: upperFirst(layout),
    value: layout
  }))
  const [layout, setLayout] = useState(layoutsOptions[0])

  // first install
  useEffect(() => {
    if (!Object.keys(formValues).length) {
      const formValuesInit = {}
      parameters.layouts.forEach((layout) => {
        formValuesInit[layout] = {
          columns:
            parameters.layoutsSettings[layout]?.columns ??
            MEDIA_GRID_DEFAULTS.columns,
          // rows:
          //   parameters.layoutsSettings[layout]?.rows ??
          //   MEDIA_GRID_DEFAULTS.rows,
          allowCustomizeGrid:
            parameters.layoutsSettings[layout]?.allowCustomizeGrid ??
            MEDIA_GRID_DEFAULTS.allowCustomizeGrid
        }
      })
      setFormValues(formValuesInit)
      ctx.setParameters(formValuesInit)
    }
  }, [])

  const update = useCallback((layout: string, field: string, value: any) => {
    const layoutSettings = formValues[layout] ?? {}
    layoutSettings[field] = value

    const newFormValues = {
      ...formValues,
      [layout]: layoutSettings
    }

    setFormValues(newFormValues)
    ctx.setParameters(newFormValues)
  })

  return (
    <Canvas ctx={ctx}>
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
          onChange={(newValue) => {
            setLayout(newValue)
          }}
          selectInputProps={{
            options: layoutsOptions
          }}
        />
      </FieldGroup>

      {formValues?.[layout.value] && (
        <FieldGroup>
          <h3 className="typo-h3">
            Settings for layout{' '}
            <span className="typo-bold">{layout.label}</span>
          </h3>

          <TextField
            id="columns"
            name="columns"
            type="number"
            label="Columns count"
            defaultValue={6}
            value={formValues[layout.value]?.columns}
            onChange={(newValue) => {
              update(layout.value, 'columns', parseInt(newValue))
            }}
          />
          {/* <TextField
            id="columns"
            name="columns"
            type="number"
            label="Rows count"
            value={formValues[layout.value]?.rows}
            onChange={(newValue) => {
              update(layout.value, 'rows', parseInt(newValue))
            }}
          /> */}
          <SwitchField
            name="allowCustomizeGrid"
            id="allowCustomizeGrid"
            label="Allow customizing grid?"
            hint="Enable users to customize the grid layout (columns)"
            value={formValues[layout.value]?.allowCustomizeGrid}
            onChange={(newValue) => {
              update(layout.value, 'allowCustomizeGrid', newValue)
            }}
          />
        </FieldGroup>
      )}
    </Canvas>
  )
}
