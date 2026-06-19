<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span>📊</span> KPIs Principales
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Conversión Global -->
      <div class="p-4 border border-slate-100 rounded-lg bg-slate-50">
        <div class="text-sm text-slate-500 font-medium mb-1">Tasa de conversión global</div>
        <div class="text-xs text-slate-400 mb-3">Visita → Venta</div>
        <div class="flex items-end gap-3">
          <div class="text-3xl font-bold text-slate-800">{{ data.conversion_global.toFixed(1) }}%</div>
          <div class="text-sm font-medium text-emerald-600 mb-1">▲ 1.2%</div>
        </div>
      </div>

      <!-- Ticket Promedio -->
      <div class="p-4 border border-slate-100 rounded-lg bg-slate-50">
        <div class="text-sm text-slate-500 font-medium mb-1">Ticket promedio</div>
        <div class="text-xs text-slate-400 mb-3">Ingreso por venta</div>
        <div class="flex items-end gap-3">
          <div class="text-3xl font-bold text-slate-800">${{ data.ticket_promedio.toFixed(2) }}</div>
          <div class="text-sm font-medium text-emerald-600 mb-1">▲ $12.5</div>
        </div>
      </div>

      <!-- Costo por Lead -->
      <div class="p-4 border border-slate-100 rounded-lg bg-slate-50">
        <div class="text-sm text-slate-500 font-medium mb-1">Costo por lead</div>
        <div class="text-xs text-slate-400 mb-3">Inversión / Leads</div>
        <div class="flex items-end gap-3">
          <div class="text-3xl font-bold text-slate-800">${{ data.costo_por_lead.toFixed(2) }}</div>
          <div class="text-sm font-medium text-rose-600 mb-1">▲ $0.30</div>
        </div>
      </div>

      <!-- ROI -->
      <div class="p-4 border border-slate-100 rounded-lg bg-slate-50">
        <div class="text-sm text-slate-500 font-medium mb-1">ROI estimado</div>
        <div class="text-xs text-slate-400 mb-3">Retorno sobre inversión</div>
        <div class="flex items-end gap-3">
          <div class="text-3xl font-bold text-slate-800">{{ data.roi.toLocaleString() }}%</div>
          <div class="text-sm font-medium text-emerald-600 mb-1">▲ 150%</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import type { Kpis } from '../../composables/useAnalyticsData';

defineProps<{
  data: Kpis;
}>();
</script>
