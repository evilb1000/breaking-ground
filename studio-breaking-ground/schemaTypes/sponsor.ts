import {defineField, defineType} from 'sanity'

const sponsorTiers = [
  {title: 'Founder', value: 'founder'},
  {title: 'Partner', value: 'partner'},
  {title: 'Network', value: 'network'},
  {title: 'Courtesy', value: 'courtesy'},
]

const eligibleSurfaces = [
  {title: 'Homepage', value: 'homepage'},
  {title: 'Member Profile', value: 'memberProfile'},
  {title: 'Project Profile', value: 'projectProfile'},
  {title: 'Articles', value: 'articles'},
  {title: 'News', value: 'news'},
  {title: 'Data', value: 'data'},
  {title: 'Insights', value: 'insights'},
]

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'websiteUrl',
      title: 'Website URL',
      type: 'url',
    }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'string',
      options: {
        list: sponsorTiers,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eligibleSurfaces',
      title: 'Eligible Surfaces',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: eligibleSurfaces,
        layout: 'grid',
      },
    }),
  ],
  preview: {
    select: {
      title: 'name',
      tier: 'tier',
      active: 'active',
      media: 'logo',
    },
    prepare({title, tier, active, media}) {
      return {
        title: title || 'Untitled Sponsor',
        subtitle: [tier, active === false ? 'inactive' : null].filter(Boolean).join(' - '),
        media,
      }
    },
  },
})
