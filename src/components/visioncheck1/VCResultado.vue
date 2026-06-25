<template>
  <div class="text-center">
    <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-emerald-100 text-emerald-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    </div>
    
    <h2 class="text-2xl font-bold text-slate-800 mb-2">Prueba Completada</h2>
    <p class="text-slate-500 mb-6">Tu agudeza visual estimada es de:</p>
    
    <div class="inline-block bg-slate-100 rounded-2xl px-8 py-4 mb-8 border border-slate-200">
      <span class="text-4xl font-black text-blue-900 tracking-tighter">{{ score }}</span>
    </div>

    <div class="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm text-left mb-8 border border-blue-100">
      <p class="mb-2 font-bold flex items-center gap-2">
        <span>💡</span> ¿Qué significa esto?
      </p>
      <p v-if="isGoodVision" class="opacity-90">
        Tienes una excelente visión estimada. Sin embargo, para prevenir fatiga visual o evaluar tu salud ocular completa, te recomendamos una revisión profesional.
      </p>
      <p v-else class="opacity-90">
        Tus resultados indican que podrías beneficiarte del uso de lentes o una actualización de tu medida actual. Un examen profesional confirmará tu estado visual.
      </p>
    </div>

    <button
      @click="$emit('next')"
      class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-lg"
    >
      Agendar Cita Gratuita <span class="text-xl">📅</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  score: string
}>()

defineEmits(['next'])

const isGoodVision = computed(() => {
  return props.score === '20/15' || props.score === '20/20' || props.score === '20/25'
})
</script>
