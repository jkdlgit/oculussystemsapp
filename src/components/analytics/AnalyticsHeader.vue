<template>
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
        <span class="text-2xl">📊</span> Dashboard de Conversión
      </h1>
      <p class="text-sm text-slate-500 mt-1">VERITAS - Gestión Visual</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="relative">
        <select class="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-10 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium">
          <option>📅 Hoy</option>
          <option>Últimos 7 días</option>
          <option>Últimos 30 días</option>
          <option>Este mes</option>
          <option>Personalizado</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <div class="relative">
        <select v-model="autoRefresh" @change="$emit('auto-refresh', autoRefresh)" class="appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer font-medium text-sm">
          <option value="0">Sin auto-actualización</option>
          <option value="15">Cada 15 segundos</option>
          <option value="30">Cada 30 segundos</option>
          <option value="60">Cada 1 minuto</option>
          <option value="300">Cada 5 minutos</option>
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <button @click="$emit('refresh')" class="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg shadow-sm transition duration-150 ease-in-out font-medium flex items-center gap-2 text-sm">
        <span>🔄</span> Actualizar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineEmits(['refresh', 'auto-refresh']);
const autoRefresh = ref('0');
</script>
