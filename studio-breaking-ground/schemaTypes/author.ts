import {defineField, defineType} from 'sanity'

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
    defineField({name: 'bio', type: 'text', title: 'Bio'})
  ]
})

