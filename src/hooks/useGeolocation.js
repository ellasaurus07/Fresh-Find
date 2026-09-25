import { useCallback, useEffect, useMemo, useState } from 'react'
import { areaCentre, MARKETS } from '../lib/data.js'
import { distanceKm, REGION_RADIUS_KM } from '../lib/geo.js'

// ---------------------------------------------------------------------------
// LOCATION — browser geolocation, only after the visitor asks for it.
// If permission is denied (or unavailable), everything keeps working: the
// visitor can pick a neighbourhood instead, and "Nearest" sorting falls back
// to "Next open" until a location exists.
//   status: 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable' | 'manual'
// ---------------------------------------------------------------------------
const MANUAL_KEY = 'freshfind.manualArea'

export default function useGeolocation() {
  const [state, setState] = useState(() => {
    let area = null
    try { area = localStorage.getItem(MANUAL_KEY) } catch (_) { area = null }
    const c = area && areaCentre(area)
    return c ? { status: 'manual', coords: c, area, error: null } : { status: 'idle', coords: null, area: null, error: null }
  })

  const request = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, status: 'unavailable', error: 'This browser can’t share its location.' }))
      return
    }
    setState((s) => ({ ...s, status: 'locating', error: null }))
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        try { localStorage.removeItem(MANUAL_KEY) } catch (_) { /* ignore */ }
        setState({ status: 'granted', coords: { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }, area: null, error: null })
      },
      (err) =>
        setState((s) => ({
          ...s,
          status: err.code === 1 ? 'denied' : 'unavailable',
          error: err.code === 1 ? 'Location permission was declined.' : 'Your location couldn’t be found just now.',
        })),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }, [])

  const setManual = useCallback((area) => {
    const c = area ? areaCentre(area) : null
    try { area ? localStorage.setItem(MANUAL_KEY, area) : localStorage.removeItem(MANUAL_KEY) } catch (_) { /* ignore */ }
    setState(c ? { status: 'manual', coords: c, area, error: null } : { status: 'idle', coords: null, area: null, error: null })
  }, [])

  // Far outside Qatar? say so, and keep distances honest.
  const outsideRegion = useMemo(() => {
    if (!state.coords || state.status !== 'granted') return false
    return Math.min(...MARKETS.map((m) => distanceKm(state.coords, m))) > REGION_RADIUS_KM
  }, [state])

  return { ...state, outsideRegion, request, setManual, hasLocation: !!state.coords }
}
