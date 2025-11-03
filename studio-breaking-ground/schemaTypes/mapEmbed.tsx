import React from 'react'
import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'mapEmbed',
  title: 'Map Embed',
  type: 'object',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string'}),
    defineField({
      name: 'dataFile',
      title: 'GeoJSON',
      type: 'file',
      options: {accept: '.geojson'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'valueProperty',
      title: 'Value Property (for height/size)',
      type: 'string',
      description: 'Name of the numeric property in your GeoJSON to use for column height (e.g. votes, OConnor_2025_Total).',
    }),
    defineField({
      name: 'valueProperties',
      title: 'Multiple Value Properties (grouped columns)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Optional: add 2–3 property names to render grouped side-by-side columns (e.g. Gainey_2025_Total, OConnor_2025_Total, Peduto_2021_Total).',
    }),
    defineField({
      name: 'heightScale',
      title: 'Height Scale',
      type: 'number',
      initialValue: 1,
      description: 'Multiplier applied to the value to get extrusion height.',
    }),
    defineField({
      name: 'columnRadius',
      title: 'Column Radius (meters)',
      type: 'number',
      initialValue: 80,
    }),
    defineField({
      name: 'columnSpacing',
      title: 'Column Spacing (meters)',
      type: 'number',
      initialValue: 90,
    }),
    defineField({
      name: 'colors',
      title: 'Series Colors',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Optional hex colors for each value property (defaults will be used if empty).',
    }),
    defineField({name: 'caption', title: 'Caption', type: 'string'}),
  ],
  preview: {
    select: {title: 'title'},
    prepare: ({title}: {title?: string}) => ({
      title: title || 'Map Embed',
      media: <span style={{fontSize: 20}}>🗺️</span>,
    }),
  },
})
