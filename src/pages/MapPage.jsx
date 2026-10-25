import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../components/Icon'
import MapView from '../components/MapView'
import PharmacyCard from '../components/PharmacyCard'
import SearchBar from '../components/SearchBar'
import { Alert, Chip, Empty, ErrorState, Spinner } from '../components/ui'
import { useLocationCtx } from '../hooks/LocationContext'
import useAsync from '../hooks/useAsync'
import { listPharmacies } from '../services/pharmacies'

const CHIPS = [
  { key: 'on_call', label: 'De garde' },
  { key: 'open_now', label: 'Ouvertes' },
  { key: 'is_24h', label: '24h/24' },
  { key: 'delivery', label: 'Livraison' },
]

export default function MapPage() {
  const [sp, setSp] = useSearchParams()
  const { loc, locate, geoError } = useLocationCtx()
  const [text, setText] = useState(sp.get('search') || '')
  const [selected, setSelected] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [recenter, setRecenter] = useState(0)

  const filters = Object.fromEntries(CHIPS.map((c) => [c.key, sp.get(c.key) === 'true']))
  const search = sp.get('search') || ''
  const { data, loading, error, reload } = useAsync(
    () => listPharmacies({ ...filters, search, lat: loc.lat, lng: loc.lng }),
    [sp.toString(), loc.lat, loc.lng],
  )
  const pharmacies = data?.results || []

  const setParam = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }) }
  useEffect(() => { setText(sp.get('search') || '') }, [sp])

  const onSelect = useCallback((id) => {
    setSelected(id)
    setExpanded(true)
    setTimeout(() => document.getElementById(`ph-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 50)
  }, [])

  return (
    <div className="map-page">
      <div className="map-box">
        <MapView pharmacies={pharmacies} me={loc.source !== 'default' ? loc : undefined} selectedId={selected} onSelect={onSelect} recenterKey={recenter} />
      </div>

      <div className="map-top">
        <SearchBar value={text} onChange={setText} onSubmit={(t) => setParam('search', (t || '').trim())} showCamera={false} />
        <div className="chips" style={{ marginBottom: 0 }}>
          {CHIPS.map((c) => <Chip key={c.key} active={filters[c.key]} onClick={() => setParam(c.key, filters[c.key] ? '' : 'true')}>{c.label}</Chip>)}
        </div>
      </div>

      <button className="locate-fab" aria-label="Me localiser" onClick={async () => { if (await locate()) setRecenter((n) => n + 1) }}><Icon name="locate" size={22} /></button>

      <section className={`sheet ${expanded ? 'expanded' : ''}`} aria-label="Pharmacies autour de vous">
        <div className="grip" />
        <div className="row between" style={{ marginBottom: 10 }}>
          <h2 className="section-title">{loading ? 'Recherche…' : `${data?.count ?? 0} pharmacie${(data?.count ?? 0) > 1 ? 's' : ''} autour de vous`}</h2>
          <button className="btn" style={{ height: 32 }} onClick={() => setExpanded((e) => !e)}><Icon name={expanded ? 'map' : 'grid'} size={15} />{expanded ? 'Carte' : 'Liste'}</button>
        </div>
        <Alert>{geoError}</Alert>
        {loading && <Spinner />}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && pharmacies.length === 0 && <Empty>Aucune pharmacie trouvée. Essayez d’autres filtres.</Empty>}
        {pharmacies.map((p) => <PharmacyCard key={p.id} id={`ph-${p.id}`} pharmacy={p} selected={p.id === selected} onSelect={setSelected} />)}
      </section>
    </div>
  )
}
