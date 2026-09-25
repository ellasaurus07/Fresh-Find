// Great-circle distance — used for "Nearby" and proximity sorting.
const R = 6371
const rad = (d) => (d * Math.PI) / 180
export function distanceKm(a, b) {
  if (!a || !b) return null
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
export function formatKm(km) {
  if (km == null) return ''
  if (km < 1) return `${Math.round(km * 1000)} m away`
  if (km < 100) return `${km.toFixed(km < 10 ? 1 : 0)} km away`
  return `${Math.round(km).toLocaleString()} km away`
}
/** Beyond this, the visitor is clearly outside Qatar — we say so and offer a manual pick. */
export const REGION_RADIUS_KM = 60

export const mapsEmbed = (lat, lng, zoom = 15) =>
  `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
export const mapsLink = (lat, lng, label = '') =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label ? `${label} ${lat},${lng}` : `${lat},${lng}`)}`
export const directionsLink = (lat, lng, from) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${from ? `&origin=${from.lat},${from.lng}` : ''}`
