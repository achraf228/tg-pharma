import { Outlet, useLocation } from 'react-router-dom'
import ClientNavbar from '../components/ClientNavbar'

export default function ClientLayout() {
  const { pathname } = useLocation()
  const map = pathname === '/carte'
  const wide = pathname === '/' || map
  return (
    <div className={`shell client-shell ${wide ? 'wide' : ''} ${map ? 'map-shell' : ''}`}>
      <ClientNavbar />
      <Outlet />
    </div>
  )
}
