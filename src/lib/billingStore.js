// ════════ Billing-side reactive cache — API-backed ════════
// Schedule (M2) → Bills (M3) → Collections (M5) round-trip now persists in the
// backend DB. Same hook/action surface; components are unchanged.
import { useEffect, useSyncExternalStore } from 'react'
import { api, session } from './api.js'

export const billAmount = (b) => Math.max(0, b.cur - b.prev) * b.rate + b.fixed

let state = { schedule: [], bills: [], collections: [] }
let inflight = null
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

function load() {
  if (!session.token()) return Promise.resolve()
  if (inflight) return inflight
  inflight = Promise.all([api.schedule(), api.bills(), api.collections()])
    .then(([schedule, bills, collections]) => { state = { schedule, bills, collections }; emit() })
    .catch(() => {}).finally(() => { inflight = null })
  return inflight
}

export const BillingStore = {
  load,
  getSchedule: () => state.schedule,
  getBills: () => state.bills,
  getCollections: () => state.collections,
  // M2
  submitReading: async (pngId, payload) => { const r = await api.submitReading(pngId, payload); await load(); return r.billId },
  // M3
  validateBill: async (id) => { await api.billAction(id, 'validate'); await load() },
  approveBill: async (id) => { await api.billAction(id, 'approve'); await load() },
  rejectBill: async (id, reason) => { await api.billAction(id, 'reject', { reason }); await load() },
  regenerateBill: async (id) => { await api.billAction(id, 'regenerate'); await load() },
  releaseBill: async (id) => { await api.billAction(id, 'release'); await load() },
  // M5
  remindCollection: async (inv) => { await api.collectionAction(inv, 'remind'); await load() },
  scheduleCollection: async (inv) => { await api.collectionAction(inv, 'schedule'); await load() },
  recordPayment: async (inv) => { await api.collectionAction(inv, 'pay'); await load() },
}

const subscribe = (cb) => { listeners.add(cb); return () => listeners.delete(cb) }
function useBilling(getSnap) {
  useEffect(() => { load() }, [])
  return useSyncExternalStore(subscribe, getSnap, getSnap)
}
export const useSchedule = () => useBilling(BillingStore.getSchedule)
export const useBills = () => useBilling(BillingStore.getBills)
export const useCollections = () => useBilling(BillingStore.getCollections)
