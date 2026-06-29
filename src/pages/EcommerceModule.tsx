import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Box, Search, PackageCheck, AlertTriangle, ListFilter, Plus, ShoppingCart, Tag, Share2, Download, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const INITIAL_PRODUCTS = [
  { id: '1', sku: 'BMB-200', name: 'Bomba Centrífuga 200HP', category: 'Maquinaria', price: 15400, stock: 12, compliance: ['ISO 9001', 'API 610'], isPublic: true },
  { id: '2', sku: 'MTR-300', name: 'Motor Trifásico Industrial', category: 'Eléctrico', price: 8200, stock: 24, compliance: ['ISO 14001', 'IEC 60034'], isPublic: true },
  { id: '3', sku: 'VLV-050', name: 'Válvula Esférica 4"', category: 'Componentes', price: 850, stock: 145, compliance: ['ISO 9001'], isPublic: false },
  { id: '4', sku: 'FLT-020', name: 'Filtro Coalescente', category: 'Insumos', price: 340, stock: 50, compliance: [], isPublic: true },
];

export default function EcommerceModule() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeTab, setActiveTab] = useState<'catalogo' | 'pedidos'>('catalogo');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const input = document.getElementById('catalog-report');
    if (!input) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setFontSize(16);
      pdf.text('Catálogo de Productos B2B', 15, 15);
      
      pdf.addImage(imgData, 'PNG', 0, 20, pdfWidth, pdfHeight);
      pdf.save('Catalogo_B2B.pdf');
    } catch (err) {
      console.error('Error generating PDF', err);
    }
    setIsExporting(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Catálogo de Productos B2B',
        text: 'Revisa nuestro catálogo de productos con certificación de calidad.',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('La función de compartir no está disponible en este navegador. Copia la URL manualmente.');
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50 dark:bg-[#0A080C]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Box className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">E-commerce B2B</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400">Catálogo de productos, certificación de normas y gestión de pedidos.</p>
          </div>
          <div className="flex gap-4">
             <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl font-bold bg-white dark:bg-[#1A1625] hover:bg-slate-50 dark:hover:bg-white/5 transition disabled:opacity-50"
             >
                {isExporting ? <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span> : <Download className="w-4 h-4 text-purple-500" />}
                Exportar
             </button>
             <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition"
             >
                <Share2 className="w-4 h-4" />
                Compartir
             </button>
          </div>
        </div>

        <div className="flex gap-2 mb-8 bg-slate-100 dark:bg-black/20 p-1.5 rounded-2xl w-full sm:w-fit overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'catalogo' 
                ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Catálogo de Productos
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'pedidos' 
                ? 'bg-white dark:bg-[#1A1625] text-purple-600 dark:text-purple-400 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pedidos Activos
            <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg text-xs">3</span>
          </button>
        </div>

        {activeTab === 'catalogo' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                 <div className="flex items-center gap-3 mb-2 text-slate-500">
                    <Box className="w-5 h-5" />
                    <h4 className="font-bold text-sm">Total Productos</h4>
                 </div>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">{products.length}</p>
              </div>
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                 <div className="flex items-center gap-3 mb-2 text-emerald-500">
                    <CheckCircle className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-slate-500">Con Normas</h4>
                 </div>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">{products.filter(p => p.compliance.length > 0).length}</p>
              </div>
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                 <div className="flex items-center gap-3 mb-2 text-purple-500">
                    <Search className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-slate-500">Públicos</h4>
                 </div>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">{products.filter(p => p.isPublic).length}</p>
              </div>
              <div className="bg-white dark:bg-[#1A1625] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                 <div className="flex items-center gap-3 mb-2 text-orange-500">
                    <ShoppingCart className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-slate-500">En Carritos</h4>
                 </div>
                 <p className="text-3xl font-bold text-slate-900 dark:text-white">12</p>
              </div>
            </div>

            <div id="catalog-report" className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
               <div className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-2 relative w-full sm:w-auto">
                     <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                        type="text" 
                        placeholder="Buscar por SKU o Nombre..." 
                        className="pl-10 pr-4 py-2.5 w-full sm:w-64 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                     />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                     <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition">
                        <ListFilter className="w-4 h-4" /> Filtros
                     </button>
                     <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 border border-transparent rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition">
                        <Plus className="w-4 h-4" /> Agregar Producto
                     </button>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#110E17]/50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Producto y SKU</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Normas (Compliance)</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Precio Mayorista</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                      {products.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              {item.name}
                              {item.isPublic && <span title="Visible en Catálogo Público"><Tag className="w-3 h-3 text-purple-500" /></span>}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs">{item.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {item.compliance.length > 0 ? item.compliance.map(norma => (
                                <span key={norma} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs rounded-md">
                                  {norma}
                                </span>
                              )) : <span className="text-slate-400 text-xs italic">Sin normativas</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                            ${item.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {item.stock > 0 
                              ? <span className="font-mono text-emerald-600 dark:text-emerald-400">{item.stock} un.</span>
                              : <span className="text-red-500 font-bold text-xs uppercase bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded">Quiebre</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pedidos' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Pedidos Recientes</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">Todos tus pedidos B2B se mostrarán aquí para su gestión de despachos rápidos.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
