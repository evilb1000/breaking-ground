import {defineField, defineType} from 'sanity'
import { baseArticle } from './baseArticle'

const SECTION_LABELS: Record<string, string> = {
  features: 'Features',
  'project-profiles': 'Project Profiles',
  'member-profiles': 'Member Profiles',
  news: 'News',
  perspectives: 'Perspectives',
  opinion: 'Opinion',
}

const sectionField = defineField({
  name: 'section',
  title: 'Section',
  type: 'string',
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
  validation: (Rule) => Rule.required().error('Section is required.'),
})

const seriesField = defineField({
  name: 'series',
  title: 'Series',
  type: 'reference',
  to: [{type: 'series'}],
  description: 'Optional. Use for recurring columns like Market Updates.',
})

const baseFields = ((baseArticle as any).fields || []) as Array<any>
const titleField = baseFields.find((field) => field?.name === 'title')
const remainingFields = baseFields.filter((field) => field?.name !== 'title')

export default defineType({
  ...baseArticle,
  name: 'article',
  title: 'Article',
  fields: [
    ...(titleField ? [titleField] : []),
    sectionField,
    seriesField,
    ...remainingFields,
  ],
  preview: {
    select: {
      title: 'title',
      section: 'section',
      seriesTitle: 'series.title',
      publishedAt: 'publishedAt',
      media: 'headerImage',
    },
    prepare({title, section, seriesTitle, publishedAt, media}) {
      const sectionLabel = SECTION_LABELS[section] || 'Unsectioned'
      const parts = [sectionLabel]
      if (seriesTitle) parts.push(seriesTitle)
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
