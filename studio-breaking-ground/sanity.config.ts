import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {colorInput} from '@sanity/color-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Breaking Ground',

  projectId: 'y9xwdi89',
  dataset: 'production',

  plugins: [structureTool(), colorInput()],

  schema: {
    types: schemaTypes,
  },
})
