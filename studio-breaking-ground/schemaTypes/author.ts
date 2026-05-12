import {defineArrayMember, defineField, defineType} from 'sanity'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  fields: [
    defineField({name: 'name', type: 'string', title: 'Name', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {source: 'name'},
      validation: (rule) => rule.required()
    }),
    defineField({name: 'image', type: 'image', title: 'Photo', options: {hotspot: true}}),
    defineField({
      name: 'bio',
      type: 'array',
      title: 'Bio',
      description: 'Short author bio. Highlight text and add a link to include LinkedIn or other profile URLs.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [],
            annotations: [
              defineField({
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  defineField({
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (rule) => rule.required(),
                  }),
                  defineField({
                    name: 'openInNewTab',
                    type: 'boolean',
                    title: 'Open in new tab',
                    initialValue: true,
                  }),
                ],
              }),
            ],
          },
        }),
      ],
    })
  ]
})

