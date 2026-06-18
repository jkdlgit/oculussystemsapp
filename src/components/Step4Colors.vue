<template>
  <div>
    <h2 class="text-2xl font-bold text-brand-dark mb-2">¿Tienes problemas para distinguir ciertos colores?</h2>
    <p class="text-slate-500 mb-2">Ejemplos:</p>
    <ul class="text-slate-500 mb-8 space-y-1 text-sm">
      <li>• ¿Confundes el rojo con el verde? (ej. semáforos, frutas, luces)</li>
      <li>• ¿Te cuesta diferenciar el azul del amarillo?</li>
      <li>• ¿Alguien te ha dicho que ves los colores de forma diferente?</li>
    </ul>

    <div class="space-y-3 mb-6">
      <button
        type="button"
        class="option-card flex items-center gap-4"
        :class="{ selected: localProblema === 'si' }"
        @click="localProblema = 'si'"
      >
        <span class="text-2xl">🔴</span>
        <span class="font-semibold">Sí, tengo problemas con algunos colores</span>
      </button>
      <button
        type="button"
        class="option-card flex items-center gap-4"
        :class="{ selected: localProblema === 'no' }"
        @click="localProblema = 'no'"
      >
        <span class="text-2xl">🟢</span>
        <span class="font-semibold">No, veo todos los colores bien</span>
      </button>
    </div>

    <!-- Detalle condicional -->
    <div v-if="localProblema === 'si'" class="mb-6 animate-fade-in">
      <label class="block text-sm font-semibold text-brand-dark mb-2">Cuéntanos más (opcional)</label>
      <textarea
        v-model="localDetalle"
        class="input-field resize-none"
        rows="3"
        placeholder="Ej. Confundo el rojo con el verde"
      ></textarea>
      <p class="text-xs text-slate-400 mt-2">No te preocupes, es más común de lo que crees y tiene solución.</p>
    </div>

    <button @click="handleNext" class="btn-primary" :disabled="!localProblema">
      Ver mi resultado →
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  problemasColores: string
  detalleColores: string
}>()

const emit = defineEmits<{
  next: [data: { problema: string; detalle: string }]
}>()

const localProblema = ref(props.problemasColores)
const localDetalle = ref(props.detalleColores)

function handleNext() {
  emit('next', { problema: localProblema.value, detalle: localDetalle.value })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
