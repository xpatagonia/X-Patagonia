import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Package, Edit2, Trash2, Tag, Upload, Zap, Ruler, Shield, Settings, Check, Filter } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { INDUSTRIAL_CATEGORIES } from '../lib/categories';

const CERTIFICATIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'API Spec', 'ASME', 'IRAM', 'NEMA', 'CE', 'ATEX'
];

const PAYMENT_METHODS = [
  'Transferencia Bancaria', 'Efectivo', 'Cheque a 30 días', 'Cheque a 60 días', 'Cheque a 90 días', 'Tarjeta de Crédito', 'Mercado Pago', 'Criptomonedas'
];

const SHIPPING_CONDITIONS = [
  'A convenir', 'Retiro en sucursal', 'Envío a cargo del comprador', 'Envío incluido (Gratis)', 'FOB', 'CIF', 'EXW'
];

export default function CompanyProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [qrModalProduct, setQrModalProduct] = useState<any | null>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Equipamiento Industrial',
    subcategory: '',
    brand: '',
    model: '',
    condition: 'Nuevo',
    year: '',
    usageHours: '',
    warranty: '',
    priceBase: '',
    priceWholesale: '',
    stock: '',
    moq: '1',
    description: '',
    certifications: [] as string[],
    paymentMethods: [] as string[],
    shippingConditions: [] as string[],
    leadTime: '',
    location: '',
    supplier: '',
    videoUrl: '',
    taxRate: '21'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const openNewModal = () => {
    setEditingId(null);
    setProductImage(null);
    
    let defaultSupplier = '';
    let defaultLocation = '';
    
    if (companyProfile) {
      defaultSupplier = companyProfile.companyName || '';
      if (companyProfile.city && companyProfile.province) {
        defaultLocation = `${companyProfile.city}, ${companyProfile.province}`;
      } else {
        defaultLocation = companyProfile.city || companyProfile.province || '';
      }
    }
    
    setNewProduct({
      sku: '', name: '', category: 'Equipamiento Industrial', subcategory: '', brand: '', model: '', 
      condition: 'Nuevo', year: '', usageHours: '', warranty: '',
      priceBase: '', priceWholesale: '', stock: '', moq: '1', description: '', certifications: [], paymentMethods: [], shippingConditions: [], leadTime: '', location: defaultLocation, supplier: defaultSupplier, videoUrl: '', taxRate: '21'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingId(product.id);
    setProductImage(product.image || null);
    
    let defaultSupplier = '';
    let defaultLocation = '';
    
    if (companyProfile) {
      defaultSupplier = companyProfile.companyName || '';
      if (companyProfile.city && companyProfile.province) {
        defaultLocation = `${companyProfile.city}, ${companyProfile.province}`;
      } else {
        defaultLocation = companyProfile.city || companyProfile.province || '';
      }
    }
    
    setNewProduct({
      sku: product.sku || '',
      name: product.name || '',
      category: product.category || 'Equipamiento Industrial',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      model: product.model || '',
      condition: product.condition || 'Nuevo',
      year: product.year || '',
      usageHours: product.usageHours || '',
      warranty: product.warranty || '',
      priceBase: product.priceBase?.toString() || '',
      priceWholesale: product.priceWholesale?.toString() || '',
      stock: product.stock?.toString() || '',
      moq: product.moq?.toString() || '1',
      description: product.description || '',
      certifications: product.certifications || [],
      paymentMethods: product.paymentMethods || [],
      shippingConditions: product.shippingConditions || [],
      leadTime: product.leadTime || '',
      location: product.location || defaultLocation,
      supplier: product.supplier || defaultSupplier,
      videoUrl: product.videoUrl || '',
      taxRate: product.taxRate?.toString() || '21'
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Resize image using canvas to avoid Firestore size limits
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setProductImage(resizedBase64);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'companies', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCompanyProfile(docSnap.data());
          }
        } catch (e) {
          console.error("Error fetching company profile: ", e);
        }

        const q = query(collection(db, "products"), where("companyId", "==", user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const prods: any[] = [];
          querySnapshot.forEach((doc) => {
            prods.push({ id: doc.id, ...doc.data() });
          });
          setProducts(prods);
          setIsLoading(false);
        }, (error) => {
          console.error("Error fetching products:", error);
          setIsLoading(false);
        });
        
        return () => unsubscribeSnapshot();
      } else {
        setProducts([]);
        setCompanyProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewProduct({
      ...newProduct,
      category: e.target.value,
      subcategory: INDUSTRIAL_CATEGORIES[e.target.value as keyof typeof INDUSTRIAL_CATEGORIES][0]
    });
  };

  const toggleCertification = (cert: string) => {
    setNewProduct(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const togglePaymentMethod = (method: string) => {
    setNewProduct(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const toggleShippingCondition = (condition: string) => {
    setNewProduct(prev => ({
      ...prev,
      shippingConditions: prev.shippingConditions.includes(condition)
        ? prev.shippingConditions.filter(c => c !== condition)
        : [...prev.shippingConditions, condition]
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    if (!auth.currentUser) {
       alert("Por favor inicie sesión para realizar esta acción.");
       return;
    }

    setIsSaving(true);
    try {
      console.log("Preparing data to save...");
      const productData = {
        sku: newProduct.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
        name: newProduct.name || '',
        category: newProduct.category || '',
        subcategory: newProduct.subcategory || '',
        brand: newProduct.brand || '',
        model: newProduct.model || '',
        condition: newProduct.condition || 'Nuevo',
        year: newProduct.year || '',
        usageHours: newProduct.usageHours || '',
        warranty: newProduct.warranty || '',
        priceBase: Number(newProduct.priceBase) || 0,
        priceWholesale: Number(newProduct.priceWholesale) || 0,
        stock: parseInt(String(newProduct.stock)) || 0,
        moq: parseInt(String(newProduct.moq)) || 1,
        description: newProduct.description || '',
        certifications: newProduct.certifications || [],
        paymentMethods: newProduct.paymentMethods || [],
        shippingConditions: newProduct.shippingConditions || [],
        leadTime: newProduct.leadTime || '',
        location: newProduct.location || '',
        supplier: newProduct.supplier || '',
        videoUrl: newProduct.videoUrl || '',
        taxRate: Number(newProduct.taxRate) || 21,
        active: true,
        companyId: auth.currentUser.uid,
        image: productImage || null
      };
      
      console.log("Data:", productData);

      if (editingId) {
        console.log("Updating document", editingId);
        await updateDoc(doc(db, "products", editingId), productData);
        console.log("Update successful");
      } else {
        console.log("Adding new document");
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp()
        });
        console.log("Add successful, new ID:", docRef.id);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setProductImage(null);
      setNewProduct({ 
        sku: '', name: '', category: 'Equipamiento Industrial', subcategory: '', brand: '', model: '', 
        condition: 'Nuevo', year: '', usageHours: '', warranty: '',
        priceBase: '', priceWholesale: '', stock: '', moq: '1', description: '', certifications: [], paymentMethods: [], shippingConditions: [], leadTime: '', location: '', supplier: '', videoUrl: '', taxRate: '21' 
      });
    } catch (e) {
      console.error("Error saving product: ", e);
      alert("Error al guardar el producto: " + (e as any).message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log('deleting', id);
      await deleteDoc(doc(db, "products", id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const activeCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.sku && p.sku.toLowerCase().includes(term)) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const totalStockValue = filteredProducts.reduce((acc, p) => acc + ((parseFloat(p.stock) || 0) * (parseFloat(p.priceBase) || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1A1625] px-6 py-8 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap className="w-48 h-48 text-orange-500" />
        </div>
        <div className="relative z-10 w-full mb-4 sm:mb-0 sm:w-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
            <Package className="w-5 h-5 text-orange-500" /> Mi Catálogo B2B
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl mx-auto sm:mx-0">
            Publica tus productos y repuestos. Los usuarios podrán solicitar cotizaciones directas.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
            <input 
              type="text" 
              placeholder="Buscar por código, nombre o categoría..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <div className="text-left w-full sm:w-auto px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Valorización Stock</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">${totalStockValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={openNewModal}
          className="relative z-10 w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs uppercase tracking-widest font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Cargar Producto
        </button>
      </div>

      {!isLoading && activeCategories.length > 0 && (
        <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-[#110E17] px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 overflow-x-auto custom-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filtrar:
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === 'all' ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-orange-500/30 hover:text-orange-500'}`}
            >
              Todas
            </button>
            {activeCategories.map(cat => (
              <button
                key={cat as string}
                onClick={() => setSelectedCategory(cat as string)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-orange-500 text-white shadow-md' : 'bg-white dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-orange-500/30 hover:text-orange-500'}`}
              >
                {cat as string}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-2xl flex justify-center items-center">
             <div className="w-8 h-8 border-t-2 border-r-2 border-orange-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#110E17] border border-slate-200 dark:border-white/10 rounded-2xl">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{(searchTerm || selectedCategory !== 'all') ? 'No se encontraron resultados' : 'No hay productos en tu catálogo'}</h3>
          <p className="text-slate-500 text-sm">{(searchTerm || selectedCategory !== 'all') ? 'Intenta con otros filtros de búsqueda.' : 'Empieza a cargar tu inventario para aumentar tus ventas B2B.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white dark:bg-[#1A1625] border border-slate-200 dark:border-white/10 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-[#110E17] flex items-center justify-center shrink-0 overflow-hidden relative">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</h3>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500">{product.sku}</span>
                    {product.brand && (
                      <span className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 px-1.5 py-0.5 rounded ml-1">{product.brand}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-medium">{product.category}</span>
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" /> Stock: <span className="font-bold text-slate-700 dark:text-slate-300">{product.stock}</span></span>
                    <span>Precio Unit.: <span className="font-bold text-emerald-600 dark:text-emerald-400">${product.priceBase?.toLocaleString()}</span></span>
                    {product.priceWholesale > 0 && (
                       <span>Por Mayor: <span className="font-bold text-emerald-600 dark:text-emerald-400">${product.priceWholesale?.toLocaleString()}</span></span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button onClick={() => setQrModalProduct(product)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors" title="Ver Código QR/GS1">
                  <div className="flex flex-col gap-[2px]">
                    <div className="flex gap-[2px]">
                      <div className="w-1.5 h-1.5 bg-current"></div>
                      <div className="w-1.5 h-1.5 bg-current"></div>
                    </div>
                    <div className="flex gap-[2px]">
                      <div className="w-1.5 h-1.5 bg-current"></div>
                      <div className="w-1.5 h-1.5 bg-transparent border border-current"></div>
                    </div>
                  </div>
                </button>
                <button onClick={() => openEditModal(product)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-4xl max-h-[90vh] flex flex-col z-[9999] bg-white dark:bg-[#1A1625] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-200 dark:border-white/10 shrink-0 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Carga de Producto / MRP</h2>
                  <p className="text-xs text-slate-500">Define los parámetros técnicos, comerciales y certificaciones del equipo o insumo.</p>
                </div>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                <form id="productForm" onSubmit={handleCreateProduct} className="space-y-8">
                  
                  {/* IDENTIFICACIÓN BÁSICA */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                       <Tag className="w-4 h-4 text-orange-500" /> Identificación Básica
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Código SKU interno</label>
                        <input 
                          type="text" 
                          placeholder="Ej: VAL-001-A"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Nombre Comercial / Técnico *</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Ej: Válvula Esférica Brida ANSI 150"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Marca</label>
                        <input 
                          type="text" 
                          value={newProduct.brand}
                          onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Modelo / Especificación</label>
                        <input 
                          type="text" 
                          value={newProduct.model}
                          onChange={(e) => setNewProduct({...newProduct, model: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Nombre Proveedor / Empresa *</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Tomado del Perfil"
                          value={newProduct.supplier}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#110E17]/50 text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-0 text-sm cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Ubicación (Prov/Ciudad)</label>
                        <input 
                          type="text" 
                          placeholder="Tomado del Perfil"
                          value={newProduct.location}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#110E17]/50 text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-0 text-sm cursor-not-allowed"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:col-span-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Condición</label>
                          <select 
                            value={newProduct.condition}
                            onChange={(e) => setNewProduct({...newProduct, condition: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm appearance-none cursor-pointer"
                          >
                            <option value="Nuevo">Nuevo</option>
                            <option value="Usado">Usado</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Año</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 2022"
                            value={newProduct.year}
                            onChange={(e) => setNewProduct({...newProduct, year: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Horas de Uso</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 5000h"
                            value={newProduct.usageHours}
                            onChange={(e) => setNewProduct({...newProduct, usageHours: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Garantía</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 6 meses"
                            value={newProduct.warranty}
                            onChange={(e) => setNewProduct({...newProduct, warranty: e.target.value})}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Descripción Detallada</label>
                        <textarea 
                          rows={4}
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm resize-y"
                          placeholder="Características técnicas, materiales, usos recomendados, etc."
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Enlace de Video (YouTube, Vimeo, MP4)</label>
                        <input 
                          type="url" 
                          placeholder="Ej: https://www.youtube.com/watch?v=..."
                          value={newProduct.videoUrl}
                          onChange={(e) => setNewProduct({...newProduct, videoUrl: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CLASIFICACIÓN Y CERTIFICACIONES */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                       <Shield className="w-4 h-4 text-orange-500" /> Clasificación y Certificaciones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Categoría Principal *</label>
                        <select 
                          value={newProduct.category}
                          onChange={handleCategoryChange}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none text-sm"
                        >
                          {Object.keys(INDUSTRIAL_CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Subcategoría</label>
                        <select 
                          value={newProduct.subcategory || ''}
                          onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none text-sm"
                        >
                          {(INDUSTRIAL_CATEGORIES[newProduct.category as keyof typeof INDUSTRIAL_CATEGORIES] || []).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Normas y Certificaciones (Opcional)</label>
                      <div className="flex flex-wrap gap-2">
                        {CERTIFICATIONS.map(cert => {
                          const isSelected = newProduct.certifications.includes(cert);
                          return (
                            <button
                              key={cert}
                              type="button"
                              onClick={() => toggleCertification(cert)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' 
                                  : 'bg-white dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-emerald-500/50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                              {cert}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* DATOS COMERCIALES E INVENTARIO */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                       <Ruler className="w-4 h-4 text-orange-500" /> Comercial y Logística
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Precio Un. (Neto)</label>
                        <input 
                          type="number"
                          placeholder="$"
                          value={newProduct.priceBase}
                          onChange={(e) => setNewProduct({...newProduct, priceBase: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">IVA (%)</label>
                        <select
                          value={newProduct.taxRate}
                          onChange={(e) => setNewProduct({...newProduct, taxRate: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        >
                          <option value="0">0%</option>
                          <option value="10.5">10.5%</option>
                          <option value="21">21%</option>
                          <option value="27">27%</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Precio Mayorista (Neto)</label>
                        <input 
                          type="number"
                          placeholder="$"
                          value={newProduct.priceWholesale}
                          onChange={(e) => setNewProduct({...newProduct, priceWholesale: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Stock Físico</label>
                        <input 
                          type="number"
                          min="0"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">MOQ (Mínimo)</label>
                        <input 
                          type="number"
                          min="1"
                          value={newProduct.moq}
                          onChange={(e) => setNewProduct({...newProduct, moq: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Formas de Pago Aceptadas</label>
                      <div className="flex flex-wrap gap-2">
                        {PAYMENT_METHODS.map(method => {
                          const isSelected = newProduct.paymentMethods.includes(method);
                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() => togglePaymentMethod(method)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                                  : 'bg-white dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-blue-500/50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                              {method}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Condiciones de Envío / Entrega</label>
                      <div className="flex flex-wrap gap-2">
                        {SHIPPING_CONDITIONS.map(condition => {
                          const isSelected = newProduct.shippingConditions.includes(condition);
                          return (
                            <button
                              key={condition}
                              type="button"
                              onClick={() => toggleShippingCondition(condition)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                isSelected 
                                  ? 'bg-teal-500 text-white border-teal-500 shadow-md' 
                                  : 'bg-white dark:bg-[#1A1625] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-teal-500/50'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                              {condition}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Imagen / Fotografía Técnica</label>
                    <div className="w-full border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl p-6 text-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      {productImage ? (
                        <div className="relative z-10">
                          <img src={productImage} alt="Preview" className="max-h-32 mx-auto rounded-lg shadow-sm" />
                          <p className="text-xs text-orange-500 font-medium mt-2">Click para cambiar imagen</p>
                        </div>
                      ) : (
                        <div className="relative z-10">
                           <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                           <p className="text-xs text-slate-500 font-medium">Click para subir foto o arrastra aquí</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </form>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#110E17] shrink-0 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 font-bold text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="productForm"
                  disabled={isSaving}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider rounded-lg transition shadow-lg shadow-orange-500/20"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Producto MRP'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR & Barcode Modal */}
      <AnimatePresence>
        {qrModalProduct && (
          <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setQrModalProduct(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md z-[9999] bg-white dark:bg-[#1A1625] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-center p-8"
            >
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Etiquetado Inteligente</h2>
              
              <div className="flex flex-col items-center gap-8">
                {/* QR Code */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Código QR (Ficha Técnica)</p>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 inline-block">
                    <QRCodeSVG 
                      value={`https://marketplace.patagonia.com/product/${qrModalProduct.id}`} 
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-slate-200 dark:bg-white/10"></div>

                {/* GS1 Barcode Alternative */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Código de Barras (GS1/SKU)</p>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-center w-full max-w-[280px]">
                    <Barcode 
                      value={qrModalProduct.sku || '00000000'} 
                      width={1.5} 
                      height={50} 
                      fontSize={14} 
                      margin={0}
                      background="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setQrModalProduct(null)}
                className="mt-8 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold text-sm rounded-lg transition"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
