import {defineType} from 'sanity'
import { baseArticle } from './baseArticle'

export default defineType({
  ...baseArticle,
  name: 'article',
  title: 'Article',
})
