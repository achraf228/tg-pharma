import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import MapView from '../components/MapView'
import PharmacyCard from '../components/PharmacyCard'
import SearchBar from '../components/SearchBar'
import { Badge, Chip, Empty, ErrorState, Spinner } from '../components/ui'
import { HOME_SERVICES, HOME_STEPS, SITE } from '../config/site'
import { useAuth } from '../hooks/AuthContext'
import { useLocationCtx } from '../hooks/LocationContext'
import useAsync from '../hooks/useAsync'
import { getGardeWeek, listPharmacies, myRequests } from '../services/pharmacies'
import { STATUS, formatDay } from '../utils/format'

const FILTERS = [
  { key: 'garde', label: 'De garde', params: { on_call: true } },
  { key: 'open', label: 'Ouvertes', params: { open_now: true } },
  { key: 'h24', label: '24h/24', params: { is_24h: true } },
  { key: 'near', label: 'Près de moi', params: {} },
]

function HeroIllustration() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art-orbit orbit-one" />
      <div className="hero-art-orbit orbit-two" />
      <div className="hero-cross"><Icon name="plus" size={38} /></div>
      <svg className="hero-illustration" viewBox="0 0 520 390" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M81 345c21-79 90-126 179-126 93 0 157 48 178 126" fill="#DBEEE3" />
        <path d="M108 345c16-65 68-102 142-102 75 0 127 39 143 102" fill="#B8DCC8" />
        <rect x="157" y="69" width="206" height="253" rx="20" fill="white" stroke="#DDE8E1" strokeWidth="2" />
        <path d="M157 89a20 20 0 0 1 20-20h166a20 20 0 0 1 20 20v27H157V89Z" fill="#0F784D" />
        <circle cx="177" cy="93" r="4" fill="#B8DCC8" /><circle cx="191" cy="93" r="4" fill="#B8DCC8" />
        <rect x="181" y="140" width="158" height="153" rx="10" fill="#F0F6F2" />
        <path d="m192 255 38-36 24 18 34-44 40 40" stroke="#B5D7C3" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M263 189c0-12 9-21 21-21 11 0 20 9 20 21 0 20-20 39-20 39s-21-19-21-39Z" fill="#0F784D" />
        <circle cx="284" cy="189" r="7" fill="white" />
        <rect x="198" y="151" width="48" height="6" rx="3" fill="#DDE8E1" />
        <rect x="207" y="307" width="106" height="8" rx="4" fill="#DDE8E1" />
        <rect x="67" y="175" width="120" height="72" rx="12" fill="white" stroke="#E5EDE8" strokeWidth="2" />
        <rect x="84" y="192" width="30" height="30" rx="8" fill="#E3F0E8" />
        <path d="M99 198v18m-9-9h18" stroke="#0F784D" strokeWidth="3" strokeLinecap="round" />
        <rect x="124" y="196" width="45" height="6" rx="3" fill="#C7D8CD" />
        <rect x="124" y="209" width="33" height="5" rx="2.5" fill="#E0E9E3" />
        <circle cx="384" cy="236" r="38" fill="white" />
        <circle cx="384" cy="236" r="28" fill="#E3F0E8" />
        <path d="M384 220v32m-16-16h32" stroke="#0F784D" strokeWidth="7" strokeLinecap="round" />
        <path d="M149 342h224" stroke="#A6C7B2" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <div className="hero-art-caption">
        <span className="caption-mark"><Icon name="check" size={16} /></span>
        <span><strong>Votre recherche simplifiée</strong><small>Pharmacies, horaires et itinéraires</small></span>
      </div>
    </div>
  )
}

