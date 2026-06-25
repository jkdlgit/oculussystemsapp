<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">


    <main class="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div class="w-full max-w-lg">
        <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 sm:p-8 md:p-10 border border-slate-100 overflow-hidden">
          


          <Transition name="fade" mode="out-in">
            <VCWelcome v-if="step === 0" @start="handleStart" :key="0" />
            <VCPrueba v-else-if="step === 1" @finish="handleTestFinish" :key="1" />
            <VCResultado v-else-if="step === 2" :score="acuityScore" @next="step = 3" :key="2" />
            <VCFormulario v-else-if="step === 3" :lead-id="leadId" :score="acuityScore" @submit="handleFormSubmit" :key="3" />
            <VCFinal v-else-if="step === 4" :key="4" />
          </Transition>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6 font-medium">
          &copy; {{ new Date().getFullYear() }} Oculus &mdash; Herramienta de valoración orientativa
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase, hasSupabaseConfig } from '@/supabase'
import VCWelcome from '@/components/visioncheck1/VCWelcome.vue'
import VCPrueba from '@/components/visioncheck1/VCPrueba.vue'
import VCResultado from '@/components/visioncheck1/VCResultado.vue'
import VCFormulario from '@/components/visioncheck1/VCFormulario.vue'
import VCFinal from '@/components/visioncheck1/VCFinal.vue'

const step = ref(0)
const leadId = ref<number | null>(null)
const acuityScore = ref<string>('')
const owner = ref<string>('publicidad')

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const ownerParam = params.get('owner')
  if (ownerParam === 'especialista') {
    owner.value = 'especialista'
  }
})

async function handleStart() {
  step.value = 1
  
  // Registrar la visita inmediatamente de forma anónima
  if (hasSupabaseConfig && !leadId.value) {
    const params = new URLSearchParams(window.location.search)
    const payload = {
      estado: 'Nuevo',
      origen: 'visioncheck1',
      owner: owner.value,
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
    };
    try {
      const { data, error } = await supabase.from('leads').insert(payload).select('id').single();
      if (!error && data) {
        leadId.value = data.id;
      }
    } catch (err) {
      console.error('Error guardando inicio de VisiónCheck', err);
    }
  }
}

function handleTestFinish(score: string) {
  acuityScore.value = score
  step.value = 2
}

function handleFormSubmit() {
  step.value = 4
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
