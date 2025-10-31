import {defineField, defineType} from 'sanity'
import AnimatedDataPreview from '../components/AnimatedDataPreview'
import { baseArticle } from './baseArticle'

export default defineType({
  ...baseArticle,
  name: 'animatedData',
  title: 'Animated Data Schema',
  components: {preview: AnimatedDataPreview},
  fields: [
    ...(baseArticle as any).fields,
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
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'xField', title: 'X Field', type: 'string', description: 'Column name for X axis (or category/labels).', validation: (r) => r.required() }),
    defineField({
      name: 'yFields',
      title: 'Y Field(s)',
      type: 'array',
      of: [{type: 'string'}],
      description: 'One or more value columns (for grouped/stacked line/bar). For pie, pick one.',
      validation: (r) => r.min(1),
    }),
    defineField({ name: 'groupField', title: 'Group Field', type: 'string', description: 'Optional series grouping column.' }),
    defineField({
      name: 'colors',
      title: 'Series Colors',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Hex or CSS colors used in series order.',
    }),
    defineField({
      name: 'animationDuration',
      title: 'Animation Duration (ms)',
      type: 'number',
      initialValue: 800,
      validation: (r) => r.min(0).max(20000),
    }),
    defineField({
      name: 'animationEasing',
      title: 'Animation Easing',
      type: 'string',
      options: { list: [
        {title: 'Ease In Out', value: 'easeInOut'},
        {title: 'Ease Out', value: 'easeOut'},
        {title: 'Ease In', value: 'easeIn'},
        {title: 'Linear', value: 'linear'},
      ]},
      initialValue: 'easeInOut',
    }),
    defineField({ name: 'showAxis', title: 'Show Axes', type: 'boolean', initialValue: true }),
    defineField({ name: 'showLegend', title: 'Show Legend', type: 'boolean', initialValue: true }),
  ],
})


