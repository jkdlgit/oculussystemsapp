<template>
  <div class="flex flex-col items-center text-center">
    <!-- Eye icon -->
    <div class="w-24 h-24 bg-gradient-to-br from-brand-teal to-brand-light rounded-full flex items-center justify-center mb-8 shadow-lg shadow-brand-teal/20 animate-pulse">
      <span class="text-5xl">👁️</span>
    </div>

    <h1 class="text-3xl sm:text-4xl font-bold text-brand-dark mb-4 leading-tight">
      ¿Cómo están tus ojos hoy?
    </h1>

    <p class="text-lg text-slate-500 mb-2 max-w-md">
      Responde 4 preguntas rápidas y descubre si necesitas una revisión visual profesional.
    </p>

    <div class="flex items-center gap-2 text-brand-teal font-semibold mb-10">
      <span>⏱️</span>
      <span>Solo 2 minutos</span>
    </div>

    <button @click="$emit('next')" class="btn-primary max-w-xs">
      Comenzar →
    </button>

    <p class="mt-6 text-xs text-slate-400">
      Este test es orientativo y no reemplaza un examen profesional.
    </p>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  next: []
}>()
</script>
