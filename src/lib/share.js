// Sharing & exporting — Web Share API when the browser has it, social links
// and clipboard as the fallback. Nothing is sent anywhere by FreshFind itself.
export const canNativeShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function'

export async function nativeShare({ title, text, url }) {
  try {
    await navigator.share({ title, text, url })
    return 'shared'
  } catch (e) {
    return e && e.name === 'AbortError' ? 'cancelled' : 'failed'
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (_) {
    // older browsers / non-secure contexts
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    let ok = false
    try { ok = document.execCommand('copy') } catch (_) { ok = false }
    ta.remove()
    return ok
  }
}

export function socialLinks({ title, text, url }) {
  const t = encodeURIComponent(`${text || title}`)
  const u = encodeURIComponent(url)
  return [
    { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${t}%20${u}` },
    { id: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { id: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { id: 'email', label: 'Email', href: `mailto:?subject=${encodeURIComponent(title)}&body=${t}%0A%0A${u}` },
  ]
}

/** Download a text file the user explicitly asked for (export). */
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
