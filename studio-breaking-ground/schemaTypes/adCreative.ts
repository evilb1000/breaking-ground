import {defineField, defineType} from 'sanity'

export const adCreative = defineType({
  name: 'adCreative',
  title: 'Ad Creative',
  type: 'document',
  fields: [
    defineField({
      name: 'sponsor',
      title: 'Sponsor',
      type: 'reference',
      to: [{type: 'sponsor'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'altText',
      title: 'Alt Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'clickUrl',
      title: 'Click URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      sponsor: 'sponsor.name',
      active: 'active',
      media: 'image',
    },
    prepare({title, sponsor, active, media}) {
      return {
        title: title || 'Untitled Ad Creative',
        subtitle: [sponsor, active === false ? 'inactive' : null].filter(Boolean).join(' - '),
        media,
      }
    },
  },
})
