// src/pulso/config/thresholds.ts
// Umbrales de referencia de la industria y cálculo de degradado continuo

export interface StepThreshold {
  label: string
  key: string
  redBelow: number    // Por debajo de este % es Rojo pleno
  greenAbove: number  // Por encima de este % es Verde pleno
  minPersons: number  // Mínimo de personas en la etapa previa para colorear
}

export const FUNNEL_THRESHOLDS: Record<string, StepThreshold> = {
  paso1: {
    label: 'Visita → Paso 1',
    key: 'paso1',
    redBelow: 25,
    greenAbove: 50,
    minPersons: 30,
  },
  paso2: {
    label: 'Paso 1 → Paso 2',
    key: 'paso2',
    redBelow: 40,
    greenAbove: 75,
    minPersons: 20,
  },
  paso3: {
    label: 'Paso 2 → Paso 3',
    key: 'paso3',
    redBelow: 50,
    greenAbove: 80,
    minPersons: 20,
  },
  completados: {
    label: 'Paso 3 → Completado',
    key: 'completados',
    redBelow: 60,
    greenAbove: 85,
    minPersons: 20,
  },
  reservas: {
    label: 'Completado → Reserva',
    key: 'reservas',
    redBelow: 10,
    greenAbove: 30,
    minPersons: 20,
  },
  llegaron: {
    label: 'Reserva → Llegó al local',
    key: 'llegaron',
    redBelow: 45,
    greenAbove: 70,
    minPersons: 10,
  },
  ventas: {
    label: 'Llegó al local → Venta',
    key: 'ventas',
    redBelow: 40,
    greenAbove: 65,
    minPersons: 10,
  },
}

export interface StepColorInfo {
  color: string
  symbol: string
  statusLabel: string
  isInsuficientData: boolean
}

/**
 * Calcula el color con degradado continuo de Rojo a Verde:
 * Rojo pleno: #ef4444
 * Naranja:    #f97316
 * Amarillo:   #eab308
 * Verde pleno: #10b981
 */
export function getFunnelStepColor(
  pct: number,
  threshold: StepThreshold,
  sampleSize: number
): StepColorInfo {
  if (sampleSize < threshold.minPersons) {
    return {
      color: '#64748b', // Gris neutro (slate-500)
      symbol: '—',
      statusLabel: 'Pocos datos',
      isInsuficientData: true,
    }
  }

  const { redBelow, greenAbove } = threshold

  // Normalizar t entre 0 (rojo) y 1 (verde)
  let t = 0
  if (pct <= redBelow) {
    t = 0
  } else if (pct >= greenAbove) {
    t = 1
  } else {
    t = (pct - redBelow) / (greenAbove - redBelow)
  }

  // Puntos clave de color en espacio RGB:
  // t = 0.00: Rojo     rgb(239, 68, 68)   #ef4444
  // t = 0.33: Naranja  rgb(249, 115, 22)  #f97316
  // t = 0.66: Amarillo rgb(234, 179, 8)   #eab308
  // t = 1.00: Verde    rgb(16, 185, 129)  #10b981
  let r: number, g: number, b: number

  if (t < 0.33) {
    const f = t / 0.33
    r = Math.round(239 + (249 - 239) * f)
    g = Math.round(68 + (115 - 68) * f)
    b = Math.round(68 + (22 - 68) * f)
  } else if (t < 0.66) {
    const f = (t - 0.33) / 0.33
    r = Math.round(249 + (234 - 249) * f)
    g = Math.round(115 + (179 - 115) * f)
    b = Math.round(22 + (8 - 22) * f)
  } else {
    const f = (t - 0.66) / 0.34
    r = Math.round(234 + (16 - 234) * f)
    g = Math.round(179 + (185 - 179) * f)
    b = Math.round(8 + (129 - 8) * f)
  }

  const color = `rgb(${r}, ${g}, ${b})`

  let symbol = '●'
  let statusLabel = 'Regular'
  if (t >= 0.8) {
    symbol = '▲'
    statusLabel = 'Óptimo'
  } else if (t >= 0.5) {
    symbol = '▲'
    statusLabel = 'Bueno'
  } else if (t >= 0.25) {
    symbol = '▼'
    statusLabel = 'Atención'
  } else {
    symbol = '▼'
    statusLabel = 'Crítico'
  }

  return {
    color,
    symbol,
    statusLabel,
    isInsuficientData: false,
  }
}
