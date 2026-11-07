<template>
  <div class="flex flex-col h-screen overflow-hidden bg-pulso-bg text-slate-200">
    <!-- Top HUD Bar -->
    <HudTopbar
      :current-client="currentClient"
      :current-quiz="todoQuizConfig"
      :active-users="kpi.activeNow"
    />

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar Navigation -->
      <SidebarNav
        :client="currentClient"
        :quiz="todoQuizConfig"
      />

      <!-- Main Content Area: VISTA TODO CONSOLIDADA -->
      <main class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Breadcrumb / Section Header con Selector de Período -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-pulso-border/40">
          <div>
            <div class="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
              <span>PROYECTOS</span>
              <span>/</span>
              <span class="text-cyan-400 font-bold uppercase">{{ currentClient.name }}</span>
              <span>/</span>
              <span class="text-cyan-300 font-bold uppercase">TODO (CONSOLIDADO)</span>
            </div>
            <h2 class="text-xl font-tech font-bold tracking-wide text-slate-100 flex items-center gap-2">
              <span>PANEL CONSOLIDADO MULTI-QUIZ // TODO</span>
              <span class="badge badge-cyan text-[10px]">SUMA TOTAL</span>
            </h2>
          </div>

          <!-- Selector de rango de fechas comparativo -->
          <div class="flex flex-wrap items-center gap-3 font-mono text-xs">
            <span class="text-slate-400">// PERÍODO:</span>
            <div class="inline-flex rounded-lg bg-pulso-void p-1 border border-pulso-border">
              <button
                v-for="days in [8, 14, 30]"
                :key="days"
                @click="selectedRangeDays = days"
                class="px-2.5 py-1 text-xs rounded transition-all font-mono"
                :class="selectedRangeDays === days
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'"
              >
                {{ days }} DÍAS
              </button>
              <button
                @click="selectedRangeDays = null"
                class="px-2.5 py-1 text-xs rounded transition-all font-mono"
                :class="selectedRangeDays === null
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'"
              >
                TODO
              </button>
            </div>
            <span class="text-[11px] text-slate-500 hidden sm:inline">
              {{ selectedRangeDays ? `(vs. los ${selectedRangeDays} días previos)` : '(Histórico acumulado)' }}
            </span>
          </div>
        </div>

        <!-- 1. Tarjetas Totales (9 tarjetas consolidadas con badge comparativo) -->
        <div class="space-y-3">
          <!-- 6 Etapas Activas -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              v-for="item in activeKpiCards"
              :key="item.key"
              class="p-3.5 rounded-xl bg-pulso-card/85 border border-pulso-border/80 flex flex-col justify-between hover:border-cyan-500/30 transition-all group"
            >
              <div class="flex items-center justify-between text-slate-400 mb-1">
                <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold group-hover:text-cyan-300 transition-colors">
                  // {{ item.label }}
                </span>
                <span class="text-sm">{{ item.icon }}</span>
              </div>
              <div class="my-1">
                <span class="text-2xl font-tech font-bold tracking-wider text-slate-100 group-hover:text-cyan-200 transition-colors">
                  {{ item.data.value.toLocaleString('es-EC') }}
                </span>
              </div>
              <!-- Badge comparativo vs período anterior -->
              <div class="pt-2 border-t border-pulso-border/40 flex items-center justify-between text-[10px] font-mono">
                <span
                  class="font-bold flex items-center gap-1"
                  :style="{ color: item.data.color }"
                >
                  {{ item.data.diffLabel }}
                </span>
                <span class="text-slate-500 text-[9px] truncate" :title="item.note">{{ item.note }}</span>
              </div>
            </div>
          </div>

          <!-- 3 Etapas del Sistema Local / Dashboard Oculus -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Llegaron al local -->
            <div class="p-4 rounded-xl bg-pulso-card/85 border border-pulso-border/80 flex flex-col justify-between hover:border-cyan-500/30 transition-all group">
              <div class="flex items-center justify-between text-slate-400 mb-1">
                <span class="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold group-hover:text-cyan-300 transition-colors">
                  // Llegaron al Local
                </span>
                <span class="text-lg">📍</span>
              </div>
              <div class="my-1.5 flex items-baseline justify-between">
                <span class="text-3xl font-tech font-bold tracking-wider text-slate-100 group-hover:text-cyan-200 transition-colors">
                  {{ kpiComparison.llegaron.value.toLocaleString('es-EC') }}
                </span>
                <span class="badge badge-accent text-[10px]">SINCRONIZADO</span>
              </div>
              <div class="pt-2 border-t border-pulso-border/40 flex items-center justify-between text-[10px] font-mono">
                <span class="font-bold" :style="{ color: kpiComparison.llegaron.color }">
                  {{ kpiComparison.llegaron.diffLabel }}
                </span>
                <span class="text-slate-400 text-[10px]">Citas atendidas en clínica</span>
              </div>
            </div>

            <!-- Nº de Ventas -->
            <div class="p-4 rounded-xl bg-pulso-card/85 border border-pulso-border/80 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
              <div class="flex items-center justify-between text-slate-400 mb-1">
                <span class="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold group-hover:text-emerald-300 transition-colors">
                  // Nº de Ventas
                </span>
                <span class="text-lg">💳</span>
              </div>
              <div class="my-1.5 flex items-baseline justify-between">
                <span class="text-3xl font-tech font-bold tracking-wider text-emerald-400 group-hover:text-emerald-300 transition-colors">
                  {{ kpiComparison.ventasCount.value.toLocaleString('es-EC') }}
                </span>
                <span class="badge badge-green text-[10px]">VENTAS REALES</span>
              </div>
              <div class="pt-2 border-t border-pulso-border/40 flex items-center justify-between text-[10px] font-mono">
                <span class="font-bold" :style="{ color: kpiComparison.ventasCount.color }">
                  {{ kpiComparison.ventasCount.diffLabel }}
                </span>
                <span class="text-slate-400 text-[10px]">Pedidos pagados</span>
              </div>
            </div>

            <!-- Ingresos Facturados -->
            <div class="p-4 rounded-xl bg-pulso-card/85 border border-pulso-border/80 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
              <div class="flex items-center justify-between text-slate-400 mb-1">
                <span class="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold group-hover:text-emerald-300 transition-colors">
                  // Ingresos Facturados
                </span>
                <span class="text-lg">💵</span>
              </div>
              <div class="my-1.5 flex items-baseline justify-between">
                <span class="text-3xl font-tech font-bold tracking-wider text-emerald-300 group-hover:text-emerald-200 transition-colors">
                  {{ formatCurrency(kpiComparison.ingresosTotal.value) }}
                </span>
                <span class="badge badge-green text-[10px]">TOTAL USD</span>
              </div>
              <div class="pt-2 border-t border-pulso-border/40 flex items-center justify-between text-[10px] font-mono">
                <span class="font-bold" :style="{ color: kpiComparison.ingresosTotal.color }">
                  {{ kpiComparison.ingresosTotal.diffLabel }}
                </span>
                <span class="text-slate-400 text-[10px]">Facturado acumulado</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Embudo Total Inteligente -->
        <div class="hud-card">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-pulso-border/50">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
              <h3 class="font-tech text-xs tracking-wider uppercase text-slate-200 font-bold">
                Embudo Total Consolidado (Todos los Quizzes Sumados)
              </h3>
            </div>
            <span class="text-xs font-mono text-slate-400">
              TASA GLOBAL: <strong class="text-cyan-300">{{ globalConversionRate }}</strong>
            </span>
          </div>
          <TodoFunnelChart :steps="todoFunnel" />
        </div>

        <!-- 3. Ranking Comparativo de Quizzes -->
        <QuizRankingTable
          :rows="quizRanking.rows"
          :total-row="quizRanking.totalRow"
          :client-slug="clientSlug"
        />

        <!-- Analytics Grid: Traffic & Sources Consolidados -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Visits Timeline Chart -->
          <div class="hud-card lg:col-span-2">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-pulso-border/50">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
                <h3 class="font-tech text-xs tracking-wider uppercase text-slate-200 font-bold">
                  Evolución Diaria Consolidada
                </h3>
              </div>
              <span class="badge badge-muted text-[10px] uppercase font-mono">
                {{ selectedRangeDays ? `${selectedRangeDays} DÍAS` : 'HISTÓRICO COMPLETO' }}
              </span>
            </div>
            <VisitsChart :data="dailyData" />
          </div>

          <!-- Traffic Sources Meter -->
          <div class="hud-card">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-pulso-border/50">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 bg-indigo-400 rounded-full"></span>
                <h3 class="font-tech text-xs tracking-wider uppercase text-slate-200 font-bold">
                  Canales de Adquisición (UTM Consolidado)
                </h3>
              </div>
              <span class="text-[10px] font-mono text-cyan-400">DISTRIBUCIÓN</span>
            </div>
            <SourcesChart :data="sources" />
          </div>
        </div>

        <!-- 4. MAPA DE CALOR 7x24 — Día × Hora (Hora local Ecuador UTC-5) -->
        <div class="hud-card">
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-pulso-border/50">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 bg-cyan-500 rounded-full"></span>
              <h3 class="font-tech text-xs tracking-wider uppercase text-slate-200 font-bold">
                Mapa de Calor por Día y Hora
              </h3>
            </div>
            <div class="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span>🕐</span>
              <span>HORA LOCAL ECUADOR (UTC-5)</span>
            </div>
          </div>
          <HeatmapChart
            :matrix="heatmapData"
            :weekdays="heatmapWeekdays"
            :low-data-warning="heatmapLowDataWarning"
          />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePulsoTodoData } from '@/pulso/composables/usePulsoTodoData'
