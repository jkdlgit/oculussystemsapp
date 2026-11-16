<template>
  <div class="flex flex-col h-full">
    <!-- Indicador de Progreso -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-500 font-bold text-sm tracking-wide">Ronda {{ currentRound }} de {{ maxRounds }}</span>
        <span class="text-indigo-600 font-black text-xs bg-indigo-50 px-2 py-0.5 rounded-full">
          Test de Agudeza Visual
        </span>
      </div>

      <!-- Barra de Progreso -->
      <div class="flex gap-2 h-2">
        <div
          v-for="i in maxRounds" :key="i"
          :class="[
            'flex-1 rounded-full transition-colors duration-300',
            i < currentRound ? 'bg-emerald-500' : (i === currentRound ? 'bg-blue-400 animate-pulse' : 'bg-slate-200')
          ]"
        ></div>
      </div>

      <p class="text-center text-xs text-slate-400 font-medium mt-2 h-4">
        <span v-if="currentRound === 1">¿Puedes leer las letras con claridad?</span>
        <span v-else class="text-slate-500 font-semibold">Ronda final — letras más pequeñas</span>
      </p>
    </div>

    <!-- Área de visualización de letras (fondo negro, estilo optometría) -->
    <div class="flex-1 flex flex-col items-center justify-center min-h-[200px] bg-black rounded-2xl mb-6 shadow-inner relative overflow-hidden">
      <!-- Instrucción sutil -->
      <span class="absolute top-3 text-slate-600 text-[10px] font-mono uppercase tracking-widest">Optotipo Snellen</span>

      <!-- Letras de la ronda actual -->
      <Transition name="pop" mode="out-in">
        <div
          :key="currentRound"
          class="font-mono font-black tracking-[0.3em] text-white text-center select-none"
          :style="{ fontSize: currentFontSize }"
        >
          {{ currentLetters }}
        </div>
      </Transition>

      <!-- Indicador de distancia recomendada -->
      <span class="absolute bottom-3 text-slate-600 text-[10px] font-mono">Mantén el dispositivo a ~40cm</span>
    </div>

    <!-- Botones Rojo / Verde -->
    <div class="grid grid-cols-2 gap-4 mt-auto">
      <button
        @click="handleRed"
        :disabled="isProcessing"
        class="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-5 px-4 rounded-xl transition-all active:scale-95 border-2 border-red-200 flex flex-col items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <span class="text-3xl leading-none">👎</span>
        <span class="text-sm uppercase tracking-wide">No veo bien</span>
      </button>
      <button
        @click="handleGreen"
        :disabled="isProcessing"
        class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-600/30 flex flex-col items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
      >
        <span class="text-3xl leading-none">👍</span>
        <span class="text-sm uppercase tracking-wide">Sí, las veo</span>
      </button>
    </div>

    <!-- Modal Oferta Roja (cuando presiona "No veo bien") -->
    <Teleport to="body">
      <div v-if="showRedModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 text-center">
          <span class="text-5xl block mb-3">👁️</span>
          <h3 class="text-lg font-extrabold text-slate-800 leading-tight mb-3">
            Tu visión podría estar afectando tu calidad de vida
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed mb-4">
            Detectamos una dificultad para distinguir esta escala. <strong>Una corrección óptica adecuada</strong> puede devolverte el 100% de nitidez — sin costo y sin compromiso.
          </p>

          <!-- Beneficios -->
          <div class="bg-rose-50 border border-rose-100 rounded-2xl p-3 text-left space-y-1.5 text-xs text-slate-700 mb-4">
            <p>🎯 <strong>Examen Computarizado Sin Costo</strong> en Óptica Johanna, Matriz Guayaquil</p>
            <p>💬 <strong>Coordinas 100% por WhatsApp</strong> — sin llamadas, sin presión</p>
            <p>⏱️ <strong>Dura menos de 20 minutos</strong> y es completamente gratuito</p>
            <p>📍 <strong>Visita cuando puedas</strong> — sin citas urgentes</p>
          </div>

          <p class="text-[11px] text-slate-400 italic mb-4">
            Planifica tu visita a tu ritmo — no te va a costar nada y podrás ir cuando gustes
          </p>

          <!-- Reversión de riesgo -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 mb-4 flex items-center gap-2">
            <span>🔒</span>
            <span>Sin compromiso de compra. No te llamaremos por teléfono.</span>
          </div>

          <!-- Selector de turnos -->
          <label class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Elige tu horario de examen:</label>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <button
              @click="bookFromRedOffer('manana')"
              class="p-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 text-slate-800 text-xs font-bold text-center hover:bg-emerald-100 transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
            >
              <span class="text-xl">🌅</span>
              <span class="font-black">Mañana</span>
              <span class="text-slate-500 font-normal text-[11px]">10:30 – 12:30</span>
            </button>
            <button
              @click="bookFromRedOffer('tarde')"
              class="p-3 rounded-xl border-2 border-violet-400 bg-violet-50 text-slate-800 text-xs font-bold text-center hover:bg-violet-100 transition-all active:scale-95 cursor-pointer flex flex-col items-center gap-1"
            >
              <span class="text-xl">🌙</span>
              <span class="font-black">Tarde</span>
              <span class="text-slate-500 font-normal text-[11px]">15:30 – 18:00</span>
            </button>
          </div>

          <button
            @click="continueTest"
            class="w-full py-2 text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer underline"
          >
            Continuar el test de todas formas
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  finish: [score: string, turno?: string]
}>()

