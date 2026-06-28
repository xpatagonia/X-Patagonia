import { ArrowRight, Search, Zap, Droplet, Wrench, Truck, Anchor, Building2, Cpu, Shield, Wheat, Utensils } from 'lucide-react';
import { motion } from 'motion/react';

const categories = [
  { id: 'alimentacion', name: 'Alimentación', icon: Utensils, count: 85 },
  { id: 'productivo', name: 'Sector Productivo (Ovina, Bovina, Cerdos)', icon: Wheat, count: 180 },
  { id: 'pesca', name: 'Pesca y Acuicultura (Flotas, Procesadoras)', icon: Anchor, count: 156 },
  { id: 'metalurgico', name: 'Sector Metalúrgico y Metalmecánico', icon: Wrench, count: 231 },
  { id: 'logistica', name: 'Puertos y Logística Terrestre / Almacenamiento', icon: Truck, count: 289 },
  { id: 'hidrocarburos', name: 'Hidrocarburos', icon: Droplet, count: 342 },
  { id: 'energia', name: 'Energías Renovables (Eólica, Solar)', icon: Zap, count: 124 },
  { id: 'construccion', name: 'Construcción Civil e Infraestructura', icon: Building2, count: 412 },
  { id: 'tecnologia', name: 'Tecnología e Innovación', icon: Cpu, count: 87 },
  { id: 'seguridad', name: 'Seguridad e Higiene Integral', icon: Shield, count: 215 },
];

const featuredServices = [
  { id: 1, title: 'Mantenimiento Electromecánico Integral', category: 'Servicios Industriales', company: 'PatagoniaTech Solutions', location: 'Comodoro Rivadavia, Chubut' },
  { id: 2, title: 'Transporte de Cargas Peligrosas', category: 'Logística y Transporte', company: 'Logística Austral S.A.', location: 'Neuquén Capital' },
  { id: 3, title: 'Inspección de Soldaduras por Ultrasonido', category: 'Hidrocarburos', company: 'NorteSur Inspecciones', location: 'Río Grande, Tierra del Fuego' },
  { id: 4, title: 'Instalación de Paneles Solares Industriales', category: 'Energías Renovables', company: 'RenovaPatagonia', location: 'Puerto Madryn, Chubut' },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header section */}
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Directorio de Servicios</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Encuentra proveedores certificados y empresas prestadoras de servicios en toda la región patagónica.
          </p>
          
          <div className="mt-8 relative max-w-2xl">
            <input 
              type="text" 
              placeholder="Buscar por servicio, empresa o palabra clave..." 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 transition">
              Buscar
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Explorar por Categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={cat.id} 
                  className="bg-white dark:bg-[#1A1625] p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md cursor-pointer group transition-all"
                >
                  <Icon className="w-6 h-6 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-500">{cat.count} proveedores</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Featured list */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Servicios Destacados</h2>
            <button className="text-xs font-bold uppercase tracking-wider text-orange-500 hover:text-orange-600 transition flex items-center">
              Ver todos <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredServices.map(service => (
              <div key={service.id} className="bg-white dark:bg-[#1A1625] p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row gap-6 shadow-sm hover:border-orange-500/30 transition-colors cursor-pointer group">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                  <Wrench className="w-8 h-8 text-slate-400 group-hover:text-orange-500 transition-colors" />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                    {service.category}
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-orange-500 transition-colors">{service.title}</h3>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{service.company}</p>
                  <p className="text-xs text-slate-500">{service.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
