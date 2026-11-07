<template>
  <div class="space-y-4">
    <!-- Header resumen y leyenda de ayuda -->
    <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-pulso-border/40 text-xs font-mono">
      <div class="flex items-center gap-2">
        <span class="text-cyan-400 font-bold">// EMBUDO CONSOLIDADO:</span>
        <span class="text-slate-400">Degradado continuo con umbrales por paso</span>
      </div>
      <div class="flex items-center gap-3 text-[10px] text-slate-400">
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
          <span>Visitas</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
          <span>Óptimo</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
          <span>Atención</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
          <span>Crítico</span>
        </span>
        <span class="flex items-center gap-1">
          <span class="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span>
          <span>Pocos datos</span>
        </span>
      </div>
    </div>

    <!-- Lista de Barras del Embudo -->
    <div class="space-y-3">
      <div
        v-for="(step, idx) in steps"
        :key="step.key"
        class="p-3 rounded-xl bg-pulso-card/70 border border-pulso-border/70 hover:border-pulso-border transition-all group"
      >
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-mono">
          <!-- Paso # y Nombre -->
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-5 h-5 rounded bg-pulso-surface border border-pulso-border flex items-center justify-center text-[10px] font-bold text-slate-300">
              0{{ idx + 1 }}
            </span>
            <span class="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
              {{ step.label.toUpperCase() }}
            </span>
            <span
              v-if="step.isInsuficientData"
              class="badge bg-slate-800 text-slate-400 border border-slate-700 text-[9px] py-0 px-2"
              title="Muestra insuficiente para concluir rendimiento"
            >
              POCOS DATOS (&lt;{{ step.minPersons }})
            </span>
            <span
              v-else-if="idx > 0"
              class="text-[10px] px-1.5 py-0.5 rounded font-bold"
              :style="{ backgroundColor: `${step.color}20`, color: step.color, border: `1px solid ${step.color}50` }"
            >
              {{ step.symbol }} {{ step.statusLabel }}
            </span>
          </div>

          <!-- 3 Datos Clave: Cantidad | % vs Anterior | % vs Visitas -->
          <div class="flex items-center gap-4 text-xs font-mono">
            <!-- 1. Cantidad -->
            <div class="text-right">
              <span class="text-slate-400 text-[10px] block leading-tight">CANTIDAD</span>
              <span class="font-bold text-slate-100 text-sm">
                {{ step.count.toLocaleString('es-EC') }}
              </span>
            </div>

            <!-- 2. % respecto al paso anterior -->
            <div class="text-right w-24">
              <span class="text-slate-400 text-[10px] block leading-tight">RETENCIÓN</span>
              <span
                class="font-bold text-xs"
                :style="{ color: idx === 0 ? '#38bdf8' : step.color }"
              >
                {{ idx === 0 ? '100%' : `${step.pctStep.toFixed(1)}%` }}
              </span>
              <span class="text-[9px] text-slate-500 block leading-tight">vs paso previo</span>
            </div>

            <!-- 3. % respecto a visitas totales -->
            <div class="text-right w-24">
              <span class="text-slate-400 text-[10px] block leading-tight">CONVERSIÓN</span>
              <span class="font-bold text-cyan-300 text-xs">
                {{ step.pctVisits.toFixed(1) }}%
              </span>
              <span class="text-[9px] text-slate-500 block leading-tight">del total</span>
            </div>
          </div>
        </div>

        <!-- Barra de Progreso con Ancho proporcional y Color continuo -->
        <div class="w-full bg-pulso-void h-3 rounded-full overflow-hidden p-0.5 border border-pulso-border/70 relative">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :style="{
              width: `${Math.max(2, Math.min(100, step.pctVisits))}%`,
              backgroundColor: step.color,
              boxShadow: `0 0 10px ${step.color}40`,
            }"
          ></div>
        </div>

        <!-- Nota contextual si es tramo Reserva -> Llegó al local -->
        <div v-if="step.key === 'llegaron'" class="mt-1.5 text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>Solo se evalúan reservas cuya fecha/hora de cita ya ocurrió. Citas futuras quedan excluidas de inasistencia.</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoFunnelStep } from '@/pulso/types'

defineProps<{
  steps: TodoFunnelStep[]
}>()
</script>
