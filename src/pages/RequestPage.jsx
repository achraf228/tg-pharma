import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { Alert, IconBtn, Spinner } from '../components/ui'
import { useLocationCtx } from '../hooks/LocationContext'
import useAsync from '../hooks/useAsync'
import { errorMessage } from '../services/api'
import { createRequest, listPharmacies } from '../services/pharmacies'
import { formatKm } from '../utils/format'

const KINDS = {
  check: { title: 'Vérifier un produit', help: 'Demandez à une pharmacie si le produit est disponible.', cta: 'Envoyer la demande' },
  reserve: { title: 'Réserver un produit', help: 'La pharmacie vous le met de côté.', cta: 'Réserver' },
  prescription: { title: 'Envoyer une ordonnance', help: 'Photo ou PDF de votre ordonnance (5 Mo max).', cta: 'Envoyer l’ordonnance' },
}

export default function RequestPage() {
  const { kind } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { loc } = useLocationCtx()
  const [pharmacy, setPharmacy] = useState(sp.get('pharmacy') || '')
  const [product, setProduct] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef(null)
  const { data, loading } = useAsync(() => listPharmacies({ lat: loc.lat, lng: loc.lng }), [loc.lat, loc.lng])
  const cfg = KINDS[kind]
  if (!cfg) return <Navigate to="/demande/check" replace />

  const submit = async (e) => {
    e.preventDefault(); setErr('')
    if (!pharmacy) return setErr('Choisissez une pharmacie.')
    setBusy(true)
    try { await createRequest({ pharmacy, kind, product_name: product.trim(), file }); setDone(true) }
    catch (ex) { setErr(errorMessage(ex)) } finally { setBusy(false) }
  }

  if (done) return (
    <div className="card" style={{ marginTop: 24, textAlign: 'center' }}>
      <h2>Demande envoyée ✔</h2>
      <p className="muted" style={{ margin: '6px 0 14px' }}>La pharmacie vous répondra bientôt. Suivez l’état de votre demande dans « Rappels ».</p>
      <div className="btn-row flat"><Link className="btn btn-primary" to="/rappels">Voir mes demandes</Link><Link className="btn" to="/">Accueil</Link></div>
    </div>
  )

  return (
    <>
      <header className="topbar"><IconBtn icon="back" label="Retour" onClick={() => nav(-1)} /><h1>{cfg.title}<small>{cfg.help}</small></h1></header>
      <form className="card" onSubmit={submit}>
        <label className="field"><span>Pharmacie</span>
          {loading ? <Spinner /> : (
            <select className="select" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} required>
              <option value="">Sélectionner…</option>
              {data?.results.map((p) => <option key={p.id} value={p.id}>{p.name}{p.distance_km != null ? ` · ${formatKm(p.distance_km)}` : ''}{p.is_on_call ? ' · de garde' : ''}</option>)}
            </select>)}
        </label>
        {kind !== 'prescription' && (
          <label className="field"><span>Nom du produit</span>
            <input className="input" value={product} onChange={(e) => setProduct(e.target.value)} maxLength={150} required />
          </label>)}
        {kind === 'prescription' && (
          <div className="field"><span>Ordonnance</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" capture="environment" hidden onChange={(e) => setFile(e.target.files[0] || null)} />
            <button type="button" className="btn btn-block" onClick={() => fileRef.current.click()}><Icon name="camera" size={16} />{file ? file.name : 'Prendre une photo ou choisir un fichier'}</button>
          </div>)}
        <Alert>{err}</Alert>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy || (kind === 'prescription' && !file)}>{busy ? 'Envoi…' : cfg.cta}</button>
      </form>
    </>
  )
}
