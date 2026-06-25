<template>
  <div class="text-center">
    <div class="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-blue-100">
      👁️
    </div>
    
    <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
      Descubre tu Agudeza Visual
    </h1>
    
    <p class="text-slate-600 mb-8 text-xl leading-relaxed px-2">
      Realiza esta rápida auto-prueba interactiva de <span class="font-bold text-slate-800">1 minuto</span> para estimar el nivel de tu visión actual.
    </p>

    <div class="bg-blue-50/50 rounded-xl p-5 mb-8 border border-blue-100/50 text-left">
      <h3 class="font-bold text-slate-800 mb-3 flex items-center gap-2 text-lg">
        <span class="text-blue-600">📌</span> Instrucciones:
      </h3>
      <ul class="space-y-3 text-base text-slate-600">
        <li class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">1</div>
          <span>Sostén tu dispositivo a una distancia cómoda de lectura (aprox. 30-40 cm).</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">2</div>
          <span>Si usas lentes de lectura normalmente, <strong>ponte los lentes</strong>.</span>
        </li>
        <li class="flex items-start gap-3">
          <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">3</div>
          <span>Ajusta el tamaño de la letra hasta que apenas puedas leerla cómodamente.</span>
        </li>
      </ul>
    </div>

    <button
      @click="$emit('start')"
      class="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 text-lg"
    >
      Comenzar Prueba <span class="text-xl">👉</span>
    </button>
    
    <p class="text-xs text-slate-400 mt-5 font-medium px-4">
      *Esta es una prueba orientativa y no reemplaza un examen profesional de la vista.
    </p>
  </div>
</template>

<script setup lang="ts">
defineEmits(['start'])
</script>
