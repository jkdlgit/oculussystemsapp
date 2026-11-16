<template>
  <div class="text-center">
    <!-- Success state after booking -->
    <div v-if="booked" class="flex flex-col items-center">
      <div class="w-20 h-20 bg-brand-success/10 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">✅</span>
      </div>
      <h2 class="text-2xl font-bold text-brand-dark mb-4">¡Turno apartado con éxito!</h2>
      <p class="text-slate-500 mb-6 max-w-md leading-relaxed text-sm">
        Tu turno <strong>{{ selectedTurno === 'manana' ? 'de la Mañana (10:30 a 12:30)' : 'de la Tarde (15:30 a 18:00)' }}</strong> ha sido reservado. Si no se abrió WhatsApp automáticamente, haz clic abajo para coordinar con Madeline.
      </p>

      <a :href="whatsappLink" target="_blank" @click="handleWhatsAppClick" class="btn-primary w-full max-w-xs flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white mb-4 shadow-lg shadow-[#25D366]/30 py-3.5 rounded-xl font-bold">
        <span class="text-xl">💬</span> Abrir WhatsApp con Madeline
      </a>

      <button @click="$emit('restart')" class="text-xs text-slate-400 underline hover:text-slate-600 mt-2 cursor-pointer">
        Volver a realizar el chequeo
      </button>
    </div>

    <!-- Ya agendó recientemente -->
    <div v-else-if="alreadySubmitted" class="flex flex-col items-center">
      <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">⏳</span>
      </div>
      <h2 class="text-2xl font-bold text-brand-dark mb-4">Ya tienes una cita pendiente</h2>
      <p class="text-slate-500 mb-4 max-w-md leading-relaxed text-sm">
        Detectamos que ya solicitaste una cita desde este dispositivo recientemente. Coordinemos directamente por WhatsApp.
      </p>
      
      <a :href="whatsappLink" target="_blank" @click="handleWhatsAppClick" class="btn-primary w-full max-w-xs flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white mb-4 shadow-lg shadow-[#25D366]/30 py-3.5 rounded-xl font-bold">
        <span class="text-xl">💬</span> Hablar con Madeline por WhatsApp
      </a>

      <button @click="$emit('restart')" class="text-xs text-slate-400 underline hover:text-slate-600 mt-2 cursor-pointer">
        Volver al inicio
      </button>
    </div>

    <!-- Result state (CRO Optimizado) -->
    <div v-else class="flex flex-col items-center">
      <!-- Icono y Titular de Valor -->
      <div class="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mb-4">
        <span class="text-3xl">🩺</span>
      </div>

      <h2 class="text-xl sm:text-2xl font-black text-brand-dark mb-3 leading-snug max-w-md">
        Tu resultado califica para 1 Examen Computarizado con Optómetra (Sin Costo) en Matriz Guayaquil
      </h2>

      <!-- Reversión Total de Riesgo -->
      <div class="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs mb-4 text-left flex items-start gap-2.5 max-w-md w-full">
        <span class="text-base flex-shrink-0">🔒</span>
        <span class="leading-relaxed"><strong>Sin compromiso de compra.</strong> No te llamaremos por teléfono; coordinas tu cupo <strong>100% por chat</strong> sin costo ni formularios adicionales.</span>
      </div>

      <!-- Diagnóstico Preliminar -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-5 text-left max-w-md w-full shadow-sm">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Diagnóstico preliminar:</span>
        <p class="text-slate-800 leading-relaxed text-sm font-medium">{{ resultMessage }}</p>
      </div>

      <!-- Micro-selector táctil de 2 horarios de 1 toque -->
      <div class="w-full max-w-md mb-5 text-left">
        <label class="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Elige tu turno preferido:</label>
        <div class="grid grid-cols-2 gap-3">
          <button
            type="button"
            @click="selectedTurno = 'manana'"
            :class="selectedTurno === 'manana'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-bold shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'"
            class="p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <span class="text-2xl leading-none">🌅</span>
            <span class="text-xs font-bold">Turno Mañana</span>
            <span class="text-[11px] text-slate-500">10:30 a 12:30</span>
          </button>
          <button
            type="button"
            @click="selectedTurno = 'tarde'"
            :class="selectedTurno === 'tarde'
              ? 'bg-violet-50 border-violet-500 text-violet-950 ring-2 ring-violet-400 font-bold shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300'"
            class="p-3.5 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <span class="text-2xl leading-none">🌙</span>
            <span class="text-xs font-bold">Turno Tarde</span>
            <span class="text-[11px] text-slate-500">15:30 a 18:00</span>
          </button>
        </div>
      </div>

      <!-- Botón Cierre WhatsApp -->
      <button
        @click="handleBook"
        class="btn-primary w-full max-w-md flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white py-4 rounded-xl text-base font-bold shadow-lg shadow-[#25D366]/30 transition-all cursor-pointer active:scale-[0.98]"
        :disabled="submitting"
      >
        <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <template v-else>
          <span class="text-xl">💬</span> Apartar mi Turno por WhatsApp
        </template>
      </button>

      <p v-if="submitError" class="text-red-500 text-xs mt-3 max-w-sm">{{ submitError }}</p>

      <p class="mt-5 text-[11px] text-slate-400 max-w-sm">
        Este test es orientativo y no reemplaza un examen profesional completo con optómetra.
      </p>
    </div>

    <!-- Exit Intent Modal (Salva-fugas) -->
    <Teleport to="body">
      <div v-if="showExitPopup" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" @click.self="showExitPopup = false">
        <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative border border-amber-300 text-center animate-fade-in">
          <button @click="showExitPopup = false" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer">
            ✕
          </button>
          <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-3 mx-auto text-3xl">
            ⚠️
          </div>
          <h3 class="text-lg font-extrabold text-slate-800 mb-2 leading-tight">
            ¡Espera! Tu diagnóstico tiene un beneficio activo
          </h3>
          <p class="text-slate-500 mb-5 leading-relaxed text-xs">
            ¿Deseas que te enviemos tu reporte por WhatsApp para que no lo pierdas y puedas agendar tu examen computarizado sin costo cuando gustes?
          </p>
          <a :href="exitWhatsappLink" target="_blank" @click="handleExitWhatsAppClick(); showExitPopup = false" class="btn-primary w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#25D366]/30">
            <span class="text-lg">📲</span> Recibir mi reporte en WhatsApp
          </a>
          <button @click="showExitPopup = false" class="text-xs text-slate-400 hover:text-slate-600 transition-colors mt-3 w-full py-1 cursor-pointer">
            No, seguir revisando
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { QuizData } from '@/types'
import { supabase, hasSupabaseConfig } from '@/supabase'
import { config } from '@/config'

