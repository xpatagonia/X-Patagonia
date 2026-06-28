import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ShoppingCart, ArrowRight, Building2, MapPin, Package, Shield, Settings, Ruler, ChevronDown, Check, Trash2, Send, Video, Droplets, Anchor, Tractor, Utensils, Pickaxe, Zap, Cpu, Hammer, Sprout, Wrench, Truck, Flame } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
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

const CATEGORIES = [
  { id: 'all', name: 'Todos los productos' },
  ...MAIN_CATEGORIES.map(cat => ({
    id: cat,
    name: cat,
    icon: CATEGORY_ICONS[cat] || Package
  }))
];

export default function Marketplace() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  const [productsDb, setProductsDb] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const prods: any[] = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProductsDb(prods);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching products", error);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const [sortBy, setSortBy] = useState('Relevancia');

  const uniqueBrands = Array.from(new Set(productsDb.filter(p => !!p.brand).map(p => p.brand))).sort();

  const filteredProducts = productsDb.filter(product => {
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    const matchesBrand = activeBrand === 'all' || product.brand === activeBrand;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesBrand && matchesSearch;
  }).sort((a, b) => {
     if (sortBy === 'Menor Precio') {
        const priceA = a.priceBase || 0;
        const priceB = b.priceBase || 0;
        return priceA - priceB;
     }
     if (sortBy === 'Mayor Precio') {
        const priceA = a.priceBase || 0;
        const priceB = b.priceBase || 0;
        return priceB - priceA;
     }
     return 0; // Relevancia
  });

  const handleQuoteRequest = (product: any) => {
    if (!cartItems.find(item => item.id === product.id)) {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };
  
  const handleRemoveFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  const handleSubmitRFQ = () => {
    setCartItems([]);
    setIsCartOpen(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A080C] pt-24 pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#1A1625] border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
                Marketplace B2B
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Inspecciona catálogo, compara proveedores y centraliza tus compras industriales.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-slate-100 dark:bg-black/20 rounded-xl hover:bg-slate-200 dark:hover:bg-black/40 transition-colors text-slate-700 dark:text-slate-300"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsCartOpen(true)}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold uppercase tracking-wider transition-colors text-sm"
              >
                Ir al Checkout (RFQ)
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por equipo, repuesto, código SKU o proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar / Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Categorías
              </h3>
              <div className="space-y-2">
                {CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      activeCategory === category.id
                        ? 'bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-4 h-4" /> Marcas
              </h3>
              <select 
                 value={activeBrand} 
                 onChange={(e) => setActiveBrand(e.target.value)}
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-orange-500/50 outline-none transition-all text-sm text-slate-900 dark:text-white"
              >
                 <option value="all">Todas las marcas</option>
                 {uniqueBrands.map(brand => (
                    <option key={brand as string} value={brand as string}>{brand}</option>
                 ))}
              </select>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
                Disponibilidad
              </h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-slate-300 dark:border-white/20 group-hover:border-orange-500 transition-colors flex items-center justify-center">
                   {/* Checkmark logic could go here */}
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Stock Inmediato
                </span>
              </label>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-slate-500">
                Mostrando <span className="font-bold text-slate-900 dark:text-white">{filteredProducts.length}</span> resultados
              </p>
              
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span>Ordenar por:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent font-bold outline-none cursor-pointer">
                  <option value="Relevancia">Relevancia</option>
                  <option value="Menor Precio">Menor Precio</option>
                  <option value="Mayor Precio">Mayor Precio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredProducts.map(product => (
                  <motion.div
                    key={product.id}
                    layout text-center
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white dark:bg-[#1A1625] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group"
                  >
                    <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-[#110E17]">
                      <img 
                        src={product.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-black/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-md text-slate-900 dark:text-white">
                          MOD: B2B-Nativo
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="flex flex-col gap-1.5 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1">
                            {product.supplier || 'Compañía en Plataforma'}
                            {product.verified && (
                              <Check className="w-3 h-3 text-emerald-500" title="Proveedor Verificado" />
                            )}
                          </span>
                        </div>
                        {product.location && (
                          <div className="flex items-center gap-1.5 px-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {product.location}
                            </span>
                          </div>
                        )}
                      </div>

                      {product.description && (
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2" title={product.description}>
                          {product.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.condition && (
                          <span className={`px-2 py-0.5 text-[10px] rounded border font-medium ${
                            product.condition === 'Nuevo' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                              : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                          }`}>
                            {product.condition}
                          </span>
                        )}
                        {product.year && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#110E17] text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-200 dark:border-white/10">
                            Año {product.year}
                          </span>
                        )}
                        {product.usageHours && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#110E17] text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-200 dark:border-white/10">
                            {product.usageHours} hs uso
                          </span>
                        )}
                        {product.warranty && (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-[#110E17] text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-200 dark:border-white/10">
                            Gar. {product.warranty}
                          </span>
                        )}
                      </div>
                      
                      {product.paymentMethods && product.paymentMethods.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                           <span className="text-[10px] text-slate-400 mr-1 self-center">Pago:</span>
                           {product.paymentMethods.map((pm: string) => (
                             <span key={pm} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] rounded-md font-medium whitespace-nowrap">
                               {pm}
                             </span>
                           ))}
                        </div>
                      )}

                      {product.shippingConditions && product.shippingConditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                           <span className="text-[10px] text-slate-400 mr-1 self-center">Envío:</span>
                           {product.shippingConditions.map((sc: string) => (
                             <span key={sc} className="px-1.5 py-0.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] rounded-md font-medium whitespace-nowrap">
                               {sc}
                             </span>
                           ))}
                        </div>
                      )}

                      {product.videoUrl && (
                        <div className="mb-4">
                          <a 
                            href={product.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors border border-red-200 dark:border-red-500/20"
                          >
                            <Video className="w-3.5 h-3.5" />
                            Ver Video del Producto
                          </a>
                        </div>
                      )}

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Precio (Neto Referencia)</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {product.priceBase ? `$${product.priceBase.toLocaleString()}` : (product.price || 'A cotizar')}
                          </span>
                        </div>
                        {product.taxRate && (
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Impuestos (IVA)</span>
                            <span className="font-medium text-slate-500 dark:text-slate-400">
                              {product.taxRate}%
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">MOQ</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {product.moq} {product.moq === 1 ? 'unidad' : 'unidades'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Entrega</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{product.leadTime || 'A coordinar'}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleQuoteRequest(product)}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2 group/btn ${
                          cartItems.find(i => i.id === product.id) 
                            ? 'bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 cursor-default'
                            : 'bg-slate-100 hover:bg-orange-500 dark:bg-white/5 dark:hover:bg-orange-500 text-slate-900 hover:text-white dark:text-white'
                        }`}
                        disabled={!!cartItems.find(i => i.id === product.id)}
                      >
                        <ShoppingCart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 
                        {cartItems.find(i => i.id === product.id) ? 'Añadido a Cotización' : 'Agregar a Cotización'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white dark:bg-[#1A1625] rounded-2xl border border-slate-200 dark:border-white/10">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No se encontraron productos</h3>
                <p className="text-slate-500">Prueba con otros términos de búsqueda o filtros.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[9998] flex justify-end">
            <motion.div 
              initial={{ bg: 'transparent' }} 
              animate={{ backgroundColor: 'rgba(0,0,0,0.5)' }} 
              exit={{ backgroundColor: 'transparent' }} 
              className="absolute inset-0 backdrop-blur-sm" 
              onClick={() => setIsCartOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full z-[9999] bg-white dark:bg-[#1A1625] shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-orange-500" />
                  Borrador de Solicitud (RFQ)
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-300 rounded-lg">
                  Cerrar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-500">No hay productos en su cotización aún.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-4 bg-orange-50 dark:bg-orange-500/10 p-3 rounded-lg border border-orange-100 dark:border-orange-500/20">
                      Revise los ítems solicitados. Se enviará un Request For Quotation (RFQ) multiproveedor a los dueños de dichos catálogos de manera simultánea.
                    </p>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 items-center bg-white dark:bg-[#110E17] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                        <img src={item.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400'} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h4>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">{item.supplier || 'Compañía en Plataforma'}</p>
                          <p className="text-xs font-bold text-orange-500">{item.priceBase ? `$${item.priceBase.toLocaleString()}` : (item.price || 'A cotizar')}</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mensaje Adicional / Aclaraciones</label>
                      <textarea 
                        rows={4}
                        placeholder="Especificar urgencia de entrega, locación, requerimientos de facturación..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1A1625] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17]">
                <button 
                  onClick={handleSubmitRFQ}
                  disabled={cartItems.length === 0}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Emitir Cotizaciones (RFQ)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-[9999] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 dark:border-white/20"
          >
            <Check className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="font-bold text-sm">RFQs Enviados Exitosamente</p>
              <p className="text-xs opacity-80">Los proveedores notificados responderán pronto.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
