// ════════ Onboarding applications — API-backed reactive cache ════════
// Same hook/action surface as before, but the source of truth is now the
// Express + SQLite backend (lib/api.js). Components keep using useApps()/Store.*.
import { useEffect } from 'react'
import { useSyncExternalStore } from 'react'
import { api, session } from './api.js'

let state = []
let inflight = null
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

function load() {
  if (!session.token()) return Promise.resolve()
  if (inflight) return inflight
  inflight = api.applications().then((rows) => { state = rows; emit() }).catch(() => {}).finally(() => { inflight = null })
  return inflight
}

export const Store = {
  getAll: () => state,
  get: (png) => state.find((a) => a.png === png),
  load,
  create: async (data) => { const app = await api.createApplication(data); await load(); return app.png },
  pay: async (png, info) => { await api.payApplication(png, info); await load() },
  decide: async (png, decision, remarks, docs) => { await api.decideApplication(png, decision, remarks, docs); await load() },
  advance: async (png, to) => { await api.advanceApplication(png, to); await load() },
}

const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb) }

export function useApps() {
  useEffect(() => { load() }, [])
  return useSyncExternalStore(subscribe, Store.getAll, Store.getAll)
}
export function useApp(png) {
  const all = useApps()
  return all.find((a) => a.png === png)
}
