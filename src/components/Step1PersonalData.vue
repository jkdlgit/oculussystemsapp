<template>
  <div>
    <h2 class="text-2xl font-bold text-brand-dark mb-2">Datos personales</h2>
    <p class="text-slate-500 mb-8">Usaremos estos datos para contactarte y agendar tu cita.</p>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      <!-- Nombre -->
      <div>
        <label for="nombre" class="block text-sm font-semibold text-brand-dark mb-2">Nombre completo</label>
        <input
          id="nombre"
          v-model="localNombre"
          type="text"
          class="input-field"
          placeholder="Ej. María Pérez"
          required
        />
        <p v-if="errors.nombre" class="text-red-500 text-sm mt-1">{{ errors.nombre }}</p>
      </div>

      <!-- Teléfono -->
      <div>
        <label for="telefono" class="block text-sm font-semibold text-brand-dark mb-2">Teléfono (WhatsApp)</label>
        <input
          id="telefono"
          v-model="localTelefono"
          type="tel"
          class="input-field"
          placeholder="Ej. 0991234567 o 08..."
          maxlength="16"
          required
        />
        <p v-if="errors.telefono" class="text-red-500 text-sm mt-1">{{ errors.telefono }}</p>
      </div>

      <!-- Edad -->
      <div>
        <label for="edad" class="block text-sm font-semibold text-brand-dark mb-2">Edad</label>
        <input
          id="edad"
          v-model.number="localEdad"
          type="number"
          class="input-field"
          placeholder="Ej. 35"
          min="1"
          max="120"
          required
        />
        <p v-if="errors.edad" class="text-red-500 text-sm mt-1">{{ errors.edad }}</p>
      </div>

      <button type="submit" class="btn-primary mt-4">
        Continuar →
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const props = defineProps<{
  nombre: string
  telefono: string
  edad: number | null
}>()

const emit = defineEmits<{
  next: [data: { nombre: string; telefono: string; edad: number }]
}>()

const localNombre = ref(props.nombre)
const localTelefono = ref(props.telefono)
const localEdad = ref<number | null>(props.edad)

const errors = reactive({
  nombre: '',
  telefono: '',
  edad: '',
})

function normalizeEcuadorianPhone(raw: string): { isValid: boolean; normalized: string; error?: string } {
  if (!raw || !raw.trim()) {
    return { isValid: false, normalized: '', error: 'El teléfono es obligatorio.' }
  }

  const clean = raw.trim()
  const digits = clean.replace(/\D/g, '')

  let phone = ''

  if (digits.startsWith('593')) {
    // Si viene con código de país 593 (ej. +5939... o +5938...)
    const after593 = digits.slice(3)
    if (after593.length === 9) {
      phone = '0' + after593
    } else if (after593.length === 10 && after593.startsWith('0')) {
      phone = after593
    }
  } else if (digits.length === 9 && (digits.startsWith('8') || digits.startsWith('9'))) {
    // Si el usuario omitió el 0 inicial (ej: 991234567 u 881234567)
    phone = '0' + digits
  } else if (digits.length === 10 && (digits.startsWith('08') || digits.startsWith('09'))) {
    // Formato estándar de celular en Ecuador (todas las operadoras: 09... y 08...)
    phone = digits
  } else if (digits.length === 10 && digits.startsWith('0')) {
    // Cualquier número ecuatoriano de 10 dígitos que empiece con 0
    phone = digits
  }

  if (phone && /^0[89]\d{8}$/.test(phone)) {
    return { isValid: true, normalized: phone }
  }

  if (phone && /^0\d{9}$/.test(phone)) {
    return { isValid: true, normalized: phone }
  }

  return {
    isValid: false,
    normalized: raw,
    error: 'Ingresa un número celular válido de Ecuador de 10 dígitos (Ej. 09... o 08...).',
  }
}

function validate(): boolean {
  let valid = true
  errors.nombre = ''
  errors.telefono = ''
  errors.edad = ''

  if (!localNombre.value || localNombre.value.trim().length < 2) {
    errors.nombre = 'Ingresa tu nombre completo (mínimo 2 caracteres).'
    valid = false
  }

  const phoneRes = normalizeEcuadorianPhone(localTelefono.value)
  if (!phoneRes.isValid) {
    errors.telefono = phoneRes.error || 'Ingresa un número celular válido de Ecuador (Ej. 09... o 08...).'
    valid = false
  } else {
    localTelefono.value = phoneRes.normalized
  }

  if (!localEdad.value || localEdad.value < 1 || localEdad.value > 120) {
    errors.edad = 'Ingresa una edad válida (entre 1 y 120).'
    valid = false
  }

  return valid
}

function handleSubmit() {
  if (validate()) {
    const phoneRes = normalizeEcuadorianPhone(localTelefono.value)
    emit('next', {
      nombre: localNombre.value.trim(),
      telefono: phoneRes.isValid ? phoneRes.normalized : localTelefono.value.trim(),
      edad: localEdad.value!,
    })
  }
}
</script>
