import { create } from 'zustand'
import { updateEntity } from '../services/api'
import type { Task, TaskStatus } from '../types'

interface BoardState {
  tasks: Task[]
  hydrated: boolean
  setAll: (tasks: Task[]) => void
  moveTask: (taskId: string, to: TaskStatus) => void
}

// Hidratado do useQuery da página; mover card persiste via PATCH (otimista com rollback).
export const useBoardStore = create<BoardState>((set, get) => ({
  tasks: [],
  hydrated: false,
  setAll: (tasks) => set({ tasks, hydrated: true }),
  moveTask: (taskId, to) => {
    const prev = get().tasks
    set({ tasks: prev.map((t) => (t.id === taskId ? { ...t, status: to } : t)) })
    updateEntity('tasks', taskId, { status: to }).catch(() => set({ tasks: prev }))
  },
}))
