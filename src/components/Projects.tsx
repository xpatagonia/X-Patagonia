import { motion } from 'motion/react';
import { BadgeCheck, Factory, Beaker } from 'lucide-react';

export default function Projects() {
  return (
    <section id="proveedores" className="py-24 px-6 md:px-12 bg-white dark:bg-[#110E17]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          <div>
            <h4 className="text-[11px] uppercase tracking-widest mb-3 text-purple-400 font-bold">Top Suppliers</h4>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 tracking-tight">Proveedores Verificados</h2>
            <p className="text-lg opacity-80 leading-relaxed text-slate-600 dark:text-slate-400 max-w-lg">
              Haz negocios con empresas auditadas y certificadas. Evaluamos capacidad de suministro, estándares de calidad y compromiso sostenible.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-5 p-5 border border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50 dark:bg-[#1A1625] hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer group">
              <div className="flex-none mt-1">
                 <div className="w-12 h-12 bg-white/5 group-hover:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:border-purple-500/20 transition-colors">
                    <Factory className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-purple-400 transition-colors" />
                 </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Metalúrgica Andina S.A.</h4>
                  <BadgeCheck className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Desarrollo de piezas industriales y tolvas para el agro.</p>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded-lg">Tier 1</span>
                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 text-[10px] uppercase font-bold tracking-widest rounded-lg border border-purple-500/20">Cotizar Rápido</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-5 p-5 border border-slate-200 dark:border-white/10 rounded-3xl bg-slate-50 dark:bg-[#1A1625] hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all cursor-pointer group">
              <div className="flex-none mt-1">
                 <div className="w-12 h-12 bg-white/5 group-hover:bg-purple-500/10 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:border-purple-500/20 transition-colors">
                    <Beaker className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-purple-400 transition-colors" />
                 </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">BioAgro Sur SRL</h4>
                  <BadgeCheck className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Fertilizantes orgánicos y servicios de análisis de suelo.</p>
                <div className="flex gap-2">
                  <span className="px-2.5 py-1 bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] uppercase font-bold tracking-widest rounded-lg">Tier 2</span>
                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 text-[10px] uppercase font-bold tracking-widest rounded-lg border border-purple-500/20">Ver Catálogo</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-white to-slate-50 dark:from-[#1C1827] dark:to-[#120E19] border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-12 text-slate-900 dark:text-white h-full min-h-[450px] flex flex-col justify-center relative overflow-hidden shadow-2xl shadow-purple-900/20"
        >
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-400 to-purple-600 rounded-2xl mb-2 p-[1px]">
               <div className="w-full h-full bg-slate-50 dark:bg-[#1C1827] rounded-2xl flex items-center justify-center">
                 <BadgeCheck className="w-7 h-7 text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-purple-500" />
               </div>
            </div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] mb-2 opacity-70 font-bold text-orange-400">Respaldo Institucional</h4>
            <div className="text-5xl font-display font-bold tracking-tight mb-2">+500 Negocios</div>
            <p className="text-base opacity-80 leading-relaxed font-medium text-slate-700 dark:text-slate-300">
              Nuestra plataforma asegura transacciones comerciales transparentes, reduciendo el riesgo operacional al conectar a las empresas patagónicas bajo estándares internacionales.
            </p>
            <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-[#110E17] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors mt-6 shadow-lg shadow-white/5">
               Quiero ser Proveedor
            </button>
          </div>
          
          {/* Decorative modern BG shapes */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
        </motion.div>
      </div>
    </section>
  );
}
