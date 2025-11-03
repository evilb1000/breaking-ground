import React from 'react'
import {useFormValue} from 'sanity'

export default function ChartDataPreview() {
  const title = useFormValue(['title']) as string | undefined
  const slug = useFormValue(['slug', 'current']) as string | undefined
  const chartType = useFormValue(['chartType']) as string | undefined
  const file = useFormValue(['dataFile', 'asset', '_ref']) as string | undefined

  return (
    <div style={{padding: 16}}>
      <h3 style={{margin: 0, fontWeight: 700}}>Chart Data Preview</h3>
      <p style={{marginTop: 8}}>
        <strong>Title:</strong> {title || '—'}
      </p>
      <p>
        <strong>Chart Type:</strong> {chartType || '—'}
      </p>
      <p>
        <strong>CSV:</strong> {file ? 'Attached' : 'Not uploaded'}
      </p>
      {slug ? (
        <p style={{marginTop: 12}}>
          Chart Slug: <code>{slug}</code>
        </p>
      ) : (
        <p style={{marginTop: 12}}>Set and publish a slug to use this chart.</p>
      )}
    </div>
  )
}

