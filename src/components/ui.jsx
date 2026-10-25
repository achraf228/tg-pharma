import { Link } from 'react-router-dom'
import Icon from './Icon'

export const Spinner = ({ label = 'Chargement…' }) => (
  <div className="state" role="status"><span className="spinner" /> {label}</div>
)

export const ErrorState = ({ message, onRetry }) => (
  <div className="state state-error" role="alert">
    <p>{message}</p>
    {onRetry && <button className="btn btn-soft" onClick={onRetry}>Réessayer</button>}
  </div>
)

export const Empty = ({ children }) => <div className="state state-empty">{children}</div>

export const Badge = ({ tone = 'amber', children }) => <span className={`badge badge-${tone}`}>{children}</span>

export const Toggle = ({ checked, onChange, label, disabled }) => (
  <button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
    className={`toggle ${checked ? 'on' : ''}`} onClick={() => onChange(!checked)}><span /></button>
)

export const Chip = ({ active, onClick, children }) => (
  <button type="button" className={`chip ${active ? 'active' : ''}`} onClick={onClick} aria-pressed={!!active}>{children}</button>
)

export function IconBtn({ icon, label, onClick, to, active }) {
  const cls = `icon-btn ${active ? 'active' : ''}`
  return to
    ? <Link to={to} className={cls} aria-label={label}><Icon name={icon} /></Link>
    : <button type="button" className={cls} aria-label={label} onClick={onClick}><Icon name={icon} /></button>
}

export const Alert = ({ tone = 'error', children }) => children ? <div className={`alert alert-${tone}`} role="alert">{children}</div> : null
