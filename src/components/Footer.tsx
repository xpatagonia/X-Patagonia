import { Grid2X2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-[#0A080E] text-slate-600 dark:text-slate-400 py-20 px-6 md:px-12 border-t border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center mb-8 cursor-pointer">
              <img src="/logo.png" alt="x.patagonia logo" className="h-10 w-auto object-contain dark:invert-0 invert" />
            </div>
            <p className="text-sm max-w-sm leading-relaxed text-slate-500 font-medium">
              Impulsando la innovación y agilizando las operaciones en la cadena de suministro B2B. Conectamos empresas y proveedores verificados en la Patagonia.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[10px] tracking-widest uppercase text-slate-500">Servicios B2B</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <li><a href="#categorias" className="hover:text-purple-400 transition-colors">Directorio de Empresas</a></li>
              <li><a href="#rfq" className="hover:text-orange-400 transition-colors">Cotizador RFQ</a></li>
              <li><a href="#proveedores" className="hover:text-purple-400 transition-colors">Red Verificada</a></li>
              <li><a href="#" className="hover:text-orange-400 transition-colors">API & Odoo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[10px] tracking-widest uppercase text-slate-500">Plataforma</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Acceso Backend</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Soporte Técnico</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Contacto Ventas</a></li>
              <li><a href="/privacy" className="hover:text-slate-900 dark:text-white transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-slate-900 dark:text-white transition-colors">Aviso Legal</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <p>&copy; {new Date().getFullYear()} XPATAGONIA ONLINE. Todos los derechos reservados.</p>
          <div className="mt-4 md:mt-0 flex gap-4 items-center">
            <span>Plataforma Odoo B2B</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
