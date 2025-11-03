import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'chartData',
  title: 'Chart Data',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required(),
      description: 'Chart name/identifier',
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'dataFile',
      title: 'CSV Data',
      type: 'file',
      options: {accept: 'text/csv'},
      description: 'Upload a .csv file containing your data rows.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'chartType',
      title: 'Chart Type',
      type: 'string',
      options: {
        list: [
          {title: 'Line', value: 'line'},
          {title: 'Bar', value: 'bar'},
          {title: 'Pie', value: 'pie'},
          {title: 'Area', value: 'area'},
          {title: 'Scatter', value: 'scatter'},
          {title: 'Stacked Bar', value: 'stacked'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ 
      name: 'xField', 
      title: 'X Field', 
      type: 'string', 
      description: 'Column name for X axis (or category/labels).', 
      validation: (r) => r.required() 
    }),
    defineField({
      name: 'yFields',
      title: 'Y Field(s)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One or more value columns (for grouped/stacked line/bar). For pie, pick one.',
      validation: (r) => r.min(1),
    }),
    defineField({ 
      name: 'groupField', 
      title: 'Group Field', 
      type: 'string', 
      description: 'Optional series grouping column.' 
    }),
    defineField({
      name: 'colors',
      title: 'Series Colors',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Hex or CSS colors used in series order.',
    }),
    defineField({ 
      name: 'chartTitle', 
      title: 'Chart Title', 
      type: 'string' 
    }),
    defineField({ 
      name: 'xLabel', 
      title: 'X Axis Title', 
      type: 'string',
      description: 'Horizontal axis title/label'
    }),
    defineField({ 
      name: 'yLabel', 
      title: 'Y Axis Title', 
      type: 'string',
      description: 'Vertical axis title/label'
    }),
    defineField({
      name: 'animationDuration',
      title: 'Animation Duration (ms)',
      type: 'number',
      initialValue: 800,
      validation: (r) => r.min(0).max(20000),
      description: 'Animation duration for non-scroll animations',
    }),
    defineField({
      name: 'animationEasing',
      title: 'Animation Easing',
      type: 'string',
      options: { 
        list: [
          {title: 'Ease In Out', value: 'easeInOut'},
          {title: 'Ease Out', value: 'easeOut'},
          {title: 'Ease In', value: 'easeIn'},
          {title: 'Linear', value: 'linear'},
        ]
      },
      initialValue: 'easeInOut',
      description: 'Animation easing for non-scroll animations',
    }),
    defineField({ 
      name: 'showAxis', 
      title: 'Show Axes', 
      type: 'boolean', 
      initialValue: true 
    }),
    defineField({ 
      name: 'showTicks', 
      title: 'Show Tick Labels', 
      type: 'boolean', 
      initialValue: true 
    }),
    defineField({ 
      name: 'tickCount', 
      title: 'Y Tick Count', 
      type: 'number', 
      initialValue: 5, 
      validation: (r) => r.min(2).max(10) 
    }),
    defineField({ 
      name: 'numberFormat', 
      title: 'Y Number Format', 
      type: 'string', 
      description: 'Optional formatter hint, e.g., 0,0 or 0.0a' 
    }),
    defineField({ 
      name: 'showLegend', 
      title: 'Show Legend', 
      type: 'boolean', 
      initialValue: true 
    }),
  ],
  preview: {
    select: {
      title: 'title',
      chartType: 'chartType',
      media: 'dataFile'
    },
    prepare({title, chartType}) {
      return {
        title: title || 'Untitled Chart',
        subtitle: chartType ? `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart` : 'Chart'
      }
    }
  }
})

