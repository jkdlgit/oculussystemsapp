<template>
  <div class="space-y-5">
    <!-- Aviso si no hay datos de entrega de lentes -->
    <div
      v-if="!data.hasDeliveryData"
      class="flex items-start gap-2.5 p-3 rounded-lg border border-slate-700/60 bg-slate-900/50 text-xs font-mono text-slate-400"
    >
      <span class="text-base">ℹ️</span>
      <span>
        El tramo <strong class="text-slate-200">Venta → Entrega de Lentes</strong> requiere el campo
        <code class="text-cyan-400">fecha_entrega_real</code> en la tabla de pedidos.
        Los demás tramos ya se calculan con los datos actuales.
      </span>
    </div>

    <!-- Barra del Viaje Completo (proporcional a mediana total) -->
    <div class="p-3 rounded-xl bg-pulso-card/70 border border-pulso-border/70">
      <p class="text-[10px] font-mono text-cyan-400 font-bold uppercase mb-3">
        // Viaje del cliente (mediana acumulada)
      </p>
      <div class="relative h-8 flex rounded-lg overflow-hidden border border-pulso-border/50">
        <div
          v-for="(seg, i) in validSegments"
          :key="seg.key"
          class="relative flex items-center justify-center transition-all group"
          :style="{
            width: `${segmentWidth(seg)}%`,
            backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
            minWidth: '1%',
          }"
          :title="`${seg.label}: ${formatDuration(seg.medianMs)}`"
        >
          <!-- Etiqueta visible si el segmento es suficientemente ancho -->
          <span
            v-if="segmentWidth(seg) > 12"
            class="text-[9px] font-mono font-bold text-white truncate px-1"
          >
            {{ formatDurationShort(seg.medianMs) }}
          </span>
          <!-- Separador vertical -->
          <div
            v-if="i < validSegments.length - 1"
            class="absolute right-0 top-0 bottom-0 w-px bg-black/30"
          ></div>
        </div>
      </div>

      <!-- Etiquetas de etapas debajo -->
      <div class="flex mt-2">
        <div
          v-for="(seg, i) in validSegments"
          :key="seg.key"
          class="text-[9px] font-mono text-slate-500 truncate"
          :style="{ width: `${segmentWidth(seg)}%`, minWidth: '1%' }"
        >
          <span class="text-[8px]">{{ seg.from }}</span>
        </div>
        <div class="text-[9px] font-mono text-slate-500 ml-auto">Entrega</div>
      </div>
    </div>

    <!-- Tarjetas por tramo: Mediana + P90 + en curso -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <div
        v-for="(seg, i) in data.segments"
        :key="seg.key"
        class="p-4 rounded-xl border transition-all group"
        :class="seg.sampleSize === 0 && seg.inProgress === 0
          ? 'bg-pulso-void/40 border-slate-800/50 opacity-60'
          : 'bg-pulso-card/80 border-pulso-border/70 hover:border-cyan-500/30'"
      >
        <!-- Cabecera: color del tramo + nombre -->
        <div class="flex items-center gap-2 mb-3">
          <span
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            :style="{ backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }"
          ></span>
          <p class="text-[10px] font-mono font-bold text-slate-300 leading-tight">
            {{ seg.from.toUpperCase() }} → {{ seg.to.toUpperCase() }}
          </p>
        </div>

        <!-- Sin datos -->
        <div v-if="seg.sampleSize === 0 && seg.inProgress === 0" class="text-center py-2">
          <span class="text-[11px] font-mono text-slate-600">Sin datos</span>
        </div>

        <!-- Con datos -->
        <div v-else class="space-y-2">
          <!-- Mediana -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[9px] font-mono text-slate-500 uppercase">Tiempo típico</p>
              <p class="text-lg font-tech font-bold text-slate-100 leading-tight">
                {{ seg.sampleSize > 0 ? formatDuration(seg.medianMs) : '—' }}
              </p>
              <p class="text-[9px] font-mono text-slate-600">Mediana</p>
            </div>
            <div class="text-right">
              <p class="text-[9px] font-mono text-slate-500 uppercase">Caso lento</p>
              <p class="text-base font-tech font-bold text-amber-400 leading-tight">
                {{ seg.sampleSize > 0 ? formatDuration(seg.p90Ms) : '—' }}
              </p>
              <p class="text-[9px] font-mono text-slate-600">P90</p>
            </div>
          </div>

          <!-- Barra comparativa mediana vs P90 -->
          <div v-if="seg.sampleSize > 0" class="space-y-1">
            <div class="flex items-center gap-1.5">
              <div class="h-1.5 rounded-full flex-1 bg-pulso-void overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{
                    width: `${seg.p90Ms > 0 ? (seg.medianMs / seg.p90Ms) * 100 : 0}%`,
                    backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                  }"
                ></div>
              </div>
              <span class="text-[9px] font-mono text-slate-600 w-10 text-right">
                {{ seg.p90Ms > 0 ? Math.round((seg.medianMs / seg.p90Ms) * 100) : 0 }}%
              </span>
            </div>
            <p class="text-[9px] font-mono text-slate-600">de los casos son ≤ mediana</p>
          </div>

          <!-- Footer: muestra + en curso -->
          <div class="pt-2 border-t border-pulso-border/50 flex items-center justify-between text-[10px] font-mono">
            <span class="text-slate-500">
              <span class="text-slate-300 font-bold">{{ seg.sampleSize }}</span> medidos
            </span>
            <span v-if="seg.inProgress > 0" class="flex items-center gap-1 text-cyan-400">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 live-pulse"></span>
              {{ seg.inProgress }} en curso
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Nota aclaratoria -->
    <div class="text-[10px] font-mono text-slate-600 flex items-start gap-2">
      <span>ℹ️</span>
      <span>
        Los tiempos se calculan sobre los clientes que <strong class="text-slate-400">entraron en el período seleccionado</strong>,
        aunque su venta o entrega ocurra después. La <strong class="text-slate-400">Mediana</strong> es el tiempo que divide el 50%
        de los casos, resistente a valores atípicos. El <strong class="text-slate-400">P90</strong> (caso lento) es superado solo por
        1 de cada 10 personas.
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JourneyData } from '@/pulso/types'

