import {defineField, defineType} from 'sanity'

export const figmaArticle = defineType({
  name: 'figmaArticle',
  title: 'Figma Article',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta'},
    {name: 'intro', title: 'Intro'},
    {name: 'sidebar', title: 'Sidebar'},
    {name: 'body', title: 'Body'},
    {name: 'navigation', title: 'Navigation'},
  ],
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: {
        source: 'headline',
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Estimated Reading Time (Minutes)',
      type: 'number',
      group: 'meta',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'section',
      title: 'Section',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          {title: 'Features', value: 'features'},
          {title: 'Project Profiles', value: 'project-profiles'},
          {title: 'Member Profiles', value: 'member-profiles'},
          {title: 'News', value: 'news'},
          {title: 'Perspectives', value: 'perspectives'},
          {title: 'Opinion', value: 'opinion'},
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'meta',
      description:
        'Legacy category taxonomy preserved from the original article schema. Informational only; section is the primary classifier.',
      options: {
        list: [
          {title: 'Feature', value: 'feature'},
          {title: 'Profile', value: 'profile'},
          {title: 'News', value: 'news'},
          {title: 'Data & Trends', value: 'data_trends'},
        ],
      },
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'reference',
      group: 'meta',
      to: [{type: 'series'}],
      description: 'Optional. Use for recurring columns (preserved from legacy article schema).',
    }),

    defineField({
      name: 'introImage',
      title: 'Intro Image',
      type: 'image',
      group: 'intro',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
          description: 'Optional caption shown beneath the intro image.',
        }),
      ],
    }),
    defineField({
      name: 'articleTag',
      title: 'Article Tag',
      type: 'string',
      group: 'intro',
      initialValue: 'ARTICLE TAG',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Article Headline',
      type: 'string',
      group: 'intro',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'dek',
      title: 'Summary (Dek)',
      type: 'text',
      rows: 2,
      group: 'intro',
      description:
        'Short summary preserved from legacy article schema. Optional; not currently rendered by the Figma article template.',
      validation: (Rule) => Rule.max(240),
    }),

    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'sidebar',
      to: [{type: 'author'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coAuthors',
      title: 'Co-Authors',
      type: 'array',
      group: 'sidebar',
      of: [{type: 'reference', to: [{type: 'author'}]}],
      description:
        'Optional additional authors when multiple people co-write a piece (preserved from legacy article schema).',
    }),
    defineField({
      name: 'authorBio',
      title: 'Author Bio',
      type: 'text',
      rows: 4,
      group: 'sidebar',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'sidebar',
      of: [
        {
          type: 'reference',
          to: [{type: 'figmaArticle'}],
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(6),
    }),

    defineField({
      name: 'body',
      title: 'Body Content',
      type: 'blockContent',
      group: 'body',
      validation: (Rule) => Rule.required(),
      description:
        'Primary article content. Supports inline media blocks, so multiple in-line images can be inserted directly into the body flow.',
    }),

    defineField({
      name: 'nextArticle',
      title: 'Next Article',
      type: 'reference',
      group: 'navigation',
      to: [{type: 'figmaArticle'}],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'headline',
      section: 'section',
      publishedAt: 'publishedAt',
      media: 'introImage',
    },
    prepare({title, section, publishedAt, media}) {
      const sectionLabel = section || 'Unsectioned'
      const parts = [sectionLabel, 'Figma Article']
      if (publishedAt) {
        const date = new Date(publishedAt)
        if (!Number.isNaN(date.getTime())) {
          parts.push(
            date.toLocaleDateString('en-US', {
              month: 'short',
              year: 'numeric',
            })
          )
        }
      }
      return {
        title,
        subtitle: parts.join(' • '),
        media,
      }
    },
  },
})
