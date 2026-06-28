export interface Provider {
  id: string;
  name: string;
  email: string;
  category: string;
}

// Base de datos simulada de proveedores validados (para el test de notificaciones)
const MOCK_PROVIDERS: Provider[] = [
  { id: '1', name: 'PatagoniaTech Solutions', email: 'contacto@patagoniatech.local', category: 'Servicios Industriales' },
  { id: '2', name: 'Metalúrgica del Céfiro', email: 'ventas@metalurgicacefiro.local', category: 'Servicios Industriales' },
  { id: '3', name: 'Logística Austral S.A.', email: 'operaciones@logisticaaustral.local', category: 'Logística y Transporte' },
  { id: '4', name: 'Transportes Cruz del Sur', email: 'cotizaciones@cruz-sur.local', category: 'Logística y Transporte' },
  { id: '5', name: 'NorteSur Inspecciones', email: 'cotizaciones@nortesur.local', category: 'Hidrocarburos' },
  { id: '6', name: 'Servicios Petroleros del Golfo', email: 'ventas@spg.local', category: 'Hidrocarburos' },
  { id: '7', name: 'RenovaPatagonia', email: 'proyectos@renovapatagonia.local', category: 'Energías Renovables' },
  { id: '8', name: 'Eólica Sur', email: 'comercial@eolicasur.local', category: 'Energías Renovables' }
];

/**
 * Función que simula la interacción con un servicio de email (SendGrid, Resend) o WhatsApp
 * para iterar la lista de proveedores del directorio y notificarles de un nuevo RFQ.
 */
export async function notifyProvidersForRfq(rfqCategory: string, rfqTitle: string, rfqId: number) {
  console.log(`\n======================================================`);
  console.log(`[Notificación Inteligente] Iniciando proceso de Match...`);
  console.log(`RFQ Categoría Buscada: "${rfqCategory}"`);
  
  // 1. Encontrar proveedores cuyo rubro coincida
  const matchedProviders = MOCK_PROVIDERS.filter(p => p.category === rfqCategory);
  
  console.log(`✅ [Match Directo] Se encontraron ${matchedProviders.length} proveedores verificados para la categoría.`);
  console.log(`======================================================\n`);

  // 2. Simular envío iterando los proveedores (simulación de latencia de API externa)
  for (const provider of matchedProviders) {
    console.log(`[Email Service] Preparando envío para: ${provider.name} <${provider.email}>`);
    
    // Simula tiempo de resolución de API, por ejemplo SendGrid (500ms)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log(`[Email Service] ✉️ ENVIADO - Asunto: "Nueva Oportunidad de Negocio #${rfqId} - ${rfqTitle}"\n`);
  }

  console.log(`[Proceso Completado] Se notificaron ${matchedProviders.length} proveedores exitosamente.`);
  return {
    success: true,
    providersNotified: matchedProviders.length
  };
}
