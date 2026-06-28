import { motion } from 'motion/react';
import { Search, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Hero() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.currentUser) {
      navigate('/dashboard');
    } else {
      // You can implement AuthModal opening here, or just navigate to a public search 
      // where we could have a "sign up to view details" logic. 
      // For now, we'll prompt to login if they try to search to keep the B2B context secure.
      alert('Debes iniciar sesión para realizar búsquedas en el directorio de industrias.');
    }
  };

  return (
    <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden px-6 md:px-12 bg-white dark:bg-[#110E17]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/50 via-white to-white dark:from-purple-900/20 dark:via-[#110E17] dark:to-[#110E17] -z-10"></div>
      
      <div className="max-w-5xl mx-auto relative text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-10 shadow-sm backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 mr-2 text-orange-400" />
            Directorio B2B Oficial de la Patagonia
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] mb-8 text-slate-900 dark:text-white tracking-tight">
            El Hub de Servicios para la <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">Industria Sostenible</span>
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12 font-medium">
            Encuentra proveedores locales verificados, solicita cotizaciones múltiples (RFQ) y escala tus operaciones con la red empresarial más grande del sur.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-slate-50 dark:bg-[#1A1625] p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
             <div className="pl-6 pr-4 hidden sm:block border-r border-slate-200 dark:border-white/10">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-transparent text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none cursor-pointer max-w-[200px] truncate"
                >
                  <option value="Todas" className="bg-slate-50 dark:bg-[#1A1625]">Todas las categorías</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Alimentación</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Sector Productivo (Ovina, Bovina, Cerdos)</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Pesca y Acuicultura (Flotas, Procesadoras)</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Sector Metalúrgico y Metalmecánico</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Puertos y Logística Terrestre / Almacenamiento</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Hidrocarburos</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Energías Renovables (Eólica, Solar)</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Construcción Civil e Infraestructura</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Tecnología e Innovación</option>
                  <option className="bg-slate-50 dark:bg-[#1A1625]">Seguridad e Higiene Integral</option>
                </select>
             </div>
             <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué servicio o insumo necesita tu empresa?" 
                className="w-full px-6 py-4 bg-transparent outline-none text-base placeholder:text-slate-500 font-medium text-slate-900 dark:text-white" 
             />
             <button type="submit" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-[11px] uppercase tracking-widest font-bold rounded-xl hover:opacity-90 transition duration-300 flex items-center whitespace-nowrap shadow-lg shadow-purple-500/25">
               <Search className="w-5 h-5 sm:mr-2" />
               <span className="hidden sm:block">Buscar</span>
             </button>
          </form>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Búsquedas frecuentes:</span>
            <button onClick={() => setQuery('Logística Frío')} className="text-slate-700 dark:text-slate-300 hover:text-orange-400 transition-colors">Logística Frío</button>
            <span className="text-slate-700">•</span>
            <button onClick={() => setQuery('Auditoría Ambiental')} className="text-slate-700 dark:text-slate-300 hover:text-orange-400 transition-colors">Auditoría Ambiental</button>
            <span className="text-slate-700">•</span>
            <button onClick={() => setQuery('Maquinaria Agrícola')} className="text-slate-700 dark:text-slate-300 hover:text-orange-400 transition-colors">Maquinaria Agrícola</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
