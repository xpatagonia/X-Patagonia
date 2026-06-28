import { motion } from 'motion/react';
import { Truck, Sprout, Settings2, Briefcase, ChevronRight } from 'lucide-react';

const categories = [
  {
    id: 'logistica',
    title: 'Logística & Supply Chain',
    description: 'Transporte de carga, cadena de frío e infraestructura para comercio internacional.',
    icon: Truck
  },
  {
    id: 'agrotech',
    title: 'AgroTech & Bioinsumos',
    description: 'Servicios agronómicos, biotecnología, monitoreo y soluciones satelitales.',
    icon: Sprout
  },
  {
    id: 'industrial',
    title: 'Ingeniería & Maquinaria',
    description: 'Mantenimiento industrial, desarrollo de piezas, automatización y energías.',
    icon: Settings2
  },
  {
    id: 'consulting',
    title: 'Consultoría & Finanzas',
    description: 'Servicios legales, certificaciones de triple impacto y gestión contable.',
    icon: Briefcase
  }
];

export default function EcosystemGrid() {
  return (
    <section id="categorias" className="py-24 px-6 md:px-12 bg-slate-50 dark:bg-[#0C0A11] border-t border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-orange-400 mb-3">Directorio B2B</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Categorías de Servicios</h2>
          </div>
          <a href="#" className="flex items-center text-sm font-bold text-slate-900 dark:text-white hover:text-orange-400 transition-colors uppercase tracking-wider group">
            Explorar todas <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div 
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="bg-slate-50 dark:bg-[#1A1625] border border-slate-100 dark:border-white/5 rounded-3xl p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 cursor-pointer transition-all duration-300 group flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-purple-500/10 rounded-full blur-[40px] -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>
              <div className="w-14 h-14 bg-white/5 group-hover:bg-purple-500/10 border border-slate-200 dark:border-white/10 group-hover:border-purple-500/20 rounded-2xl mb-8 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-purple-400 transition-colors relative z-10">
                <category.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-slate-900 dark:text-white tracking-tight relative z-10">{category.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-grow relative z-10">
                {category.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
