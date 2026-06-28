import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Newspaper, Sparkles, TrendingUp, Briefcase, Map, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getApiUrl } from '../lib/apiConfig';

const hardcodedNews = [
  {
    id: 1,
    category: 'Turismo Corporativo',
    title: 'Nuevos centros de convenciones impulsan el turismo de negocios en Bariloche y Neuquén',
    excerpt: 'La apertura de nuevos espacios para eventos corporativos proyecta un crecimiento del 35% en la visita de ejecutivos a la región.',
    date: 'Hace 2 días',
    icon: Map,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    id: 2,
    category: 'Emprendedurismo',
    title: 'Startups patagónicas lideran la transición energética con IA',
    excerpt: 'Tres empresas locales levantaron rondas de inversión para escalar soluciones de eficiencia en el sector hidrocarburífero.',
    date: 'Hace 4 días',
    icon: Sparkles,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    id: 3,
    category: 'Empresarial',
    title: 'El impacto de la Ley de Promoción Industrial en las PyMEs proveedoras',
    excerpt: 'Análisis detallado de los beneficios fiscales y cómo prepararse para las nuevas licitaciones del régimen provincial.',
    date: 'Hace 1 semana',
    icon: Briefcase,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  }
];

export default function NewsMagazine() {
  const [news, setNews] = useState<any[]>(hardcodedNews);
  
  useEffect(() => {
    fetch(`${getApiUrl()}/api/insights`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formattedNews = data.slice(0, 3).map((item: any) => ({
            id: item.id,
            category: item.category,
            title: item.title,
            excerpt: item.content.substring(0, 150) + '...',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Reciente',
            icon: Newspaper,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
          }));
          setNews(formattedNews);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-[#0A080C] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-500/5 to-purple-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-600 mb-2">
              <Newspaper className="w-5 h-5 text-orange-500" />
              <span>Patagonia Insight</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
              Actualidad Empresarial & Negocios
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
              Resumen semanal estratégico sobre ecosistema corporativo, startups e innovación, 
              <span className="text-slate-900 dark:text-white font-medium ml-1">curado con Inteligencia Artificial.</span>
            </p>
          </div>
          
          <Link to="/insights" className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shrink-0">
            <span>Ver más noticias</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {news.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={item.id}
                className="group relative bg-slate-50 dark:bg-[#1A1625] rounded-3xl p-8 border border-slate-200 dark:border-white/5 hover:border-orange-500/30 transition-all flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`px-3 py-1.5 rounded-lg ${item.bg} flex items-center gap-2`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${item.color}`}>
                      {item.category}
                    </span>
                  </div>
                  <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-orange-500 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-grow">
                  {item.excerpt}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/10 mt-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.date}</span>
                  <Link to={`/insights`} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors group/btn">
                    <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover/btn:text-white transition-colors" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
