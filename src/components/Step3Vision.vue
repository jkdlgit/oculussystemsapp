<template>
  <div>
    <!-- Subpaso 1: Vision de lejos -->
    <div v-if="subStep === 1" class="animate-fade-in">
      <h2 class="text-2xl font-bold text-brand-dark mb-2">¿Te cuesta ver de lejos?</h2>
      <p class="text-slate-500 mb-6">Ejemplo: letreros en la calle, pizarrón, números de bus, televisor</p>

      <div class="space-y-3 mb-8">
        <button
          v-for="opt in opcionesLejos"
          :key="opt.value"
          type="button"
          class="option-card flex items-center gap-4"
          :class="{ selected: localLejos === opt.value }"
          @click="selectLejos(opt.value)"
          :disabled="advancing"
        >
          <span class="text-2xl flex-shrink-0">{{ opt.icon }}</span>
          <div class="text-left">
            <span class="font-semibold block">{{ opt.label }}</span>
            <p class="text-sm text-slate-400 leading-tight">{{ opt.desc }}</p>
          </div>
        </button>
      </div>

      <!-- Botón oculto: avance automático al seleccionar -->
    </div>

    <!-- Subpaso 2: Vision de cerca -->
    <div v-else-if="subStep === 2" class="animate-fade-in">
      <h2 class="text-2xl font-bold text-brand-dark mb-2">¿Te cuesta ver de cerca?</h2>
      <p class="text-slate-500 mb-6">Ejemplo: leer un libro, revisar el celular, ver el menú de un restaurante</p>

      <div class="space-y-3 mb-8">
        <button
          v-for="opt in opcionesCerca"
          :key="opt.value"
          type="button"
          class="option-card flex items-center gap-4"
          :class="{ selected: localCerca === opt.value }"
          @click="selectCerca(opt.value)"
          :disabled="advancing"
        >
          <span class="text-2xl flex-shrink-0">{{ opt.icon }}</span>
          <div class="text-left">
            <span class="font-semibold block">{{ opt.label }}</span>
            <p class="text-sm text-slate-400 leading-tight">{{ opt.desc }}</p>
          </div>
        </button>
      </div>

      <!-- Solo botón Volver; el Continuar es automático -->
      <button
        type="button"
        @click="subStep = 1; advancing = false"
        class="w-full py-4 border-2 border-slate-200 text-brand-dark font-semibold text-base rounded-2xl hover:bg-slate-50 transition-all duration-300 ease-out flex items-center justify-center"
      >
        ← Volver
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VisionLevel } from '@/types'

const props = defineProps<{
  visionLejos: string
  visionCerca: string
}>()

const emit = defineEmits<{
  next: [data: { lejos: string; cerca: string }]
}>()

const localLejos = ref<VisionLevel>((props.visionLejos as VisionLevel) || '')
const localCerca = ref<VisionLevel>((props.visionCerca as VisionLevel) || '')
const subStep = ref(1)
const advancing = ref(false)

const opcionesLejos = [
  { value: 'mucho', label: 'Mucho', desc: 'Me cuesta bastante ver objetos lejanos', icon: '🔵' },
  { value: 'poco', label: 'Un poco', desc: 'A veces, pero no siempre', icon: '🟢' },
  { value: 'nada', label: 'Nada', desc: 'Veo perfectamente de lejos', icon: '⚪' },
] as const

const opcionesCerca = [
  { value: 'mucho', label: 'Mucho', desc: 'Me cuesta bastante ver objetos cercanos', icon: '🔵' },
  { value: 'poco', label: 'Un poco', desc: 'A veces, pero no siempre', icon: '🟢' },
  { value: 'nada', label: 'Nada', desc: 'Veo perfectamente de cerca', icon: '⚪' },
] as const

function selectLejos(value: string) {
  if (advancing.value) return
  localLejos.value = value as VisionLevel
  advancing.value = true
  subStep.value = 2
  advancing.value = false
}

function selectCerca(value: string) {
  if (advancing.value) return
  localCerca.value = value as VisionLevel
  advancing.value = true
  emit('next', { lejos: localLejos.value, cerca: localCerca.value })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
