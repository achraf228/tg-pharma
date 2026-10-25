import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { Spinner } from '../components/ui'

export function RequireAuth({ children, pharmacist = false }) {
  const { user, loading, isPharmacist } = useAuth()
  const loc = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to={`/connexion?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (pharmacist && !isPharmacist) return <Navigate to="/pharmacien/acces" replace />
  return children
}
