import { Outlet } from 'react-router-dom'
import ClientNavbar from '../components/ClientNavbar'

export default function PharmacistLayout() {
  return (
    <div className="shell wide client-shell pharmacist-shell">
      <ClientNavbar />
      <Outlet />
    </div>
  )
}
