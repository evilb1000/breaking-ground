import {defineField, defineType, defineArrayMember} from 'sanity'

/* ------------------------------------------------------------------ */
/*  Shared presentation fieldset + fields for every section block     */
/* ------------------------------------------------------------------ */

const PRESENTATION_FIELDSET = {
  name: 'presentation',
  title: 'Section Presentation',
  options: {collapsible: true, collapsed: true},
} as const

interface SectionDefaults {
  sectionTheme?: string
  topSpacing?: string
  bottomSpacing?: string
  contentWidth?: string
}

function sectionPresentationFields(defaults: SectionDefaults = {}) {
  return [
    defineField({
      name: 'sectionTheme',
      title: 'Background Theme',
      type: 'string',
      fieldset: 'presentation',
      options: {
        list: [
          {title: 'White', value: 'white'},
          {title: 'Light Gray', value: 'light'},
          {title: 'Dark', value: 'dark'},
          {title: 'Black', value: 'black'},
          {title: 'Custom Color', value: 'custom'},
        ],
      },
      initialValue: defaults.sectionTheme || 'white',
    }),
    defineField({
      name: 'customBgColor',
      title: 'Custom Background Color',
      type: 'color',
      fieldset: 'presentation',
      hidden: ({parent}: any) => parent?.sectionTheme !== 'custom',
    }),
    defineField({
      name: 'customTextColor',
      title: 'Text Color (for custom bg)',
      type: 'string',
      fieldset: 'presentation',
      options: {list: [{title: 'Dark Text', value: 'dark'}, {title: 'Light Text', value: 'light'}]},
      hidden: ({parent}: any) => parent?.sectionTheme !== 'custom',
      initialValue: 'dark',
    }),
    defineField({
      name: 'bgGradient',
      title: 'Background Gradient',
      type: 'object',
      fieldset: 'presentation',
      description: 'Optional gradient layered over the background color.',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Gradient',
          type: 'boolean',
          initialValue: false,
        }),
        defineField({
          name: 'colorFrom',
          title: 'From Color',
          type: 'color',
          hidden: ({parent}: any) => !parent?.enabled,
        }),
        defineField({
          name: 'colorTo',
          title: 'To Color',
          type: 'color',
          hidden: ({parent}: any) => !parent?.enabled,
        }),
        defineField({
          name: 'direction',
          title: 'Direction',
          type: 'string',
          hidden: ({parent}: any) => !parent?.enabled,
          options: {
            list: [
              {title: 'Top \u2192 Bottom', value: 'to bottom'},
              {title: 'Bottom \u2192 Top', value: 'to top'},
              {title: 'Left \u2192 Right', value: 'to right'},
              {title: 'Right \u2192 Left', value: 'to left'},
              {title: 'Top-Left \u2192 Bottom-Right', value: 'to bottom right'},
              {title: 'Top-Right \u2192 Bottom-Left', value: 'to bottom left'},
            ],
          },
          initialValue: 'to bottom',
        }),
        defineField({
          name: 'opacity',
          title: 'Gradient Opacity',
          type: 'number',
          hidden: ({parent}: any) => !parent?.enabled,
          description: '0 = fully transparent, 100 = fully opaque. Leave empty for 100.',
          validation: (r) => r.min(0).max(100),
        }),
      ],
    }),
    defineField({
      name: 'topSpacing',
      title: 'Top Spacing',
      type: 'string',
      fieldset: 'presentation',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Tight (32 px)', value: 'tight'},
          {title: 'Standard (64 px)', value: 'std'},
          {title: 'Major (96 px)', value: 'major'},
        ],
      },
      initialValue: defaults.topSpacing || 'std',
    }),
    defineField({
      name: 'bottomSpacing',
      title: 'Bottom Spacing',
      type: 'string',
      fieldset: 'presentation',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Tight (32 px)', value: 'tight'},
          {title: 'Standard (64 px)', value: 'std'},
          {title: 'Major (96 px)', value: 'major'},
        ],
      },
      initialValue: defaults.bottomSpacing || 'std',
    }),
    defineField({
      name: 'contentWidth',
      title: 'Content Width',
      type: 'string',
      fieldset: 'presentation',
      options: {
        list: [
          {title: 'Editorial (centered 8-col)', value: 'editorial'},
          {title: 'Wide (full 12-col grid)', value: 'wide'},
          {title: 'Full Bleed (edge-to-edge)', value: 'bleed'},
        ],
      },
      initialValue: defaults.contentWidth || 'wide',
    }),
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
      fieldset: 'presentation',
    }),
    defineField({
      name: 'subheading',
      title: 'Section Subheading',
      type: 'string',
      fieldset: 'presentation',
    }),
    defineField({
      name: 'sectionCaption',
      title: 'Section Caption',
      type: 'string',
      fieldset: 'presentation',
      description: 'Small text displayed below section content.',
    }),
    defineField({
      name: 'textAlign',
      title: 'Text Alignment',
      type: 'string',
      fieldset: 'presentation',
      options: {
        list: [{title: 'Left', value: 'left'}, {title: 'Center', value: 'center'}],
        layout: 'radio',
      },
      initialValue: 'left',
    }),
  ]
}

