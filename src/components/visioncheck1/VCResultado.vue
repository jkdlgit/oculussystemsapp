<template>
  <div class="flex flex-col items-center text-center">

    <!-- Icono -->
    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
      :class="isGoodVision ? 'bg-emerald-100' : 'bg-amber-100'">
      <span class="text-3xl">{{ isGoodVision ? '✅' : '👓' }}</span>
    </div>

    <!-- Encabezado directo — 26px+ -->
    <h2 class="text-[26px] sm:text-3xl font-black text-slate-900 mb-3 leading-tight max-w-sm">
      Hemos analizado tu agudeza visual.
    </h2>

    <!-- Score — visible y claro -->
    <div class="rounded-2xl px-5 py-3 mb-4 border w-full max-w-sm text-left"
      :class="isGoodVision ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'">
      <span class="text-sm font-bold uppercase tracking-wider text-slate-500 block mb-1">Tu agudeza visual estimada:</span>
      <span class="text-2xl font-black tracking-tight" :class="isGoodVision ? 'text-emerald-800' : 'text-amber-800'">{{ score }}</span>
    </div>

    <!-- Cuerpo informativo — 18px, interlineado 1.6 -->
    <p class="text-[18px] leading-[1.6] text-slate-700 mb-5 max-w-sm text-left">
      Tu puntaje indica que tus ojos necesitan una revisión presencial para evitar fatiga o pérdida de enfoque.<br><br>
      <strong class="text-slate-900">Da clic abajo</strong> para enviar automáticamente tu test a nuestro especialista en Guayaquil y elegir tu hora.
    </p>

    <!-- Selector de turno táctil — botones grandes -->
    <div class="w-full max-w-sm mb-6 text-left">
      <p class="text-base font-bold text-slate-700 mb-3">Elige cuándo quieres venir:</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          @click="selectedTurno = 'manana'"
          :class="selectedTurno === 'manana'
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 font-bold shadow-md'
            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'"
          class="p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 min-h-[80px]"
        >
          <span class="text-3xl leading-none">🌅</span>
          <span class="text-base font-bold">Mañana</span>
          <span class="text-sm text-slate-500 font-medium">10:30 a 12:30</span>
        </button>
        <button
          type="button"
          @click="selectedTurno = 'tarde'"
          :class="selectedTurno === 'tarde'
            ? 'bg-violet-50 border-violet-500 ring-2 ring-violet-400 text-violet-950 font-bold shadow-md'
            : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'"
          class="p-4 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 min-h-[80px]"
        >
          <span class="text-3xl leading-none">🌙</span>
          <span class="text-base font-bold">Tarde</span>
          <span class="text-sm text-slate-500 font-medium">15:30 a 18:00</span>
        </button>
      </div>
    </div>

    <!-- CTA Principal — botón masivo, 56px+ de altura, ancho completo -->
    <button
      @click="handleBook"
      class="w-full max-w-sm bg-[#25D366] hover:bg-[#1ebe57] active:scale-[0.98] text-white min-h-[56px] rounded-2xl text-[18px] font-black shadow-xl shadow-[#25D366]/40 transition-all cursor-pointer border-none flex items-center justify-center gap-3"
    >
      <span class="text-2xl">💬</span> Enviar mi resultado y apartar mi cita
    </button>

    <!-- Micro-texto de confianza -->
    <p class="mt-3 text-sm text-slate-500 leading-relaxed max-w-sm text-center">
      🔒 Tu resultado es confidencial. Escríbenos y te asignamos horario inmediato en nuestra óptica en Guayaquil, sin filas de espera.
    </p>

    <!-- Exit Intent Modal -->
    <Teleport to="body">
      <div v-if="showExitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="showExitModal = false">
        <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-amber-300 text-center">
          <button @click="showExitModal = false" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">
            ✕
          </button>
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="text-xl font-extrabold text-slate-800 mb-2 leading-tight">
            ¡Espera! Tu diagnóstico tiene un beneficio activo
          </h3>
          <p class="text-slate-500 mb-5 text-base leading-relaxed">
            ¿Deseas que te enviemos tu reporte por WhatsApp para que no lo pierdas?
          </p>
          <button
            @click="handleExitWhatsApp"
            class="w-full min-h-[56px] rounded-2xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-black text-[18px] flex items-center justify-center gap-2 cursor-pointer"
          >
            📲 Recibir mi reporte en WhatsApp
          </button>
          <button @click="showExitModal = false" class="text-sm text-slate-400 hover:text-slate-600 mt-4 w-full py-1 cursor-pointer">
            No, seguir revisando
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { config } from '@/config'

const props = defineProps<{
  score: string
  initialTurno?: string
}>()

const emit = defineEmits(['next'])

const selectedTurno = ref<'manana' | 'tarde'>(
  (props.initialTurno as 'manana' | 'tarde') || 'manana'
)
const showExitModal = ref(false)
let idleTimer: ReturnType<typeof setTimeout> | null = null

const isGoodVision = computed(() => {
  return props.score.startsWith('20/15') || props.score.startsWith('20/20') || props.score.startsWith('20/25')
})

function getWhatsAppLink(turno: string) {
  const turnoTexto = turno === 'manana' ? 'de la mañana (10:30 a 12:30)' : 'de la tarde (15:30 a 18:00)'
  const msg = `Hola, acabo de terminar mi Quiz 2 en la web de Óptica Johanna. Mi resultado muestra que necesito revisión visual y quiero apartar una cita ${turnoTexto}.`
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`
}

function handleBook() {
  emit('next', selectedTurno.value)
  window.open(getWhatsAppLink(selectedTurno.value), '_blank')
}

function handleExitWhatsApp() {
  const msg = `Hola, acabo de terminar mi Quiz 2 en la web de Óptica Johanna. Mi resultado muestra que necesito revisión visual y quiero apartar una cita.`
  const link = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`
  window.open(link, '_blank')
  showExitModal.value = false
}

// Exit intent
const resetIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer)
  if (!showExitModal.value) {
    idleTimer = setTimeout(() => { showExitModal.value = true }, 7000)
  }
}
const handleMouseLeave = (e: MouseEvent) => {
  if (e.clientY <= 0 && !showExitModal.value) showExitModal.value = true
}

onMounted(() => {
  document.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('mousemove', resetIdleTimer)
  document.addEventListener('click', resetIdleTimer)
  resetIdleTimer()
})

onUnmounted(() => {
  document.removeEventListener('mouseleave', handleMouseLeave)
  document.removeEventListener('mousemove', resetIdleTimer)
  document.removeEventListener('click', resetIdleTimer)
  if (idleTimer) clearTimeout(idleTimer)
})
</script>

