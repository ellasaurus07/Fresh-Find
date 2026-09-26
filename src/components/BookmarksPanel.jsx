import { useState } from 'react'
import Icon from './Icon.jsx'
import { Sheet, StatusPill, NoteField } from './UI.jsx'
import { categoryLabel, seasonLabel } from '../lib/data.js'
import { scheduleSummary } from '../lib/schedule.js'
import { useApp } from '../lib/context.js'
import { downloadText, copyText, canNativeShare, nativeShare, socialLinks } from '../lib/share.js'
import { absoluteUrl } from '../lib/router.js'

// Declared at module level (not inside the panel's render) so React keeps the
// same component type between renders — otherwise every keystroke in a note
// remounted the textarea and dropped focus.
function SavedItem({ b }) {
  const { bookmarks, toast } = useApp()
  const it = b.item
  const isM = b.type === 'market'
  return (
    <li className="saved-item">
      <a href={`#/${isM ? 'markets' : 'produce'}/${it.id}`} className="saved-item__main">
        <img src={isM ? it.thumb : it.image} alt="" width="84" height="64" className={isM ? '' : 'is-art'} loading="lazy" />
        <span>
          <strong>{it.name}</strong>
          <small>{isM ? scheduleSummary(it) : `${categoryLabel(it.category)} · ${seasonLabel(it)}`}</small>
          {isM && <StatusPill market={it} />}
        </span>
      </a>
      <NoteField type={b.type} id={it.id} name={it.name} />
      <button type="button" className="icon-btn saved-item__x" onClick={() => { bookmarks.remove(b.type, it.id); toast(`Removed ${it.name}`) }} aria-label={`Remove ${it.name}`}>
        <Icon name="close" size={18} />
      </button>
    </li>
  )
}

// SAVED — favourites (localStorage), session notes (sessionStorage),
// export as a formatted list, and sharing.
export default function BookmarksPanel({ onClose }) {
  const { bookmarks, toast } = useApp()
  const [confirm, setConfirm] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const markets = bookmarks.resolved.filter((b) => b.type === 'market')
  const produce = bookmarks.resolved.filter((b) => b.type === 'produce')
  const summary = `My FreshFind list: ${bookmarks.resolved.map((b) => b.item.name).join(', ')}`

  const exportTxt = () => {
    downloadText(`freshfind-saved-${new Date().toISOString().slice(0, 10)}.txt`, bookmarks.formatList())
    toast('Exported your list as a text file')
  }
  const copy = async () => toast((await copyText(bookmarks.formatList())) ? 'List copied to the clipboard' : 'Copy failed')
  const share = async () => {
    if (canNativeShare()) {
      const r = await nativeShare({ title: 'My FreshFind list', text: bookmarks.formatList(), url: absoluteUrl('#/') })
      if (r !== 'failed') return
    }
    setShareOpen((o) => !o)
  }

  return (
    <Sheet title="Saved" kicker="Your markets and produce, kept on this device" crumbs={[{ label: 'Home', to: '#/' }, { label: 'Saved', to: '#/saved' }]} onClose={onClose} className="sheet--saved"
      actions={bookmarks.count > 0 && (
        <>
          <button type="button" className="btn btn--primary btn--small" onClick={exportTxt}><Icon name="download" size={16} /><span>Export list</span></button>
          <button type="button" className="ghost-btn" onClick={copy}><Icon name="copy" size={16} /> Copy</button>
          <button type="button" className="ghost-btn" onClick={() => window.print()}><Icon name="print" size={16} /> Print</button>
          <span className="share">
            <button type="button" className="ghost-btn" onClick={share} aria-expanded={shareOpen}><Icon name="share" size={16} /> Share</button>
            {shareOpen && (
              <span className="share-pop" role="group" aria-label="Share your list">
                {socialLinks({ title: 'My FreshFind list', text: summary, url: absoluteUrl('#/') }).map((s) => <a key={s.id} href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>)}
              </span>
            )}
          </span>
        </>
      )}
    >
      {bookmarks.count === 0 ? (
        <div className="empty empty--saved">
          <img src="/assets/sprites/veg-basket-optimized.webp" alt="" width="280" height="214" loading="eager" decoding="async"/>
          <p>Your basket is empty. Tap the heart on any market or produce page to keep it here — then add notes, export or share your list.</p>
          <div className="empty__ctas">
            <a className="btn btn--primary" href="#/markets"><span>Browse markets</span></a>
            <a className="btn btn--quiet" href="#/produce"><span>Produce guide</span></a>
          </div>
        </div>
      ) : (
        <div className="saved">
          <p className="fine">Notes are session-only: they disappear when you close this tab. Saved items stay until you remove them.</p>
          {markets.length > 0 && (<section aria-labelledby="sv-m"><h2 id="sv-m">Markets <small>{markets.length}</small></h2><ul>{markets.map((b) => <SavedItem key={`${b.type}:${b.id}`} b={b} />)}</ul></section>)}
          {produce.length > 0 && (<section aria-labelledby="sv-p"><h2 id="sv-p">Produce <small>{produce.length}</small></h2><ul>{produce.map((b) => <SavedItem key={`${b.type}:${b.id}`} b={b} />)}</ul></section>)}
          <div className="saved__clear">
            {confirm ? (
              <><span>Remove everything?</span><button type="button" className="btn btn--small btn--danger" onClick={() => { bookmarks.clearAll(); setConfirm(false); toast('Saved list cleared') }}>Yes, clear</button><button type="button" className="text-btn" onClick={() => setConfirm(false)}>Keep</button></>
            ) : <button type="button" className="text-btn" onClick={() => setConfirm(true)}>Clear saved list</button>}
          </div>
        </div>
      )}
    </Sheet>
  )
}
