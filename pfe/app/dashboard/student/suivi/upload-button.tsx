'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const DOCUMENT_TITLES = [
  { value: 'Cahier des charges', label: 'Cahier des charges' },
  { value: 'CHP01', label: 'CHP01' },
  { value: 'CHP02', label: 'CHP02' },
  { value: 'CHP03', label: 'CHP03' },
  { value: 'CHP04', label: 'CHP04' },
  { value: 'Conclusion', label: 'Conclusion' },
  { value: 'Bibliographie', label: 'Bibliographie' },
  { value: 'Annexes', label: 'Annexes' },
  { value: 'Présentation', label: 'Présentation' },
]

type UploadProps = { onUploadSuccess?: () => void }

export function SuiviUploadButton({ onUploadSuccess }: UploadProps = {}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [category, setCategory] = useState('Cahier des charges')

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)

    try {
      const res = await fetch('/api/student/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        router.refresh()
        await onUploadSuccess?.()
      } else {
        const error = await res.json()
        alert(error.error || 'Erreur lors du téléversement')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Erreur lors du téléversement')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
      >
        {DOCUMENT_TITLES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Téléversement...' : 'Partager avec mon encadrant'}
      </button>
    </div>
  )
}