// === Configuración del test (2 rondas) ===
const maxRounds = 2

// Sets de letras por ronda
const letterSets = [
  ['E', 'P', 'T', 'O', 'F', 'Z'], // ronda 1 — letras grandes (16px)
  ['C', 'D', 'L', 'V', 'N', 'R'], // ronda 2 — letras pequeñas (9.5px)
]

// Tamaños de fuente por ronda (drásticamente reducidos, empezando pequeño)
const fontSizes = ['16px', '9.5px']

// === Estado ===
const currentRound = ref(1)
const isProcessing = ref(false)
const showRedModal = ref(false)
const roundLetters = ref<string[]>([]) // letras generadas al inicio

// Generar 4 letras aleatorias para la ronda actual
function generateLetters(round: number): string {
  const pool = letterSets[round - 1]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 4).join('  ')
}

// Inicializar letras para ambas rondas
roundLetters.value = [
  generateLetters(1),
  generateLetters(2),
]

const currentLetters = computed(() => roundLetters.value[currentRound.value - 1] || '')
const currentFontSize = computed(() => fontSizes[currentRound.value - 1])

// === Acciones ===

// Botón verde → continúa a siguiente ronda o finaliza con 20/20
function handleGreen() {
  if (isProcessing.value) return
  isProcessing.value = true

  setTimeout(() => {
    if (currentRound.value >= maxRounds) {
      // Completó ambas rondas viendo bien → 20/20
      emit('finish', '20/20 — Agudeza Excelente')
    } else {
      // Avanzar a la siguiente ronda
      currentRound.value++
      isProcessing.value = false
    }
  }, 300)
}

// Botón rojo → muestra modal de oferta inmediatamente
function handleRed() {
  if (isProcessing.value) return
  showRedModal.value = true
}

// Elegir turno desde el modal rojo → ir a resultado + WhatsApp
function bookFromRedOffer(turno: string) {
  showRedModal.value = false
  const score = currentRound.value === 1 ? '20/60 — Dificultad Visual Alta' : '20/40 — Dificultad Visual Moderada'
  emit('finish', score, turno)
}

// Continuar test sin agendar (desde el modal rojo)
function continueTest() {
  showRedModal.value = false
  isProcessing.value = false
  // Si falló ronda 1, igual termina (el usuario dijo que no ve)
  if (currentRound.value >= maxRounds) {
    emit('finish', '20/40 — Dificultad Visual Moderada')
  } else {
    // Pasa a ronda 2 de todas formas
    currentRound.value++
  }
}
</script>

<style scoped>
.pop-enter-active {
  animation: pop-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse;
}
@keyframes pop-in {
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
