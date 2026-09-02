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
          {title: 'Donut', value: 'donut'},
          {title: 'Combo Bar + Line', value: 'combo'},
          {title: 'Heatmap + Range', value: 'heatmapRange'},
          {title: 'Area', value: 'area'},
          {title: 'Scatter', value: 'scatter'},
          {title: 'Stacked Bar', value: 'stacked'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'posterTheme',
      title: 'Poster Theme',
      type: 'string',
      hidden: ({parent}) => parent?.chartType !== 'heatmapRange',
      options: {
        list: [
          {title: 'Cool Midnight', value: 'cool-midnight'},
          {title: 'Cozy Cottage', value: 'cozy-cottage'},
          {title: 'Harbor Fog', value: 'harbor-fog'},
          {title: 'Signal Cyan', value: 'signal-cyan'},
        ],
        layout: 'radio',
      },
      initialValue: 'cool-midnight',
      description: 'Named visual variation from data_posters/types/<type>/themes.',
    }),
    defineField({ 
      name: 'xField', 
      title: 'X Field', 
      type: 'string', 
      description: 'Column name for X axis (or category/labels). For heatmap posters, this is the row label column (e.g. submarket).', 
      validation: (r) => r.required() 
    }),
    defineField({
      name: 'yFields',
      title: 'Y Field(s)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One or more value columns (for grouped/stacked line/bar). For pie, pick one. For heatmap posters, list the quarter columns in display order; year1/year2/year3/avg_3yr/sales are read automatically.',
      validation: (r) =>
        r.custom((fields, context) => {
          const chartType = (context.parent as {chartType?: string} | undefined)?.chartType
          if (chartType === 'heatmapRange') return true
          if (!fields?.length) return 'Add at least one Y field'
          return true
        }),
    }),
    defineField({
      name: 'seriesConfig',
      title: 'Series Configuration',
      type: 'array',
      description: 'For combo charts, configure each CSV value column as a bar or line and assign it to the left or right axis.',
      hidden: ({parent}) => parent?.chartType !== 'combo',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'field',
              title: 'CSV Field',
              type: 'string',
              description: 'Exact CSV column name for this series.',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'label',
              title: 'Display Label',
              type: 'string',
              description: 'Optional legend label. Falls back to the CSV field name.',
            }),
            defineField({
              name: 'renderAs',
              title: 'Render As',
              type: 'string',
              options: {
                list: [
                  {title: 'Bar', value: 'bar'},
                  {title: 'Line', value: 'line'},
                ],
                layout: 'radio',
              },
              initialValue: 'bar',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'axis',
              title: 'Axis',
              type: 'string',
              options: {
                list: [
                  {title: 'Left', value: 'left'},
                  {title: 'Right', value: 'right'},
                ],
                layout: 'radio',
              },
              initialValue: 'left',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'color',
              title: 'Color',
              type: 'string',
              description: 'Optional hex or CSS color for this series.',
            }),
          ],
          preview: {
            select: {
              field: 'field',
              label: 'label',
              renderAs: 'renderAs',
              axis: 'axis',
            },
            prepare({field, label, renderAs, axis}) {
              return {
                title: label || field || 'Untitled series',
                subtitle: [renderAs, axis ? `${axis} axis` : null].filter(Boolean).join(' - '),
              }
            },
          },
        },
      ],
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

