import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { SITE } from '../config/site'

const KEY = 'tp_location'
const LocationContext = createContext(null)

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}

/** Position utilisée pour calculer les distances : quartier choisi, GPS, ou centre de Lomé. */
export function LocationProvider({ children }) {
  const [loc, setLoc] = useState(() => read() || { quartier: null, ...SITE.defaultCenter, source: 'default' })
  const [geoError, setGeoError] = useState(null)

  const save = useCallback((next) => {
    setLoc(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }, [])

  const chooseQuartier = useCallback((q) => save({ quartier: q.quartier, lat: q.latitude, lng: q.longitude, source: 'quartier' }), [save])

  const locate = useCallback(() => new Promise((resolve) => {
    if (!navigator.geolocation) { setGeoError('La géolocalisation n’est pas disponible sur cet appareil.'); return resolve(null) }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeoError(null)
        const next = { quartier: null, lat: p.coords.latitude, lng: p.coords.longitude, source: 'gps' }
        save(next)
        resolve(next)
      },
      () => { setGeoError('Position refusée ou indisponible. Choisissez un quartier.'); resolve(null) },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }), [save])

  const value = useMemo(() => ({ loc, chooseQuartier, locate, geoError }), [loc, chooseQuartier, locate, geoError])
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export const useLocationCtx = () => useContext(LocationContext)
