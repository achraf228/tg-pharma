const dmy = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
export const formatDay = (iso) => (iso ? dmy.format(new Date(iso)).replace('.', '') : '')
export const formatDateTime = (iso) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
export const formatKm = (km) => (km == null ? null : `${km.toFixed(1).replace('.', ',')} km`)
export function timeAgo(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (min < 1) return "à l'instant"
  if (min < 60) return `il y a ${min} min`
  const h = Math.round(min / 60)
  return h < 24 ? `il y a ${h} h` : `il y a ${Math.round(h / 24)} j`
}
export const toLocalInput = (iso) => {
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}
export const phoneDigits = (p) => (p || '').replace(/[^\d]/g, '')
export const directionsUrl = (p) => `https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`
export const whatsappUrl = (p) => `https://wa.me/${phoneDigits(p.whatsapp || p.phone)}`
export const STATUS = {
  pending: { label: 'En attente', cls: 'badge-amber' },
  available: { label: 'Disponible', cls: 'badge-green' },
  unavailable: { label: 'Indisponible', cls: 'badge-red' },
}
