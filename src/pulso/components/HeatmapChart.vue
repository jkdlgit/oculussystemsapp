<template>
  <div class="space-y-4">
    <!-- Header: Selector de Métrica + Modo Calidad -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-pulso-border/50 text-xs font-mono">
      <!-- Selector de Métrica -->
      <div class="flex flex-wrap items-center gap-1.5">
        <span class="text-slate-500 mr-1">// MÉTRICA:</span>
        <button
          v-for="m in METRIC_OPTIONS"
          :key="m.key"
          @click="activeMetric = m.key"
          class="px-2.5 py-1 rounded transition-all text-[11px]"
          :class="activeMetric === m.key
            ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
            : 'text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-800/50'"
        >
          {{ m.icon }} {{ m.label.toUpperCase() }}
        </button>
      </div>

      <!-- Toggle Modo Calidad -->
      <button
        @click="qualityMode = !qualityMode"
        class="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[11px]"
        :class="qualityMode
          ? 'bg-amber-500/20 text-amber-300 font-bold border-amber-500/40'
          : 'text-slate-400 border-slate-700/50 hover:text-slate-200 hover:border-slate-600'"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="qualityMode ? 'bg-amber-400' : 'bg-slate-500'"></span>
        MODO CALIDAD
        <span class="text-[10px] opacity-70">{{ qualityMode ? '(% → Reserva)' : '(Cantidad)' }}</span>
      </button>
    </div>

    <!-- Aviso de pocos datos -->
    <div
      v-if="lowDataWarning"
      class="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 text-xs font-mono text-amber-300"
    >
      <span class="text-base mt-0.5">⚠️</span>
      <div>
        <span class="font-bold">Pocos datos para conclusiones horarias.</span>
        <span class="text-amber-400/70 ml-1">Se recomiendan al menos 4 semanas (28 días) para que el patrón día/hora sea estadísticamente confiable. Amplía el rango de fechas para obtener resultados más precisos.</span>
      </div>
    </div>

    <!-- Leyenda de color -->
    <div class="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-slate-500">
      <div class="flex items-center gap-1.5">
        <span>Menos</span>
        <div class="flex gap-0.5">
          <div
            v-for="i in 6"
            :key="i"
            class="w-4 h-3 rounded-sm"
            :style="{ backgroundColor: getCellBgColor(i - 1, 5) }"
          ></div>
        </div>
        <span>Más</span>
        <span class="ml-2 text-slate-600">|</span>
        <span class="ml-2 flex items-center gap-1 text-slate-500">
          <span class="w-3.5 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block"></span>
          Sin datos
        </span>
      </div>
      <div class="text-slate-500">
        {{ qualityMode ? '% visitas que reservaron' : activeLabel }} · Hora local Ecuador (UTC-5)
      </div>
    </div>

    <!-- Cuadrícula 7×24 -->
    <div class="overflow-x-auto -mx-1">
      <div class="min-w-[520px] px-1">
        <!-- Fila de cabecera de horas (0-23) -->
        <div class="flex mb-1">
          <div class="w-10 flex-shrink-0"></div>
          <div class="flex-1 grid" style="grid-template-columns: repeat(24, 1fr); gap: 2px;">
            <div
              v-for="h in 24"
              :key="h"
              class="text-center text-[9px] font-mono text-slate-600 leading-none py-0.5"
            >
              {{ h - 1 === 0 ? '00' : h - 1 < 10 ? `0${h - 1}` : h - 1 }}
            </div>
          </div>
        </div>

        <!-- Filas de días (Lun-Dom) -->
        <div class="space-y-0.5">
          <div
            v-for="(dayLabel, dayIndex) in weekdays"
            :key="dayLabel"
            class="flex items-center"
          >
            <!-- Etiqueta del día -->
            <div class="w-10 flex-shrink-0 text-[10px] font-mono font-bold text-slate-500 pr-1 text-right">
              {{ dayLabel }}
            </div>

            <!-- Celdas de horas -->
            <div class="flex-1 grid" style="grid-template-columns: repeat(24, 1fr); gap: 2px;">
              <div
                v-for="hour in 24"
                :key="hour"
                class="relative group"
                style="padding-bottom: 100%;"
              >
                <div
                  class="absolute inset-0 rounded-sm transition-all duration-200 cursor-default"
                  :style="getCellStyle(dayIndex, hour - 1)"
                  :class="getCellValue(dayIndex, hour - 1) === 0 ? '' : 'group-hover:ring-1 group-hover:ring-cyan-400/60'"
                >
                  <!-- Valor visible en hover -->
                  <div
                    v-if="getCellValue(dayIndex, hour - 1) > 0"
                    class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span class="text-[8px] font-bold text-white drop-shadow-sm leading-none">
                      {{ qualityMode ? `${getCellValue(dayIndex, hour - 1)}%` : getCellValue(dayIndex, hour - 1) }}
                    </span>
                  </div>
                </div>

                <!-- Tooltip al pasar el mouse -->
                <div
                  class="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  <div
                    v-if="getCell(dayIndex, hour - 1)"
                    class="bg-pulso-void border border-pulso-border rounded-lg p-2.5 text-[10px] font-mono shadow-xl whitespace-nowrap"
                  >
                    <div class="text-cyan-300 font-bold mb-1.5 text-center">
                      {{ dayLabel }} {{ (hour - 1).toString().padStart(2, '0') }}:00 (UTC-5)
                    </div>
                    <div class="space-y-0.5 text-slate-300">
                      <div class="flex justify-between gap-3">
                        <span class="text-slate-500">Visitas</span>
                        <span class="font-bold text-slate-100">{{ getCell(dayIndex, hour - 1)!.visitas }}</span>
                      </div>
                      <div class="flex justify-between gap-3">
                        <span class="text-slate-500">Completados</span>
                        <span>{{ getCell(dayIndex, hour - 1)!.completados }}</span>
                      </div>
                      <div class="flex justify-between gap-3">
                        <span class="text-slate-500">Reservas</span>
                        <span class="text-cyan-300 font-bold">{{ getCell(dayIndex, hour - 1)!.reservas }}</span>
                      </div>
                      <div class="flex justify-between gap-3">
                        <span class="text-slate-500">Llegaron</span>
                        <span>{{ getCell(dayIndex, hour - 1)!.llegaron }}</span>
                      </div>
                      <div class="flex justify-between gap-3">
                        <span class="text-slate-500">Ventas</span>
                        <span class="text-emerald-400 font-bold">{{ getCell(dayIndex, hour - 1)!.ventas }}</span>
                      </div>
                      <div class="border-t border-pulso-border/60 mt-1.5 pt-1.5 flex justify-between gap-3">
                        <span class="text-slate-500">Tasa reserva</span>
                        <span class="text-amber-300 font-bold">{{ getCell(dayIndex, hour - 1)!.tasa }}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Banda de franjas horarias al pie -->
        <div class="flex mt-3">
          <div class="w-10 flex-shrink-0"></div>
          <div class="flex-1 grid" style="grid-template-columns: repeat(24, 1fr); gap: 2px;">
            <div
              v-for="h in 24"
              :key="h"
              class="text-center text-[8px] font-mono text-slate-700 leading-none"
            >
              <span v-if="[0, 6, 12, 18].includes(h - 1)">|</span>
            </div>
          </div>
        </div>

        <!-- Etiquetas de bloques horarios -->
        <div class="flex">
          <div class="w-10 flex-shrink-0"></div>
          <div class="flex flex-1 text-[9px] font-mono text-slate-600">
            <span class="flex-1 text-left pl-0.5">00hs</span>
            <span class="flex-1 text-center">06hs</span>
            <span class="flex-1 text-center">12hs</span>
            <span class="flex-1 text-center">18hs</span>
            <span class="text-right pr-0.5">23hs</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen: horas y días más activos -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-pulso-border/40">
      <!-- Top 3 horas del día -->
      <div class="p-3 rounded-lg bg-pulso-void/70 border border-pulso-border/60">
        <p class="text-[10px] font-mono text-cyan-400 font-bold uppercase mb-2">// Horas más activas del día</p>
        <div class="space-y-1.5">
          <div
            v-for="(item, i) in topHours"
            :key="i"
            class="flex items-center justify-between text-xs font-mono"
          >
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-pulso-surface border border-pulso-border flex items-center justify-center text-[10px] font-bold text-cyan-400">
                {{ i + 1 }}
              </span>
              <span class="text-slate-200">{{ item.hour.toString().padStart(2, '0') }}:00 – {{ (item.hour + 1).toString().padStart(2, '0') }}:00</span>
            </div>
            <span class="font-bold text-slate-100">
              {{ item.value }} {{ qualityMode ? '%' : activeLabel.toLowerCase() }}
            </span>
          </div>
          <p v-if="topHours.length === 0" class="text-[10px] font-mono text-slate-600">Sin datos en el período seleccionado</p>
        </div>
      </div>

      <!-- Top 3 días de la semana -->
      <div class="p-3 rounded-lg bg-pulso-void/70 border border-pulso-border/60">
        <p class="text-[10px] font-mono text-cyan-400 font-bold uppercase mb-2">// Días más activos de la semana</p>
        <div class="space-y-1.5">
          <div
            v-for="(item, i) in topDays"
            :key="i"
            class="flex items-center justify-between text-xs font-mono"
          >
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded bg-pulso-surface border border-pulso-border flex items-center justify-center text-[10px] font-bold text-cyan-400">
                {{ i + 1 }}
              </span>
              <span class="text-slate-200">{{ weekdays[item.dayIndex] }}</span>
            </div>
            <span class="font-bold text-slate-100">
              {{ item.value }} {{ qualityMode ? '%' : activeLabel.toLowerCase() }} (total)
            </span>
          </div>
          <p v-if="topDays.length === 0" class="text-[10px] font-mono text-slate-600">Sin datos en el período seleccionado</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HeatmapCell } from '@/pulso/types'

