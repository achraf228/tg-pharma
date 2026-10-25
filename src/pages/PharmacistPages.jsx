import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { Alert, Badge, Empty, ErrorState, IconBtn, Spinner, Toggle } from '../components/ui'
import { useAuth } from '../hooks/AuthContext'
import useAsync from '../hooks/useAsync'
import { errorMessage } from '../services/api'
import * as api from '../services/pharmacist'
import { STATUS, formatDateTime, formatDay, timeAgo, toLocalInput } from '../utils/format'

export function PharmacistDenied() {
  return <div className="card" style={{ marginTop: 24 }}><h2>Accès réservé aux pharmaciens</h2>
    <p className="muted" style={{ margin: '6px 0 12px' }}>Votre compte n’est rattaché à aucune pharmacie. Contactez l’équipe Togo Pharma pour activer votre espace.</p>
    <Link className="btn btn-primary" to="/">Retour à l’accueil</Link></div>
}

/* ---------- panneaux réutilisables ---------- */
function RequestsPanel({ limit, status }) {
  const { data, loading, error, reload } = useAsync(() => api.listRequests(status ? { status } : {}), [status])
  const [err, setErr] = useState('')
  const answer = async (id, s) => { setErr(''); try { await api.answerRequest(id, s); reload() } catch (e) { setErr(errorMessage(e)) } }
  const items = (data?.results || []).slice(0, limit)
  return (
    <>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      <Alert>{err}</Alert>
      {data && items.length === 0 && <Empty>Aucune demande {status === 'pending' ? 'en attente' : ''}.</Empty>}
      {items.map((r) => (
        <div className="list-line" key={r.id} style={{ display: 'block' }}>
          <div className="row between"><b>{r.product_name || 'Ordonnance'}</b>{r.status !== 'pending' && <Badge tone={STATUS[r.status].cls.replace('badge-', '')}>{STATUS[r.status].label}</Badge>}</div>
          <div className="muted">{r.client} · {timeAgo(r.created_at)} · {r.kind === 'reserve' ? 'Réservation' : r.kind === 'prescription' ? 'Ordonnance' : 'Disponibilité'}</div>
          {r.status === 'pending' && <div className="btn-row flat"><button className="btn btn-primary" onClick={() => answer(r.id, 'available')}>Disponible</button><button className="btn" onClick={() => answer(r.id, 'unavailable')}>Indisponible</button></div>}
        </div>
      ))}
    </>
  )
}

function StockPanel({ limit, onChange }) {
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useAsync(() => api.listStock(search), [search])
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const file = useRef(null)
  const wrap = async (fn) => { setErr(''); setInfo(''); try { await fn(); await reload(); onChange?.() } catch (e) { setErr(errorMessage(e)) } }
  const items = (data || []).slice(0, limit)
  return (
    <>
      <div className="search" style={{ marginBottom: 6 }}><Icon name="search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Chercher un produit" aria-label="Chercher un produit" /></div>
      {loading && <Spinner />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && items.length === 0 && <Empty>{search ? 'Aucun produit trouvé.' : 'Aucun produit en stock enregistré.'}</Empty>}
      {items.map((s) => (
        <div className="list-line" key={s.id}>
          <b>{s.name}</b>
          <span className="row"><span className="muted">{s.in_stock ? 'En stock' : 'Rupture'}</span>
            <Toggle checked={s.in_stock} label={`${s.name} en stock`} onChange={(v) => wrap(() => api.setStock(s.id, v))} /></span>
        </div>
      ))}
      <Alert>{err}</Alert><Alert tone="ok">{info}</Alert>
      <div className="btn-row flat">
        <button className="btn btn-primary" style={{ height: 44 }} disabled={!search.trim()} title={search.trim() ? '' : 'Saisissez un nom de produit dans la recherche'}
          onClick={() => wrap(async () => { await api.addStock(search.trim()); setSearch('') })}><Icon name="plus" size={16} />Ajouter</button>
        <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files[0] && wrap(async () => { const r = await api.importStock(e.target.files[0]); setInfo(`${r.imported} produit(s) importé(s).`); file.current.value = '' })} />
        <button className="btn" style={{ height: 44 }} onClick={() => file.current.click()}><Icon name="upload" size={16} />Importer</button>
      </div>
      <p className="muted" style={{ marginTop: 6 }}>Ajouter : saisissez le nom ci-dessus. Importer : CSV, une ligne « produit,rupture » ou « produit ».</p>
    </>
  )
}