/* ------------------------------------------------------------------ */
/*  Reusable image fields                                             */
/* ------------------------------------------------------------------ */

const captionedImage = [
  defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
  defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
  defineField({name: 'caption', title: 'Caption', type: 'string'}),
]

/* ------------------------------------------------------------------ */
/*  Section types                                                     */
/* ------------------------------------------------------------------ */

const heroSection = defineArrayMember({
  name: 'heroSection',
  title: 'Hero Image',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    ...captionedImage,
    defineField({
      name: 'overlayText',
      title: 'Overlay Text',
      type: 'string',
      description: 'Optional large text rendered on top of the hero image.',
    }),
    defineField({
      name: 'heroHeight',
      title: 'Hero Height',
      type: 'string',
      options: {
        list: [
          {title: 'Standard (70 vh)', value: 'standard'},
          {title: 'Tall (85 vh)', value: 'tall'},
          {title: 'Full Screen (100 vh)', value: 'full'},
        ],
        layout: 'radio',
      },
      initialValue: 'tall',
    }),
    defineField({
      name: 'imageFade',
      title: 'Fade Image into Background',
      type: 'boolean',
      description: 'Fades the bottom edge of the image into the section background or gradient, creating a seamless transition.',
      initialValue: false,
    }),
    ...sectionPresentationFields({sectionTheme: 'black', contentWidth: 'bleed', topSpacing: 'none', bottomSpacing: 'none'}),
  ],
  preview: {
    select: {title: 'alt', heading: 'heading', media: 'image'},
    prepare: ({title, heading, media}: any) => ({title: heading || title || 'Hero Image', subtitle: 'Hero Image', media}),
  },
})

const textBlock = defineArrayMember({
  name: 'textBlock',
  title: 'Text Block',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    defineField({name: 'body', title: 'Body', type: 'blockContent', validation: (r) => r.required()}),
    ...sectionPresentationFields({contentWidth: 'editorial', topSpacing: 'tight', bottomSpacing: 'tight'}),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare: ({heading}: any) => ({title: heading || 'Text Block'}),
  },
})

const pullQuote = defineArrayMember({
  name: 'pullQuote',
  title: 'Pull Quote',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 3, validation: (r) => r.required()}),
    defineField({name: 'attribution', title: 'Attribution', type: 'string'}),
    ...sectionPresentationFields({topSpacing: 'std', bottomSpacing: 'std'}),
  ],
  preview: {
    select: {title: 'quote'},
    prepare: ({title}: any) => ({title: title ? `\u201C${title.slice(0, 60)}\u2026\u201D` : 'Pull Quote'}),
  },
})

