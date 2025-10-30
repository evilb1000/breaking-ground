import {defineField, defineType} from 'sanity'

export const issue = defineType({
  name: 'issue',
  title: 'Issue',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string', title: 'Issue Title', validation: (rule) => rule.required()}),
    defineField({name: 'slug', type: 'slug', title: 'Slug', options: {source: 'title'}, validation: (rule) => rule.required()}),
    defineField({name: 'publishedAt', type: 'datetime', title: 'Published at'})
  ]
})

