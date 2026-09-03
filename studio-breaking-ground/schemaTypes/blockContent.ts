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
      to: [{type: 'chartData'}],
    }),
    // Chart figure with alignment/size/caption
    defineArrayMember({
      name: 'chartFigure',
      title: 'Chart Figure',
      type: 'object',
      fields: [
        defineField({ name: 'chart', title: 'Chart', type: 'reference', to: [{type: 'chartData'}], validation: (r) => r.required() }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'text',
          rows: 3,
          description:
            'Optional. Overrides the caption on the Chart Data document for this article only.',
        }),
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
        select: {title: 'chart.title', caption: 'caption'},
        prepare: ({title, caption}: {title?: string; caption?: string}) => ({
          title: title || caption || 'Chart Figure',
          subtitle: title && caption ? caption : undefined,
        })
      }
    }),
    // Map Embed
    defineArrayMember({
      name: 'mapEmbed',
      title: 'Map Embed',
      type: 'mapEmbed',
    }),
    // Ad slot (686 × 361 — matches the homepage ad rectangle)
    defineArrayMember({
      name: 'adSlot',
      title: 'Ad Slot',
      type: 'object',
      fields: [
        defineField({
          name: 'image',
          title: 'Ad Image (686×361)',
          type: 'image',
          options: {hotspot: true},
          description:
            'Ad creative displayed in the body. If no image is provided, a grey "Ad space" placeholder renders at the correct size.',
        }),
        defineField({
          name: 'linkUrl',
          title: 'Click-through URL',
          type: 'url',
        }),
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
        defineField({
          name: 'label',
          title: 'Internal Label',
          type: 'string',
          description: 'Optional label shown in the Studio preview only (e.g. "April sponsor").',
        }),
      ],
      preview: {
        select: {title: 'label', media: 'image'},
        prepare({title, media}: {title?: string; media?: unknown}) {
          return {title: title || 'Ad Slot (686×361)', media: media as any}
        },
      },
    }),
    // Pull quote (Figma article module)
    defineArrayMember({
      name: 'pullQuote',
      title: 'Pull Quote',
      type: 'object',
      fields: [
        defineField({
          name: 'quote',
          title: 'Quote',
          type: 'text',
          rows: 3,
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'attribution',
          title: 'Attribution',
          type: 'string',
        }),
      ],
      preview: {
        select: {title: 'quote', subtitle: 'attribution'},
        prepare({title, subtitle}: {title?: string; subtitle?: string}) {
          const preview = title && title.length > 60 ? `${title.slice(0, 60)}…` : title
          return {
            title: preview || 'Pull Quote',
            subtitle: subtitle || undefined,
          }
        },
      },
    }),
  ]
})
