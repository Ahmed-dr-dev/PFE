'use client'

import { useState, useEffect, useRef } from 'react'

type Peer = { id: string; full_name: string | null; email: string | null; role: string }
type Conversation = { peer: Peer; last_message: { content: string; created_at: string }; unread_count: number }
type Message = { id: string; sender_id: string; receiver_id: string; content: string; created_at: string }

export function MessagerieView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [peers, setPeers] = useState<Peer[]>([])
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  async function loadConversations() {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function loadPeers() {
    try {
      const res = await fetch('/api/messages/peers')
      if (res.ok) {
        const data = await res.json()
        setPeers(data.peers || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function loadThread(peerId: string) {
    try {
      const res = await fetch(`/api/messages?with=${peerId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadConversations(), loadPeers()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedPeer) {
      loadThread(selectedPeer.id)
      loadConversations()
    } else {
      setMessages([])
    }
  }, [selectedPeer?.id])

  useEffect(() => {
    threadRef.current?.scrollTo(0, threadRef.current.scrollHeight)
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !selectedPeer || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: selectedPeer.id, content: text }),
      })
      if (res.ok) {
        const data = await res.json()
        setMessages((prev) => [...prev, data.message])
        setInput('')
        loadConversations()
      } else {
        const err = await res.json()
        alert(err.error || 'Erreur')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const startWithPeer = (peer: Peer) => {
    setSelectedPeer(peer)
    setShowNewModal(false)
  }

  const roleLabel: Record<string, string> = { student: 'Étudiant', professor: 'Enseignant', admin: 'Admin' }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Messagerie</span>
          </h1>
          <p className="text-gray-600 text-sm">Échanger avec les autres utilisateurs</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-lg font-semibold text-sm hover:from-emerald-700 hover:to-cyan-700"
        >
          Nouvelle conversation
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 rounded-xl border border-gray-200 bg-white overflow-hidden min-h-[420px]">
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col">
          <div className="p-2 overflow-y-auto flex-1 divide-y divide-gray-200">
            {conversations.length === 0 && !selectedPeer && (
              <p className="p-4 text-gray-600 text-sm">Aucune conversation. Cliquez sur &quot;Nouvelle conversation&quot;.</p>
            )}
            {conversations.map((c) => (
              <button
                key={c.peer.id}
                type="button"
                onClick={() => setSelectedPeer(c.peer)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-0.5 ${
                  selectedPeer?.id === c.peer.id ? 'bg-emerald-600/20 border border-emerald-500/40' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm truncate">{c.peer.full_name || c.peer.email || c.peer.id}</span>
                  {c.unread_count > 0 && (
                    <span className="bg-emerald-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {c.unread_count}
                    </span>
                  )}
                </div>
                <span className="text-gray-600 text-xs truncate">{c.last_message.content}</span>
                <span className="text-gray-500 text-xs">
                  {new Date(c.last_message.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {selectedPeer ? (
            <>
              <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 text-xs font-semibold">
                  {(selectedPeer.full_name || selectedPeer.email || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{selectedPeer.full_name || selectedPeer.email || 'Utilisateur'}</p>
                  <p className="text-gray-600 text-xs">{roleLabel[selectedPeer.role] || selectedPeer.role}</p>
                </div>
              </div>
              <div ref={threadRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((m) => {
                  const isMe = m.sender_id !== selectedPeer.id
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                          isMe ? 'bg-emerald-600/30 border border-emerald-500/40 text-white' : 'bg-gray-100 border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-emerald-700/80' : 'text-gray-500'}`}>
                          {new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="p-3 border-t border-gray-200 flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-200"
                />
                <button type="submit" disabled={sending || !input.trim()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 hover:bg-emerald-700">
                  {sending ? '…' : 'Envoyer'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
              Sélectionnez une conversation ou démarrez-en une nouvelle.
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Nouvelle conversation</h3>
              <button type="button" onClick={() => setShowNewModal(false)} className="text-gray-600 hover:text-gray-900">✕</button>
            </div>
            <div className="p-2 overflow-y-auto max-h-[60vh]">
              {peers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => startWithPeer(p)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 text-sm font-semibold">
                    {(p.full_name || p.email || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.full_name || p.email || p.id}</p>
                    <p className="text-gray-600 text-xs">{roleLabel[p.role] || p.role}</p>
                  </div>
                </button>
              ))}
              {peers.length === 0 && <p className="p-4 text-gray-600 text-sm">Aucun autre utilisateur.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
