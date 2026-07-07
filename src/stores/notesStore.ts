import { create } from 'zustand'
import { updateEntity } from '../services/api'
import type { NoteCard } from '../types'

interface NotesState {
  cards: NoteCard[]
  hydrated: boolean
  setAll: (cards: NoteCard[]) => void
  move: (cardId: string, toColumn: string) => void
  toggleCheck: (cardId: string, index: number) => void
}

// Hidratado do useQuery da página; mutações persistem via PATCH (otimista com rollback).
export const useNotesStore = create<NotesState>((set, get) => ({
  cards: [],
  hydrated: false,
  setAll: (cards) => set({ cards, hydrated: true }),
  move: (cardId, toColumn) => {
    const prev = get().cards
    set({ cards: prev.map((c) => (c.id === cardId ? { ...c, columnId: toColumn } : c)) })
    updateEntity('note-cards', cardId, { columnId: toColumn }).catch(() => set({ cards: prev }))
  },
  toggleCheck: (cardId, index) => {
    const prev = get().cards
    const card = prev.find((c) => c.id === cardId)
    if (!card) return
    const checklist = card.checklist.map((it, i) => (i === index ? { ...it, done: !it.done } : it))
    set({ cards: prev.map((c) => (c.id === cardId ? { ...c, checklist } : c)) })
    updateEntity('note-cards', cardId, { checklist }).catch(() => set({ cards: prev }))
  },
}))
