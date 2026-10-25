import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert } from '../components/ui'
import { useAuth } from '../hooks/AuthContext'
import { errorMessage } from '../services/api'

export default function Login() {
  const { user, login, register } = useAuth()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ username: '', password: '', first_name: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const next = sp.get('next')

  if (user && !busy) return <Navigate to={next || (user.role === 'pharmacien' ? '/pharmacien' : '/')} replace />
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const u = mode === 'login' ? await login(f.username, f.password) : await register(f)
      nav(next || (u.role === 'pharmacien' ? '/pharmacien' : '/'), { replace: true })
    } catch (ex) { setErr(errorMessage(ex)) } finally { setBusy(false) }
  }

  return (
    <>
      <header className="topbar"><h1>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1></header>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Connexion</button>
        <button role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Inscription</button>
      </div>
      <form className="card" onSubmit={submit}>
        {mode === 'register' && <label className="field"><span>Prénom</span><input className="input" value={f.first_name} onChange={set('first_name')} autoComplete="given-name" /></label>}
        <label className="field"><span>Nom d’utilisateur</span><input className="input" value={f.username} onChange={set('username')} autoComplete="username" required /></label>
        <label className="field"><span>Mot de passe</span><input className="input" type="password" value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : undefined} required /></label>
        <Alert>{err}</Alert>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? '…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>
        <p className="muted" style={{ marginTop: 10 }}>Pharmacien ? Votre compte est créé par l’équipe Togo Pharma et rattaché à votre officine.</p>
      </form>
    </>
  )
}
