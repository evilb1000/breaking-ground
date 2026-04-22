import {defineField, defineType} from 'sanity'

const entryReference = {
  type: 'reference',
  to: [{type: 'projectProfile'}, {type: 'figmaArticle'}],
}

export const updatedHomepage = defineType({
  name: 'updatedHomepage',
  title: 'Updated Homepage',
  type: 'document',
  groups: [
    {name: 'hero', title: 'Hero'},
    {name: 'tabbedPanel', title: 'Tabbed Panel'},
    {name: 'midAd', title: 'Mid Ad'},
    {name: 'eventBanner', title: 'Event Banner'},
    {name: 'meta', title: 'Meta'},
  ],
  fields: [
    defineField({
      name: 'heroArticle',
      title: 'Hero Article',
      type: 'reference',
      to: [{type: 'projectProfile'}, {type: 'figmaArticle'}],
      description: 'Main hero feature (left image + right text block).',
      group: 'hero',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'gridTwo',
      title: 'Tabbed Panel Items',
      type: 'array',
      of: [entryReference],
      description: 'Used in the right-side tabbed content panel (Profiles tab content).',
      group: 'tabbedPanel',
      validation: (Rule) => Rule.required().min(4).max(8),
    }),

    defineField({
      name: 'gridThree',
      title: 'Tabbed Panel Fallback Items',
      type: 'array',
      of: [entryReference],
      description: 'Fallback content if gridTwo is empty.',
      group: 'tabbedPanel',
      validation: (Rule) => Rule.max(8),
    }),

    defineField({
      name: 'secondaryFeature',
      title: 'Mid Ad Feature',
      type: 'reference',
      to: [{type: 'projectProfile'}, {type: 'figmaArticle'}],
      description: 'Used in the mid-page ad/content block.',
      group: 'midAd',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'tertiaryFeature',
      title: 'Event Banner Feature',
      type: 'reference',
      to: [{type: 'projectProfile'}, {type: 'figmaArticle'}],
      description: 'Primary source for event banner title/date/image.',
      group: 'eventBanner',
    }),

    defineField({
      name: 'issueHighlight',
      title: 'Event Banner Fallback Feature',
      type: 'reference',
      to: [{type: 'projectProfile'}, {type: 'figmaArticle'}],
      description: 'Fallback event source if Tertiary Feature is not set.',
      group: 'eventBanner',
    }),

    defineField({
      name: 'announcementMessage',
      title: 'Event Banner Body Copy',
      type: 'string',
      description: 'Body text line in the event banner.',
      group: 'eventBanner',
      validation: (Rule) => Rule.max(220),
    }),
    defineField({
      name: 'announcementLinkLabel',
      title: 'Event Banner CTA Label',
      type: 'string',
      description: 'CTA label (ex: Register here).',
      group: 'eventBanner',
      validation: (Rule) => Rule.max(80),
    }),
    defineField({
      name: 'announcementLinkUrl',
      title: 'Event Banner CTA URL',
      type: 'url',
      description: 'CTA destination URL.',
      group: 'eventBanner',
    }),

    defineField({
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 4,
      description: 'Optional editor notes for this homepage version.',
      group: 'meta',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Updated Homepage',
      subtitle: 'Desktop Figma homepage source',
    }),
  },
})
