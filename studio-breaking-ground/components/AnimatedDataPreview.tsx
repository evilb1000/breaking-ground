import React from 'react'
import {useFormValue} from 'sanity'

export default function AnimatedDataPreview() {
  const title = useFormValue(['title']) as string | undefined
  const slug = useFormValue(['slug', 'current']) as string | undefined
  const chartType = useFormValue(['chartType']) as string | undefined
  const file = useFormValue(['dataFile', 'asset', '_ref']) as string | undefined

  return (
    <div style={{padding: 16}}>
      <h3 style={{margin: 0, fontWeight: 700}}>Animated Data Preview</h3>
      <p style={{marginTop: 8}}>
        <strong>Title:</strong> {title || '—'}
      </p>
      <p>
        <strong>Chart:</strong> {chartType || '—'}
      </p>
      <p>
        <strong>CSV:</strong> {file ? 'Attached' : 'Not uploaded'}
      </p>
      {slug ? (
        <p style={{marginTop: 12}}>
          Frontend URL: <code>/data/{slug}</code>
        </p>
      ) : (
        <p style={{marginTop: 12}}>Set and publish a slug to preview on the site.</p>
      )}
      <p style={{marginTop: 12, color: '#666'}}>A live in-Studio chart preview can be added next.</p>
    </div>
  )
}


