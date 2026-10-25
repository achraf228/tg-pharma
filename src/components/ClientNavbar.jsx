import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { SITE } from '../config/site'

const LINKS = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/carte', label: 'Pharmacies' },
  { to: '/carte?on_call=true', label: 'Pharmacies de garde' },
  { to: '/demande/prescription', label: 'Ordonnance' },
  { to: '/messages', label: 'Conseils santé' },
  { to: '/profil', label: 'Mon espace' },
]

const PHARMACIST_LINKS = [
  { to: '/pharmacien', label: 'Tableau de bord', end: true },
  { to: '/pharmacien/demandes', label: 'Demandes' },
  { to: '/pharmacien/stock', label: 'Stock' },
  { to: '/pharmacien/garde', label: 'Gardes' },
  { to: '/pharmacien/profil', label: 'Ma pharmacie' },
]

export default function ClientNavbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname, search } = useLocation()
  const pharmacist = pathname.startsWith('/pharmacien')
  const links = pharmacist ? PHARMACIST_LINKS : LINKS

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname, search])

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 8)
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  return (
    <header className={`client-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="client-navbar-inner">
        <Link className="brand" to="/" aria-label={`${SITE.name}, accueil`}>
          <span className="brand-mark"><Icon name="plus" size={23} /></span>
          <span className="brand-name">Togo <strong>Pharma</strong></span>
        </Link>

        <button
          className="navbar-toggle"
          type="button"
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          aria-controls="client-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>

        <nav id="client-navigation" className={`client-navigation${menuOpen ? ' open' : ''}`} aria-label="Navigation principale">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) => {
                const onCall = new URLSearchParams(search).get('on_call') === 'true'
                const selected = isActive && (link.to !== '/carte' || !onCall) && (link.to !== '/carte?on_call=true' || onCall)
                return `client-nav-link${selected ? ' active' : ''}`
              }}
            >
              {link.label}
            </NavLink>
          ))}
          <Link className="navbar-cta" to={pharmacist ? '/' : '/carte'}>
            <Icon name={pharmacist ? 'home' : 'search'} size={17} />
            {pharmacist ? 'Espace client' : 'Trouver une pharmacie'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