const COOLDOWN_MS = 1 * 1 * 1 * 1
const STORAGE_KEY = 'oculus_last_submission'

const props = defineProps<{
  quizData: QuizData
}>()

const emit = defineEmits<{
  restart: []
}>()

const booked = ref(false)
const submitting = ref(false)
const submitError = ref('')
const alreadySubmitted = ref(false)
const showExitPopup = ref(false)
const currentLeadId = ref<number | null>(null)
const selectedTurno = ref<'manana' | 'tarde'>('manana')

let idleTimer: ReturnType<typeof setTimeout> | null = null

const whatsappLink = computed(() => {
  const turnoTexto = selectedTurno.value === 'manana' ? 'de la mañana (10:30)' : 'de la tarde (15:30)'
  const msg = `¡Hola Madeline! 👋 Acabo de terminar el chequeo visual en la web y aparté el turno ${turnoTexto} para mi examen computarizado gratuito en Matriz Guayaquil. ¿Me confirmas la dirección exacta?`
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`
})

const exitWhatsappLink = computed(() => {
  const msg = `¡Hola Madeline! 👋 Acabo de hacer el chequeo visual en la web. Mi diagnóstico: ${resultMessage.value.slice(0, 100)}... Me gustaría recibir mi reporte completo y apartar mi examen computarizado sin costo en Matriz Guayaquil.`
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(msg)}`
})

