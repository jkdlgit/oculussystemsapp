<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 overflow-hidden">
    <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span>📉</span> Tabla de Abandono <span class="text-sm font-normal text-slate-500">(Dónde se pierden)</span>
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-y border-slate-200">
            <th class="py-3 px-4 font-semibold text-sm text-slate-600">Transición</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Entraron</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Perdidos</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-right">% Abandono</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600">Acción sugerida</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="item in data" :key="item.transicion" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="py-3 px-4 font-medium text-slate-700">{{ item.transicion }}</td>
            <td class="py-3 px-4 text-right">{{ item.entraron.toLocaleString() }}</td>
            <td class="py-3 px-4 text-right text-rose-600 font-medium">{{ item.perdidos.toLocaleString() }}</td>
            
            <td class="py-3 px-4 text-right">
              <span :class="getAbandonmentColorClass(item.porcentaje)" class="px-2 py-1 rounded-full font-medium text-xs">
                {{ item.porcentaje.toFixed(1) }}%
              </span>
            </td>
            
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <span v-if="item.accion.includes('✅')" class="text-emerald-500 text-base">✓</span>
                <span v-else class="text-amber-500 text-base">💡</span>
                <span class="text-slate-600">{{ item.accion.replace('✅ ', '') }}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Abandono } from '../../composables/useAnalyticsData';

defineProps<{
  data: Abandono[];
}>();

const getAbandonmentColorClass = (percentage: number) => {
  if (percentage < 20) return 'bg-emerald-100 text-emerald-800';
  if (percentage <= 40) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
};
</script>