type MetricKey = 'visitas' | 'completados' | 'reservas' | 'llegaron' | 'ventas'

const METRIC_OPTIONS: { key: MetricKey; label: string; icon: string }[] = [
  { key: 'visitas',     label: 'Visitas',     icon: '👁️' },
  { key: 'completados', label: 'Completados', icon: '✅' },
  { key: 'reservas',    label: 'Reservas',    icon: '📅' },
  { key: 'llegaron',    label: 'Llegaron',    icon: '📍' },
  { key: 'ventas',      label: 'Ventas',      icon: '💳' },
]

const props = defineProps<{
  matrix: HeatmapCell[][]   // 7 (días) × 24 (horas)
  weekdays: string[]         // ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
  lowDataWarning: boolean
}>()

const activeMetric = ref<MetricKey>('visitas')
const qualityMode = ref(false)

const activeLabel = computed(() => METRIC_OPTIONS.find(m => m.key === activeMetric.value)?.label || 'Visitas')

// Valor de la celda según métrica activa / modo calidad
function getCellValue(dayIndex: number, hour: number): number {
  const cell = props.matrix[dayIndex]?.[hour]
  if (!cell) return 0
  if (qualityMode.value) return cell.tasa
  return cell[activeMetric.value]
}

function getCell(dayIndex: number, hour: number): HeatmapCell | undefined {
  return props.matrix[dayIndex]?.[hour]
}

