export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 }
    },
    {
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }]
    },
    {
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'priceFrom',
      title: 'Display as "From $X"',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4
    },
    {
      name: 'material',
      title: 'Material',
      type: 'string'
    },
    {
      name: 'size',
      title: 'Size',
      type: 'string'
    },
    {
      name: 'productionTime',
      title: 'Production Time',
      type: 'string'
    },
    {
      name: 'featured',
      title: 'Featured on Homepage',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        { name: 'metaTitle', title: 'Meta Title', type: 'string' },
        { name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2 },
        { name: 'focusKeyword', title: 'Focus Keyword', type: 'string' }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category.title',
      media: 'mainImage'
    }
  }
}
