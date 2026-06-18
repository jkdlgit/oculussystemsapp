# Oculus - Quiz Visual VisioControl

Quiz web interactivo para una óptica en Guayaquil. Los usuarios responden 4 pasos sobre su visión y al final pueden agendar una cita gratuita.

## 🚀 Tecnologías

- **Vue.js 3** (Composition API + `<script setup>`)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Base de datos)
- **Vite** (Bundler)

## 📦 Instalación

```bash
cd C:\Users\user\Documents\Oculus
npm install
```

## ⚙️ Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el archivo `supabase-schema.sql` en el **SQL Editor** de Supabase
3. Copia `.env.example` a `.env` y completa tus credenciales:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 🏃 Desarrollo

```bash
npm run dev
```

## 🏗️ Build para producción

```bash
npm run build
```

## 📂 Estructura del proyecto

```
Oculus/
├── src/
│   ├── components/
│   │   ├── ProgressBar.vue        # Barra de progreso
│   │   ├── Step0Welcome.vue       # Bienvenida
│   │   ├── Step1PersonalData.vue  # Datos personales
│   │   ├── Step2Symptoms.vue      # Síntomas visuales
│   │   ├── Step3Vision.vue        # Visión lejos/cerca
│   │   ├── Step4Colors.vue        # Percepción de colores
│   │   └── Step5Result.vue        # Resultado + Cita
│   ├── App.vue                    # Componente principal
│   ├── main.ts                    # Entry point
│   ├── style.css                  # Tailwind + estilos
│   ├── supabase.ts                # Cliente de Supabase
│   └── types.ts                   # Tipos e interfaces
├── supabase-schema.sql            # SQL para crear tabla en Supabase
├── .env.example                   # Variables de entorno de ejemplo
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```
