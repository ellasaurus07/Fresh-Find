import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { CHAT } from '../lib/data.js'
import { reply } from '../lib/chatEngine.js'
import { useApp } from '../lib/context.js'
import { go } from '../lib/router.js'

// FRESHBOT — floating, rule-based helper on every page (SRS). No live AI:
// answers come from chatbot.json + the market/produce JSON via chatEngine.
export default function Chatbot() {
  const { now, geo } = useApp()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'bot', text: CHAT.greeting }])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const launcherRef = useRef(null)
  const pendingLocate = useRef(false)

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }) }, [messages, typing, open])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 40) }, [open])
  useEffect(() => {
    if (!open) return
    const esc = (e) => { if (e.key === 'Escape') { e.preventDefault(); setOpen(false); launcherRef.current?.focus() } }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])
  // when the visitor shares a location from inside the chat, answer the pending question
  useEffect(() => {
    if (!pendingLocate.current) return
    if (geo.coords) {
      pendingLocate.current = false
      setMessages((m) => [...m, { from: 'bot', ...reply('near me', { now, coords: geo.coords }) }])
    } else if (geo.status === 'denied' || geo.status === 'unavailable') {
      pendingLocate.current = false
      setMessages((m) => [...m, { from: 'bot', text: 'No problem — I couldn’t use your location. You can pick your neighbourhood in the market directory instead.', links: [{ label: 'Choose a neighbourhood', to: '#/markets?sort=near' }] }])
    }
  }, [geo.coords, geo.status, now])

  const send = (text) => {
    const t = text.trim()
    if (!t) return
    setDraft('')
    setMessages((m) => [...m, { from: 'user', text: t }])
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { from: 'bot', ...reply(t, { now: new Date(), coords: geo.coords }) }])
    }, 420)
  }

  return (
    <div className={`chat${open ? ' is-open' : ''}`}>
      {open && (
        <section className="chat__panel" role="dialog" aria-label="FreshBot, your FreshFind helper">
          <header className="chat__head">
            <span className="chat__avatar" aria-hidden="true"><img src="/assets/sprites/herb-basil.webp" alt="" /></span>
            <span><strong>FreshBot</strong><small>Rule-based helper · no live AI</small></span>
            <button type="button" className="icon-btn" onClick={() => { setOpen(false); launcherRef.current?.focus() }} aria-label="Close FreshBot"><Icon name="close" /></button>
          </header>
          <ol className="chat__list allow-scroll" ref={listRef} aria-live="polite" aria-relevant="additions">
            {messages.map((m, i) => (
              <li key={i} className={`chat__msg chat__msg--${m.from}`}>
                <span className="sr-only">{m.from === 'bot' ? 'FreshBot:' : 'You:'}</span>
                <p>{m.text}</p>
                {m.action === 'locate' && (
                  <button type="button" className="chat__link" onClick={() => { pendingLocate.current = true; geo.request() }}>
                    <Icon name="locate" size={14} /> Share my location
                  </button>
                )}
                {m.links?.length > 0 && (
                  <span className="chat__links">
                    {m.links.map((l) => (
                      <a key={l.to + l.label} href={l.to} className="chat__link" onClick={(e) => { e.preventDefault(); go(l.to); if (window.innerWidth < 720) setOpen(false) }}>
                        {l.label} <Icon name="arrow" size={14} />
                      </a>
                    ))}
                  </span>
                )}
              </li>
            ))}
            {typing && <li className="chat__msg chat__msg--bot chat__typing" aria-label="FreshBot is typing"><i /><i /><i /></li>}
          </ol>
          <div className="chat__quick" role="group" aria-label="Suggested questions">
            {CHAT.quickReplies.map((q) => <button key={q} type="button" onClick={() => send(q)}>{q}</button>)}
          </div>
          <form className="chat__form" onSubmit={(e) => { e.preventDefault(); send(draft) }}>
            <label htmlFor="chat-input" className="sr-only">Ask FreshBot a question</label>
            <input id="chat-input" ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type your question…" autoComplete="off" maxLength={200} />
            <button type="submit" className="icon-btn icon-btn--solid" aria-label="Send"><Icon name="arrow" /></button>
          </form>
        </section>
      )}
      <button ref={launcherRef} type="button" className="chat__launcher" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? 'Close FreshBot helper' : 'Open FreshBot helper'} data-cursor="open">
        <img src="/assets/sprites/herb-basil.webp" alt="" />
        <span className="chat__launch-label">Ask FreshBot</span>
      </button>
    </div>
  )
}
