<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <h2 class="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span>📈</span> Evolución Temporal
    </h2>
    <div class="h-80">
      <Line v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { Evolucion } from '../../composables/useAnalyticsData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  data: Evolucion;
}>();

const chartData = computed(() => {
  if (!props.data) return null;
  
  return {
    labels: props.data.fechas,
    datasets: [
      {
        label: 'Visitas',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6',
        data: props.data.visitas,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Quizzes',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        pointBackgroundColor: '#10b981',
        data: props.data.quizzes,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Reservas',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
        pointBackgroundColor: '#f59e0b',
        data: props.data.reservas,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Ventas',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderColor: '#ec4899',
        pointBackgroundColor: '#ec4899',
        data: props.data.ventas,
        fill: true,
        tension: 0.4
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        font: {
          family: "'Inter', sans-serif",
          size: 13
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: {
        family: "'Inter', sans-serif",
        size: 13
      },
      bodyFont: {
        family: "'Inter', sans-serif",
        size: 13
      },
      padding: 12,
      cornerRadius: 8,
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
        }
      }
    },
    y: {
      grid: {
        color: '#f1f5f9'
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
        }
      }
    }
  }
};
</script>
