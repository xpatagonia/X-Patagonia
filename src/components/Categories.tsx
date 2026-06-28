import { motion } from 'motion/react';
import { Building2, Sprout, Hammer, Wrench, Truck, Flame, Anchor, Utensils, Pickaxe, Zap, Cpu, Package, Shield, Settings, Droplets } from 'lucide-react';
import { MAIN_CATEGORIES } from '../lib/categories';

const CATEGORY_ICONS: Record<string, any> = {
  'Construcción': Building2,
  'Agroindustria': Sprout,
  'Metalúrgica': Hammer,
  'Servicios': Wrench,
  'Logística': Truck,
  'Hidrocarburos (Oil & Gas)': Flame,
  'Industria Pesquera': Anchor,
  'Alimentación y Bebidas': Utensils,
  'Minería': Pickaxe,
  'Energías Renovables': Zap,
  'Tecnología e Innovación': Cpu,
  'Equipamiento Industrial': Package,
  'Seguridad e Higiene (EPP)': Shield,
  'Repuestos y Metalmecánica': Settings,
  'Insumos y Consumibles': Droplets,
};

const CATEGORIES = MAIN_CATEGORIES.map((cat, index) => ({
  id: index + 1,
  name: cat,
  icon: CATEGORY_ICONS[cat] || Package,
  count: Math.floor(Math.random() * 300) + 50 // Mock count
}));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Categories() {
  return (
    <section id="categorias" className="py-24 px-6 md:px-12 bg-slate-50 dark:bg-[#110E17]/50 border-t border-slate-200 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center md:text-left mb-16 md:flex justify-between items-end">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Explora por Categorías
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Directorio estructurado para facilitar la integración de compras corporativas. Estas categorías se sincronizarán directamente con nuestro sistema de gestión.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mt-6 md:mt-0"
          >
            <a
              href="/servicios"
              className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              Ver Directorio Completo &rarr;
            </a>
          </motion.div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {CATEGORIES.map((category) => (
            <motion.a
              key={category.id}
              href="/servicios"
              variants={itemVariants}
              className="group flex items-center p-6 bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-900/10 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex-none p-4 bg-slate-50 dark:bg-white/5 rounded-xl group-hover:bg-orange-500/10 group-hover:text-orange-500 text-slate-400 transition-colors">
                <category.icon className="w-8 h-8" />
              </div>
              <div className="ml-6 flex-1">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {category.count} empresas verificadas
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
