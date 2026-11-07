// Tipos centrales de Pulso // Telemetría Estandarizada Multi-Cliente

export interface QuizConfig {
  id: string
  quiz_key: string
  name: string
  url: string
  active: boolean
  created_at: string
}

export interface Client {
  id: string
  slug: string
  name: string
  emoji: string
  industry: string
  owner_email?: string
  has_local_crm: boolean
  quizzes: QuizConfig[]
}

export interface Site {
  id: string
  site_key: string
  name: string
  url: string
  owner_email?: string
  active: boolean
  has_local_crm?: boolean // Indica si el cliente tiene sistema de gestión local (ej. Óptica /dashboard)
  created_at: string
}

export interface Event {
  id: number
  client_key?: string
  quiz_key?: string
  site_id?: string
  site_key?: string
  session_id: string
  event_type: string
  event_name: string
  page_url?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  country?: string
  device?: string
  browser?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Lead {
  id: number
  client_id?: string
  quiz_id?: string
  site_id: string
  session_id?: string
  nombre?: string
  telefono?: string
  edad?: number
  email?: string
  respuestas?: Record<string, any>
  resultado?: string
  estado: string
  estado_cita?: string
  fecha_cita?: string
  hora_cita?: string
  utm_source?: string
  created_at: string
}

// Estructura de Métricas Estandarizadas Pulso
export interface KpiData {
  visitas: number          // Personas que cargaron la URL
  paso1: number            // Completaron Paso 1
  paso2: number            // Completaron Paso 2
  paso3: number            // Completaron Paso 3
  completados: number      // Terminaron el quiz
  reservas: number         // Agendaron o contactaron por WhatsApp
  llegaron: number         // Llegaron al local (Pausado)
  ventasCount: number      // Nº de Ventas (Pausado)
  ingresosTotal: number    // Total Ingresos $ (Pausado)
  activeNow: number        // Usuarios activos
}

export interface FunnelStep {
  label: string
  count: number
  pct: number
  status?: string
}

export interface DailyVisit {
  date: string
  visitas: number
  completados: number
  reservas: number
}

// Tipos para la pestaña TODO Consolidada
export interface KpiComparisonItem {
  value: number
  prevValue: number
  diffPct: number | null
  diffLabel: string
  isPositive: boolean
  isNegative: boolean
  isNew: boolean
  color: string
}

export type TodoKpiComparison = Record<keyof KpiData, KpiComparisonItem>

export interface TodoFunnelStep {
  key: string
  label: string
  count: number
  pctStep: number      // % respecto al paso anterior
  pctVisits: number    // % respecto a visitas totales
  color: string        // Hex/RGB en degradado continuo
  symbol: string       // ▲, ▼, ●, —
  statusLabel: string
  isInsuficientData: boolean
  minPersons: number
  previousCount: number
}

export interface QuizRankingRow {
  quizKey: string
  quizName: string
  emoji: string
  visitas: number
  completados: number
  reservas: number
  llegaron: number
  ventas: number
  ingresos: number
  tasaGlobal: number   // (Ventas / Visitas) * 100
}

export interface HeatmapCell {
  dayIndex: number  // 0=Lunes ... 6=Domingo
  hour: number      // 0-23
  visitas: number
  completados: number
  reservas: number
  llegaron: number
  ventas: number
  tasa: number      // % visitas → reservas (modo calidad)
}
