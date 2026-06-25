<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <h2 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
      <span>🔍</span> Filtros
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      
      <!-- Rango de Fechas -->
      <div class="col-span-1 md:col-span-2 lg:col-span-1 flex gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-500 mb-1">Desde</label>
          <input type="date" v-model="filters.dateStart" class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
          <input type="date" v-model="filters.dateEnd" class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <!-- Origen -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Origen</label>
        <select v-model="filters.origen" class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer">
          <option>Todos</option>
          <option value="quiz1">quiz1</option>
          <option value="visioncheck1">visioncheck1</option>
          <option value="Quiz">Quiz (Antiguo)</option>
          <option>WhatsApp</option>
          <option>Facebook</option>
          <option>Google</option>
          <option>Instagram</option>
          <option>Referidos</option>
          <option>Manual</option>
        </select>
      </div>

      <!-- Estado -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Estado</label>
        <select v-model="filters.estado" class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer">
          <option>Todos</option>
          <option>Nuevo</option>
          <option>Contactado</option>
          <option>Cita agendada</option>
          <option>Atendido</option>
          <option>Paciente</option>
          <option>Cliente</option>
        </select>
      </div>

      <!-- Owner -->
      <div>
        <label class="block text-xs font-medium text-slate-500 mb-1">Owner</label>
        <select v-model="filters.especialista" class="w-full bg-slate-50 border border-slate-200 text-slate-700 py-2 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer">
          <option value="Todos">Todos</option>
          <option value="publicidad">Publicidad</option>
          <option value="especialista">Especialista</option>
        </select>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits(['filter-change']);

const filters = ref({
  dateStart: '',
  dateEnd: '',
  origen: 'Todos',
  estado: 'Todos',
  especialista: 'Todos'
});

watch(filters, (newVal) => {
  emit('filter-change', newVal);
}, { deep: true });
</script>
