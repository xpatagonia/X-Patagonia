import { motion } from 'motion/react';
import { Search, ShoppingCart, FileText, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: 'Explora o Busca',
    description: 'Encuentra servicios, productos o proveedores específicos dentro de nuestras categorías validadas.',
    icon: Search,
  },
  {
    id: 2,
    title: 'Solicita Cotización (RFQ)',
    description: 'Envía tus requerimientos a múltiples proveedores simultáneamente con un solo clic.',
    icon: FileText,
  },
  {
    id: 3,
    title: 'Compara y Gestiona',
    description: 'Recibe propuestas estandarizadas directamente en tu panel de control sincronizado.',
    icon: ShoppingCart,
  },
  {
    id: 4,
    title: 'Contrata con Confianza',
    description: 'Adjudica con seguridad a empresas que cumplen con criterios de Triple Impacto.',
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white dark:bg-[#110E17] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6"
          >
            ¿Cómo Funciona XPatagonia?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Optimizamos tu proceso de abastecimiento b2b integrando todo el ciclo de compras en una única plataforma fácil de usar.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent hidden lg:block z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="relative text-center group"
              >
                <div className="w-24 h-24 mx-auto bg-slate-50 dark:bg-[#1A1625] border-2 border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center mb-6 shadow-xl group-hover:border-orange-400 group-hover:scale-110 transition-all duration-500 relative z-10">
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-purple-600/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <step.icon className="w-10 h-10 text-slate-700 dark:text-slate-300 group-hover:text-orange-500 transition-colors relative z-10" />
                   
                   {/* Step Number Badge */}
                   <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center text-sm shadow-lg border-2 border-white dark:border-[#1A1625]">
                     {step.id}
                   </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
