<template>
  <div class="flex flex-col items-center text-center">
    <!-- Icono de resultado -->
    <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
      :class="isGoodVision ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'">
      <span class="text-3xl">{{ isGoodVision ? '✅' : '👓' }}</span>
    </div>

    <!-- Titular de Valor CRO -->
    <h2 class="text-xl font-black text-slate-800 mb-3 leading-snug max-w-sm">
      Tu resultado califica para 1 Examen Computarizado con Optómetra (Sin Costo) en Matriz Guayaquil
    </h2>

    <!-- Reversión Total de Riesgo -->
    <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs mb-4 text-left flex items-start gap-2 w-full max-w-sm">
      <span class="flex-shrink-0">🔒</span>
      <span class="leading-relaxed"><strong>Sin compromiso de compra.</strong> No te llamaremos por teléfono; coordinas tu cupo <strong>100% por chat</strong>, sin costo y sin formularios.</span>
    </div>

    <!-- Score obtenido -->
    <div class="inline-block rounded-2xl px-6 py-3 mb-4 border w-full max-w-sm text-left"
      :class="isGoodVision ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'">
      <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Tu agudeza visual estimada:</span>
      <span class="text-2xl font-black tracking-tight" :class="isGoodVision ? 'text-emerald-800' : 'text-amber-800'">{{ score }}</span>
    </div>

    <!-- Explicación contextual -->
    <div class="bg-blue-50 text-blue-800 p-3.5 rounded-xl text-xs text-left mb-5 border border-blue-100 w-full max-w-sm">
      <p class="mb-1.5 font-bold flex items-center gap-1.5">
        <span>💡</span> ¿Qué significa esto?
      </p>
      <p v-if="isGoodVision" class="leading-relaxed opacity-90">
        Tu visión estimada es muy buena. Para mantener tus ojos saludables y descartar fatiga visual o cambios de graduación, te recomendamos un chequeo profesional anual.
      </p>
      <p v-else class="leading-relaxed opacity-90">
        Tus resultados indican que podrías beneficiarte de lentes o una actualización de tu graduación actual. Un examen computarizado confirmará exactamente tu estado visual.
      </p>
    </div>

    <!-- Micro-selector de turnos -->
    <div class="w-full max-w-sm mb-5 text-left">
      <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Elige tu turno preferido:</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          type="button"
          @click="selectedTurno = 'manana'"
          :class="selectedTurno === 'manana'
            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 font-bold shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'"
          class="p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1"
        >
          <span class="text-2xl leading-none">🌅</span>
          <span class="text-xs font-bold">Turno Mañana</span>
          <span class="text-[11px] text-slate-500">10:30 a 12:30</span>
        </button>
        <button
          type="button"
          @click="selectedTurno = 'tarde'"
          :class="selectedTurno === 'tarde'
            ? 'bg-violet-50 border-violet-500 ring-2 ring-violet-400 text-violet-950 font-bold shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'"
          class="p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1"
        >
          <span class="text-2xl leading-none">🌙</span>
          <span class="text-xs font-bold">Turno Tarde</span>
          <span class="text-[11px] text-slate-500">15:30 a 18:00</span>
        </button>
      </div>
    </div>

    <!-- Botón CTA WhatsApp con Madeline -->
    <button
      @click="handleBook"
      class="w-full max-w-sm bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-4 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 text-base cursor-pointer"
    >
      <span class="text-xl">💬</span> Apartar mi Turno por WhatsApp
    </button>

    <p class="mt-4 text-[11px] text-slate-400 max-w-sm">
      Este test es orientativo. No reemplaza un examen profesional con optómetra.
    </p>

    <!-- Exit Intent Modal -->
    <Teleport to="body">
      <div v-if="showExitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" @click.self="showExitModal = false">
        <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-amber-300 text-center">
          <button @click="showExitModal = false" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer">
            ✕
          </button>
          <div class="text-4xl mb-3">⚠️</div>
          <h3 class="text-lg font-extrabold text-slate-800 mb-2 leading-tight">
            ¡Espera! Tu diagnóstico tiene un beneficio activo
          </h3>
          <p class="text-slate-500 mb-5 text-xs leading-relaxed">
            ¿Deseas que te enviemos tu reporte por WhatsApp para que no lo pierdas y puedas agendar tu examen computarizado sin costo cuando gustes?
          </p>
          <button
            @click="handleExitWhatsApp"
            class="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            📲 Recibir mi reporte en WhatsApp
          </button>
          <button @click="showExitModal = false" class="text-xs text-slate-400 hover:text-slate-600 mt-3 w-full py-1 cursor-pointer">
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
  const turnoTexto = turno === 'manana' ? 'de la mañana (10:30)' : 'de la tarde (15:30)'
  const msg = `¡Hola Madeline! 👋 Acabo de terminar el chequeo de agudeza visual (Score: ${props.score}) y aparté el turno ${turnoTexto} para mi examen computarizado gratuito en Matriz Guayaquil. ¿Me confirmas la dirección exacta?`
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`
}

function handleBook() {
  emit('next', selectedTurno.value)
  window.open(getWhatsAppLink(selectedTurno.value), '_blank')
}

function handleExitWhatsApp() {
  const msg = `¡Hola Madeline! 👋 Acabo de hacer el test de agudeza visual en la web (Score: ${props.score}). Me gustaría recibir mi reporte y agendar mi examen computarizado gratuito en Matriz Guayaquil cuando pueda.`
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
