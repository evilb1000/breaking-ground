import {defineField, defineType} from 'sanity'

const sponsorTiers = [
  {title: 'Founder', value: 'founder'},
  {title: 'Partner', value: 'partner'},
  {title: 'Network', value: 'network'},
  {title: 'Courtesy', value: 'courtesy'},
]

export const businessCategories = [
  {title: 'Legal', value: 'legal'},
  {title: 'Financial Services', value: 'financialServices'},
  {title: 'Insurance & Risk Management', value: 'insuranceRisk'},
  {title: 'Architecture & Engineering', value: 'architectureEngineering'},
  {title: 'General Contractor', value: 'generalContractor'},
  {title: 'Specialty Contractor', value: 'specialtyContractor'},
  {title: 'Construction Management', value: 'constructionManagement'},
  {title: 'Real Estate & Development', value: 'realEstateDevelopment'},
  {title: 'Building Materials & Suppliers', value: 'buildingMaterialsSuppliers'},
  {title: 'Technology', value: 'technology'},
  {title: 'Workforce, Training & Education', value: 'workforceTrainingEducation'},
  {title: 'Association, Civic & Public Sector', value: 'associationCivicPublic'},
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
      name: 'businessCategory',
      title: 'Business Category',
      type: 'string',
      description:
        'Used to prevent sponsor ads from appearing beside articles authored by a competing firm or organization.',
      options: {
        list: businessCategories,
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
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
      category: 'businessCategory',
      active: 'active',
      media: 'logo',
    },
    prepare({title, tier, category, active, media}) {
      return {
        title: title || 'Untitled Sponsor',
        subtitle: [tier, category, active === false ? 'inactive' : null].filter(Boolean).join(' - '),
        media,
      }
    },
  },
})
