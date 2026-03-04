import {postType} from './postType'
import {blockContent} from './blockContent'
import {author} from './author'
import {issue} from './issue'
import article from './article'
import animatedData from './animatedData'
import chartData from './chartData'
import mapEmbed from './mapEmbed.tsx'
import {homepage} from './homepage'

export const schemaTypes = [blockContent, author, issue, postType, article, animatedData, chartData, mapEmbed, homepage]
