<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">

      <AnalyticsHeader
        project-name="Oculus"
        last-updated="Justo ahora"
        @refresh="refreshData"
        @auto-refresh="onAutoRefresh"
      />

      <!-- Filtros justo debajo del header -->
      <DashboardFilters @filter-change="onFilterChange" />

      <!-- Indicador de actualización sin ocultar datos -->
      <div v-if="isRefreshing" class="flex items-center justify-center gap-2 py-2 mb-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        <span class="text-sm text-indigo-600 font-medium">Actualizando datos...</span>
      </div>

      <!-- Cargando Estado -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>

      <!-- Contenido Principal -->
      <div v-else-if="data">
        <SummaryCards :data="data.resumen" />

        <FunnelVisualization :data="data.funnel" />

        <KpiCards :data="data.kpis" />

        <StageDetailsTable :data="data.funnel" />

        <!-- Tabla de Abandono - ancho completo -->
        <AbandonmentTable :data="data.abandono" />

        <!-- Evolución Temporal - ancho completo -->
        <EvolutionChart :data="data.evolucion" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useAnalyticsData, type FilterOptions } from '../composables/useAnalyticsData';
import AnalyticsHeader from '../components/analytics/AnalyticsHeader.vue';
import SummaryCards from '../components/analytics/SummaryCards.vue';
import FunnelVisualization from '../components/analytics/FunnelVisualization.vue';
import KpiCards from '../components/analytics/KpiCards.vue';
import StageDetailsTable from '../components/analytics/StageDetailsTable.vue';
import AbandonmentTable from '../components/analytics/AbandonmentTable.vue';
import EvolutionChart from '../components/analytics/EvolutionChart.vue';
import DashboardFilters from '../components/analytics/DashboardFilters.vue';

const { data, isLoading, isRefreshing, refresh } = useAnalyticsData();
const currentFilters = ref<FilterOptions | undefined>(undefined);
let autoRefreshInterval: ReturnType<typeof setInterval> | null = null;

const onFilterChange = (filters: FilterOptions) => {
  currentFilters.value = filters;
  refresh(filters);
};

const refreshData = () => {
  refresh(currentFilters.value);
};

const onAutoRefresh = (seconds: string) => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
  
  const secs = parseInt(seconds, 10);
  if (secs > 0) {
    autoRefreshInterval = setInterval(() => {
      refreshData();
    }, secs * 1000);
  }
};

onUnmounted(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.font-sans {
  font-family: 'Inter', sans-serif;
}
</style>