import HudTopbar from '@/pulso/components/HudTopbar.vue'
import SidebarNav from '@/pulso/components/SidebarNav.vue'
import TodoFunnelChart from '@/pulso/components/TodoFunnelChart.vue'
import QuizRankingTable from '@/pulso/components/QuizRankingTable.vue'
import HeatmapChart from '@/pulso/components/HeatmapChart.vue'
import VisitsChart from '@/pulso/components/VisitsChart.vue'
import SourcesChart from '@/pulso/components/SourcesChart.vue'
import type { QuizConfig } from '@/pulso/types'

const route = useRoute()
const clientSlugParam = computed(() => (route.params.clientSlug as string) || 'opticajohanna')

const {
  clientSlug,
  currentClient,
  selectedRangeDays,
  kpi,
  kpiComparison,
  todoFunnel,
  quizRanking,
  dailyData,
  sources,
  heatmapData,
  heatmapLowDataWarning,
  heatmapWeekdays,
} = usePulsoTodoData(clientSlugParam.value)

const todoQuizConfig = computed<QuizConfig>(() => ({
  id: 'todo',
  quiz_key: 'todo',
  name: 'TODO (Consolidado)',
  url: `/pulso/${clientSlug.value}/todo`,
  active: true,
  created_at: new Date().toISOString(),
}))

