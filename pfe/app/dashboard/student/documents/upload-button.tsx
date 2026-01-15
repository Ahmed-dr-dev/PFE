'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function UploadButton() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'Autre') // Default category, can be made dynamic

    try {
      const res = await fetch('/api/student/documents', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        router.refresh()
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
    <>
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
        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-emerald-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Téléversement...' : 'Téléverser un document'}
      </button>
    </>
  )
}
