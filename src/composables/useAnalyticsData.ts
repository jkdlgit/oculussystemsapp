import { ref, onMounted, watch } from 'vue';
import { supabase, hasSupabaseConfig } from '../supabase';

export interface Resumen {
  visitas: number;
  quizzes: number;
  reservas: number;
  llegaron: number;
  ventas: number;
  ventas_count: number;
  ticket_promedio: number;
}

export interface FunnelStage {
  etapa: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
}

export interface Kpis {
  conversion_global: number;
  ticket_promedio: number;
  costo_por_lead: number;
  roi: number;
}

export interface Abandono {
  transicion: string;
  entraron: number;
  perdidos: number;
  porcentaje: number;
  accion: string;
}

export interface Evolucion {
  fechas: string[];
  visitas: number[];
  quizzes: number[];
  reservas: number[];
  ventas: number[];
}

export interface AnalyticsData {
  resumen: Resumen;
  funnel: FunnelStage[];
  kpis: Kpis;
  abandono: Abandono[];
  evolucion: Evolucion;
}

export interface FilterOptions {
  dateStart: string;
  dateEnd: string;
  origen: string;
  estado: string;
  especialista: string;
}

export function useAnalyticsData() {
  const data = ref<AnalyticsData | null>(null);
  const isLoading = ref(true);
  const isRefreshing = ref(false);
  const error = ref<string | null>(null);

  const fetchData = async (filters?: FilterOptions) => {
    // Solo mostrar spinner de carga completa si no hay data previa
    if (data.value === null) {
      isLoading.value = true;
    } else {
      isRefreshing.value = true;
    }
    error.value = null;

    if (!hasSupabaseConfig) {
      error.value = "Supabase no está configurado.";
      isLoading.value = false;
      isRefreshing.value = false;
      return;
    }

    try {
      let leadsQuery = supabase.from('leads').select('id, created_at, fecha_cita, estado_cita, origen, estado');
      let historialQuery = supabase.from('historial_clinico').select('id, created_at, paciente_id');
      let pedidosQuery = supabase.from('pedidos').select('id, created_at, total, estado_pago, estado_pedido, paciente_id');
      let pacientesQuery = supabase.from('pacientes').select('id, lead_id');

      // Aplica filtros en Supabase donde sea posible
      if (filters) {
        if (filters.dateStart && filters.dateStart !== '') {
          leadsQuery = leadsQuery.gte('created_at', filters.dateStart);
          historialQuery = historialQuery.gte('created_at', filters.dateStart);
          pedidosQuery = pedidosQuery.gte('created_at', filters.dateStart);
        }
        if (filters.dateEnd && filters.dateEnd !== '') {
          leadsQuery = leadsQuery.lte('created_at', filters.dateEnd + 'T23:59:59.999Z');
          historialQuery = historialQuery.lte('created_at', filters.dateEnd + 'T23:59:59.999Z');
          pedidosQuery = pedidosQuery.lte('created_at', filters.dateEnd + 'T23:59:59.999Z');
        }
        if (filters.origen && filters.origen !== 'Todos') {
          leadsQuery = leadsQuery.eq('origen', filters.origen);
        }
        if (filters.estado && filters.estado !== 'Todos') {
          leadsQuery = leadsQuery.eq('estado_cita', filters.estado);
        }
      }

      const [leadsRes, historialRes, pedidosRes, pacientesRes] = await Promise.all([
        leadsQuery,
        historialQuery,
        pedidosQuery,
        pacientesQuery
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (historialRes.error) throw historialRes.error;
      if (pedidosRes.error) throw pedidosRes.error;
      if (pacientesRes.error) throw pacientesRes.error;

      let leads = leadsRes.data || [];
      let historial = historialRes.data || [];
      let pedidos = pedidosRes.data || [];
      const pacientes = pacientesRes.data || [];

      // Si hay un filtro de origen aplicado en leads, debemos propagarlo hacia pacientes y pedidos
      // Para asegurarnos de medir *sólo* las ventas de esos leads filtrados.
      if (filters && filters.origen && filters.origen !== 'Todos') {
        const validLeadIds = new Set(leads.map(l => l.id));
        const validPacienteIds = new Set(pacientes.filter(p => p.lead_id && validLeadIds.has(p.lead_id)).map(p => p.id));
        
        historial = historial.filter(h => validPacienteIds.has(h.paciente_id));
        pedidos = pedidos.filter(p => validPacienteIds.has(p.paciente_id));
      }

      // 1. Visitas (Entradas al quiz reales)
      const visitasCount = leads.length;

      // 2. Quizzes Completados (Llegaron a resultados)
      const quizzesCompletados = leads.filter(l => l.estado && l.estado !== 'Nuevo');
      const quizzesCount = quizzesCompletados.length;

      // 2. Reservas agendadas (detecta estado_cita O estado del quiz)
      const reservas = leads.filter(l => 
        l.fecha_cita || 
        (l.estado_cita && l.estado_cita !== 'Nueva') ||
        l.estado === 'Agendado'
      );
      const reservasCount = reservas.length;

      // 3. Llegaron al local
      const llegaron = leads.filter(l => l.estado_cita === 'Atendida');
      const llegaronCount = llegaron.length;

      // 4. Exámenes realizados
      // Contamos PACIENTES únicos que tuvieron al menos un examen.
      // Si un paciente regresa y se hace un 2do examen, el funnel NO sube (ya estaba contado).
      const pacientesConExamen = new Set(historial.map(h => h.paciente_id));
      const examenesCount = pacientesConExamen.size;
      // Dato informativo: total de registros de exámenes (incluyendo reconsultas)
      const totalExamenesRegistrados = historial.length;

      // 5. Pedidos generados
      const pedidosCount = pedidos.length;

      // 6. Pagos completados
      const pagosCompletados = pedidos.filter(p => p.estado_pago === 'Pagado total');
      const pagosCount = pagosCompletados.length;

      // 7. Productos entregados
      const productosEntregados = pedidos.filter(p => p.estado_pedido === 'Entregado');
      const entregadosCount = productosEntregados.length;

      const ventasTotales = pagosCompletados.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
      const ticketPromedio = pedidosCount > 0 ? ventasTotales / pedidosCount : 0;
      const conversionGlobal = visitasCount > 0 ? (pagosCount / visitasCount) * 100 : 0;

      const inversionMarketing = 500;
      const costoPorLead = quizzesCount > 0 ? inversionMarketing / quizzesCount : 0;
      const roi = inversionMarketing > 0 ? ((ventasTotales - inversionMarketing) / inversionMarketing) * 100 : 0;

      const formatPorcentaje = (count: number, base: number) => {
        return base > 0 ? Number(((count / base) * 100).toFixed(1)) : 0;
      };

      const funnelData: FunnelStage[] = [
        { etapa: 1, nombre: "Entrada al quiz", cantidad: visitasCount, porcentaje: 100 },
        { etapa: 2, nombre: "Quiz completado", cantidad: quizzesCount, porcentaje: formatPorcentaje(quizzesCount, visitasCount) },
        { etapa: 3, nombre: "Reserva agendada", cantidad: reservasCount, porcentaje: formatPorcentaje(reservasCount, visitasCount) },
        { etapa: 4, nombre: "Llegaron al local", cantidad: llegaronCount, porcentaje: formatPorcentaje(llegaronCount, visitasCount) },
        { etapa: 5, nombre: "Examen realizado", cantidad: examenesCount, porcentaje: formatPorcentaje(examenesCount, visitasCount) },
        { etapa: 6, nombre: "Pedido generado", cantidad: pedidosCount, porcentaje: formatPorcentaje(pedidosCount, visitasCount) },
        { etapa: 7, nombre: "Pago completado", cantidad: pagosCount, porcentaje: formatPorcentaje(pagosCount, visitasCount) },
        { etapa: 8, nombre: "Producto entregado", cantidad: entregadosCount, porcentaje: formatPorcentaje(entregadosCount, visitasCount) }
      ];

      const abandonoData: Abandono[] = [
        { transicion: "Quiz → Completado", entraron: visitasCount, perdidos: visitasCount - quizzesCount, porcentaje: formatPorcentaje(visitasCount - quizzesCount, visitasCount), accion: "Mejorar UX del quiz" },
        { transicion: "Quiz → Reserva", entraron: quizzesCount, perdidos: quizzesCount - reservasCount, porcentaje: formatPorcentaje(quizzesCount - reservasCount, quizzesCount), accion: "Incentivar reserva" },
        { transicion: "Reserva → Llegaron", entraron: reservasCount, perdidos: reservasCount - llegaronCount, porcentaje: formatPorcentaje(reservasCount - llegaronCount, reservasCount), accion: "Recordatorios WhatsApp" },
        { transicion: "Llegaron → Examen", entraron: llegaronCount, perdidos: llegaronCount - examenesCount, porcentaje: formatPorcentaje(llegaronCount - examenesCount, llegaronCount), accion: "Revisar proceso clínico" },
        { transicion: "Examen → Pedido", entraron: examenesCount, perdidos: examenesCount - pedidosCount, porcentaje: formatPorcentaje(examenesCount - pedidosCount, examenesCount), accion: "Mejorar ofertas" },
        { transicion: "Pedido → Venta", entraron: pedidosCount, perdidos: pedidosCount - pagosCount, porcentaje: formatPorcentaje(pedidosCount - pagosCount, pedidosCount), accion: "Facilitar pagos" }
      ];

      const ultimos7Dias = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const getCountForDate = (arr: any[], dateStr: string) => 
        arr.filter(item => item.created_at?.startsWith(dateStr)).length;

      const evolucionData: Evolucion = {
        fechas: ultimos7Dias.map(d => d.slice(5)), 
        visitas: ultimos7Dias.map(d => getCountForDate(leads, d)),
        quizzes: ultimos7Dias.map(d => getCountForDate(quizzesCompletados, d)),
        reservas: ultimos7Dias.map(d => getCountForDate(reservas, d)),
        ventas: ultimos7Dias.map(d => getCountForDate(pedidos.filter(p => p.estado_pago === 'Pagado total'), d))
      };

      data.value = {
        resumen: {
          visitas: visitasCount,
          quizzes: quizzesCount,
          reservas: reservasCount,
          llegaron: llegaronCount,
          ventas: ventasTotales,
          ventas_count: pagosCount,
          ticket_promedio: ticketPromedio
        },
        funnel: funnelData,
        kpis: {
          conversion_global: conversionGlobal,
          ticket_promedio: ticketPromedio,
          costo_por_lead: costoPorLead,
          roi: roi
        },
        abandono: abandonoData,
        evolucion: evolucionData
      };

    } catch (err: any) {
      console.error("Error fetching analytics data", err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
      isRefreshing.value = false;
    }
  };

  onMounted(() => {
    fetchData();
  });

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh: fetchData
  };
}
