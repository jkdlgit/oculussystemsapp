<template>
  <div>
    <h2 class="text-2xl font-bold text-brand-dark mb-6">¿Tienes problemas para distinguir ciertos colores?</h2>

    <div class="space-y-3 mb-6">
      <button
        type="button"
        class="option-card flex items-center gap-4"
        :class="{ selected: localProblema === 'si' }"
        @click="selectProblema('si')"
        :disabled="advancing"
      >
        <span class="text-2xl">🔴</span>
        <span class="font-semibold text-[18px]">Sí, tengo problemas con algunos colores</span>
      </button>
      <button
        type="button"
        class="option-card flex items-center gap-4"
        :class="{ selected: localProblema === 'no' }"
        @click="selectProblema('no')"
        :disabled="advancing"
      >
        <span class="text-2xl">🟢</span>
        <span class="font-semibold text-[18px]">No, veo todos los colores bien</span>
      </button>
    </div>
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
const advancing = ref(false)

function selectProblema(value: string) {
  if (advancing.value) return
  localProblema.value = value
  advancing.value = true
  emit('next', { problema: value, detalle: '' })
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
