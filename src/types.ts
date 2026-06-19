export interface QuizData {
  leadId?: number
  nombre: string
  telefono: string
  edad: number | null
  sintomas: string[]
  visionLejos: string
  visionCerca: string
  problemasColores: string
  detalleColores: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
}

export const sintomasOpciones = [
  { id: 'fatiga', label: 'Fatiga visual o cansancio en los ojos', emoji: '😩' },
  { id: 'dolor_cabeza', label: 'Dolores de cabeza frecuentes', emoji: '🤕' },
  { id: 'ardor', label: 'Ardor o picazón en los ojos', emoji: '🔥' },
  { id: 'secos', label: 'Ojos secos', emoji: '💧' },
  { id: 'lagrimeo', label: 'Lagrimeo excesivo', emoji: '😢' },
  { id: 'sensibilidad', label: 'Sensibilidad a la luz', emoji: '☀️' },
  { id: 'ninguna', label: 'Ninguna de las anteriores', emoji: '✅' },
]

export type VisionLevel = 'mucho' | 'poco' | 'nada' | ''
