import {defineArrayMember, defineField, defineType} from 'sanity'

export const blockContent = defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      marks: {
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({name: 'href', type: 'url', title: 'URL', validation: (rule) => rule.required()}),
              defineField({name: 'openInNewTab', type: 'boolean', title: 'Open in new tab'})
            ]
          }
        ]
      }
    }),

    // Inline image
    defineArrayMember({
      name: 'inlineImage',
      title: 'Inline image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', type: 'string', title: 'Alt text'}),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
        defineField({
          name: 'alignment',
          title: 'Alignment',
          type: 'string',
          options: {
            list: [
              {title: 'Left', value: 'left'},
              {title: 'Right', value: 'right'},
              {title: 'Center', value: 'center'}
            ],
            layout: 'radio'
          }
        }),
        defineField({
          name: 'size',
          title: 'Size',
          type: 'string',
          options: {
            list: [
              {title: 'Small (25%)', value: 'small'},
              {title: 'Medium (50%)', value: 'medium'},
              {title: 'Large (75%)', value: 'large'},
              {title: 'Full (100%)', value: 'full'}
            ],
            layout: 'radio'
          }
        })
      ]
    }),

    // Floating image/object figure with alignment
    defineArrayMember({
      name: 'figure',
      title: 'Figure',
      type: 'object',
      fields: [
        defineField({
          name: 'image',
          type: 'image',
          title: 'Image',
          options: {hotspot: true},
          validation: (rule) => rule.required()
        }),
        defineField({name: 'alt', type: 'string', title: 'Alt text'}),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
        defineField({
          name: 'alignment',
          title: 'Alignment',
          type: 'string',
          options: {
            list: [
              {title: 'Left', value: 'left'},
              {title: 'Right', value: 'right'},
              {title: 'Center', value: 'center'}
            ],
            layout: 'radio'
          },
          initialValue: 'center'
        }),
        defineField({
          name: 'size',
          title: 'Size',
          type: 'string',
          options: {
            list: [
              {title: 'Small (25%)', value: 'small'},
              {title: 'Medium (50%)', value: 'medium'},
              {title: 'Large (75%)', value: 'large'},
              {title: 'Full (100%)', value: 'full'}
            ],
            layout: 'radio'
          }
        })
      ],
      preview: {
        select: {title: 'caption', media: 'image'},
        prepare(selection) {
          const {title} = selection as {title?: string}
          return {title: title || 'Figure', media: (selection as any).media}
        }
      }
    })
    ,
    // Inline chart (reference)
    defineArrayMember({
      name: 'inlineChart',
      title: 'Inline Chart',
      type: 'reference',
      to: [{type: 'animatedData'}],
    }),
    // Chart figure with alignment/size/caption
    defineArrayMember({
      name: 'chartFigure',
      title: 'Chart Figure',
      type: 'object',
      fields: [
        defineField({ name: 'chart', title: 'Chart', type: 'reference', to: [{type: 'animatedData'}], validation: (r) => r.required() }),
        defineField({ name: 'caption', title: 'Caption', type: 'string' }),
        defineField({
          name: 'alignment', title: 'Alignment', type: 'string', options: { layout: 'radio', list: [
            {title: 'Left', value: 'left'},
            {title: 'Right', value: 'right'},
            {title: 'Center', value: 'center'},
          ]}, initialValue: 'center'
        }),
        defineField({
          name: 'size', title: 'Size', type: 'string', options: { layout: 'radio', list: [
            {title: 'Small (25%)', value: 'small'},
            {title: 'Medium (50%)', value: 'medium'},
            {title: 'Large (75%)', value: 'large'},
            {title: 'Full (100%)', value: 'full'},
          ]}, initialValue: 'full'
        })
      ],
      preview: {
        select: {title: 'caption'},
        prepare: ({title}: {title?: string}) => ({title: title || 'Chart Figure'})
      }
    })
  ]
})