const props = defineProps<{
  data: JourneyData
}>()

const SEGMENT_COLORS = [
  '#38bdf8',  // entrada → quiz — celeste
  '#6366f1',  // quiz → reserva — índigo
  '#f59e0b',  // reserva → local — ámbar
  '#10b981',  // local → venta — esmeralda
  '#ec4899',  // venta → entrega — rosa
]

const validSegments = computed(() =>
  props.data.segments.filter(s => s.medianMs > 0 || s.inProgress > 0)
)

const totalMedianMs = computed(() =>
  validSegments.value.reduce((sum, s) => sum + s.medianMs, 0)
)

function segmentWidth(seg: { medianMs: number }): number {
  if (totalMedianMs.value === 0) return 100 / (validSegments.value.length || 1)
  return Math.max(2, (seg.medianMs / totalMedianMs.value) * 100)
}

// Formateo de duración legible
function formatDuration(ms: number): string {
  if (ms <= 0) return '—'
  const secs = ms / 1000
  if (secs < 120) return `${Math.round(secs)}s`
  const mins = secs / 60
  if (mins < 90) return `${Math.round(mins)} min`
  const hours = mins / 60
  if (hours < 36) return `${hours.toFixed(1)} h`
  const days = hours / 24
  return `${days.toFixed(1)} días`
}

function formatDurationShort(ms: number): string {
  if (ms <= 0) return '—'
  const hours = ms / (1000 * 60 * 60)
  if (hours < 1) return `${Math.round(ms / 60000)}m`
  if (hours < 24) return `${hours.toFixed(0)}h`
  return `${(hours / 24).toFixed(1)}d`
}
</script>
