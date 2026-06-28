import { motion } from 'motion/react';
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000); 
    }, 1500);
  };

  return (
    <section id="rfq" className="py-24 px-6 md:px-12 bg-slate-50 dark:bg-[#0C0A11] text-slate-900 dark:text-white border-t border-slate-100 dark:border-white/5">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 tracking-tight">Solicitar Cotización <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-500">(RFQ)</span></h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#A855F7] mb-4">Genera múltiples presupuestos</p>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-medium">Completa los requerimientos de tu empresa y el Hub conectará tu solicitud con proveedores verificados según tus necesidades.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-slate-50 dark:bg-[#1A1625] rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-purple-900/10 border border-slate-200 dark:border-white/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-purple-600/10 blur-[60px] pointer-events-none"></div>
          
          <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">Nombre de Empresa</label>
                <input required type="text" className="w-full px-5 py-4 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-base font-medium text-slate-900 dark:text-white" placeholder="Odoo Latam S.A." />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">Email Corporativo</label>
                <input required type="email" className="w-full px-5 py-4 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-base font-medium text-slate-900 dark:text-white" placeholder="compras@empresa.com" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">Categoría Principal</label>
                  <select className="w-full px-5 py-4 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all text-base font-medium appearance-none cursor-pointer text-slate-900 dark:text-white">
                    <option value="logistica" className="bg-white dark:bg-[#110E17]">Logística y Supply Chain</option>
                    <option value="maquinaria" className="bg-white dark:bg-[#110E17]">Ingeniería e Industrial</option>
                    <option value="agro" className="bg-white dark:bg-[#110E17]">AgroTech e Insumos</option>
                    <option value="it" className="bg-white dark:bg-[#110E17]">Sistemas e Infraestructura IT</option>
                  </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">Presupuesto Estimado (USD)</label>
                  <select className="w-full px-5 py-4 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all text-base font-medium appearance-none cursor-pointer text-slate-900 dark:text-white">
                    <option value="1" className="bg-white dark:bg-[#110E17]">- Consultar precio -</option>
                    <option value="2" className="bg-white dark:bg-[#110E17]">Menos de $1,000</option>
                    <option value="3" className="bg-white dark:bg-[#110E17]">$1,000 - $10,000</option>
                    <option value="4" className="bg-white dark:bg-[#110E17]">Más de $10,000</option>
                  </select>
              </div>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-3">Detalles del Requerimiento / Volumen de Compra</label>
              <textarea required rows={5} className="w-full px-5 py-4 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-600 text-base font-medium resize-none text-slate-900 dark:text-white" placeholder="Especificar cantidades, fechas de entrega, estándares técnicos requeridos..."></textarea>
            </div>
            
            <button 
              type="submit" 
              disabled={status !== 'idle'}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-slate-900 dark:text-white text-[11px] font-bold uppercase tracking-widest py-5 rounded-xl hover:opacity-90 transition-all duration-300 disabled:opacity-70 flex justify-center items-center shadow-lg shadow-purple-500/20"
            >
              {status === 'submitting' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : status === 'success' ? (
                <span>Solicitud Enviada (Se notificará vía Odoo)</span>
              ) : (
                <span className="flex items-center gap-2">Generar Oportunidad B2B <ArrowRight className="w-4 h-4" /></span>
              )}
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              Conectado mediante Odoo RPC al módulo de Compras / Ventas B2B
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
