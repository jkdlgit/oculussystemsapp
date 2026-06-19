<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span>📈</span> Embudo de Conversión
    </h2>
    <div class="space-y-4">
      <div v-for="(stage, index) in data" :key="stage.etapa" class="relative">
        <div class="flex flex-col md:flex-row md:items-center justify-between text-sm mb-1 z-10 relative">
          <span class="font-medium text-slate-700 w-full md:w-1/3">{{ stage.etapa }}. {{ stage.nombre }}</span>
          <span class="font-semibold text-slate-900 w-full md:w-1/6 md:text-center">{{ stage.cantidad.toLocaleString() }}</span>
          <span class="font-bold text-blue-600 w-full md:w-1/6 md:text-right">{{ stage.porcentaje }}%</span>
        </div>
        
        <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden relative">
          <div 
            class="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            :class="getBarColor(index, data.length)"
            :style="{ width: `${stage.porcentaje}%` }"
          ></div>
        </div>
        
        <!-- Flecha de transición (excepto el último) -->
        <div v-if="index < data.length - 1" class="h-6 w-px bg-slate-300 ml-4 my-1 flex items-center justify-center relative">
          <div class="absolute bottom-0 w-2 h-2 border-r-2 border-b-2 border-slate-300 transform rotate-45 translate-y-1"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FunnelStage } from '../../composables/useAnalyticsData';

defineProps<{
  data: FunnelStage[];
}>();

const getBarColor = (index: number, total: number) => {
  // Gradiente de colores de verde a azul dependiendo del stage
  const colors = [
    'bg-blue-500',
    'bg-blue-400',
    'bg-indigo-400',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-emerald-500'
  ];
  return colors[index % colors.length];
};
</script>
