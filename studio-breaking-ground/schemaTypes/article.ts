import {defineField, defineType} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        isUnique: (value, context) => context.defaultIsUnique(value, context)
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'dek',
      title: 'Summary',
      type: 'text',
      rows: 2,
      validation: (Rule) => Rule.max(200),
      description: 'A short summary that appears under the title on the front end.',
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required()
    }),

    // Header image (hotspot-enabled, replaces prior homeCrop fields)
    defineField({
      name: 'headerImage',
      title: 'Header Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Describe the image for accessibility and SEO.',
        }),
        defineField({
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional image caption shown below the image.',
        }),
      ],
    }),

    // Legacy field to avoid "Unknown field" warnings for existing documents.
    // Hidden/readOnly; kept temporarily to allow migrating old content from heroImage -> headerImage.
    defineField({
      name: 'heroImage',
      title: 'Legacy Header Image',
      type: 'image',
      hidden: true,
      readOnly: true,
      fields: [
        defineField({name: 'alt', type: 'string', title: 'Alt Text'}),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
      ],
    }),

    // Author reference
    defineField({
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{type: 'author'}],
      validation: (rule) => rule.required()
    }),

    // Category as enum list
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      options: {
        list: [
          {title: 'Feature', value: 'feature'},
          {title: 'Profile', value: 'profile'},
          {title: 'News', value: 'news'},
          {title: 'Data & Trends', value: 'data_trends'}
        ]
      },
      validation: (rule) => rule.required()
    }),

    // Issue reference
    defineField({
      name: 'issue',
      type: 'reference',
      title: 'Issue',
      to: [{type: 'issue'}]
    }),

    // Body content using blockContent
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'Body',
      validation: (rule) => rule.required()
    }),

    // Extras
    defineField({
      name: 'readingTime',
      type: 'number',
      title: 'Estimated reading time (minutes)',
      validation: (rule) => rule.min(0)
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage'
    })
  ]
})
