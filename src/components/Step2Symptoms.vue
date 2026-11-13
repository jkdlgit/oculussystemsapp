<template>
  <div>
    <h2 class="text-2xl font-bold text-brand-dark mb-2">¿Cuál es tu molestia principal en los ojos?</h2>
    <p class="text-slate-500 mb-8">Selecciona la opción que más se acerca a lo que sientes</p>

    <div class="space-y-3">
      <button
        v-for="opt in sintomasOpciones"
        :key="opt.id"
        type="button"
        class="option-card flex items-center gap-4 w-full"
        :class="{ selected: selected === opt.id }"
        @click="selectOption(opt.id)"
        :disabled="advancing"
      >
        <span class="text-2xl flex-shrink-0">{{ opt.emoji }}</span>
        <span class="flex-1 font-medium text-left">{{ opt.label }}</span>
        <span
          class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300"
          :class="selected === opt.id ? 'bg-brand-teal border-brand-teal' : 'border-slate-300'"
        >
          <span v-if="selected === opt.id" class="w-2.5 h-2.5 rounded-full bg-white"></span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sintomasOpciones } from '@/types'

const emit = defineEmits<{
  next: [sintomas: string[]]
}>()

const selected = ref<string>('')
const advancing = ref(false)

function selectOption(id: string) {
  if (advancing.value) return
  advancing.value = true
  selected.value = id
  emit('next', [id])
}
</script>
