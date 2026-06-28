import { motion } from 'motion/react';
import { Check, X, Shield, Zap, Building2, CreditCard } from 'lucide-react';

const tiers = [
  {
    name: 'Básico',
    id: 'tier-basic',
    priceMonthly: 'Gratis',
    description: 'Perfecto para empezar y posicionar tu empresa en el directorio patagónico.',
    features: [
      'Presencia en el directorio público',
      'Perfil básico de empresa',
      'Responder 1 Cotización (RFQ) por mes',
      'Soporte comunitario',
    ],
    notIncluded: [
      'Notificaciones de Match Directo en RFQs',
      'Posicionamiento destacado en búsquedas',
      'Insignia de Empresa Verificada',
      'Analíticas de visualizaciones',
    ],
    cta: 'Comenzar Gratis',
    popular: false,
    icon: Shield,
    color: 'text-slate-500',
    bg: 'bg-slate-50 dark:bg-[#1A1625]'
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    priceMonthly: '$45.000',
    currency: 'ARS',
    billingPeriod: '/mes',
    description: 'Para empresas estructuradas que buscan captar nuevos contratos activamente.',
    features: [
      'Presencia destacada en el directorio',
      'Perfil completo con galería de trabajos',
      'Respuestas a RFQs ilimitadas',
      'Notificaciones instantáneas de Match Directo',
      'Insignia de Empresa Verificada',
      'Soporte prioritario',
    ],
    notIncluded: [
      'Ejecutivo de cuenta dedicado',
      'Reportes de mercado avanzados',
    ],
    cta: 'Suscribirse al Plan Pro',
    popular: true,
    icon: Zap,
    color: 'text-orange-500',
    bg: 'bg-white dark:bg-[#1A1625]'
  },
  {
    name: 'Corporativo',
    id: 'tier-corp',
    priceMonthly: 'A Medida',
    description: 'Solución integral para grandes proveedores y contratistas de primer nivel.',
    features: [
      'Todas las características del Plan Pro',
      'Ejecutivo de cuenta dedicado',
      'Reportes de mercado avanzados (IA)',
      'Máxima prioridad en resultados de búsqueda',
      'Integración vía API (ERP)',
      'Eventos exclusivos de networking',
    ],
    notIncluded: [],
    cta: 'Contactar Ventas',
    popular: false,
    icon: Building2,
    color: 'text-purple-500',
    bg: 'bg-slate-50 dark:bg-[#1A1625]'
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            Impulsa tus negocios en la Patagonia
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Aumentá tu visibilidad, recibí notificaciones de nuevos requerimientos y conectá con operadoras de primer nivel. Elegí el plan que mejor se adapte a tu empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col p-8 rounded-3xl ${tier.bg} border ${
                  tier.popular 
                    ? 'border-orange-500 shadow-xl dark:shadow-orange-500/10 scale-105 z-10' 
                    : 'border-slate-200 dark:border-white/5 shadow-sm'
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2">
                    <span className="bg-orange-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Más Elegido
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                    <Icon className={`w-6 h-6 ${tier.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{tier.name}</h3>
                  <p className="text-sm text-slate-500 min-h-[40px]">{tier.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">
                      {tier.priceMonthly}
                    </span>
                    {tier.currency && (
                      <span className="text-sm font-bold text-slate-500 uppercase">{tier.currency}</span>
                    )}
                    {tier.billingPeriod && (
                      <span className="text-slate-500">{tier.billingPeriod}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((feature, i) => (
                    <li key={`not-${i}`} className="flex gap-3 text-sm text-slate-400 dark:text-slate-600">
                      <X className="w-5 h-5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                    tier.popular
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                  }`}
                >
                  {tier.id === 'tier-basic' ? null : <CreditCard className="w-4 h-4" />}
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-20 max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">¿Sos una operadora o gran comprador?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            La emisión de Requerimientos de Cotización (RFQs) es 100% gratuita para compradores validados. Podés empezar a recibir cotizaciones hoy mismo.
          </p>
          <a href="/dashboard" className="text-orange-500 font-bold hover:text-orange-600 hover:underline">
            Ir a mi panel de compras &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