const Head = ({ title, sub, back }) => {
  const nav = useNavigate()
  return <header className="topbar">{back && <IconBtn icon="back" label="Retour" onClick={() => nav(-1)} />}<h1>{sub && <small>{sub}</small>}{title}</h1></header>
}

/* ---------- pages ---------- */
export function PharmacistDashboard() {
  const { data: d, loading, error, reload, setData } = useAsync(api.getDashboard, [])
  const [err, setErr] = useState('')
  const [tick, setTick] = useState(0)
  if (loading && !d) return <Spinner />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const toggleOpen = async (open) => {
    setErr('')
    try { await api.updateMyPharmacy({ closed_manually: !open }); reload() } catch (e) { setErr(errorMessage(e)) }
  }
  return (
    <main className="pharmacist-dashboard">
      <header className="topbar"><h1><small>Espace pharmacien</small>{d.pharmacy.name}</h1><IconBtn icon="bell" label="Demandes en attente" to="/pharmacien/demandes" /></header>

      <div className="dark">
        <div className="row between">
          <div><small>Garde cette semaine</small><strong>{d.garde ? `Du ${formatDay(d.garde.start)} au ${formatDay(d.garde.end)}` : 'Aucune garde déclarée'}</strong></div>
          <div className="row"><small style={{ opacity: 1 }}>{d.is_open ? 'Ouverte' : 'Fermée'}</small><Toggle checked={d.is_open} label="Pharmacie ouverte" onChange={toggleOpen} /></div>
        </div>
        <Link className="btn btn-white btn-block" style={{ marginTop: 10 }} to="/pharmacien/garde">Déclarer ou modifier ma garde</Link>
      </div>
      <Alert>{err}</Alert>

      <div className="stats">
        <div className="stat"><b>{d.pending_requests}</b><span>Demandes en attente</span></div>
        <div className="stat"><b>{d.reservations}</b><span>Réservations</span></div>
        <div className="stat"><b>{d.stock_outs}</b><span>Ruptures</span></div>
      </div>

      <div className="card"><div className="row between"><h2>Demandes clients</h2><Badge>En attente</Badge></div>
        <RequestsPanel key={tick} limit={3} status="pending" />
      </div>
      <div className="card"><h2 style={{ marginBottom: 6 }}>Stock rapide</h2><StockPanel limit={3} onChange={() => { reload(); setTick((t) => t + 1) }} /></div>
      <div className="btn-row flat">
        <Link className="btn" to="/pharmacien/profil"><Icon name="clock" size={16} />Horaires et infos</Link>
        <Link className="btn" to="/pharmacien/profil"><Icon name="truck" size={16} />Livraison</Link>
      </div>
    </main>
  )
}

export function PharmacistRequests() {
  const [status, setStatus] = useState('pending')
  return <><Head title="Demandes clients" back />
    <div className="tabs">{[['pending', 'En attente'], ['', 'Toutes']].map(([v, l]) => <button key={l} className={status === v ? 'active' : ''} onClick={() => setStatus(v)}>{l}</button>)}</div>
    <div className="card"><RequestsPanel status={status} /></div></>
}

export function PharmacistStock() {
  return <><Head title="Stock" back /><div className="card"><StockPanel /></div></>
}

export function PharmacistGarde() {
  const { data, loading, error, reload } = useAsync(api.listGardes, [])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [err, setErr] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setErr('')
    try { await api.createGarde(new Date(start).toISOString(), new Date(end).toISOString()); setStart(''); setEnd(''); reload() } catch (ex) { setErr(errorMessage(ex)) }
  }
  const remove = async (id) => { setErr(''); try { await api.deleteGarde(id); reload() } catch (ex) { setErr(errorMessage(ex)) } }
  return (
    <>
      <Head title="Ma garde" back />
      <form className="card" onSubmit={submit}>
        <h2 style={{ marginBottom: 10 }}>Déclarer une période de garde</h2>
        <label className="field"><span>Début</span><input className="input" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required /></label>
        <label className="field"><span>Fin</span><input className="input" type="datetime-local" value={end} min={start} onChange={(e) => setEnd(e.target.value)} required /></label>
        <Alert>{err}</Alert>
        <button className="btn btn-primary btn-block btn-lg">Enregistrer la garde</button>
      </form>
      <div className="card"><h2>Gardes enregistrées</h2>
        {loading && <Spinner />}{error && <ErrorState message={error} onRetry={reload} />}
        {data?.length === 0 && <Empty>Aucune garde enregistrée.</Empty>}
        {data?.map((g) => (
          <div className="list-line" key={g.id}>
            <span><b>{formatDateTime(g.start)} → {formatDateTime(g.end)}</b>{g.is_active && <> <Badge tone="green">En cours</Badge></>}</span>
            <button className="btn btn-danger" style={{ height: 32 }} onClick={() => remove(g.id)} aria-label="Supprimer cette garde">Suppr.</button>
          </div>))}
      </div>
    </>
  )
}

