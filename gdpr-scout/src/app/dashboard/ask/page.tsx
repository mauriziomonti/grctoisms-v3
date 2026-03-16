'use client'

import { useState, useRef, useEffect } from 'react'

interface Source {
  articleNumber: string
  articleTitle: string
  excerpt: string
  score: number
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  loading?: boolean
}

const EXAMPLE_QUESTIONS = [
  'What are the lawful bases for processing personal data?',
  'What are the requirements for data breach notification?',
  'When is a Data Protection Impact Assessment required?',
  'What rights do data subjects have under the GDPR?',
]

function SourceCard({ source }: { source: Source }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="font-medium text-gray-700">
          {source.articleNumber}{source.articleTitle ? ` — ${source.articleTitle}` : ''}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-3 py-2 text-gray-500 leading-relaxed bg-white">
          {source.excerpt}
        </div>
      )}
    </div>
  )
}

function AssistantBubble({ message }: { message: Message }) {
  if (message.loading) {
    return (
      <div className="flex gap-3 max-w-3xl">
        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="flex gap-1 items-center h-5">
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 max-w-3xl">
      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-1 mb-1.5">
              Sources from GDPR regulation
            </p>
            {message.sources.map((src, i) => (
              <SourceCard key={i} source={src} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function submit(question: string) {
    if (!question.trim() || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: question }
    const loadingMsg: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', loading: true }
    setMessages((prev) => [...prev, userMsg, loadingMsg])

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const data = await res.json() as { answer?: string; sources?: Source[]; error?: string }

      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? {
                ...m,
                loading: false,
                content: data.answer ?? data.error ?? 'An unexpected error occurred.',
                sources: data.sources ?? [],
              }
            : m
        )
      )
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.loading
            ? { ...m, loading: false, content: 'Failed to reach the AI endpoint. Please try again.' }
            : m
        )
      )
    } finally {
      setLoading(false)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Page heading */}
      <div className="px-8 pt-8 pb-4 shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Answers are grounded exclusively in the GDPR regulation text — no general knowledge.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-8 pb-4">
        {isEmpty ? (
          <div className="mt-8">
            <p className="text-sm font-medium text-gray-500 mb-4">Try asking:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => submit(q)}
                  className="text-left px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-3xl pb-4">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-xl text-sm leading-relaxed shadow-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <AssistantBubble key={msg.id} message={msg} />
              )
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-8 pb-8">
        <form
          onSubmit={(e) => { e.preventDefault(); submit(input) }}
          className="flex gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-2 max-w-3xl focus-within:border-brand-300 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a GDPR question…"
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        <p className="text-[10px] text-gray-300 mt-2 px-1">
          GDPR Scout only cites original regulation text. Never relies on general knowledge.
        </p>
      </div>
    </div>
  )
}