// Exit Intent Detectors
const resetIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer)
  if (!booked.value && !alreadySubmitted.value && !showExitPopup.value) {
    idleTimer = setTimeout(() => {
      showExitPopup.value = true
    }, 7000)
  }
}

const handleMouseLeave = (e: MouseEvent) => {
  if (e.clientY <= 0 && !booked.value && !alreadySubmitted.value && !submitting.value && !showExitPopup.value) {
    showExitPopup.value = true
  }
}

const handlePopState = () => {
  if (!booked.value && !alreadySubmitted.value && !showExitPopup.value) {
    showExitPopup.value = true
    history.pushState(null, '', location.href)
  }
}

onMounted(async () => {
  document.addEventListener('mouseleave', handleMouseLeave)
  document.addEventListener('mousemove', resetIdleTimer)
  document.addEventListener('click', resetIdleTimer)
  document.addEventListener('keydown', resetIdleTimer)
  history.pushState(null, '', location.href)
  window.addEventListener('popstate', handlePopState)
  resetIdleTimer()

  const lastSubmission = localStorage.getItem(STORAGE_KEY)
  if (lastSubmission) {
    const elapsed = Date.now() - parseInt(lastSubmission, 10)
    if (elapsed < COOLDOWN_MS) {
      alreadySubmitted.value = true
      return
    }
  }

  await saveLeadImmediately()
})

onUnmounted(() => {
  document.removeEventListener('mouseleave', handleMouseLeave)
  document.removeEventListener('mousemove', resetIdleTimer)
  document.removeEventListener('click', resetIdleTimer)
  document.removeEventListener('keydown', resetIdleTimer)
  window.removeEventListener('popstate', handlePopState)
  if (idleTimer) clearTimeout(idleTimer)
})

async function saveLeadImmediately() {
  if (!hasSupabaseConfig) return

  const payload = {
    nombre: props.quizData.nombre || 'Visitante',
    telefono: props.quizData.telefono || '',
    edad: props.quizData.edad ?? 0,
    respuestas: {
      sintomas: props.quizData.sintomas,
      vision_lejos: props.quizData.visionLejos,
      vision_cerca: props.quizData.visionCerca,
      problemas_colores: props.quizData.problemasColores,
      detalle_colores: props.quizData.detalleColores,
      turno_inicial: selectedTurno.value,
    },
    resultado: resultMessage.value,
    utm_source: props.quizData.utmSource || null,
    utm_medium: props.quizData.utmMedium || null,
    utm_campaign: props.quizData.utmCampaign || null,
    estado: 'Viendo Resultados',
    owner: props.quizData.owner || 'publicidad',
  }

  try {
    if (props.quizData.leadId) {
      currentLeadId.value = props.quizData.leadId
      await supabase.from('leads').update(payload).eq('id', currentLeadId.value)
    } else {
      const response = await supabase.from('leads').insert(payload).select('id').single()
      if (!response.error && response.data) {
        currentLeadId.value = response.data.id
      }
    }
  } catch (err) {
    console.error('[DEBUG-BOOK] Error guardando registro inicial', err)
  }
}

