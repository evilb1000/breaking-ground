export interface Post {
  _id: string
  _type: string
  title: string
  slug: {
    current: string
  }
  publishedAt: string
  image?: {
    asset: {
      _ref: string
      _type: string
    }
  }
  body: any[]
}