// Valor máximo en la cuadrícula actual (para escalar el color)
const maxValue = computed(() => {
  let m = 0
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = getCellValue(d, h)
      if (v > m) m = v
    }
  }
  return m
})

// Escala monocromática cyan (de tenue a brillante)
// Paleta: '#0a1929' → '#0e3a5e' → '#0c5490' → '#0284c7' → '#0ea5e9' → '#38bdf8'
const COLOR_STOPS = [
  { r: 10,  g: 25,  b: 41  },   // 0% — fondo casi negro
  { r: 14,  g: 58,  b: 94  },   // 20%
  { r: 12,  g: 84,  b: 144 },   // 40%
  { r: 2,   g: 132, b: 199 },   // 60%
  { r: 14,  g: 165, b: 233 },   // 80%
  { r: 56,  g: 189, b: 248 },   // 100%
]

function getCellBgColor(ratio: number, maxRatio: number): string {
  const t = maxRatio > 0 ? ratio / maxRatio : 0
  const idx = Math.min(Math.floor(t * (COLOR_STOPS.length - 1)), COLOR_STOPS.length - 2)
  const frac = t * (COLOR_STOPS.length - 1) - idx
  const c0 = COLOR_STOPS[idx]
  const c1 = COLOR_STOPS[idx + 1]
  const r = Math.round(c0.r + (c1.r - c0.r) * frac)
  const g = Math.round(c0.g + (c1.g - c0.g) * frac)
  const b = Math.round(c0.b + (c1.b - c0.b) * frac)
  return `rgb(${r},${g},${b})`
}

function getCellStyle(dayIndex: number, hour: number): Record<string, string> {
  const v = getCellValue(dayIndex, hour)
  if (v === 0) {
    return { backgroundColor: 'rgb(15,23,42)', border: '1px solid rgb(30,41,59)' }
  }
  const mx = maxValue.value
  const bg = getCellBgColor(v, mx)
  // Brillo del texto inversamente proporcional al fondo oscuro
  const opacity = mx > 0 ? 0.4 + (v / mx) * 0.6 : 0.4
  return {
    backgroundColor: bg,
    opacity: String(opacity),
  }
}

// Top 3 horas y días más activos
const topHours = computed(() => {
  const totals: { hour: number; value: number }[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    value: 0,
  }))
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const v = getCellValue(d, h)
      if (qualityMode.value) {
        // Promedio de tasas entre los días que tienen datos
        const cell = getCell(d, h)
        if (cell && cell.visitas > 0) {
          totals[h].value = Math.round((totals[h].value + v) / 2)
        }
      } else {
        totals[h].value += v
      }
    }
  }
  return [...totals].sort((a, b) => b.value - a.value).filter(x => x.value > 0).slice(0, 3)
})

const topDays = computed(() => {
  const totals: { dayIndex: number; value: number }[] = Array.from({ length: 7 }, (_, d) => ({
    dayIndex: d,
    value: 0,
  }))
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      totals[d].value += getCellValue(d, h)
    }
  }
  return [...totals].sort((a, b) => b.value - a.value).filter(x => x.value > 0).slice(0, 3)
})
</script>
