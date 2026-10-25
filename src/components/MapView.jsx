import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'

const pinIcon = (closed, selected) => L.divIcon({
  className: '', iconSize: [26, 26], iconAnchor: [13, 26],
  html: `<div class="pin ${closed ? 'closed' : ''} ${selected ? 'selected' : ''}"></div>`,
})
const meIcon = L.divIcon({ className: '', iconSize: [16, 16], html: '<div class="me-dot"></div>' })

/**
 * Carte OpenStreetMap. `pharmacies` : liste issue de l'API.
 * `me` : position de l'utilisateur. `recenterKey` force un recentrage sur `me`.
 */
export default function MapView({ pharmacies = [], me, selectedId, onSelect, interactive = true, recenterKey }) {
  const el = useRef(null)
  const map = useRef(null)
  const layer = useRef(null)
  const fitted = useRef('')

  useEffect(() => {
    map.current = L.map(el.current, {
      zoomControl: false, attributionControl: interactive, dragging: interactive, scrollWheelZoom: interactive,
      doubleClickZoom: interactive, touchZoom: interactive, boxZoom: interactive, keyboard: interactive,
    }).setView(me ? [me.lat, me.lng] : [6.1375, 1.2123], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    return () => { map.current.remove(); map.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!map.current) return
    layer.current.clearLayers()
    const pts = []
    pharmacies.forEach((p) => {
      const ll = [Number(p.latitude), Number(p.longitude)]
      pts.push(ll)
      const m = L.marker(ll, { icon: pinIcon(!p.is_open, p.id === selectedId), title: p.name }).addTo(layer.current)
      if (onSelect) m.on('click', () => onSelect(p.id))
    })
    if (me) L.marker([me.lat, me.lng], { icon: meIcon, interactive: false }).addTo(layer.current)
    const sig = pharmacies.map((p) => p.id).join(',')
    if (sig !== fitted.current && pts.length) {
      fitted.current = sig
      if (me) pts.push([me.lat, me.lng])
      map.current.fitBounds(pts, { padding: [40, 40], maxZoom: 15 })
    }
  }, [pharmacies, me, selectedId, onSelect])

  useEffect(() => {
    if (recenterKey && me && map.current) map.current.setView([me.lat, me.lng], 15)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recenterKey])

  return <div ref={el} style={{ width: '100%', height: '100%' }} />
}
