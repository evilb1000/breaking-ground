import {defineField, defineType} from 'sanity'

// Canonical base article schema used as a template for extensions
export const baseArticle = defineType({
  name: 'baseArticle',
  title: 'Base Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title',
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
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
      name: 'heroLede',
      title: 'Hero lede',
      type: 'text',
      rows: 3,
      description:
        'Homepage featured hero line (replaces byline/date in hero block). Keep it 1-3 sentences.',
      validation: (Rule) => Rule.max(240),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published at',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),

    // Header image (hotspot enabled)
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

    // Optional separate image for homepage/listing presentation
    defineField({
      name: 'homepageImage',
      title: 'Homepage Image',
      type: 'image',
      options: {hotspot: true},
      description: 'Optional. If set, this image is used when the article appears on the homepage, carousels, and section pages. The Header Image is still used on the article page itself.',
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
          description: 'Optional image caption.',
        }),
      ],
    }),

    // Legacy hero image kept hidden/read-only for migration/back-compat
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

    defineField({
      name: 'author',
      type: 'reference',
      title: 'Author',
      to: [{type: 'author'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coAuthors',
      type: 'array',
      title: 'Co-Authors',
      of: [{type: 'reference', to: [{type: 'author'}]}],
      description: 'Optional additional authors when multiple people co-write a piece.',
    }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Category',
      options: {
        list: [
          {title: 'Feature', value: 'feature'},
          {title: 'Profile', value: 'profile'},
          {title: 'News', value: 'news'},
          {title: 'Data & Trends', value: 'data_trends'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      title: 'Body',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'readingTime',
      type: 'number',
      title: 'Estimated reading time (minutes)',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      title: 'Featured on homepage',
    }),
  ],
})


