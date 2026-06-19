<template>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
    <!-- Visitas -->
    <div class="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100 flex flex-col hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-blue-800 font-medium text-sm">Visitas</span>
        <span class="text-xl">👁️</span>
      </div>
      <div class="text-2xl font-bold text-slate-800 mb-1">{{ data.visitas.toLocaleString() }}</div>
      <div class="flex items-center text-xs font-medium text-emerald-600">
        <span>▲ 12%</span>
        <span class="text-slate-400 ml-1 font-normal">vs mes ant.</span>
      </div>
    </div>

    <!-- Quizzes -->
    <div class="bg-emerald-50 rounded-xl p-4 shadow-sm border border-emerald-100 flex flex-col hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-emerald-800 font-medium text-sm">Quizzes</span>
        <span class="text-xl">📝</span>
      </div>
      <div class="text-2xl font-bold text-slate-800 mb-1">{{ data.quizzes.toLocaleString() }}</div>
      <div class="flex items-center text-xs font-medium text-emerald-600">
        <span>▲ 8%</span>
        <span class="text-slate-400 ml-1 font-normal">vs mes ant.</span>
      </div>
    </div>

    <!-- Reservas -->
    <div class="bg-amber-50 rounded-xl p-4 shadow-sm border border-amber-100 flex flex-col hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-amber-800 font-medium text-sm">Reservas</span>
        <span class="text-xl">📅</span>
      </div>
      <div class="text-2xl font-bold text-slate-800 mb-1">{{ data.reservas.toLocaleString() }}</div>
      <div class="flex items-center text-xs font-medium text-rose-600">
        <span>▼ 3%</span>
        <span class="text-slate-400 ml-1 font-normal">vs mes ant.</span>
      </div>
    </div>

    <!-- Llegaron -->
    <div class="bg-purple-50 rounded-xl p-4 shadow-sm border border-purple-100 flex flex-col hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-purple-800 font-medium text-sm">Llegaron</span>
        <span class="text-xl">🏥</span>
      </div>
      <div class="text-2xl font-bold text-slate-800 mb-1">{{ data.llegaron.toLocaleString() }}</div>
      <div class="flex items-center text-xs font-medium text-emerald-600">
        <span>▲ 5%</span>
        <span class="text-slate-400 ml-1 font-normal">vs mes ant.</span>
      </div>
    </div>

    <!-- Ingresos (Ventas en $) -->
    <div class="bg-pink-50 rounded-xl p-4 shadow-sm border border-pink-100 flex flex-col hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-pink-800 font-medium text-sm">Ingresos</span>
        <span class="text-xl">💰</span>
      </div>
      <div class="text-2xl font-bold text-slate-800 mb-1">${{ data.ventas.toLocaleString() }}</div>
      <div class="flex items-center text-xs font-medium text-emerald-600">
        <span>▲ 22%</span>
        <span class="text-slate-400 ml-1 font-normal">vs mes ant.</span>
      </div>
    </div>

    <!-- Nº Ventas -->
    <div class="bg-teal-50 rounded-xl p-4 shadow-sm border border-teal-100 flex flex-col hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between mb-2">
        <span class="text-teal-800 font-medium text-sm">Nº Ventas</span>
        <span class="text-xl">🛍️</span>
      </div>
      <div class="text-2xl font-bold text-slate-800 mb-1">{{ data.ventas_count.toLocaleString() }}</div>
      <div class="flex items-center text-xs font-medium text-emerald-600">
        <span>▲ 15%</span>
        <span class="text-slate-400 ml-1 font-normal">vs mes ant.</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Resumen } from '../../composables/useAnalyticsData';

defineProps<{
  data: Resumen;
}>();
</script>
