import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Building2, Wallet, CheckCircle, Shield, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
  moduleName: string;
  price: string;
}

export default function CheckoutModal({ isOpen, onClose, onConfirm, moduleName, price }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onConfirm(paymentMethod);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#1A1625] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-orange-500" />
                Finalizar Contratación
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-[#110E17]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Módulo:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{moduleName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total a Pagar:</span>
                <span className="text-2xl font-bold text-orange-500">{price}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Método de Pago</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-xl border-2 flex flex-col justify-center gap-2 transition-colors ${
                      paymentMethod === 'card' 
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' 
                      : 'border-slate-200 dark:border-white/10 bg-transparent hover:border-orange-300 dark:hover:border-white/20'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 ${paymentMethod === 'card' ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold ${paymentMethod === 'card' ? 'text-orange-700 dark:text-orange-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      Tarjeta
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-4 rounded-xl border-2 flex flex-col justify-center gap-2 transition-colors ${
                      paymentMethod === 'transfer' 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10' 
                      : 'border-slate-200 dark:border-white/10 bg-transparent hover:border-purple-300 dark:hover:border-white/20'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 ${paymentMethod === 'transfer' ? 'text-purple-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-bold ${paymentMethod === 'transfer' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      Transferencia
                    </span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Número de Tarjeta
                    </label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Vencimiento
                      </label>
                      <input 
                        type="text" 
                        placeholder="MM/AA"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        CVC
                      </label>
                      <input 
                        type="text" 
                        placeholder="123"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Nombre en la tarjeta
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ej. Juan Pérez"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                      <div className="space-y-2 text-sm text-purple-900 dark:text-purple-200">
                        <p className="font-medium">Datos bancarios para la transferencia:</p>
                        <p><strong>CBU/CVU:</strong> 0000003100000000000000</p>
                        <p><strong>Alias:</strong> patagonia.hub.app</p>
                        <p><strong>Banco:</strong> Banco Nación</p>
                        <p className="text-xs mt-2 opacity-80">
                          Una vez confirmada, tu solicitud pasará a revisión hasta que se acredite el pago.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20"
                >
                  {isProcessing ? (
                    'Procesando...'
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Confirmar Pago
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="w-3.5 h-3.5" />
                  Pago seguro y encriptado
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
