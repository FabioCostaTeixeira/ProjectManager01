import { create } from 'zustand'
import { updateEntity } from '../services/api'
import type { Alert, Reminder } from '../types'

interface AlertsState {
  alerts: Alert[]
  reminders: Reminder[]
  hydrated: boolean
  setAll: (alerts: Alert[], reminders: Reminder[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
  snooze: (id: string, days?: number) => void
  toggleReminder: (id: string) => void
}

const addDays = (iso: string, days: number) => {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// Hidratado do useQuery da página; mutações persistem via PATCH (otimista com rollback).
export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  reminders: [],
  hydrated: false,
  setAll: (alerts, reminders) => set({ alerts, reminders, hydrated: true }),
  markRead: (id) => {
    const prev = get().alerts
    set({ alerts: prev.map((a) => (a.id === id ? { ...a, read: true } : a)) })
    updateEntity('alerts', id, { read: true }).catch(() => set({ alerts: prev }))
  },
  markAllRead: () => {
    const prev = get().alerts
    set({ alerts: prev.map((a) => ({ ...a, read: true })) })
    Promise.all(
      prev.filter((a) => !a.read).map((a) => updateEntity('alerts', a.id, { read: true })),
    ).catch(() => set({ alerts: prev }))
  },
  snooze: (id, days = 7) => {
    const prev = get().alerts
    const alert = prev.find((a) => a.id === id)
    if (!alert) return
    const snoozedUntil = addDays(alert.date, days)
    set({ alerts: prev.map((a) => (a.id === id ? { ...a, snoozedUntil } : a)) })
    updateEntity('alerts', id, { snoozedUntil }).catch(() => set({ alerts: prev }))
  },
  toggleReminder: (id) => {
    const prev = get().reminders
    const rem = prev.find((r) => r.id === id)
    if (!rem) return
    set({ reminders: prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })
    updateEntity('reminders', id, { done: !rem.done }).catch(() => set({ reminders: prev }))
  },
}))