const activeKpiCards = computed(() => [
  { key: 'visitas', label: 'Visitas', icon: '👁️', data: kpiComparison.value.visitas, note: 'URLs cargadas' },
  { key: 'paso1', label: 'Paso 1', icon: '1️⃣', data: kpiComparison.value.paso1, note: 'Avanzaron paso 1' },
  { key: 'paso2', label: 'Paso 2', icon: '2️⃣', data: kpiComparison.value.paso2, note: 'Avanzaron paso 2' },
  { key: 'paso3', label: 'Paso 3', icon: '3️⃣', data: kpiComparison.value.paso3, note: 'Avanzaron paso 3' },
  { key: 'completados', label: 'Completados', icon: '✅', data: kpiComparison.value.completados, note: 'Terminaron el quiz' },
  { key: 'reservas', label: 'Reservas', icon: '📅', data: kpiComparison.value.reservas, note: 'Cita o WhatsApp' },
])

function formatCurrency(val: number): string {
  return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const globalConversionRate = computed(() => {
  if (kpi.value.visitas <= 0) return '0.0%'
  if (kpi.value.ventasCount > 0) {
    return ((kpi.value.ventasCount / kpi.value.visitas) * 100).toFixed(1) + '%'
  }
  return ((kpi.value.reservas / kpi.value.visitas) * 100).toFixed(1) + '%'
})
</script>