const resultMessage = computed(() => {
  const { sintomas, visionLejos, visionCerca, problemasColores } = props.quizData
  const sintomasCount = sintomas.filter(s => s !== 'ninguna').length
  const hasVisionProblem = visionLejos === 'mucho' || visionCerca === 'mucho'
  const hasColorProblem = problemasColores === 'si'
  const hasSymptomsAndVision = sintomasCount >= 1 && hasVisionProblem

  if (hasColorProblem) {
    return 'Has indicado dificultades para distinguir algunos colores. Esto es más común de lo que crees y tiene solución. Contamos con lentes especiales que pueden ayudarte. Agenda tu cita y ven a probarlos.'
  }

  if (hasSymptomsAndVision) {
    return 'Tus respuestas indican que podrías beneficiarte de un examen visual completo. Es posible que necesites una nueva graduación o un ajuste en tus lentes actuales. Agenda tu cita y descubre cómo podemos ayudarte a ver mejor.'
  }

  if (sintomasCount >= 3) {
    return 'Tus ojos están mostrando señales de fatiga visual importante. Te recomendamos agendar una revisión profesional para descartar problemas mayores y encontrar la mejor solución para ti.'
  }

  if (hasVisionProblem) {
    return 'Parece que tu graduación actual podría no estar funcionando como debería. Un examen visual completo te dará la claridad que necesitas. Agenda tu cita y empecemos a ver mejor.'
  }

  return '¡Excelentes noticias! Tu vista parece estar en buen estado. Sin embargo, recomendamos un chequeo visual anual para mantener tus ojos saludables. Agenda tu cita y disfruta de la tranquilidad de saber que tus ojos están bien.'
})

async function handleBook() {
  submitting.value = true
  submitError.value = ''

  const turnoTexto = selectedTurno.value === 'manana' ? 'Mañana (10:30 a 12:30)' : 'Tarde (15:30 a 18:00)'

  const payload = {
    nombre: props.quizData.nombre || 'Visitante',
    telefono: props.quizData.telefono || '',
    edad: props.quizData.edad ?? 0,
    respuestas: {
      sintomas: props.quizData.sintomas,
      vision_lejos: props.quizData.visionLejos,
      vision_cerca: props.quizData.visionCerca,
      problemas_colores: props.quizData.problemasColores,
      detalle_colores: props.quizData.detalleColores,
      turno: selectedTurno.value,
      turno_texto: turnoTexto,
    },
    resultado: resultMessage.value,
    utm_source: props.quizData.utmSource || null,
    utm_medium: props.quizData.utmMedium || null,
    utm_campaign: props.quizData.utmCampaign || null,
    estado: 'Agendado',
    estado_cita: 'Nueva',
    owner: props.quizData.owner || 'publicidad',
  }

  try {
    if (hasSupabaseConfig) {
      if (currentLeadId.value) {
        await supabase
          .from('leads')
          .update({
            estado: 'Agendado',
            estado_cita: 'Nueva',
            respuestas: payload.respuestas,
          })
          .eq('id', currentLeadId.value)
      } else {
        const response = await supabase.from('leads').insert(payload).select('id').single()
        if (response.data) currentLeadId.value = response.data.id
      }
    }

    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    booked.value = true
    ;(window as any).pulso?.booking({ action: 'agendar_cita', turno: selectedTurno.value })

    // Abrir WhatsApp con el mensaje estructurado para Madeline
    window.open(whatsappLink.value, '_blank')
  } catch (err: any) {
    console.error('[DEBUG-BOOK] Excepción capturada en handleBook:', err)
    window.open(whatsappLink.value, '_blank')
    booked.value = true
  } finally {
    submitting.value = false
  }
}

function handleWhatsAppClick() {
  ;(window as any).pulso?.booking({ action: 'whatsapp_click', turno: selectedTurno.value })
  if (!booked.value && currentLeadId.value && hasSupabaseConfig) {
    supabase.from('leads')
      .update({ estado: 'Agendado', estado_cita: 'Nueva' })
      .eq('id', currentLeadId.value)
      .then(() => {
        booked.value = true
        localStorage.setItem(STORAGE_KEY, Date.now().toString())
      })
  }
}

function handleExitWhatsAppClick() {
  ;(window as any).pulso?.booking({ action: 'exit_intent_whatsapp_report' })
  if (currentLeadId.value && hasSupabaseConfig) {
    supabase.from('leads')
      .update({ estado: 'Reporte Solicitado Exit' })
      .eq('id', currentLeadId.value)
  }
}
</script>
