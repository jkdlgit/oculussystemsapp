<template>
  <div class="flex flex-col h-full">
    <!-- Indicador de Progreso y Gamificación -->
    <div class="mb-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-500 font-bold text-sm tracking-wide">Progreso: {{ currentRound }}/{{ maxRounds }}</span>
        <div class="flex items-center gap-2">
          <Transition name="pop">
            <span v-if="streak >= 2" class="text-orange-500 font-bold text-sm bg-orange-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              🔥 Racha x{{ streak }}
            </span>
          </Transition>
          <span class="text-indigo-600 font-black text-sm bg-indigo-50 px-2 py-0.5 rounded-full">
            ⭐ {{ puntuacion }} pts
          </span>
        </div>
      </div>
      
      <!-- Barra de Progreso Visual con Iconos -->
      <div class="flex gap-1 h-2">
        <div 
          v-for="i in maxRounds" :key="i"
          :class="[
            'flex-1 rounded-full transition-colors duration-300 relative',
            i < currentRound ? (roundResults[i-1] ? 'bg-emerald-500' : 'bg-red-400') : (i === currentRound ? 'bg-blue-400 animate-pulse' : 'bg-slate-200')
          ]"
        >
        </div>
      </div>
      
      <p class="text-center text-xs text-slate-400 font-medium mt-2 h-4 transition-all duration-300">
        <span v-if="feedback === 'success'" class="text-emerald-600 font-bold">¡Excelente! Sigue así.</span>
        <span v-else-if="feedback === 'error'" class="text-red-500 font-bold">No te preocupes, intentemos con otra.</span>
        <span v-else-if="streak >= 3" class="text-orange-500 font-bold">¡Vas invicto, visión de águila! 🦅</span>
        <span v-else>¿Puedes identificar la letra?</span>
      </p>
    </div>

    <!-- Área de Visualización de Letra -->
    <div class="flex-1 flex flex-col items-center justify-center min-h-[180px] bg-white rounded-2xl border-2 border-slate-200 mb-6 relative overflow-hidden shadow-sm">
      
      <!-- Feedback Overlay -->
      <Transition name="fade-fast">
        <div v-if="feedback" class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <span v-if="feedback === 'success'" class="text-7xl drop-shadow-md">✅</span>
          <span v-if="feedback === 'error'" class="text-7xl drop-shadow-md">❌</span>
        </div>
      </Transition>

      <div 
        :class="[
          'font-mono font-black leading-none select-none transition-all duration-300 flex items-center justify-center',
          feedback === 'success' ? 'text-emerald-600' : (feedback === 'error' ? 'text-red-500' : 'text-black')
        ]"
        :style="{ fontSize: `${currentSize}px`, height: '100px' }"
      >
        <Transition name="pop" mode="out-in">
          <span :key="currentLetter + currentRound">{{ currentLetter }}</span>
        </Transition>
      </div>
    </div>

    <!-- Control de Tamaño (Slider Manual) -->
    <div class="mb-6 px-2 bg-slate-50 p-4 rounded-xl border border-slate-100 relative group">
      <!-- Pulso animado detrás del slider para llamar la atención -->
      <div v-if="showSliderPulse" class="absolute inset-0 border-2 border-blue-400 rounded-xl animate-ping opacity-20 pointer-events-none"></div>
      
      <div class="flex justify-between text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">
        <span class="flex items-center gap-1"><span class="text-lg leading-none">A</span> Grande</span>
        <span class="flex items-center gap-1">Pequeña <span class="text-xs leading-none">A</span></span>
      </div>
      
      <input 
        type="range" 
        min="1" 
        max="10" 
        v-model.number="currentStep"
        @input="onManualSliderMove"
        class="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <p class="text-center text-[10px] text-slate-400 mt-2">Puedes ajustar el tamaño manualmente</p>
    </div>

    <!-- Controles (Botones Grandes) -->
    <div class="grid grid-cols-2 gap-4 mt-auto">
      <button
        @click="handleAnswer(false)"
        :disabled="isProcessing"
        class="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-5 px-4 rounded-xl transition-all active:scale-95 border-2 border-red-200 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
      >
        <span class="text-3xl leading-none">👎</span>
        <span class="text-sm uppercase tracking-wide">No veo bien</span>
      </button>
      <button
        @click="handleAnswer(true)"
        :disabled="isProcessing"
        class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-5 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-600/30 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
      >
        <span class="text-3xl leading-none">👍</span>
        <span class="text-sm uppercase tracking-wide">Sí, la veo clara</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['finish'])

