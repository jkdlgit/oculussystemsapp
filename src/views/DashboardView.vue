<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
    <!-- Sidebar -->
    <aside class="z-20 flex w-16 shrink-0 flex-col items-center border-r border-slate-800 bg-slate-900 py-6">
      <div class="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/20">
        <Activity size="24" class="text-white" />
      </div>
      <nav class="flex w-full flex-col gap-6 px-2">
        <button class="group relative flex justify-center rounded-xl bg-slate-800 p-3 text-indigo-400">
          <LayoutDashboard size="20" />
        </button>
        <button class="flex justify-center rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
          <Bell size="20" />
        </button>
        <button class="flex justify-center rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
          <Terminal size="20" />
        </button>
      </nav>
      <div class="mt-auto flex w-full flex-col gap-6 px-2">
        <button class="flex justify-center rounded-xl p-3 text-slate-400 transition-all hover:bg-slate-800 hover:text-white">
          <Settings size="20" />
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex min-w-0 flex-1 flex-col">
      <!-- Header -->
      <header class="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div class="relative max-w-2xl flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size="18" />
          <input
            type="text"
            placeholder="Buscar paciente por nombre o teléfono..."
            v-model="searchQuery"
            class="w-full rounded-lg border border-transparent bg-slate-100 py-2 pl-10 pr-4 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div class="ml-4 flex items-center gap-3">
          <button @click="fetchCitas" :disabled="loading" class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
            <RefreshCw size="16" :class="{ 'animate-spin': loading }" class="text-slate-400" /> {{ loading ? 'Cargando...' : 'Actualizar' }}
          </button>
          <div class="relative">
            <select
              v-model="sortBy"
              class="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="recent">Ordenar: Más Reciente</option>
              <option value="date">Ordenar: Fecha Cita</option>
              <option value="severity">Ordenar: Estado</option>
            </select>
            <ArrowDownUp
              size="14"
              class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-4 lg:p-8">
        <div class="mx-auto max-w-6xl pb-12">
          <div class="mb-6 flex items-end justify-between">
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-slate-900">Gestión de Citas</h1>
              <p class="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                Sincronización en tiempo real activa
              </p>
            </div>
          </div>

          <div v-if="!hasConfig" class="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200 text-sm text-yellow-800">
            ⚠️ No hay configuración de Supabase. Mostrando datos de ejemplo.
          </div>
          <div v-if="error && hasConfig" class="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800">
            ❌ {{ error }}
          </div>

          <div class="flex flex-col gap-1">
            <template v-if="sortedCitas.length > 0">
              <div
                v-for="cita in sortedCitas"
                :key="cita.id"
                :class="[
                  'mb-3 overflow-hidden rounded-xl border border-slate-200 border-l-4 bg-white shadow-sm transition-all duration-200 hover:shadow-md',
                  getSeverityConfig(cita.estado_cita).border
                ]"
              >
                <div
                  class="flex cursor-pointer flex-col items-start gap-4 p-4 lg:flex-row lg:items-center"
                  @click="toggleExpand(cita.id)"
                >
                  <div class="flex flex-1 flex-col gap-2">
                    <div class="flex items-center gap-3">
                      <h3 class="text-lg font-semibold leading-tight text-slate-900">{{ cita.nombre }}</h3>
                      <a :href="`https://wa.me/${cleanPhone(cita.telefono)}`" target="_blank" @click.stop class="rounded border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors">
                        📱 {{ cita.telefono }}
                      </a>
                    </div>

                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-1.5 rounded border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-white shadow-sm">
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                          Edad
                        </span>
                        <span class="text-sm font-bold">{{ cita.edad ?? 'N/A' }}</span>
                      </div>
                      <div
                        :class="[
                          'flex items-center gap-1.5 rounded border px-2.5 py-0.5 text-xs font-bold tracking-wide',
                          getSeverityConfig(cita.estado_cita).badge
                        ]"
                      >
                        <component :is="getSeverityConfig(cita.estado_cita).icon" size="14" />
                        {{ cita.estado_cita || 'Nueva' }}
                      </div>
                    </div>
                  </div>

                  <div class="grid w-full flex-1 grid-cols-2 gap-4 lg:w-auto lg:grid-cols-4">
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Fecha Cita
                      </span>
                      <span class="truncate text-sm font-medium text-slate-700">{{ formatDate(cita.fecha_cita) }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Resultado
                      </span>
                      <span class="truncate text-sm text-slate-700">{{ cita.resultado || 'Consulta' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Estado CRM
                      </span>
                      <span class="truncate text-sm text-slate-700">{{ cita.estado || 'Nuevo' }}</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Origen
                      </span>
                      <span class="truncate text-sm text-slate-700">{{ cita.origen || 'Desconocido' }}</span>
                    </div>
                  </div>

                  <div class="flex w-full shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3 lg:w-auto lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
                    <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1">
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                        E
                      </div>
                      <span class="pr-1 text-xs font-medium text-slate-600">Especialista</span>
                    </div>

                    <div class="flex items-center gap-1">
                      <button class="rounded p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" @click.stop title="Ver Detalles">
                        <Eye size="16" />
                      </button>
                      <button class="rounded p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" @click.stop title="Editar">
                        <Edit2 size="16" />
                      </button>
                      <div class="mx-1 h-4 w-px bg-slate-300"></div>
                      <button class="rounded p-1.5 text-slate-400 transition-colors hover:text-slate-800">
                        <ChevronUp v-if="expandedId === cita.id" size="20" />
                        <ChevronDown v-else size="20" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  :class="[
                    'grid transition-all duration-300 ease-in-out',
                    expandedId === cita.id ? 'grid-rows-[1fr] border-t border-slate-100 opacity-100' : 'grid-rows-[0fr] opacity-0'
                  ]"
                >
                  <div class="overflow-hidden bg-slate-50/50">
                    <div class="grid gap-6 p-5 lg:grid-cols-2">
                      <div class="flex flex-col gap-5">
                        <div>
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <AlertOctagon size="14" class="text-red-500" /> Síntomas Reportados
                          </h4>
                          <div class="rounded-lg border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-700 shadow-sm">
                            {{ formatSintomas(getSintomas(cita.respuestas)) || 'Ningún síntoma específico reportado.' }}
                          </div>
                        </div>
                        <div>
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <CheckCircle2 size="14" class="text-green-500" /> Evaluación
                          </h4>
                          <div class="rounded-lg border border-slate-200 border-l-4 border-l-green-400 bg-white p-3.5 text-sm leading-relaxed text-slate-700 shadow-sm">
                            {{ cita.resultado ? 'Resultado del quiz: ' + cita.resultado : 'Pendiente de evaluación médica en consulta.' }}
                          </div>
                        </div>
                      </div>

                      <div class="flex flex-col gap-5">
                        <div class="flex flex-1 flex-col">
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Cpu size="14" class="text-slate-400" /> Metadata de Respuestas
                          </h4>
                          <div class="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-slate-800 bg-slate-900 p-4 shadow-inner">
                            <div class="flex flex-col">
                              <span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Visión de Lejos
                              </span>
                              <span class="font-mono text-xs text-indigo-400">{{ cita.respuestas?.vision_lejos || 'N/A' }}</span>
                            </div>
                            <div class="flex flex-col">
                              <span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Visión de Cerca
                              </span>
                              <span class="font-mono text-xs text-emerald-400">{{ cita.respuestas?.vision_cerca || 'N/A' }}</span>
                            </div>
                            <div class="flex flex-col">
                              <span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Problemas Colores
                              </span>
                              <span class="font-mono text-xs text-blue-400">{{ cita.respuestas?.problemas_colores || 'N/A' }}</span>
                            </div>
                            <div class="flex flex-col">
                              <span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Detalle Colores
                              </span>
                              <span class="font-mono text-xs text-amber-400 truncate">{{ cita.respuestas?.detalle_colores || 'N/A' }}</span>
                            </div>
                            <div class="col-span-2 flex flex-col">
                              <span class="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                Hora Asignada
                              </span>
                              <span class="font-mono text-xs text-slate-300">{{ cita.hora_cita || 'Sin hora' }}</span>
                            </div>
                          </div>
                        </div>

                        <div class="flex flex-col">
                          <h4 class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Clock size="14" class="text-slate-400" /> Registro
                          </h4>
                          <div class="flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-3.5 shadow-sm">
                            <div class="relative flex items-start gap-3">
                              <div class="mt-1 flex flex-col items-center">
                                <div class="relative z-10 h-2 w-2 rounded-full bg-indigo-500"></div>
                              </div>
                              <span class="mt-0.5 font-mono text-xs text-slate-600">{{ formatDateTime(cita.created_at) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div v-else-if="!loading" class="rounded-xl border border-dashed border-slate-200 bg-white py-20 text-center">
              <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Search size="24" class="text-slate-400" />
              </div>
              <h3 class="text-lg font-medium text-slate-900">No se encontraron citas</h3>
              <p class="mt-1 text-sm text-slate-500">
                Intenta ajustar tu búsqueda o filtros.
              </p>
            </div>
            
            <div v-if="loading" class="py-12 text-center text-slate-500 flex flex-col items-center">
               <RefreshCw class="animate-spin mb-4" size="32" />
               <p>Cargando información...</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownUp,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  Edit2,
  Eye,
  LayoutDashboard,
  Search,
  Settings,
  Terminal,
  Info,
  RefreshCw
} from 'lucide-vue-next'
import { supabase, hasSupabaseConfig } from '@/supabase'

const hasConfig = hasSupabaseConfig

interface Respuestas {
  sintomas?: string[]
  vision_lejos?: string
  vision_cerca?: string
  problemas_colores?: string
  detalle_colores?: string
}

interface Cita {
  id: string
  nombre: string
  telefono: string
  edad: number | null
  respuestas: Respuestas | null
  resultado: string | null
  estado: string | null
  fecha_cita: string | null
  hora_cita: string | null
  estado_cita: string | null
  origen: string | null
  created_at: string
}

const citas = ref<Cita[]>([])
const loading = ref(false)
const error = ref('')

const searchQuery = ref('')
const sortBy = ref('recent')
const expandedId = ref<string | null>(null)

const mockData: Cita[] = [
  {
    id: '1',
    nombre: 'María González',
    telefono: '+52 55 1234 5678',
    edad: 34,
    respuestas: { sintomas: ['fatiga', 'dolor_cabeza'], vision_lejos: 'mucho', vision_cerca: 'poco' },
    resultado: 'Miopía leve',
    estado: 'Nuevo',
    fecha_cita: '2026-06-20',
    hora_cita: '10:00:00',
    estado_cita: 'Nueva',
    origen: 'Quiz',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    nombre: 'Carlos Ramírez',
    telefono: '+52 55 9876 5432',
    edad: 45,
    respuestas: { sintomas: ['secos', 'sensibilidad'] },
    resultado: 'Ojo seco',
    estado: 'Atendido',
    fecha_cita: '2026-06-18',
    hora_cita: '11:30:00',
    estado_cita: 'Atendida',
    origen: 'Quiz',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    nombre: 'Sofía Martínez',
    telefono: '+52 55 5555 1212',
    edad: 28,
    respuestas: { sintomas: ['ardor'] },
    resultado: null,
    estado: 'Agendado',
    fecha_cita: '2026-06-19',
    hora_cita: '09:00:00',
    estado_cita: 'NoAsistió',
    origen: 'Quiz',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

const getSeverityConfig = (estado_cita: string | null) => {
  const estado = estado_cita || 'Nueva'
  if (estado === 'Nueva') {
    return {
      border: 'border-emerald-500',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Bell,
    }
  } else if (estado === 'NoAsistió') {
    return {
      border: 'border-red-500',
      badge: 'bg-red-100 text-red-800 border-red-200',
      icon: AlertOctagon,
    }
  } else if (estado === 'Atendida') {
    return {
      border: 'border-slate-400',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: CheckCircle2,
    }
  }
  return {
    border: 'border-yellow-400',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Info,
  }
}

const toggleExpand = (id: string) => {
  expandedId.value = expandedId.value === id ? null : id
}

const sortedCitas = computed(() => {
  let sorted = [...citas.value]

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    sorted = sorted.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.telefono.toLowerCase().includes(q) ||
      (c.estado_cita || '').toLowerCase().includes(q)
    )
  }

  sorted.sort((a, b) => {
    if (sortBy.value === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy.value === 'date') {
      const da = a.fecha_cita ?? ''
      const db = b.fecha_cita ?? ''
      return da.localeCompare(db)
    }
    if (sortBy.value === 'severity') {
      const order = { 'Nueva': 3, 'NoAsistió': 2, 'Atendida': 1 }
      const va = order[(a.estado_cita || 'Nueva') as keyof typeof order] || 0
      const vb = order[(b.estado_cita || 'Nueva') as keyof typeof order] || 0
      return vb - va
    }
    return 0
  })

  return sorted
})

async function fetchCitas() {
  loading.value = true
  error.value = ''

  if (!hasConfig) {
    await new Promise(r => setTimeout(r, 600))
    citas.value = mockData
    loading.value = false
    return
  }

  try {
    const { data, error: sbError } = await supabase
      .from('leads')
      .select('id, nombre, telefono, edad, respuestas, resultado, estado, fecha_cita, hora_cita, estado_cita, origen, created_at')
      .order('fecha_cita', { ascending: true, nullsFirst: false })

    if (sbError) {
      error.value = `Error al cargar citas: ${sbError.message}`
      citas.value = []
    } else {
      citas.value = (data as Cita[]) || []
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    error.value = `Error inesperado: ${msg}`
  } finally {
    loading.value = false
  }
}

function getSintomas(respuestas: Respuestas | null): string[] {
  return respuestas?.sintomas ?? []
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  const parts = date.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return date
}

function formatDateTime(dt: string): string {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatSintomas(sintomas: string[]): string {
  if (!sintomas || sintomas.length === 0) return ''
  const labels: Record<string, string> = {
    fatiga:       'Fatiga',
    dolor_cabeza: 'Dolor de cabeza',
    ardor:        'Ardor',
    secos:        'Ojos secos',
    lagrimeo:     'Lagrimeo',
    sensibilidad: 'Sensibilidad',
    ninguna:      'Ninguno',
  }
  return sintomas.map(s => labels[s] ?? s).join(', ')
}

function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

onMounted(() => {
  fetchCitas()
})
</script>
