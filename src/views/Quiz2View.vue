<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 relative">
    <!-- Pulso Badge Floating Indicator -->
    <div class="fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-xs font-mono shadow-lg backdrop-blur">
      <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
      <span>PULSO TRACKER // ACTIVO [{{ clientSlug }} / quiz2]</span>
    </div>

    <main class="w-full max-w-lg">
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 md:p-10 border border-slate-100 overflow-hidden">
        <Transition name="fade" mode="out-in">
          <VCWelcome v-if="step === 0" @start="handleStart" :key="0" />
          <VCPrueba v-else-if="step === 1" @finish="handleTestFinish" :key="1" />
          <VCResultado v-else-if="step === 2" :score="acuityScore" @next="handleGoToForm" :key="2" />
          <VCFormulario v-else-if="step === 3" :lead-id="leadId" :score="acuityScore" @submit="handleFormSubmit" :key="3" />
          <VCFinal v-else-if="step === 4" @whatsapp="handleWhatsAppClick" :key="4" />
        </Transition>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6 font-medium">
        &copy; {{ new Date().getFullYear() }} Oculus &mdash; VisiónCheck monitoreado con Pulso
      </p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase, hasSupabaseConfig } from '@/supabase'
import { usePulsoTracker } from '@/pulso/composables/usePulsoTracker'
import VCWelcome from '@/components/visioncheck1/VCWelcome.vue'
import VCPrueba from '@/components/visioncheck1/VCPrueba.vue'
import VCResultado from '@/components/visioncheck1/VCResultado.vue'
import VCFormulario from '@/components/visioncheck1/VCFormulario.vue'
import VCFinal from '@/components/visioncheck1/VCFinal.vue'

// Tracker universal sincronizado con Pulso Analytics
const tracker = usePulsoTracker({
  clientSlug: 'opticajohanna',
  quizKey: 'quiz2',
  quizName: 'Quiz 2 · VisiónCheck Agudeza Visual',
})

declare global {
  interface Window {
    pulso?: {
      setClientAndQuiz?: (client: string, quiz: string) => void
      setSite: (site: string) => void
      visit: () => void
      step: (num: number, meta?: any) => void
      completed: (meta?: any) => void
      booking: (meta?: any) => void
      lead: (data: any) => void
      track: (event: string, meta?: any) => void
    }
  }
}

const route = useRoute()
const step = ref(0)
const leadId = ref<number | null>(null)
const acuityScore = ref<string>('')
const owner = ref<string>('publicidad')

const clientSlug = computed(() => {
  const param = route.params.clientSlug as string
  if (param) return param
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  if (pathParts.length > 1 && (pathParts[1] === 'quiz2' || pathParts[1] === 'visioncheck1')) {
    return pathParts[0]
  }
  return 'opticajohanna'
})

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const ownerParam = params.get('owner')
  if (ownerParam === 'especialista') {
    owner.value = 'especialista'
  }

  // Iniciar Tracker de Pulso para [clientSlug / quiz2]
  const scriptId = 'pulso-tracker-script'
  let script = document.getElementById(scriptId) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = scriptId
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    script.src = isLocal ? 'http://localhost:5174/tracker.js?v=0.8' : '/tracker.js?v=0.8'
    script.setAttribute('data-client', clientSlug.value)
    script.setAttribute('data-quiz', 'quiz2')
    document.head.appendChild(script)
  } else {
    if (window.pulso?.setClientAndQuiz) {
      window.pulso.setClientAndQuiz(clientSlug.value, 'quiz2')
    } else if (window.pulso?.setSite) {
      window.pulso.setSite(`${clientSlug.value}/quiz2`)
    }
    window.pulso?.visit()
  }

  // Sincronizar leadId con usePulsoTracker
  if (tracker.leadId.value) {
    leadId.value = tracker.leadId.value
  }
})

async function handleStart() {
  step.value = 1
  window.pulso?.step(1, { action: 'iniciar_prueba_visioncheck' })
  tracker.trackStep(1, { action: 'iniciar_prueba_visioncheck' })

  if (hasSupabaseConfig && leadId.value) {
    try {
      await supabase.from('leads').update({
        estado: 'Paso 1',
        respuestas: { etapa: 'prueba_iniciada', paso: 1, test: 'visioncheck1', client_id: 'opticajohanna', quiz: 'quiz2' }
      }).eq('id', leadId.value)
    } catch (e) {}
  }
}

async function handleTestFinish(score: string) {
  acuityScore.value = score
  step.value = 2

  // Telemetría Pulso: Paso 2 y completado de la prueba
  window.pulso?.step(2, { score })
  window.pulso?.completed({ score, test: 'visioncheck1' })

  tracker.trackStep(2, { score })
  tracker.trackCompleted({ score, diagnosis: `Agudeza estimada: ${score}` })

  if (hasSupabaseConfig && leadId.value) {
    try {
      await supabase.from('leads').update({
        estado: 'Viendo Resultados',
        resultado: 'Agudeza visual estimada: ' + score,
        respuestas: { visionCheck_score: score, etapa: 'completado', paso: 2, test: 'visioncheck1', client_id: 'opticajohanna', quiz: 'quiz2' }
      }).eq('id', leadId.value)
      console.log('📡 [PULSO] Prueba VisiónCheck completada, score:', score)
    } catch (err) {
      console.error('[VC] Error actualizando resultado:', err)
    }
  }
}

function handleGoToForm() {
  step.value = 3
  window.pulso?.step(3, { action: 'abrir_formulario_reserva' })
  tracker.trackStep(3, { action: 'abrir_formulario_reserva' })
}

async function handleFormSubmit(formData: { nombre: string; telefono: string; edad: number }) {
  step.value = 4

  // Telemetría Pulso: Reserva completada
  window.pulso?.booking({
    action: 'reserva_formulario_visioncheck',
    nombre: formData.nombre,
    score: acuityScore.value
  })

  await tracker.trackBooking({
    nombre: formData.nombre,
    telefono: formData.telefono,
    edad: formData.edad,
    metadata: { score: acuityScore.value, test: 'visioncheck1' }
  })
}

function handleWhatsAppClick() {
  window.pulso?.booking({
    action: 'whatsapp_confirmacion_visioncheck',
    score: acuityScore.value
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