export function PharmacistProfile() {
  const { logout } = useAuth()
  const nav = useNavigate()
  const ph = useAsync(api.getMyPharmacy, [])
  const hrs = useAsync(api.getHours, [])
  const [form, setForm] = useState(null)
  const [hours, setHours] = useState(null)
  const [msg, setMsg] = useState(null)
  const f = form || ph.data
  const h = hours || hrs.data
  const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
  const fullHours = h ? DAYS.map((_, i) => h.find((x) => x.weekday === i) || { weekday: i, open_time: '08:00', close_time: '20:00', closed: true }) : []

  const save = async () => {
    setMsg(null)
    try {
      if (form) { const { name, id, ...rest } = form; await api.updateMyPharmacy({ ...rest, avg_response_minutes: Number(rest.avg_response_minutes) || 15 }) }
      if (hours) await api.saveHours(fullHours.map(({ weekday, open_time, close_time, closed }) => ({ weekday, open_time, close_time, closed })))
      setMsg({ ok: true, text: 'Modifications enregistrées.' }); setForm(null); setHours(null); ph.reload(); hrs.reload()
    } catch (e) { setMsg({ ok: false, text: errorMessage(e) }) }
  }
  const upd = (k) => (e) => setForm({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const updH = (i, k, v) => setHours(fullHours.map((x) => (x.weekday === i ? { ...x, [k]: v } : x)))

  if (!f || !h) return ph.error ? <ErrorState message={ph.error} onRetry={ph.reload} /> : <Spinner />
  return (
    <>
      <Head title="Horaires et infos" back />
      <div className="card">
        <h2 style={{ marginBottom: 10 }}>{f.name}</h2>
        <label className="field"><span>Téléphone</span><input className="input" value={f.phone} onChange={upd('phone')} /></label>
        <label className="field"><span>WhatsApp (format international)</span><input className="input" value={f.whatsapp} onChange={upd('whatsapp')} /></label>
        <label className="field"><span>Pharmacien responsable</span><input className="input" value={f.pharmacist_name} onChange={upd('pharmacist_name')} /></label>
        <label className="field"><span>Assurances acceptées (séparées par des virgules)</span><input className="input" value={f.insurances} onChange={upd('insurances')} /></label>
        <label className="field"><span>Délai moyen de réponse (min)</span><input className="input" type="number" min="1" max="240" value={f.avg_response_minutes} onChange={upd('avg_response_minutes')} /></label>
        <div className="list-line"><b id="livraison">Livraison</b><Toggle checked={f.delivery} label="Livraison" onChange={(v) => setForm({ ...f, delivery: v })} /></div>
        {f.delivery && <label className="field" style={{ marginTop: 8 }}><span>Zone de livraison</span><input className="input" value={f.delivery_zone} onChange={upd('delivery_zone')} /></label>}
      </div>
      <div className="card"><h2 style={{ marginBottom: 6 }}>Horaires d’ouverture</h2>
        {fullHours.map((x) => (
          <div className="list-line" key={x.weekday}>
            <b style={{ width: 80 }}>{DAYS[x.weekday]}</b>
            {x.closed ? <span className="muted" style={{ flex: 1 }}>Fermé</span> : <span className="row" style={{ flex: 1 }}>
              <input className="input" type="time" value={x.open_time.slice(0, 5)} onChange={(e) => updH(x.weekday, 'open_time', e.target.value)} aria-label={`Ouverture ${DAYS[x.weekday]}`} />
              <input className="input" type="time" value={x.close_time.slice(0, 5)} onChange={(e) => updH(x.weekday, 'close_time', e.target.value)} aria-label={`Fermeture ${DAYS[x.weekday]}`} /></span>}
            <Toggle checked={!x.closed} label={`${DAYS[x.weekday]} ouvert`} onChange={(v) => updH(x.weekday, 'closed', !v)} />
          </div>))}
      </div>
      <Alert tone={msg?.ok ? 'ok' : 'error'}>{msg?.text}</Alert>
      <div className="stack">
        <button className="btn btn-primary btn-block btn-lg" disabled={!form && !hours} onClick={save}>Enregistrer</button>
        <button className="btn btn-danger btn-block btn-lg" onClick={async () => { await logout(); nav('/') }}><Icon name="logout" size={16} />Se déconnecter</button>
      </div>
    </>
  )
}