const fullWidthImage = defineArrayMember({
  name: 'fullWidthImage',
  title: 'Full-Width Image',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    ...captionedImage,
    defineField({
      name: 'captionPosition',
      title: 'Caption Position',
      type: 'string',
      description: 'Place the caption on the image or below it.',
      options: {
        list: [
          {title: 'Below Image', value: 'below'},
          {title: 'Bottom Left', value: 'bottom-left'},
          {title: 'Bottom Center', value: 'bottom-center'},
          {title: 'Bottom Right', value: 'bottom-right'},
          {title: 'Center Left', value: 'center-left'},
          {title: 'Center', value: 'center'},
          {title: 'Center Right', value: 'center-right'},
          {title: 'Top Left', value: 'top-left'},
          {title: 'Top Center', value: 'top-center'},
          {title: 'Top Right', value: 'top-right'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'below',
    }),
    defineField({
      name: 'captionSize',
      title: 'Caption Size',
      type: 'string',
      description: 'Only applies when caption is placed on the image.',
      options: {
        list: [
          {title: 'Small', value: 'sm'},
          {title: 'Medium', value: 'md'},
          {title: 'Large', value: 'lg'},
          {title: 'Extra Large', value: 'xl'},
          {title: 'Display', value: 'display'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'sm',
    }),
    defineField({
      name: 'captionFont',
      title: 'Caption Font',
      type: 'string',
      description: 'Only applies when caption is placed on the image.',
      options: {
        list: [
          {title: 'Serif (editorial)', value: 'serif'},
          {title: 'Sans-serif (modern)', value: 'sans'},
          {title: 'Uppercase serif', value: 'serif-caps'},
          {title: 'Uppercase sans', value: 'sans-caps'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'serif',
    }),
    defineField({
      name: 'imageFade',
      title: 'Fade Image into Background',
      type: 'boolean',
      description: 'Fades the bottom edge of the image into the section background or gradient.',
      initialValue: false,
    }),
    defineField({
      name: 'revealEffect',
      title: 'Scroll Reveal Effect',
      type: 'string',
      description: 'How the image appears as the reader scrolls to it.',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Fade In', value: 'fade'},
          {title: 'Fade Up', value: 'fade-up'},
          {title: 'Scale', value: 'scale'},
          {title: 'Scale + Rise', value: 'scale-up'},
          {title: 'Clip Reveal (up)', value: 'clip-up'},
          {title: 'Clip Reveal (down)', value: 'clip-down'},
          {title: 'Clip Reveal (center)', value: 'clip-center'},
          {title: 'Scroll Fade (reversible)', value: 'scroll-fade'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'none',
    }),
    ...sectionPresentationFields({contentWidth: 'bleed'}),
  ],
  preview: {
    select: {title: 'alt', heading: 'heading', media: 'image'},
    prepare: ({title, heading, media}: any) => ({title: heading || title || 'Full-Width Image', subtitle: 'Full-Width Image', media}),
  },
})


const imageDiptych = defineArrayMember({
  name: 'imageDiptych',
  title: 'Image Pair (6/6)',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    defineField({name: 'imageLeft', title: 'Left Image', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
    defineField({name: 'altLeft', title: 'Alt Text (Left)', type: 'string'}),
    defineField({name: 'captionLeft', title: 'Caption (Left)', type: 'string'}),
    defineField({name: 'imageRight', title: 'Right Image', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
    defineField({name: 'altRight', title: 'Alt Text (Right)', type: 'string'}),
    defineField({name: 'captionRight', title: 'Caption (Right)', type: 'string'}),
    ...sectionPresentationFields({contentWidth: 'wide'}),
  ],
  preview: {
    select: {heading: 'heading', media: 'imageLeft'},
    prepare: ({heading, media}: any) => ({title: heading || 'Image Pair (6 / 6)', media}),
  },
})

const imageGrid = defineArrayMember({
  name: 'imageGrid',
  title: 'Image Grid (3-up)',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
            defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
          preview: {
            select: {title: 'alt', media: 'image'},
            prepare: ({title, media}: any) => ({title: title || 'Image', media}),
          },
        }),
      ],
      validation: (r) => r.min(2).max(4),
    }),
    ...sectionPresentationFields({contentWidth: 'wide'}),
  ],
  preview: {
    select: {images: 'images', heading: 'heading'},
    prepare: ({images, heading}: any) => ({title: heading || `Image Grid (${images?.length ?? 0} images)`}),
  },
})

const colorBlock = defineArrayMember({
  name: 'colorBlock',
  title: 'Color Block Section',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    defineField({name: 'body', title: 'Content', type: 'blockContent', validation: (r) => r.required()}),
    ...sectionPresentationFields({sectionTheme: 'dark', contentWidth: 'editorial', topSpacing: 'std', bottomSpacing: 'std'}),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare: ({heading}: any) => ({title: heading || 'Color Block Section'}),
  },
})

const projectDataBlock = defineArrayMember({
  name: 'projectDataBlock',
  title: 'Project Data Placard',
  type: 'object',
  description: 'Renders the project metadata (architect, contractor, etc.) as a styled placard.',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    ...sectionPresentationFields({contentWidth: 'wide', topSpacing: 'std', bottomSpacing: 'std'}),
  ],
  preview: {
    select: {heading: 'heading'},
    prepare: ({heading}: any) => ({title: heading || 'Project Data Placard'}),
  },
})

const gallerySection = defineArrayMember({
  name: 'gallerySection',
  title: 'Gallery',
  type: 'object',
  fieldsets: [PRESENTATION_FIELDSET],
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'image', title: 'Image', type: 'image', options: {hotspot: true}, validation: (r) => r.required()}),
            defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
            defineField({name: 'caption', title: 'Caption', type: 'string'}),
          ],
          preview: {
            select: {title: 'alt', media: 'image'},
            prepare: ({title, media}: any) => ({title: title || 'Image', media}),
          },
        }),
      ],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      options: {list: [2, 3, 4]},
      initialValue: 3,
    }),
    ...sectionPresentationFields({contentWidth: 'wide'}),
  ],
  preview: {
    select: {images: 'images', heading: 'heading'},
    prepare: ({images, heading}: any) => ({title: heading || `Gallery (${images?.length ?? 0} images)`}),
  },
})

