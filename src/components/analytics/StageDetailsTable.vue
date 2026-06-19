<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 overflow-hidden">
    <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span>📊</span> Detalle por Etapa
    </h2>
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-y border-slate-200">
            <th class="py-3 px-4 font-semibold text-sm text-slate-600">Etapa</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600">Evento</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-right">Cantidad</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-right">% vs etapa ant.</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-right">% vs entrada</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-center">Variación</th>
            <th class="py-3 px-4 font-semibold text-sm text-slate-600 text-center">Tendencia</th>
          </tr>
        </thead>
        <tbody class="text-sm">
          <tr v-for="(stage, index) in data" :key="stage.etapa" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="py-3 px-4 font-medium text-slate-800">{{ stage.etapa }}</td>
            <td class="py-3 px-4 text-slate-700">{{ stage.nombre }}</td>
            <td class="py-3 px-4 text-right font-medium">{{ stage.cantidad.toLocaleString() }}</td>
            
            <td class="py-3 px-4 text-right">
              <span :class="getStageColorClass(getStageVsPrevious(index))" class="px-2 py-1 rounded-full font-medium text-xs">
                {{ getStageVsPrevious(index).toFixed(1) }}%
              </span>
            </td>
            
            <td class="py-3 px-4 text-right font-medium text-slate-600">
              {{ stage.porcentaje }}%
            </td>
            
            <td class="py-3 px-4 text-center">
              <span :class="index % 3 === 0 ? 'text-rose-500' : 'text-emerald-500'" class="font-medium">
                {{ index % 3 === 0 ? '-3%' : '+5%' }}
              </span>
            </td>
            
            <td class="py-3 px-4 text-center">
              <span :class="index % 3 === 0 ? 'text-rose-500' : 'text-emerald-500'">
                {{ index % 3 === 0 ? '▼' : '▲' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FunnelStage } from '../../composables/useAnalyticsData';

const props = defineProps<{
  data: FunnelStage[];
}>();

const getStageVsPrevious = (index: number) => {
  if (index === 0) return 100;
  const current = props.data[index].cantidad;
  const previous = props.data[index - 1].cantidad;
  return previous > 0 ? (current / previous) * 100 : 0;
};

const getStageColorClass = (percentage: number) => {
  if (percentage >= 80) return 'bg-emerald-100 text-emerald-800';
  if (percentage >= 50) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
};
</script>
