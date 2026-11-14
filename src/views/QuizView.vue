<template>
  <div class="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-6 relative">
    <!-- Pulso Badge Floating Indicator (Oculto) -->
    <div v-if="false" class="fixed top-3 right-3 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-500/30 text-xs font-mono shadow-lg backdrop-blur">
      <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
      <span>PULSO TRACKER // ACTIVO [opticajohanna / quiz1]</span>
    </div>

    <div class="w-full max-w-lg">
      <!-- Card Container -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10">

        <!-- Progress Bar (oculto en bienvenida, adaptado al flujo clínico sin formulario previo) -->
        <ProgressBar v-if="step >= 2 && step < 5" :current="step - 1" :total="3" />

        <!-- Steps -->
        <Transition name="fade" mode="out-in">
          <Step2Symptoms
            v-if="step === 2"
            :sintomas="quiz.sintomas"
            @next="handleStep2"
            :key="2"
          />

          <Step3Vision
            v-else-if="step === 3"
            :vision-lejos="quiz.visionLejos"
            :vision-cerca="quiz.visionCerca"
            @next="handleStep3"
            :key="3"
          />

          <Step4Colors
            v-else-if="step === 4"
            :problemas-colores="quiz.problemasColores"
            :detalle-colores="quiz.detalleColores"
            @next="handleStep4"
            :key="4"
          />

          <Step5Result
            v-else-if="step === 5"
            :quiz-data="quiz"
            @restart="handleRestart"
            :key="5"
          />
        </Transition>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-slate-400 mt-6">
        &copy; {{ new Date().getFullYear() }} VisioControl &mdash; Gu&iacute;a visual profesional
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { supabase, hasSupabaseConfig } from '@/supabase'
import type { QuizData } from '@/types'
import { usePulsoTracker } from '@/pulso/composables/usePulsoTracker'
import ProgressBar from '@/components/ProgressBar.vue'
import Step0Welcome from '@/components/Step0Welcome.vue'
import Step1PersonalData from '@/components/Step1PersonalData.vue'
import Step2Symptoms from '@/components/Step2Symptoms.vue'
import Step3Vision from '@/components/Step3Vision.vue'
import Step4Colors from '@/components/Step4Colors.vue'
import Step5Result from '@/components/Step5Result.vue'

// Tracker universal sincronizado con Pulso Analytics
const tracker = usePulsoTracker({
  clientSlug: 'opticajohanna',
  quizKey: 'quiz1',
  quizName: 'Quiz 1 · Chequeo Visual Integral',
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

const step = ref(2)

const quiz = reactive<QuizData>({
  nombre: '',
  telefono: '',
  edad: null,
  sintomas: [],
  visionLejos: '',
  visionCerca: '',
  problemasColores: '',
  detalleColores: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  owner: '',
})

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  quiz.utmSource = params.get('utm_source') || ''
  quiz.utmMedium = params.get('utm_medium') || ''
  quiz.utmCampaign = params.get('utm_campaign') || ''
  const ownerParam = params.get('owner')
  quiz.owner = ownerParam === 'especialista' ? 'especialista' : 'publicidad'

  // Sincronizar leadId con usePulsoTracker
  if (tracker.leadId.value) {
    quiz.leadId = tracker.leadId.value
  }

  // Inyectar o inicializar tracker de Pulso para /opticajohanna/quiz1
  const scriptId = 'pulso-tracker-script'
  let script = document.getElementById(scriptId) as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = scriptId
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    script.src = isLocal ? 'http://localhost:5174/tracker.js?v=0.8' : '/tracker.js?v=0.8'
    script.setAttribute('data-client', 'opticajohanna')
    script.setAttribute('data-quiz', 'quiz1')
    script.setAttribute('data-site', 'opticajohanna/quiz1')
    script.defer = true
    document.head.appendChild(script)
  } else {
    if (window.pulso?.setClientAndQuiz) {
      window.pulso.setClientAndQuiz('opticajohanna', 'quiz1')
    } else if (window.pulso?.setSite) {
      window.pulso.setSite('opticajohanna/quiz1')
    } else {
      window.pulso?.visit()
    }
  }

  // ⚡ Entrada Directa a Pregunta 1 (Paso 1 de síntomas): Registrar inicio de quiz sin pantalla de bienvenida
  window.pulso?.step(1, { action: 'entrada_directa_sintomas' })
  tracker.trackStep(1, { action: 'entrada_directa_sintomas' })
})

function handleStart() {
  step.value = 2
}

