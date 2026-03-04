import {defineField, defineType} from 'sanity'

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  fields: [
    defineField({
      name: 'heroArticle',
      title: 'Hero Article',
      type: 'reference',
      to: [{type: 'article'}],
      description: 'Primary hero article on the homepage.',
    }),
    defineField({
      name: 'secondaryFeature',
      title: 'Secondary Feature',
      type: 'reference',
      to: [{type: 'article'}],
      description: 'Secondary feature article block.',
    }),
    defineField({
      name: 'gridOne',
      title: 'Grid One',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'article'}]}],
      validation: (Rule) => Rule.max(4),
      description: 'First homepage article grid (max 4).',
    }),
    defineField({
      name: 'gridTwo',
      title: 'Grid Two',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'article'}]}],
      validation: (Rule) => Rule.max(4),
      description: 'Second homepage article grid (max 4).',
    }),
    defineField({
      name: 'issueHighlight',
      title: 'Issue Highlight',
      type: 'reference',
      to: [{type: 'issue'}],
      description: 'Optional issue highlight block.',
    }),
    defineField({
      name: 'announcementMessage',
      title: 'Announcement Message',
      type: 'string',
      description: 'Main sentence shown in the homepage announcement bar.',
      validation: (Rule) => Rule.required().max(180),
    }),
    defineField({
      name: 'announcementLinkLabel',
      title: 'Announcement Link Label',
      type: 'string',
      description: 'Clickable link text in the homepage announcement bar.',
      validation: (Rule) => Rule.required().max(60),
    }),
    defineField({
      name: 'announcementLinkUrl',
      title: 'Announcement Link URL',
      type: 'url',
      description: 'Destination URL for the homepage announcement link.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Homepage',
    }),
  },
})
