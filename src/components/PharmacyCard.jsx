import { Link } from 'react-router-dom'
import { directionsUrl, formatKm, whatsappUrl } from '../utils/format'
import Icon from './Icon'
import { Badge } from './ui'

export function statusText(p) {
  if (p.is_24h) return 'Ouverte 24h/24'
  if (p.is_open) return p.open_until ? `Ouverte jusqu’à ${p.open_until.replace(':', 'h')}` : 'Ouverte'
  return 'Fermée actuellement'
}

export const metaLine = (p) => [formatKm(p.distance_km), statusText(p), p.quartier].filter(Boolean).join(' · ')

export default function PharmacyCard({ pharmacy: p, selected, onSelect, id }) {
  const rich = p.stock_confirmed_minutes != null && !!(p.whatsapp || p.phone)
  return (
    <article className={`card ph-card ${selected ? 'selected' : ''}`} id={id} onClick={() => onSelect?.(p.id)}>
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <Link to={`/pharmacie/${p.id}`}><h3>{p.name}</h3></Link>
        {p.is_on_call && <Badge>De garde</Badge>}
      </div>
      <p className="meta">{metaLine(p)}</p>
      {rich && <span className="confirm-pill">
        Stock confirmé {p.stock_confirmed_minutes < 60 ? `il y a ${p.stock_confirmed_minutes} min` : `il y a ${Math.round(p.stock_confirmed_minutes / 60)} h`}
      </span>}
      <div className={`btn-row ${rich ? 'stack' : 'flat'}`}>
        <a className="btn btn-primary" href={`tel:${p.phone}`}>{rich && <Icon name="phone" size={16} />}Appeler</a>
        <a className="btn" href={directionsUrl(p)} target="_blank" rel="noreferrer">{rich && <Icon name="nav" size={16} />}Itinéraire</a>
        {rich ? (
          <>
            <a className="btn" href={whatsappUrl(p)} target="_blank" rel="noreferrer"><Icon name="chat" size={16} />WhatsApp</a>
            <Link className="btn" to={`/pharmacie/${p.id}#demande`}><Icon name="box" size={16} />Produit</Link>
          </>
        ) : <Link className="btn" to={`/pharmacie/${p.id}`}>Détails</Link>}
      </div>
    </article>
  )
}
