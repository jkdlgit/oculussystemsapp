<template>
  <div>
    <h2 class="text-2xl font-bold text-brand-dark mb-2">¿Qué molestias has notado en tus ojos últimamente?</h2>
    <p class="text-slate-500 mb-8">Selecciona todas las que apliquen</p>

    <div class="space-y-3 mb-8">
      <button
        v-for="opt in sintomasOpciones"
        :key="opt.id"
        type="button"
        class="symptom-chip w-full"
        :class="{ selected: isSelected(opt.id) }"
        @click="toggle(opt.id)"
      >
        <span class="text-2xl flex-shrink-0">{{ opt.emoji }}</span>
        <span class="flex-1 font-medium">{{ opt.label }}</span>
        <span
          class="w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300"
          :class="isSelected(opt.id) ? 'bg-brand-teal border-brand-teal' : 'border-slate-300'"
        >
          <svg v-if="isSelected(opt.id)" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      </button>
    </div>

    <button @click="handleNext" class="btn-primary" :disabled="selected.length === 0">
      Continuar →
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sintomasOpciones } from '@/types'

const props = defineProps<{
  sintomas: string[]
}>()

const emit = defineEmits<{
  next: [sintomas: string[]]
}>()

const selected = ref<string[]>([...props.sintomas])

function isSelected(id: string): boolean {
  return selected.value.includes(id)
}

function toggle(id: string) {
  if (id === 'ninguna') {
    selected.value = isSelected('ninguna') ? [] : ['ninguna']
    return
  }
  // Remove 'ninguna' if selecting a symptom
  selected.value = selected.value.filter(s => s !== 'ninguna')

  const idx = selected.value.indexOf(id)
  if (idx > -1) {
    selected.value.splice(idx, 1)
  } else {
    selected.value.push(id)
  }
}

function handleNext() {
  emit('next', [...selected.value])
}
</script>
