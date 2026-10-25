import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PharmacyCard from '../components/PharmacyCard'
import { Alert, Badge, Empty, ErrorState, IconBtn, Spinner } from '../components/ui'
import { useAuth } from '../hooks/AuthContext'
import { useLocationCtx } from '../hooks/LocationContext'
import useAsync from '../hooks/useAsync'
import { errorMessage } from '../services/api'
import { askQuestion, listPharmacies, myQuestions, myRequests } from '../services/pharmacies'
import { STATUS, timeAgo } from '../utils/format'

const Header = ({ title, back = true }) => {
  const nav = useNavigate()
  return <header className="topbar">{back && <IconBtn icon="back" label="Retour" onClick={() => nav(-1)} />}<h1>{title}</h1></header>
}

/** « Rappels » : suivi des demandes envoyées aux pharmacies (réponse, produit à retirer). */
export function Reminders() {
  const { data, loading, error, reload } = useAsync(() => myRequests(), [])
  return (
    <>
      <Header title="Mes demandes" />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.results.length === 0 && <Empty>Vous n’avez encore envoyé aucune demande.<Link className="btn btn-primary" to="/demande/check">Vérifier un produit</Link></Empty>}
      {data?.results.map((r) => (
        <div className="card" key={r.id}>
          <div className="row between"><b>{r.product_name || 'Ordonnance'}</b><Badge tone={STATUS[r.status].cls.replace('badge-', '')}>{STATUS[r.status].label}</Badge></div>
          <p className="muted" style={{ marginTop: 4 }}>{r.pharmacy_name} · {timeAgo(r.created_at)} · {r.kind === 'reserve' ? 'Réservation' : r.kind === 'prescription' ? 'Ordonnance' : 'Disponibilité'}</p>
          {r.status === 'available' && <Link className="btn btn-primary btn-block" style={{ marginTop: 10 }} to={`/pharmacie/${r.pharmacy}`}>Voir la pharmacie</Link>}
        </div>
      ))}
    </>
  )
}

export function Favorites() {
  const { loc } = useLocationCtx()
  const { data, loading, error, reload } = useAsync(() => listPharmacies({ favorites: true, lat: loc.lat, lng: loc.lng }), [loc.lat, loc.lng])
  return (
    <>
      <Header title="Mes favoris" />
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.results.length === 0 && <Empty>Aucun favori. Ouvrez une fiche pharmacie et touchez le cœur pour l’ajouter.</Empty>}
      {data?.results.map((p) => <PharmacyCard key={p.id} pharmacy={p} />)}
    </>
  )
}

export function Messages() {
  const { data, loading, error, reload } = useAsync(myQuestions, [])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const send = async (e) => {
    e.preventDefault(); setBusy(true); setMsg(null)
    try { await askQuestion(text.trim()); setText(''); setMsg({ ok: true, text: 'Question envoyée. Un pharmacien vous répondra ici.' }); reload() }
    catch (ex) { setMsg({ ok: false, text: errorMessage(ex) }) } finally { setBusy(false) }
  }
  return (
    <>
      <Header title="Messages" back={false} />
      <form className="card" onSubmit={send}>
        <h2>Poser une question au pharmacien</h2>
        <textarea className="input" rows={4} maxLength={1500} value={text} onChange={(e) => setText(e.target.value)} placeholder="Décrivez votre question de santé…" style={{ margin: '10px 0' }} required />
        <p className="muted" style={{ marginBottom: 8 }}>En cas d’urgence, appelez une pharmacie de garde ou les secours.</p>
        <Alert tone={msg?.ok ? 'ok' : 'error'}>{msg?.text}</Alert>
        <button className="btn btn-primary btn-block" disabled={busy || !text.trim()}>Envoyer</button>
      </form>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.results.map((q) => (
        <div className="card" key={q.id}>
          <p>{q.text}</p><p className="muted" style={{ marginTop: 4 }}>{timeAgo(q.created_at)}</p>
          {q.answer ? <div className="alert alert-ok" style={{ marginTop: 8 }}><b>Réponse :</b> {q.answer}</div> : <p style={{ marginTop: 8 }}><Badge>En attente de réponse</Badge></p>}
        </div>
      ))}
    </>
  )
}

export function Profile() {
  const { user, logout, isPharmacist } = useAuth()
  const nav = useNavigate()
  return (
    <>
      <Header title="Profil" back={false} />
      <div className="card"><h2>{user.first_name || user.username}</h2><p className="muted">@{user.username} · {isPharmacist ? 'Pharmacien' : 'Client'}</p></div>
      <div className="stack">
        {isPharmacist && <Link className="btn btn-primary btn-block btn-lg" to="/pharmacien">Ouvrir l’espace pharmacien</Link>}
        <Link className="btn btn-block btn-lg" to="/rappels">Mes demandes</Link>
        <Link className="btn btn-block btn-lg" to="/favoris">Mes favoris</Link>
        <button className="btn btn-danger btn-block btn-lg" onClick={async () => { await logout(); nav('/') }}>Se déconnecter</button>
      </div>
    </>
  )
}
