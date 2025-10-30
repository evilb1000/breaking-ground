import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: 'y9xwdi89',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-10-28',
  // Note: You'll need to add a read token if the dataset requires authentication
  // token: 'your-read-token-here',
})