async function handleStep1(data: { nombre: string; telefono: string; edad: number }) {
  quiz.nombre = data.nombre
  quiz.telefono = data.telefono
  quiz.edad = data.edad
  step.value = 2

  // 1️⃣ Pulso: Marcar Paso 1 completado
  window.pulso?.step(1, { nombre: data.nombre, edad: data.edad })
  tracker.trackStep(1, { nombre: data.nombre, edad: data.edad })

  if (hasSupabaseConfig) {
    const payload = {
      nombre: quiz.nombre,
      telefono: quiz.telefono,
      edad: quiz.edad,
      respuestas: { etapa: 'paso_1', paso: 1, client_id: 'opticajohanna', quiz: 'quiz1' },
      utm_source: quiz.utmSource || null,
      utm_medium: quiz.utmMedium || null,
      utm_campaign: quiz.utmCampaign || null,
      estado: 'Paso 1',
      origen: 'quiz1',
      owner: quiz.owner || 'publicidad',
    }
    try {
      if (quiz.leadId) {
        await supabase.from('leads').update(payload).eq('id', quiz.leadId)
      } else {
        const { data: leadData, error } = await supabase.from('leads').insert(payload).select('id').single()
        if (!error && leadData) {
          quiz.leadId = leadData.id
          sessionStorage.setItem('_oculus_visit_quiz1', String(leadData.id))
        }
      }
    } catch (err) {
      console.error('[DEBUG-QUIZ] Error al guardar inicio del quiz', err)
    }
  }
}

async function handleStep2(sintomas: string[]) {
  quiz.sintomas = sintomas
  step.value = 3

  // 2️⃣ Pulso: Marcar Paso 2 completado
  window.pulso?.step(2, { sintomasCount: sintomas.length })
  tracker.trackStep(2, { sintomas })

  if (hasSupabaseConfig && quiz.leadId) {
    try {
      await supabase.from('leads').update({
        estado: 'Paso 2',
        respuestas: { sintomas, etapa: 'paso_2', paso: 2, client_id: 'opticajohanna', quiz: 'quiz1' }
      }).eq('id', quiz.leadId)
    } catch (e) {}
  }
}

async function handleStep3(data: { lejos: string; cerca: string }) {
  quiz.visionLejos = data.lejos
  quiz.visionCerca = data.cerca
  step.value = 4

  // 3️⃣ Pulso: Marcar Paso 3 completado
  window.pulso?.step(3, { lejos: data.lejos, cerca: data.cerca })
  tracker.trackStep(3, { vision_lejos: data.lejos, vision_cerca: data.cerca })

  if (hasSupabaseConfig && quiz.leadId) {
    try {
      await supabase.from('leads').update({
        estado: 'Paso 3',
        respuestas: { sintomas: quiz.sintomas, vision_lejos: data.lejos, vision_cerca: data.cerca, etapa: 'paso_3', paso: 3, client_id: 'opticajohanna', quiz: 'quiz1' }
      }).eq('id', quiz.leadId)
    } catch (e) {}
  }
}

async function handleStep4(data: { problema: string; detalle: string }) {
  quiz.problemasColores = data.problema
  quiz.detalleColores = data.detalle
  step.value = 5

  // ✅ Pulso: Marcar COMPLETADOS
  window.pulso?.completed({
    nombre: quiz.nombre,
    telefono: quiz.telefono,
    problemasColores: data.problema
  })

  tracker.trackCompleted({
    score: 80,
    diagnosis: 'Evaluación Visual Completada',
    answers: { sintomas: quiz.sintomas, vision_lejos: quiz.visionLejos, vision_cerca: quiz.visionCerca, problemas_colores: data.problema }
  })

  window.pulso?.lead({
    nombre: quiz.nombre,
    telefono: quiz.telefono,
    edad: quiz.edad,
    origen: 'quiz1'
  })

  if (hasSupabaseConfig && quiz.leadId) {
    try {
      await supabase.from('leads').update({
        estado: 'Viendo Resultados',
        resultado: 'Has completado el diagnóstico visual.',
        respuestas: {
          sintomas: quiz.sintomas,
          vision_lejos: quiz.visionLejos,
          vision_cerca: quiz.visionCerca,
          problemas_colores: data.problema,
          detalle_colores: data.detalle,
          etapa: 'completado',
          paso: 4
        }
      }).eq('id', quiz.leadId)
    } catch (e) {}
  }
}

function handleRestart() {
  quiz.leadId = undefined
  quiz.nombre = ''
  quiz.telefono = ''
  quiz.edad = null
  quiz.sintomas = []
  quiz.visionLejos = ''
  quiz.visionCerca = ''
  quiz.problemasColores = ''
  quiz.detalleColores = ''
  step.value = 2
}
</script>
