<template>
  <div class="min-h-screen bg-brand-bg flex items-center justify-center p-4 sm:p-6">
    <div class="w-full max-w-lg">
      <!-- Card Container -->
      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-10">

        <!-- Progress Bar (hidden on welcome) -->
        <ProgressBar v-if="step > 0 && step < 5" :current="step" :total="4" />

        <!-- Steps -->
        <Transition name="fade" mode="out-in">
          <Step0Welcome v-if="step === 0" @next="step = 1" :key="0" />

          <Step1PersonalData
            v-else-if="step === 1"
            :nombre="quiz.nombre"
            :telefono="quiz.telefono"
            :edad="quiz.edad"
            @next="handleStep1"
            :key="1"
          />

          <Step2Symptoms
            v-else-if="step === 2"
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
import ProgressBar from '@/components/ProgressBar.vue'
import Step0Welcome from '@/components/Step0Welcome.vue'
import Step1PersonalData from '@/components/Step1PersonalData.vue'
import Step2Symptoms from '@/components/Step2Symptoms.vue'
import Step3Vision from '@/components/Step3Vision.vue'
import Step4Colors from '@/components/Step4Colors.vue'
import Step5Result from '@/components/Step5Result.vue'

const step = ref(0)

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
})

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  quiz.utmSource = params.get('utm_source') || ''
  quiz.utmMedium = params.get('utm_medium') || ''
  quiz.utmCampaign = params.get('utm_campaign') || ''
})

async function handleStep1(data: { nombre: string; telefono: string; edad: number }) {
  quiz.nombre = data.nombre
  quiz.telefono = data.telefono
  quiz.edad = data.edad
  step.value = 2

  if (hasSupabaseConfig && !quiz.leadId) {
    const payload = {
      nombre: quiz.nombre,
      telefono: quiz.telefono,
      edad: quiz.edad,
      respuestas: {},
      utm_source: quiz.utmSource || null,
      utm_medium: quiz.utmMedium || null,
      utm_campaign: quiz.utmCampaign || null,
      estado: 'Nuevo',
    };
    try {
      const { data: leadData, error } = await supabase.from('leads').insert(payload).select('id').single();
      if (!error && leadData) {
        quiz.leadId = leadData.id;
      }
    } catch (err) {
      console.error('[DEBUG-QUIZ] Error al guardar inicio del quiz', err);
    }
  }
}

function handleStep2(sintomas: string[]) {
  quiz.sintomas = sintomas
  step.value = 3
}

function handleStep3(data: { lejos: string; cerca: string }) {
  quiz.visionLejos = data.lejos
  quiz.visionCerca = data.cerca
  step.value = 4
}

function handleStep4(data: { problema: string; detalle: string }) {
  quiz.problemasColores = data.problema
  quiz.detalleColores = data.detalle
  step.value = 5
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
  step.value = 0
}
</script>