/* ------------------------------------------------------------------ */
/*  Main document type                                                */
/* ------------------------------------------------------------------ */

export default defineType({
  name: 'projectProfile',
  title: 'Project Profile',
  type: 'document',
  groups: [
    {name: 'meta', title: 'Meta & SEO'},
    {name: 'projectData', title: 'Project Data'},
    {name: 'content', title: 'Page Content', default: true},
  ],
  fields: [
    /* ---------- Meta ---------- */
    defineField({name: 'title', title: 'Title', type: 'string', group: 'meta', validation: (r) => r.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'meta',
      options: {source: 'title', isUnique: (v, ctx) => ctx.defaultIsUnique(v, ctx)},
      validation: (r) => r.required(),
    }),
    defineField({name: 'dek', title: 'Summary', type: 'text', rows: 2, group: 'meta', validation: (r) => r.max(240)}),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'headerImage',
      title: 'Header / Listing Image',
      type: 'image',
      group: 'meta',
      options: {hotspot: true},
      fields: [
        defineField({name: 'alt', type: 'string', title: 'Alt Text'}),
        defineField({name: 'caption', type: 'string', title: 'Caption'}),
      ],
    }),
    defineField({name: 'author', title: 'Author', type: 'reference', to: [{type: 'author'}], group: 'meta'}),
    defineField({
      name: 'coAuthors',
      title: 'Co-Authors',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'author'}]}],
      group: 'meta',
    }),

    /* ---------- Project Data ---------- */
    defineField({name: 'projectName', title: 'Project Name', type: 'string', group: 'projectData', validation: (r) => r.required()}),
    defineField({name: 'architect', title: 'Architect', type: 'string', group: 'projectData'}),
    defineField({name: 'generalContractor', title: 'General Contractor', type: 'string', group: 'projectData'}),
    defineField({name: 'owner', title: 'Owner / Client', type: 'string', group: 'projectData'}),
    defineField({name: 'completionDate', title: 'Completion Date', type: 'string', group: 'projectData', description: 'e.g. "Fall 2026" or "March 2025"'}),
    defineField({name: 'projectSize', title: 'Project Size', type: 'string', group: 'projectData', description: 'e.g. "185,000 SF" or "12 acres"'}),
    defineField({name: 'projectCost', title: 'Project Cost', type: 'string', group: 'projectData', description: 'e.g. "$42 million"'}),
    defineField({name: 'location', title: 'Location', type: 'string', group: 'projectData'}),
    defineField({name: 'projectType', title: 'Project Type', type: 'string', group: 'projectData', description: 'e.g. "Mixed-Use", "Healthcare", "Higher Education"'}),

    /* ---------- Page Builder ---------- */
    defineField({
      name: 'pageContent',
      title: 'Page Content',
      type: 'array',
      group: 'content',
      of: [
        heroSection,
        textBlock,
        pullQuote,
        fullWidthImage,
        imageDiptych,
        imageGrid,
        colorBlock,
        projectDataBlock,
        gallerySection,
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      projectName: 'projectName',
      publishedAt: 'publishedAt',
      media: 'headerImage',
    },
    prepare({title, projectName, publishedAt, media}) {
      const parts = ['Project Profile']
      if (projectName && projectName !== title) parts.push(projectName)
      if (publishedAt) {
        const d = new Date(publishedAt)
        if (!Number.isNaN(d.getTime())) {
          parts.push(d.toLocaleDateString('en-US', {month: 'short', year: 'numeric'}))
        }
      }
      return {title, subtitle: parts.join(' \u00B7 '), media}
    },
  },
})
