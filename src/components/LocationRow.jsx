import { useState } from 'react'
import { SITE } from '../config/site'
import { useLocationCtx } from '../hooks/LocationContext'
import { getQuartiers } from '../services/pharmacies'
import Icon from './Icon'
import { Alert } from './ui'

export default function LocationRow() {
  const { loc, chooseQuartier, locate, geoError } = useLocationCtx()
  const [open, setOpen] = useState(false)
  const [quartiers, setQuartiers] = useState([])
  const [err, setErr] = useState('')

  const toggle = async () => {
    setOpen((o) => !o)
    if (!quartiers.length) {
      try { setQuartiers(await getQuartiers()) } catch { setErr('Impossible de charger les quartiers.') }
    }
  }
  const label = loc.source === 'gps' ? 'Ma position' : loc.quartier || 'Choisir un quartier'
  return (
    <>
      <div className="loc-row">
        <Icon name="pin" /><span>{SITE.defaultCity} · {label}</span>
        <button className="link-btn" onClick={toggle} aria-expanded={open}>Modifier</button>
      </div>
      {open && (
        <div className="card">
          <label className="field"><span>Votre quartier</span>
            <select className="select" value={loc.quartier || ''} onChange={(e) => { const q = quartiers.find((x) => x.quartier === e.target.value); if (q) { chooseQuartier(q); setOpen(false) } }}>
              <option value="" disabled>Sélectionner…</option>
              {quartiers.map((q) => <option key={q.quartier} value={q.quartier}>{q.quartier}</option>)}
            </select>
          </label>
          <button className="btn btn-block" onClick={async () => { if (await locate()) setOpen(false) }}><Icon name="locate" size={16} /> Utiliser ma position</button>
          <Alert>{err || geoError}</Alert>
        </div>
      )}
    </>
  )
}
