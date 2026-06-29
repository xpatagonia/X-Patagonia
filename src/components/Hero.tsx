import { motion, AnimatePresence } from 'motion/react';
import { Search, ShieldCheck, Sparkles, Bot, LineChart, Network, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';

function ModernTextReveal({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const words = text.split(" ");
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, words.length * 150 + 600);
    return () => clearTimeout(timeout);
  }, [words.length, onComplete]);

  return (
    <motion.span
      className="inline-flex flex-wrap justify-center gap-x-[0.25em]"
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.12 } }
      }}
    >
      {words.map((word, i) => {
        // Highlight specific words to keep the gradient look
        const isHighlight = ["Inteligentes", "Patagonia", "Industria"].includes(word.replace(/[.,]/g, ''));
        
        return (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" }
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={isHighlight ? "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600" : "text-slate-900 dark:text-white"}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

const framesConfig = [
  {
    id: 0,
    tag: "Asistente IA de xPatagonia",
    icon: Bot,
    title: "El Hub de Servicios Inteligentes para la Industria en Patagonia",
    subtitle: "¿En qué puedo ayudarte hoy? Te ayudo a encontrar proveedores y servicios B2B.",
    type: "search"
  },
  {
    id: 1,
    tag: "Inteligencia Estratégica",
    icon: LineChart,
    title: "Datos y Tendencias para la Toma de Decisiones B2B",
    subtitle: "Accede a reportes, análisis de mercado y novedades sobre negocios y sostenibilidad.",
    type: "insights"
  },
  {
    id: 2,
    tag: "Red Empresarial",
    icon: Network,
    title: "Conecta con Proveedores Validados y Certificados",
    subtitle: "Únete a la red de negocios de la región. Encuentra socios y escala tus operaciones.",
    type: "directory"
  }
];

export default function Hero() {
  const [activeFrame, setActiveFrame] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [suggestions, setSuggestions] = useState<string[]>(['Logística Frío', 'Auditoría Ambiental', 'Maquinaria Agrícola']);
  const [showForm, setShowForm] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAiSuggestions() {
      setSuggestionsLoading(true);
      try {
        const res = await fetch('/api/hero-suggestions', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.suggestions && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI suggestions:", err);
      }
      setSuggestionsLoading(false);
    }
    
    // Fetch suggestions in background while typing happens
    fetchAiSuggestions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setShowForm(false);
      setTimeout(() => {
        setActiveFrame((prev) => (prev + 1) % framesConfig.length);
      }, 300);
    }, 15000); // 15 seconds

    return () => clearInterval(timer);
  }, [activeFrame]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth.currentUser) {
      navigate('/dashboard');
    } else {
      alert('Debes iniciar sesión para realizar búsquedas en el directorio de industrias.');
    }
  };

  return (
    <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden px-6 md:px-12 bg-white dark:bg-[#110E17] min-h-[600px] flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-200/50 via-white to-white dark:from-purple-900/20 dark:via-[#110E17] dark:to-[#110E17] -z-10"></div>
      
      <div className="max-w-5xl mx-auto relative text-center w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            key={`tag-${activeFrame}`}
            animate={{ y: [0, -4, 0], opacity: [0, 1] }}
            initial={{ opacity: 0 }}
            transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" }, opacity: { duration: 0.5 } }}
            className="inline-flex items-center px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/5 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest mb-10 shadow-sm backdrop-blur-sm"
          >
            {React.createElement(framesConfig[activeFrame].icon, { className: "w-4 h-4 mr-2 text-purple-500" })}
            {framesConfig[activeFrame].tag}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.2] mb-8 text-slate-900 dark:text-white tracking-tight h-[180px] md:h-[160px] flex items-center justify-center">
            <div>
              <ModernTextReveal 
                key={`title-${activeFrame}`}
                text={framesConfig[activeFrame].title} 
                onComplete={() => setShowForm(true)}
              />
            </div>
          </h1>
          
          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key={`content-${activeFrame}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[220px]"
              >
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-12 font-medium flex items-center justify-center">
                  <Sparkles className="w-5 h-5 mr-2 text-orange-400" />
                  {framesConfig[activeFrame].subtitle}
                </p>
                
                {framesConfig[activeFrame].type === 'search' && (
                  <>
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-slate-50 dark:bg-[#1A1625] p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center focus-within:border-purple-500/50 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
                      <div className="pl-6 pr-4 hidden sm:block border-r border-slate-200 dark:border-white/10">
                          <select 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="bg-transparent text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none cursor-pointer max-w-[200px] truncate"
                          >
                            <option value="Todas" className="bg-slate-50 dark:bg-[#1A1625]">Todas las categorías</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Alimentación</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Sector Productivo</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Pesca y Acuicultura</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Sector Metalúrgico</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Puertos y Logística</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Hidrocarburos</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Energías Renovables</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Construcción Civil</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Tecnología</option>
                            <option className="bg-slate-50 dark:bg-[#1A1625]">Seguridad e Higiene</option>
                          </select>
                      </div>
                      <input 
                          type="text" 
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Ej. Servicios de limpieza industrial..." 
                          className="w-full px-6 py-4 bg-transparent outline-none text-base placeholder:text-slate-500 font-medium text-slate-900 dark:text-white" 
                      />
                      <button type="submit" className="px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white text-[11px] uppercase tracking-widest font-bold rounded-xl hover:opacity-90 transition duration-300 flex items-center whitespace-nowrap shadow-lg shadow-purple-500/25">
                        <Search className="w-5 h-5 sm:mr-2" />
                        <span className="hidden sm:block">Buscar</span>
                      </button>
                    </form>
                    
                    <div className="mt-10 flex flex-wrap justify-center items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <span className="flex items-center">
                        {suggestionsLoading ? (
                          <span className="animate-pulse">Generando sugerencias IA...</span>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1 text-purple-500" />
                            Sugerencias IA:
                          </>
                        )}
                      </span>
                      
                      {!suggestionsLoading && suggestions.map((sug, i) => (
                        <React.Fragment key={i}>
                          <button onClick={() => setQuery(sug)} className="text-slate-700 dark:text-slate-300 hover:text-purple-500 transition-colors">
                            {sug}
                          </button>
                          {i < suggestions.length - 1 && <span className="text-slate-700">•</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}

                {framesConfig[activeFrame].type === 'insights' && (
                  <div className="flex justify-center mt-8">
                    <Link to="/insights" className="px-10 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[13px] uppercase tracking-widest font-bold rounded-2xl hover:opacity-90 transition duration-300 flex items-center shadow-lg shadow-blue-500/25">
                      Explorar Insights y Noticias
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Link>
                  </div>
                )}

                {framesConfig[activeFrame].type === 'directory' && (
                  <div className="flex justify-center mt-8">
                    <Link to="/directory" className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[13px] uppercase tracking-widest font-bold rounded-2xl hover:opacity-90 transition duration-300 flex items-center shadow-lg shadow-teal-500/25">
                      Acceder al Directorio B2B
                      <ArrowRight className="w-5 h-5 ml-3" />
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-16 flex justify-center gap-3">
            {framesConfig.map((frame, idx) => (
              <button
                key={frame.id}
                onClick={() => {
                  if (activeFrame !== idx) {
                    setShowForm(false);
                    setTimeout(() => setActiveFrame(idx), 300);
                  }
                }}
                className={`h-2 rounded-full transition-all duration-500 ${activeFrame === idx ? 'bg-purple-500 w-16' : 'bg-slate-300 dark:bg-slate-700 w-6 hover:bg-purple-400'}`}
                aria-label={`Ir al slide ${idx + 1}`}
              />
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
