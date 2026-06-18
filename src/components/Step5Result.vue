<template>
  <div class="text-center">
    <!-- Success state after booking -->
    <div v-if="booked" class="flex flex-col items-center">
      <div class="w-20 h-20 bg-brand-success/10 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">✅</span>
      </div>
      <h2 class="text-2xl font-bold text-brand-dark mb-4">¡Cita agendada!</h2>
      <p class="text-slate-500 mb-8 max-w-md">
        Gracias por confiar en nosotros. Un asesor se comunicará contigo en las próximas 24 horas para confirmar tu cita. Revisa tu WhatsApp.
      </p>
      <button @click="$emit('restart')" class="btn-primary max-w-xs">
        Volver al inicio
      </button>
    </div>

    <!-- Ya agendó recientemente -->
    <div v-else-if="alreadySubmitted" class="flex flex-col items-center">
      <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">⏳</span>
      </div>
      <h2 class="text-2xl font-bold text-brand-dark mb-4">Ya tienes una cita pendiente</h2>
      <p class="text-slate-500 mb-4 max-w-md leading-relaxed">
        Detectamos que ya solicitaste una cita desde este dispositivo hace menos de 24 horas. Un asesor ya está en camino de contactarte.
      </p>
      <p class="text-slate-400 text-sm mb-8 max-w-sm">
        Si no has recibido respuesta, escríbenos directamente por WhatsApp.
      </p>
      <button @click="$emit('restart')" class="btn-primary max-w-xs">
        Volver al inicio
      </button>
    </div>

    <!-- Result state -->
    <div v-else class="flex flex-col items-center">
      <div class="w-20 h-20 bg-brand-teal/10 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">🩺</span>
      </div>
      <h2 class="text-2xl font-bold text-brand-dark mb-4">¡Listo! Este es tu resultado</h2>

      <div class="bg-white border-2 border-slate-100 rounded-2xl p-6 mb-8 text-left max-w-md shadow-sm">
        <p class="text-brand-dark leading-relaxed">{{ resultMessage }}</p>
      </div>

      <button
        @click="handleBook"
        class="btn-primary max-w-xs flex items-center justify-center gap-2"
        :disabled="submitting"
      >
        <span v-if="submitting" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <span v-else>📅 Agendar mi cita gratuita</span>
      </button>

      <p v-if="submitError" class="text-red-500 text-sm mt-4 max-w-sm">{{ submitError }}</p>

      <p class="mt-6 text-xs text-slate-400 max-w-sm">
        Este test es orientativo y no reemplaza un examen profesional completo.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { QuizData } from '@/types'
import { supabase, hasSupabaseConfig } from '@/supabase'

// ─── Constante de cooldown ──────────────────────────────────────────────────
// Tiempo mínimo entre envíos desde el mismo dispositivo (en milisegundos).
const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 horas
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

// ─── Verificar si ya envió recientemente ────────────────────────────────────
onMounted(() => {
  const lastSubmission = localStorage.getItem(STORAGE_KEY)
  if (lastSubmission) {
    const elapsed = Date.now() - parseInt(lastSubmission, 10)
    if (elapsed < COOLDOWN_MS) {
      alreadySubmitted.value = true
    }
  }
})

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

  if (!hasSupabaseConfig) {
    console.error('Supabase is not configured. Please check your .env variables.')
    submitError.value = 'El servicio de agendamiento no está disponible porque la base de datos (Supabase) no está configurada.'
    submitting.value = false
    return
  }

  try {
    const { error } = await supabase.from('leads').insert({
      nombre: props.quizData.nombre,
      telefono: props.quizData.telefono,
      edad: props.quizData.edad,
      respuestas: {
        sintomas: props.quizData.sintomas,
        vision_lejos: props.quizData.visionLejos,
        vision_cerca: props.quizData.visionCerca,
        problemas_colores: props.quizData.problemasColores,
        detalle_colores: props.quizData.detalleColores,
      },
      resultado: resultMessage.value,
      utm_source: props.quizData.utmSource || null,
      utm_medium: props.quizData.utmMedium || null,
      utm_campaign: props.quizData.utmCampaign || null,
      estado: 'Nuevo',
    })

    if (error) {
      console.error('Supabase error:', error)
      submitError.value = 'Hubo un error al agendar tu cita. Por favor intenta de nuevo.'
    } else {
      // ─── Guardar timestamp en localStorage ──────────────────────────────
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
      booked.value = true
    }
  } catch (err) {
    console.error('Submit error:', err)
    submitError.value = 'Hubo un error de conexión. Por favor intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}
</script>
