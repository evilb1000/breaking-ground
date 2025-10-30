import { useState, useEffect } from 'react'
import { client } from './lib/sanity'
import type { Post } from './types/Post'
import './App.css'

function App() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const query = `*[_type == "post"] | order(publishedAt desc)`
        
        const data = await client.fetch(query)
        console.log('Fetched posts:', data)
        setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (error) {
    return (
      <div className="container">
        <p>Error: {error}</p>
      </div>
    )
  }

  if (loading) {
    return <div className="container">Loading posts...</div>
  }

  return (
    <div className="container">
      <header>
        <h1>Breaking Ground</h1>
        <p>A Magazine Built with Sanity</p>
      </header>

      <main>
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet. Create your first post in the Sanity Studio!</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <article key={post._id} className="post-card">
                {post.image && (
                  <div className="post-image">
                    <img 
                      src={`https://cdn.sanity.io/images/y9xwdi89/production/${post.image.asset._ref.replace('image-', '').replace('-jpg', '.jpg')}`}
                      alt={post.title}
                    />
                  </div>
                )}
                <div className="post-content">
                  <h2>{post.title}</h2>
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </time>
                  <a href={`/post/${post.slug.current}`} className="read-more">
                    Read More →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
