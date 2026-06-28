import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cookie } from 'lucide-react';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      // Simulate slight delay so it doesn't pop up instantly
      const timeout = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timeout);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  const declineCookies = () => {
    // Optionally handle decline logic, just hide for now
    localStorage.setItem('cookie-consent', 'false');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-6 left-6 right-8 md:left-auto md:right-6 md:max-w-sm z-[100] bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl shadow-purple-900/10"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-none mt-1">
              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                <Cookie className="w-5 h-5 text-orange-500" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Usamos cookies</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Utilizamos cookies propias y de terceros para mejorar tu experiencia y analizar el tráfico de nuestro sitio.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={acceptCookies}
              className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
            >
              Aceptar
            </button>
            <button
              onClick={declineCookies}
              className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            >
              Rechazar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
