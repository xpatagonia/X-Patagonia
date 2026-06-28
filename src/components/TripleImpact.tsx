import { motion } from 'motion/react';
import { Search, FileText, Handshake } from 'lucide-react';

export default function TripleImpact() {
  return (
    <section id="como-funciona" className="py-24 px-6 md:px-12 bg-white dark:bg-[#110E17]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-[11px] font-bold uppercase tracking-widest text-purple-400 mb-3">Flujo Operativo</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">¿Cómo funciona B2B?</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px border-t-2 border-dashed border-slate-200 dark:border-white/10 -z-10"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center text-center group bg-white dark:bg-[#110E17]"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 shadow-xl shadow-purple-900/20 rounded-3xl flex items-center justify-center text-orange-400 mb-8 group-hover:-translate-y-2 transition-transform duration-300 ring-4 ring-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Search className="w-8 h-8 relative z-10" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white tracking-tight">1. Busca Proveedores</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">Navega en el directorio organizado por industrias y descubre empresas locales verificadas.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center text-center group bg-white dark:bg-[#110E17]"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 shadow-xl shadow-purple-900/20 rounded-3xl flex items-center justify-center text-purple-400 mb-8 group-hover:-translate-y-2 transition-transform duration-300 ring-4 ring-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <FileText className="w-8 h-8 relative z-10" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white tracking-tight">2. Solicita Cotización</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">Envía una solicitud de compra detallada y recibe presupuestos múltiples (RFQ).</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center text-center group bg-white dark:bg-[#110E17]"
          >
            <div className="w-24 h-24 bg-slate-50 dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 shadow-xl shadow-purple-900/20 rounded-3xl flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-purple-500 mb-8 group-hover:-translate-y-2 transition-transform duration-300 ring-4 ring-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Handshake className="w-8 h-8 relative z-10 text-slate-900 dark:text-white" />
            </div>
            <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white tracking-tight">3. Cierra el Trato</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">Compara precios, evalúa perfiles de empresa y formaliza el contrato comercial directo.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
