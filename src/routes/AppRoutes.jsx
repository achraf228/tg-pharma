import { Route, Routes } from 'react-router-dom'
import ClientLayout from '../layouts/ClientLayout'
import PharmacistLayout from '../layouts/PharmacistLayout'
import Home from '../pages/Home'
import MapPage from '../pages/MapPage'
import PharmacyDetail from '../pages/PharmacyDetail'
import RequestPage from '../pages/RequestPage'
import { Favorites, Messages, Profile, Reminders } from '../pages/ClientPages'
import Login from '../pages/Login'
import { PharmacistDashboard, PharmacistDenied, PharmacistGarde, PharmacistProfile, PharmacistRequests, PharmacistStock } from '../pages/PharmacistPages'
import { RequireAuth } from './guards'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<ClientLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/carte" element={<MapPage />} />
        <Route path="/pharmacie/:id" element={<PharmacyDetail />} />
        <Route path="/demande/:kind" element={<RequireAuth><RequestPage /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="/rappels" element={<RequireAuth><Reminders /></RequireAuth>} />
        <Route path="/favoris" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="/profil" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/connexion" element={<Login />} />
        <Route path="*" element={<div className="state">Page introuvable.</div>} />
      </Route>
      <Route element={<PharmacistLayout />}>
        <Route path="/pharmacien/acces" element={<PharmacistDenied />} />
        <Route path="/pharmacien" element={<RequireAuth pharmacist><PharmacistDashboard /></RequireAuth>} />
        <Route path="/pharmacien/demandes" element={<RequireAuth pharmacist><PharmacistRequests /></RequireAuth>} />
        <Route path="/pharmacien/stock" element={<RequireAuth pharmacist><PharmacistStock /></RequireAuth>} />
        <Route path="/pharmacien/garde" element={<RequireAuth pharmacist><PharmacistGarde /></RequireAuth>} />
        <Route path="/pharmacien/profil" element={<RequireAuth pharmacist><PharmacistProfile /></RequireAuth>} />
      </Route>
    </Routes>
  )
}