export default function Home() {
  const nav = useNavigate()
  const { user, isPharmacist } = useAuth()
  const { loc, locate } = useLocationCtx()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('garde')
  const f = FILTERS.find((item) => item.key === filter)

  const list = useAsync(() => listPharmacies({ ...f.params, lat: loc.lat, lng: loc.lng }), [filter, loc.lat, loc.lng])
  const week = useAsync(getGardeWeek, [])
  const reqs = useAsync(() => (user ? myRequests() : Promise.resolve(null)), [user?.id])

  const pharmacies = list.data?.results || []
  const pick = async (key) => { setFilter(key); if (key === 'near') await locate() }
  const cta = (path) => nav(isPharmacist ? path : `/connexion?next=${encodeURIComponent(path)}`)

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> La santé, plus proche de vous</span>
          <h1>Togo Pharma, votre santé à portée de clic</h1>
          <p>La plateforme qui vous aide à rechercher une pharmacie au Togo, à consulter les pharmacies de garde et à préparer votre itinéraire en toute simplicité.</p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-lg" href="#annuaire"><Icon name="search" size={18} />Trouver une pharmacie</a>
            <Link className="btn btn-outline btn-lg" to="/carte?on_call=true"><Icon name="clock" size={18} />Pharmacies de garde</Link>
          </div>
          <div className="hero-note"><Icon name="pin" size={16} /> Des informations utiles, partout au Togo</div>
        </div>
        <HeroIllustration />
      </section>

      <section className="home-intro" id="presentation">
        <div className="section-heading">
          <span className="eyebrow">Une plateforme pensée pour vous</span>
          <h2>Découvrez Togo Pharma</h2>
          <p>Togo Pharma facilite la recherche d’informations sur les pharmacies au Togo, depuis votre quartier ou lorsque vous êtes de passage.</p>
        </div>
        <div className="intro-content">
          <div className="intro-accent"><Icon name="heart" size={25} /><span>Un accès plus simple aux soins de proximité</span></div>
          <div className="intro-copy">
            <p>Lorsque l’on cherche une pharmacie ouverte ou de garde, trouver rapidement une adresse et savoir comment s’y rendre peut être compliqué. Togo Pharma rassemble les informations disponibles dans un même espace pour vous aider à vous orienter.</p>
            <p>La plateforme s’adresse aux habitants, aux visiteurs et aux touristes. Recherchez un établissement, consultez sa fiche et sa position sur la carte, puis préparez votre trajet. Les informations pratiques affichées dépendent des données renseignées.</p>
          </div>
        </div>
      </section>

      <section className="home-services" id="services">
        <div className="section-heading">
          <span className="eyebrow">Des services utiles au quotidien</span>
          <h2>Tout pour trouver votre pharmacie</h2>
          <p>Des outils simples pour repérer un établissement et organiser votre déplacement.</p>
        </div>
        <div className="services-grid">
          {HOME_SERVICES.map((service) => (
            <article className="service-card" key={service.title}>
              <span className="service-icon"><Icon name={service.icon} size={21} /></span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-steps" id="comment-ca-marche">
        <div className="section-heading">
          <span className="eyebrow">Simple, en quelques étapes</span>
          <h2>Comment ça marche ?</h2>
        </div>
        <div className="steps-grid">
          {HOME_STEPS.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-directory" id="annuaire">
        <div className="section-heading directory-heading">
          <span className="eyebrow">Explorer les pharmacies</span>
          <h2>Recherchez près de vous</h2>
          <p>Affinez votre recherche et consultez les établissements disponibles sur la carte.</p>
        </div>
        <div className="home-search">
          <SearchBar value={q} onChange={setQ} onSubmit={(text) => nav(`/carte?search=${encodeURIComponent(text || '')}`)} />
          <div className="chips" role="group" aria-label="Filtrer les pharmacies">
            {FILTERS.map((item) => <Chip key={item.key} active={filter === item.key} onClick={() => pick(item.key)}>{item.label}</Chip>)}
          </div>
        </div>
        <div className="banner home-banner">
          <div>
            <small>Pharmacies de garde</small>
            <strong>{week.data?.start ? `Semaine du ${formatDay(week.data.start)} au ${formatDay(week.data.end)}` : 'Consultez les pharmacies de garde'}</strong>
          </div>
          <Link className="btn btn-white" to="/carte?on_call=true">Voir les pharmacies</Link>
        </div>
        <div className="home-directory-grid">
          <div className="mini-map">
            <MapView pharmacies={pharmacies} me={loc.source !== 'default' ? loc : undefined} interactive={false} />
            <Link className="btn btn-primary" to="/carte">Ouvrir la carte</Link>
          </div>
          <div className="directory-results">
            <div className="row between directory-results-heading">
              <h3>{filter === 'garde' ? 'De garde près de vous' : 'Pharmacies près de vous'}</h3>
              <Link className="link-btn" to="/carte">Tout voir</Link>
            </div>
            {list.loading && <Spinner />}
            {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
            {!list.loading && !list.error && pharmacies.length === 0 && <Empty>Aucune pharmacie ne correspond à ce filtre pour le moment.</Empty>}
            {pharmacies.slice(0, 5).map((pharmacy) => <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />)}
          </div>
        </div>
      </section>

      <section className="home-actions">
        <h2 className="section-title">Que souhaitez-vous faire ?</h2>
        <div className="actions-grid">
          {SITE.quickActions.map((action) => (
            <Link key={action.key} to={action.to} className={`action ${action.danger ? 'danger' : ''}`}>
              <span className="ico"><Icon name={action.icon} /></span>{action.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="home-followup">
        <div className="card">
          <div className="row between"><h2>Mes demandes</h2>{user && <Link className="link-btn" to="/rappels">Voir tout</Link>}</div>
          {!user && <p className="muted" style={{ marginTop: 6 }}><Link className="link-btn" to="/connexion">Connectez-vous</Link> pour suivre vos demandes de produits.</p>}
          {user && reqs.loading && <Spinner />}
          {user && reqs.data && reqs.data.results.length === 0 && <p className="muted" style={{ marginTop: 6 }}>Aucune demande pour l’instant.</p>}
          {reqs.data?.results.slice(0, 3).map((request) => (
            <div className="list-line" key={request.id}>
              <div><b>{request.product_name || 'Ordonnance'}</b><div className="muted">{request.pharmacy_name}</div></div>
              <Badge tone={STATUS[request.status].cls.replace('badge-', '')}>{STATUS[request.status].label}</Badge>
            </div>
          ))}
        </div>

        <div className="card">
          <h2>{SITE.health.title}</h2>
          <p className="muted" style={{ margin: '4px 0 10px' }}>{SITE.health.text}</p>
          <div className="btn-row flat" style={{ margin: 0 }}>
            <Link className="btn btn-primary" to="/messages">Poser une question</Link>
            <Link className="btn" to="/messages">Conseils santé</Link>
          </div>
        </div>

        <div className="dark">
          <strong>{SITE.pharmacistCta.title}</strong>
          <small style={{ margin: '4px 0 10px' }}>{SITE.pharmacistCta.text}</small>
          <div className="btn-row flat" style={{ margin: 0 }}>
            <button className="btn btn-white" onClick={() => cta('/pharmacien/garde')}>Déclarer ma garde</button>
            <button className="btn btn-white" onClick={() => cta('/pharmacien/stock')}>Mettre à jour le stock</button>
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="eyebrow">Besoin de vous déplacer ?</span>
          <h2>La pharmacie qu’il vous faut, plus facile à trouver.</h2>
          <p>Consultez la carte et les informations disponibles avant de prendre la route.</p>
        </div>
        <Link className="btn btn-white btn-lg" to="/carte"><Icon name="search" size={18} />Rechercher maintenant</Link>
      </section>
    </main>
  )
}
