<template>
  <div class="text-center">
    <!-- Success state after booking -->
    <div v-if="booked" class="flex flex-col items-center">
      <div class="w-20 h-20 bg-brand-success/10 rounded-full flex items-center justify-center mb-6">
        <span class="text-4xl">✅</span>
      </div>
      <h2 class="text-2xl font-bold text-brand-dark mb-4">¡Cita agendada!</h2>
      <p class="text-slate-500 mb-6 max-w-md">
        Gracias por confiar en nosotros. Un asesor se comunicará contigo en las próximas 24 horas para confirmar tu cita.
      </p>

      <a :href="whatsappLink" target="_blank" class="btn-primary w-full max-w-xs flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white mb-4 shadow-lg shadow-[#25D366]/30">
        <span class="text-xl">💬</span> Hablar con el especialista
      </a>

      <button @click="$emit('restart')" class="text-sm text-slate-400 underline hover:text-slate-600 mt-2">
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
      <p class="text-slate-400 text-sm mb-6 max-w-sm">
        Si no has recibido respuesta, escríbenos directamente por WhatsApp.
      </p>
      
      <a :href="whatsappLink" target="_blank" class="btn-primary w-full max-w-xs flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white mb-4 shadow-lg shadow-[#25D366]/30">
        <span class="text-xl">💬</span> Hablar por WhatsApp
      </a>

      <button @click="$emit('restart')" class="text-sm text-slate-400 underline hover:text-slate-600 mt-2">
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

    <!-- Exit Intent Popup -->
    <div v-if="showExitPopup" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative">
        <button @click="showExitPopup = false" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors">
          ✕
        </button>
        <div class="w-16 h-16 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-4 mx-auto">
          <span class="text-3xl">👋</span>
        </div>
        <h3 class="text-xl font-bold text-brand-dark mb-2">¡Espera un momento!</h3>
        <p class="text-slate-500 mb-6 leading-relaxed text-sm">
          Antes de irte, si tienes dudas sobre tus resultados, puedes conversarlas directamente con uno de nuestros especialistas vía WhatsApp. ¡Es rápido y sin compromiso!
        </p>
        <a :href="whatsappLink" target="_blank" @click="showExitPopup = false" class="btn-primary w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5a] border-none text-white mb-3 shadow-lg shadow-[#25D366]/30">
          <span class="text-xl">💬</span> Consultar ahora
        </a>
        <button @click="showExitPopup = false" class="text-sm text-slate-400 underline hover:text-slate-600 transition-colors mt-2">
          Quizás más tarde
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { QuizData } from '@/types'
import { supabase, hasSupabaseConfig } from '@/supabase'
import { config } from '@/config'

// ─── Constante de cooldown ──────────────────────────────────────────────────
// Tiempo mínimo entre envíos desde el mismo dispositivo (en milisegundos).
const COOLDOWN_MS = 1 * 1 * 1 * 1 // Test value, replace for prod
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

const whatsappLink = computed(() => {
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`
})

// Exit Intent Detectors
const handleMouseLeave = (e: MouseEvent) => {
  if (e.clientY <= 0 && !booked.value && !alreadySubmitted.value && !submitting.value && !showExitPopup.value) {
    showExitPopup.value = true
  }
}

const handlePopState = (e: PopStateEvent) => {
  if (!booked.value && !alreadySubmitted.value && !showExitPopup.value) {
    showExitPopup.value = true
    history.pushState(null, '', location.href) // prevent back navigation
  }
}

// ─── Verificar si ya envió recientemente y guardar lead inicial ───────────
onMounted(async () => {
  // Configurar detectores de intención de salida
  document.addEventListener('mouseleave', handleMouseLeave)
  history.pushState(null, '', location.href)
  window.addEventListener('popstate', handlePopState)

  const lastSubmission = localStorage.getItem(STORAGE_KEY)
  if (lastSubmission) {
    const elapsed = Date.now() - parseInt(lastSubmission, 10)
    if (elapsed < COOLDOWN_MS) {
      alreadySubmitted.value = true
      return // No registramos lead inicial si ya tiene uno pendiente reciente
    }
  }

  // Guardado inmediato de la información
  await saveLeadImmediately()
})

onUnmounted(() => {
  document.removeEventListener('mouseleave', handleMouseLeave)
  window.removeEventListener('popstate', handlePopState)
})

async function saveLeadImmediately() {
  if (!hasSupabaseConfig) return;

  const payload = {
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
    estado: 'Viendo Resultados',
  };

  try {
    if (props.quizData.leadId) {
      currentLeadId.value = props.quizData.leadId;
      const response = await supabase.from('leads').update(payload).eq('id', currentLeadId.value);
      if (!response.error) {
        console.log('[DEBUG-BOOK] Actualización de lead existente exitosa, ID:', currentLeadId.value);
      }
    } else {
      const response = await supabase.from('leads').insert(payload).select('id').single();
      if (!response.error && response.data) {
        currentLeadId.value = response.data.id;
        console.log('[DEBUG-BOOK] Guardado inmediato exitoso, ID:', currentLeadId.value);
      }
    }
  } catch (err) {
    console.error('[DEBUG-BOOK] Error guardando registro inicial', err);
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

  console.log('[DEBUG-BOOK] Iniciando proceso de agendamiento...');
  console.log('[DEBUG-BOOK] Estado de configuración Supabase (hasSupabaseConfig):', hasSupabaseConfig);
  console.log('[DEBUG-BOOK] Schema configurado (VITE_SUPABASE_SCHEMA):', import.meta.env.VITE_SUPABASE_SCHEMA);

  if (!hasSupabaseConfig) {
    console.error('[DEBUG-BOOK] Supabase is not configured. Please check your .env variables.');
    submitError.value = 'El servicio de agendamiento no está disponible porque la base de datos (Supabase) no está configurada.';
    submitting.value = false;
    return;
  }

  const payload = {
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
    estado: 'Agendado',
    estado_cita: 'Nueva',
  };

  console.log('[DEBUG-BOOK] Payload a insertar/actualizar en tabla "leads":', JSON.stringify(payload, null, 2));

  try {
    let response;
    if (currentLeadId.value) {
      // Actualizamos el registro que guardamos inicialmente
      response = await supabase
        .from('leads')
        .update({ estado: 'Agendado', estado_cita: 'Nueva' })
        .eq('id', currentLeadId.value);
    } else {
      // Fallback por si falló el guardado inicial
      response = await supabase.from('leads').insert(payload);
    }

    const { error } = response;

    if (error) {
      console.error('[DEBUG-BOOK] Error retornado por Supabase:', error);
      submitError.value = `Error de base de datos (Supabase): [${error.code}] ${error.message} - ${error.details || ''}`;
    } else {
      console.log('[DEBUG-BOOK] Actualización/Inserción exitosa sin errores.');
      // ─── Guardar timestamp en localStorage ──────────────────────────────
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
      booked.value = true;
    }
  } catch (err: any) {
    console.error('[DEBUG-BOOK] Excepción capturada en handleBook:', err);
    submitError.value = `Error de conexión / excepción: ${err?.message || JSON.stringify(err)}`;
  } finally {
    submitting.value = false;
  }
}
</script>
