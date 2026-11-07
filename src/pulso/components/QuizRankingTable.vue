<template>
  <div class="hud-card space-y-4 overflow-hidden">
    <!-- Header de la tabla -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pulso-border/50">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 bg-cyan-400 rounded-full"></span>
        <h3 class="font-tech text-xs tracking-wider uppercase text-slate-200 font-bold">
          Ranking Comparativo de Quizzes del Cliente
        </h3>
      </div>
      <div class="text-[10px] font-mono text-slate-400">
        <span>ORDENADO POR: </span>
        <span class="text-cyan-400 font-bold uppercase">{{ getColumnLabel(sortColumn) }} ({{ sortOrder === 'desc' ? 'MAYOR A MENOR' : 'MENOR A MAYOR' }})</span>
      </div>
    </div>

    <!-- Tabla interactiva -->
    <div class="overflow-x-auto">
      <table class="w-full text-left font-mono text-xs">
        <thead>
          <tr class="border-b border-pulso-border/80 text-[11px] text-slate-400 uppercase tracking-wider select-none">
            <th
              @click="toggleSort('quizName')"
              class="py-3 px-3 cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <span>Quiz</span>
                <span class="text-[10px]">{{ getSortIcon('quizName') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('visitas')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Visitas</span>
                <span class="text-[10px]">{{ getSortIcon('visitas') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('completados')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Completados</span>
                <span class="text-[10px]">{{ getSortIcon('completados') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('reservas')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Reservas</span>
                <span class="text-[10px]">{{ getSortIcon('reservas') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('llegaron')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Llegaron</span>
                <span class="text-[10px]">{{ getSortIcon('llegaron') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('ventas')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Ventas</span>
                <span class="text-[10px]">{{ getSortIcon('ventas') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('ingresos')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Ingresos</span>
                <span class="text-[10px]">{{ getSortIcon('ingresos') }}</span>
              </div>
            </th>
            <th
              @click="toggleSort('tasaGlobal')"
              class="py-3 px-3 text-right cursor-pointer hover:text-cyan-300 transition-colors"
            >
              <div class="flex items-center justify-end gap-1.5">
                <span>Tasa Global</span>
                <span class="text-[10px]">{{ getSortIcon('tasaGlobal') }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-pulso-border/40 text-slate-300">
          <tr
            v-for="row in sortedRows"
            :key="row.quizKey"
            @click="goToQuiz(row.quizKey)"
            class="hover:bg-cyan-500/5 cursor-pointer transition-colors group"
          >
            <!-- Quiz Name con Link -->
            <td class="py-3 px-3 font-bold text-slate-100 group-hover:text-cyan-300 flex items-center gap-2">
              <span class="text-base">{{ row.emoji }}</span>
              <span class="underline decoration-dotted underline-offset-4 decoration-cyan-500/40 group-hover:decoration-cyan-400">
                {{ row.quizName }}
              </span>
              <span class="text-[10px] font-normal text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                ↗
              </span>
            </td>

            <!-- Visitas -->
            <td class="py-3 px-3 text-right font-semibold text-slate-200">
              {{ row.visitas.toLocaleString('es-EC') }}
            </td>

            <!-- Completados -->
            <td class="py-3 px-3 text-right">
              {{ row.completados.toLocaleString('es-EC') }}
            </td>

            <!-- Reservas -->
            <td class="py-3 px-3 text-right font-semibold text-cyan-300">
              {{ row.reservas.toLocaleString('es-EC') }}
            </td>

            <!-- Llegaron -->
            <td class="py-3 px-3 text-right">
              {{ row.llegaron.toLocaleString('es-EC') }}
            </td>

            <!-- Ventas -->
            <td class="py-3 px-3 text-right font-semibold text-emerald-400">
              {{ row.ventas.toLocaleString('es-EC') }}
            </td>

            <!-- Ingresos Facturados -->
            <td class="py-3 px-3 text-right font-bold text-emerald-300">
              ${{ row.ingresos.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </td>

            <!-- Tasa Global (Ventas / Visitas) -->
            <td class="py-3 px-3 text-right">
              <span
                class="px-2 py-0.5 rounded text-[11px] font-bold"
                :class="getRateBadgeClass(row.tasaGlobal, row.visitas)"
              >
                {{ row.visitas < 10 ? '—' : `${row.tasaGlobal.toFixed(1)}%` }}
              </span>
            </td>
          </tr>
        </tbody>

        <!-- Fila Final: TOTAL (Coincide matemáticamente con las tarjetas) -->
        <tfoot>
          <tr class="border-t-2 border-cyan-500/40 bg-pulso-void/90 font-bold text-slate-100">
            <td class="py-3.5 px-3 text-cyan-300 flex items-center gap-2">
              <span>🌐</span>
              <span>TOTAL (CONSOLIDADO)</span>
            </td>
            <td class="py-3.5 px-3 text-right text-slate-100">
              {{ totalRow.visitas.toLocaleString('es-EC') }}
            </td>
            <td class="py-3.5 px-3 text-right">
              {{ totalRow.completados.toLocaleString('es-EC') }}
            </td>
            <td class="py-3.5 px-3 text-right text-cyan-300">
              {{ totalRow.reservas.toLocaleString('es-EC') }}
            </td>
            <td class="py-3.5 px-3 text-right">
              {{ totalRow.llegaron.toLocaleString('es-EC') }}
            </td>
            <td class="py-3.5 px-3 text-right text-emerald-400">
              {{ totalRow.ventas.toLocaleString('es-EC') }}
            </td>
            <td class="py-3.5 px-3 text-right text-emerald-300 text-sm">
              ${{ totalRow.ingresos.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </td>
            <td class="py-3.5 px-3 text-right">
              <span
                class="px-2 py-0.5 rounded text-[11px] font-bold"
                :class="getRateBadgeClass(totalRow.tasaGlobal, totalRow.visitas)"
              >
                {{ totalRow.visitas < 10 ? '—' : `${totalRow.tasaGlobal.toFixed(1)}%` }}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { QuizRankingRow } from '@/pulso/types'

const props = defineProps<{
  rows: QuizRankingRow[]
  totalRow: QuizRankingRow
  clientSlug: string
}>()

const router = useRouter()

type SortKey = keyof QuizRankingRow
const sortColumn = ref<SortKey>('ingresos')
const sortOrder = ref<'asc' | 'desc'>('desc')

function toggleSort(col: SortKey) {
  if (sortColumn.value === col) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortColumn.value = col
    sortOrder.value = 'desc'
  }
}

function getSortIcon(col: SortKey): string {
  if (sortColumn.value !== col) return '↕'
  return sortOrder.value === 'desc' ? '▼' : '▲'
}

function getColumnLabel(col: SortKey): string {
  const map: Record<SortKey, string> = {
    quizKey: 'Clave',
    quizName: 'Nombre del Quiz',
    emoji: 'Icono',
    visitas: 'Visitas',
    completados: 'Completados',
    reservas: 'Reservas',
    llegaron: 'Llegaron al Local',
    ventas: 'Ventas',
    ingresos: 'Ingresos Facturados',
    tasaGlobal: 'Tasa Global',
  }
  return map[col] || String(col)
}

const sortedRows = computed(() => {
  return [...props.rows].sort((a, b) => {
    const valA = a[sortColumn.value]
    const valB = b[sortColumn.value]
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder.value === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }
    const numA = Number(valA) || 0
    const numB = Number(valB) || 0
    return sortOrder.value === 'asc' ? numA - numB : numB - numA
  })
})

function getRateBadgeClass(rate: number, visitas: number): string {
  if (visitas < 10) return 'bg-slate-800 text-slate-400 border border-slate-700'
  if (rate >= 15) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
  if (rate >= 5) return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
  return 'bg-red-500/20 text-red-300 border border-red-500/40'
}

function goToQuiz(quizKey: string) {
  router.push(`/pulso/${props.clientSlug}/${quizKey}`)
}
</script>
