import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import MapView from '../components/MapView'
import { metaLine } from '../components/PharmacyCard'
import { Alert, Badge, ErrorState, IconBtn, Spinner } from '../components/ui'
import { useAuth } from '../hooks/AuthContext'
import { useLocationCtx } from '../hooks/LocationContext'
import useAsync from '../hooks/useAsync'
import { errorMessage } from '../services/api'
import { createRequest, getPharmacy, setFavorite } from '../services/pharmacies'
import { directionsUrl, whatsappUrl } from '../utils/format'

export default function PharmacyDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const { hash, pathname } = useLocation()
  const { user } = useAuth()
  const { loc } = useLocationCtx()
  const { data: p, loading, error, reload, setData } = useAsync(() => getPharmacy(id, { lat: loc.lat, lng: loc.lng }), [id, loc.lat, loc.lng])
  const [product, setProduct] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const formRef = useRef(null)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => { if (p && hash === '#demande') formRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [p, hash])

  const needLogin = () => { if (!user) { nav(`/connexion?next=${encodeURIComponent(pathname + '#demande')}`); return true } return false }

  const share = async () => {
    const data = { title: p.name, text: `${p.name} — ${p.address}, ${p.quartier}`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(window.location.href); setMsg({ ok: true, text: 'Lien copié dans le presse-papiers.' }) }
    } catch { /* partage annulé */ }
  }

  const toggleFav = async () => {
    if (needLogin()) return
    try { const r = await setFavorite(p.id, !p.is_favorite); setData({ ...p, is_favorite: r.is_favorite }) } catch (e) { setMsg({ ok: false, text: errorMessage(e) }) }
  }

  const send = async (kind, file) => {
    if (needLogin()) return
    if (kind !== 'prescription' && !product.trim()) { setMsg({ ok: false, text: 'Indiquez le nom du produit.' }); inputRef.current?.focus(); return }
    setBusy(true); setMsg(null)
    try {
      await createRequest({ pharmacy: p.id, kind, product_name: kind === 'prescription' ? '' : product.trim(), file })
      setMsg({ ok: true, text: kind === 'reserve' ? 'Réservation envoyée. La pharmacie vous répondra bientôt.' : kind === 'prescription' ? 'Ordonnance envoyée.' : 'Demande envoyée. Suivez la réponse dans vos rappels.' })
      setProduct('')
    } catch (e) { setMsg({ ok: false, text: errorMessage(e) }) } finally { setBusy(false); if (fileRef.current) fileRef.current.value = '' }
  }

  if (loading) return <Spinner />
  if (error) return <><IconBtn icon="back" label="Retour" onClick={() => nav(-1)} /><ErrorState message={error} onRetry={reload} /></>

  const today = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const th = p.hours.find((h) => h.weekday === today)
  const hoursLine = p.is_24h ? 'Ouverte 24h/24' : th ? (th.closed ? "Fermée aujourd'hui" : `Aujourd’hui ${th.open_time.slice(0, 5)} – ${th.close_time.slice(0, 5)}`) : 'Horaires non renseignés'
  const note = p.rating ? `${String(p.rating).replace('.', ',')} ★ · ${p.reviews_count} avis` : null

  return (
    <main className="pharmacy-detail">
      <header className="topbar">
        <IconBtn icon="back" label="Retour" onClick={() => nav(-1)} />
        <h1>Fiche pharmacie</h1>
        <IconBtn icon="share" label="Partager" onClick={share} />
        <IconBtn icon="heart" label={p.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} onClick={toggleFav} active={p.is_favorite} />
      </header>

      <section className="detail-overview">
      <div className="mini-map" style={{ height: 120 }}><MapView pharmacies={[p]} interactive={false} /></div>

      <div className="detail-title"><h1>{p.name}</h1>{p.is_on_call && <Badge>De garde</Badge>}</div>
      <p className="muted" style={{ margin: '0 2px 10px' }}>{[metaLine(p), note].filter(Boolean).join(' · ')}</p>

      <div className="btn-row stack" style={{ marginTop: 0, marginBottom: 12 }}>
        <a className="btn btn-primary" href={`tel:${p.phone}`}><Icon name="phone" size={16} />Appeler</a>
        <a className="btn" href={directionsUrl(p)} target="_blank" rel="noreferrer"><Icon name="nav" size={16} />Itinéraire</a>
        <a className="btn" href={whatsappUrl(p)} target="_blank" rel="noreferrer"><Icon name="chat" size={16} />WhatsApp</a>
        <button className="btn" onClick={share}><Icon name="share" size={16} />Partager</button>
      </div>
      <Alert tone={msg?.ok ? 'ok' : 'error'}>{msg?.text}</Alert>

      <div className="card info-list">
        <div><Icon name="pin" /><span><small>Adresse</small><b>{p.address}, {p.quartier}</b></span></div>
        <div><Icon name="clock" /><span><small>Horaires</small><b>{hoursLine}</b>
          {p.hours.length > 0 && !p.is_24h && (
            <details><summary className="muted">Toute la semaine</summary>
              <table className="hours-table"><tbody>{p.hours.map((h) => (
                <tr key={h.id} className={h.weekday === today ? 'today' : ''}><td>{h.weekday_label}</td><td>{h.closed ? 'Fermé' : `${h.open_time.slice(0, 5)} – ${h.close_time.slice(0, 5)}`}</td></tr>
              ))}</tbody></table></details>)}
        </span></div>
        <div><Icon name="phone" /><span><small>Téléphone</small><b>{p.phone}</b></span></div>
        {p.pharmacist_name && <div><Icon name="user" /><span><small>Pharmacien responsable</small><b>{p.pharmacist_name}</b></span></div>}
        {p.insurances.length > 0 && <div><Icon name="shield" /><span><small>Assurances acceptées</small><b>{p.insurances.join(', ')}</b></span></div>}
        <div><Icon name="truck" /><span><small>Livraison</small><b>{p.delivery ? `Oui${p.delivery_zone ? ` · ${p.delivery_zone}` : ''}` : 'Non'}</b></span></div>
      </div>
      </section>

      <section className="detail-side">
      <div className="card" id="demande" ref={formRef}>
        <h2>Demander un produit</h2>
        <p className="muted" style={{ margin: '2px 0 10px' }}>Réponse en général sous {p.avg_response_minutes} min</p>
        <form className="row" onSubmit={(e) => { e.preventDefault(); send('check') }}>
          <input ref={inputRef} className="input" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Nom du produit" maxLength={150} aria-label="Nom du produit" />
          <button className="btn btn-primary" style={{ height: 42 }} disabled={busy}>Envoyer</button>
        </form>
        <div className="btn-row flat">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" hidden onChange={(e) => e.target.files[0] && send('prescription', e.target.files[0])} />
          <button type="button" className="btn" disabled={busy} onClick={() => fileRef.current.click()}><Icon name="file" size={16} />Joindre une ordonnance</button>
          <button type="button" className="btn" disabled={busy} onClick={() => send('reserve')}><Icon name="calendar" size={16} />Réserver</button>
        </div>
      </div>

      <div className="card">
        <h2>Produits souvent demandés</h2>
        {p.popular_products.length === 0 && <p className="muted" style={{ marginTop: 6 }}>Cette pharmacie n’a pas encore publié son stock.</p>}
        {p.popular_products.map((s) => (
          <div className="list-line" key={s.id}><b>{s.name}</b><Badge tone={s.in_stock ? 'green' : 'red'}>{s.in_stock ? 'Disponible' : 'Rupture'}</Badge></div>
        ))}
      </div>
      </section>

      <div className="sticky-cta">
        <a className="btn btn-primary" style={{ flex: '0 0 auto' }} href={`tel:${p.phone}`}><Icon name="phone" size={16} />Appeler</a>
        <button className="btn btn-primary" onClick={() => { formRef.current.scrollIntoView({ behavior: 'smooth' }); inputRef.current.focus({ preventScroll: true }) }}>Réserver un produit</button>
      </div>
    </main>
  )
}