// Optotipos típicos de Snellen
const letters = ['C', 'D', 'E', 'F', 'L', 'N', 'O', 'P', 'T', 'Z']

// Escala de pasos: { step: number, px: number, score: string }
const scale = [
  { step: 1, px: 96, score: '20/200' },
  { step: 2, px: 84, score: '20/100' },
  { step: 3, px: 72, score: '20/80' },
  { step: 4, px: 60, score: '20/60' },
  { step: 5, px: 48, score: '20/50' },
  { step: 6, px: 36, score: '20/40' },
  { step: 7, px: 28, score: '20/30' },
  { step: 8, px: 20, score: '20/25' },
  { step: 9, px: 16, score: '20/20' }, // Visión normal
  { step: 10, px: 12, score: '20/15' }, // Visión excelente
]

const maxSteps = scale.length
const maxRounds = 10

const currentRound = ref(1)
const currentStep = ref(1) // Inicia en la letra más grande
const currentLetter = ref('')

const streak = ref(0)
const puntuacion = ref(0)
const bestStep = ref(0) // Rastrea el nivel más alto (más pequeño) donde acertó
const roundResults = ref<boolean[]>([]) // true = acierto, false = fallo

const feedback = ref<'success' | 'error' | null>(null)
const isProcessing = ref(false)
const showSliderPulse = ref(true)

const currentSize = computed(() => {
  const stepObj = scale.find(s => s.step === currentStep.value)
  return stepObj ? stepObj.px : 96
})

function getRandomLetter() {
  let newLetter = currentLetter.value
  while (newLetter === currentLetter.value) {
    newLetter = letters[Math.floor(Math.random() * letters.length)]
  }
  return newLetter
}

function nextRound() {
  currentLetter.value = getRandomLetter()
}

function onManualSliderMove() {
  // Cuando el usuario interactúa, quitamos la animación de pulso
  showSliderPulse.value = false
}

function handleAnswer(canSee: boolean) {
  if (isProcessing.value) return
  isProcessing.value = true

  // Ocultar pulso si responden sin tocar el slider
  showSliderPulse.value = false

  // Registrar resultado
  roundResults.value.push(canSee)

  if (canSee) {
    feedback.value = 'success'
    streak.value++
    puntuacion.value += currentStep.value * 10 * streak.value
    if (currentStep.value > bestStep.value) {
      bestStep.value = currentStep.value
    }
  } else {
    feedback.value = 'error'
    streak.value = 0
  }

  // Esperar 0.5s para mostrar el feedback visual antes de pasar a la siguiente
  setTimeout(() => {
    feedback.value = null
    
    if (currentRound.value >= maxRounds) {
      // Fin de la prueba
      concluirPrueba()
    } else {
      // Ajuste automático del slider para la siguiente ronda
      if (canSee) {
        if (currentStep.value < maxSteps) currentStep.value++
      } else {
        if (currentStep.value > 1) currentStep.value--
      }
      
      currentRound.value++
      nextRound()
      isProcessing.value = false
    }
  }, 600) // 600ms para asegurar que la animación se vea bien
}

function concluirPrueba() {
  // El score se basa en el mejor acierto (bestStep)
  let finalScore = '> 20/200'
  if (bestStep.value > 0) {
    const stepObj = scale.find(s => s.step === bestStep.value)
    if (stepObj) finalScore = stepObj.score
  }
  emit('finish', finalScore)
}

onMounted(() => {
  nextRound()
})
</script>

<style scoped>
.pop-enter-active {
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-leave-active {
  animation: pop-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse;
}
@keyframes pop-in {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}
.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}

/* Estilos personalizados para el range slider en navegadores webkit */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  margin-top: -6px; /* Para centrarlo si el track es más delgado */
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.4);
  border: 2px solid white;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 12px;
  cursor: pointer;
  background: #e2e8f0;
  border-radius: 8px;
}
</style>
