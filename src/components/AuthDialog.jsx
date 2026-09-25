import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import Vines from './Vines.jsx'

// Dummy Login / Signup (SRS: non-functional, for design continuity).
// Nothing is validated, stored or sent anywhere.
export default function AuthDialog({ mode, onClose, onSwitch }) {
  const ref = useRef(null)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (mode && !d.open) { setDone(false); d.showModal() }
    if (!mode && d.open) d.close()
  }, [mode])
  const signup = mode === 'signup'
  return (
    <dialog ref={ref} className="auth" onClose={onClose} onCancel={onClose} aria-labelledby="auth-title">
      <form method="dialog" className="auth__card" onSubmit={(e) => { e.preventDefault(); setDone(true) }}>
        <div className="auth__vines" aria-hidden="true"><Vines variant="auth" delay={140} /></div>
        <button type="button" className="icon-btn auth__x" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        <h2 id="auth-title">{signup ? 'Join FreshFind' : 'Welcome back'}</h2>
        <p className="auth__note">Accounts are coming soon. This form is a preview only — nothing you type is saved or sent.</p>
        {signup && <label className="field"><span>Name</span><input autoComplete="off" name="name" /></label>}
        <label className="field"><span>Email</span><input type="email" autoComplete="off" name="email" /></label>
        <label className="field"><span>Password</span><input type="password" autoComplete="off" name="password" /></label>
        {done && <p className="auth__done" role="status">Thanks! Sign-in isn’t available yet — your bookmarks already work without an account.</p>}
        <button type="submit" className="btn btn--primary">{signup ? 'Create account' : 'Log in'}</button>
        <button type="button" className="text-btn" onClick={() => { setDone(false); onSwitch(signup ? 'login' : 'signup') }}>
          {signup ? 'Already have an account? Log in' : 'New here? Sign up'}
        </button>
      </form>
    </dialog>
  )
}
