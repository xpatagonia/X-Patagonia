import { motion, AnimatePresence } from 'motion/react';
import { Grid2X2, LogOut, LayoutDashboard, ChevronDown, User as UserIcon, MessageSquare, Shield, Menu, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import AuthModal from './AuthModal';
import { getApiUrl } from '../lib/apiConfig';
import { auth } from '../lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';

export default function Navbar() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          await fetch(`${getApiUrl()}/api/sync-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error("Failed to sync user with backend", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <nav className="w-full bg-white dark:bg-[#110E17]/90 backdrop-blur-xl z-50 py-4 px-6 md:px-12 border-b border-slate-100 dark:border-white/5 sticky top-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 cursor-pointer">
            <img src="/logo.png" alt="x.patagonia logo" className="h-10 w-auto object-contain" />
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white text-[10px] rounded-md uppercase tracking-widest align-middle font-sans">B2B</span>
          </Link>
          <div className="hidden lg:flex space-x-8 text-xs font-bold uppercase tracking-wider items-center text-slate-600 dark:text-slate-400">
            <Link to="/#categorias" className="hover:text-slate-900 dark:text-white transition-colors">Categorías</Link>
            <Link to="/servicios" className="hover:text-slate-900 dark:text-white transition-colors">Directorio</Link>
            <Link to="/marketplace" className="text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
              B2B Store
            </Link>
            <Link to="/planes" className="hover:text-slate-900 dark:text-white transition-colors">Planes</Link>
            <Link to="/insights" className="hover:text-purple-600 dark:text-purple-400 transition-colors flex items-center gap-1">
               <Sparkles className="w-3.5 h-3.5" /> Insights
            </Link>
            {user ? (
              <div className="relative group">
                <button className="text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider h-10">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                  <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute top-full right-0 w-56 bg-white dark:bg-[#1A1625] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 flex flex-col overflow-hidden translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                    <span className="text-slate-900 dark:text-white uppercase text-[10px] tracking-wider font-bold block mb-0.5">Cuenta Activa</span>
                    <span className="text-orange-500 lowercase normal-case text-xs tracking-normal font-medium truncate block">{user.email}</span>
                  </div>
                  <Link to="/dashboard" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-orange-500" /> <span className="font-semibold text-xs tracking-wide">Inicio</span>
                  </Link>
                  <Link to="/inbox" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2.5 border-t border-slate-100 dark:border-white/5">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> <span className="font-semibold text-xs tracking-wide">Comunicaciones</span>
                  </Link>
                  <Link to="/perfil-empresa" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2.5 border-t border-slate-100 dark:border-white/5">
                    <UserIcon className="w-4 h-4 text-emerald-500" /> <span className="font-semibold text-xs tracking-wide">Mi Perfil</span>
                  </Link>
                  <Link to="/apps" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2.5 border-t border-slate-100 dark:border-white/5">
                    <Grid2X2 className="w-4 h-4 text-purple-500" /> <span className="font-semibold text-xs tracking-wide">Módulos</span>
                  </Link>
                  <Link to="/admin" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2.5 border-t border-slate-100 dark:border-white/5">
                    <Shield className="w-4 h-4 text-red-500" /> <span className="font-semibold text-xs tracking-wide">Super Admin</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-white/5 p-2">
                    <button onClick={handleSignOut} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" /> <span className="font-semibold text-xs tracking-wide">Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setIsAuthOpen(true)} className="text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                  Solicitar Cotización
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-white/10"></div>
                <button onClick={() => setIsAuthOpen(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors uppercase font-bold tracking-wider">Ingresar</button>
              </>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden mt-4 pt-4 border-t border-slate-100 dark:border-white/5 overflow-hidden"
          >
            <div className="flex flex-col space-y-4 text-sm font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400">
              <Link to="/#categorias" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 dark:hover:text-white transition-colors">Categorías</Link>
              <Link to="/servicios" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 dark:hover:text-white transition-colors">Directorio</Link>
              <Link to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="text-orange-500 hover:text-orange-400 transition-colors">B2B Store</Link>
              <Link to="/planes" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-slate-900 dark:hover:text-white transition-colors">Planes</Link>
              <Link to="/insights" onClick={() => setIsMobileMenuOpen(false)} className="text-purple-500 hover:text-purple-400 transition-colors flex items-center gap-2"><Sparkles className="w-4 h-4" /> Insights</Link>
              
              {user ? (
                <>
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col space-y-4">
                    <span className="text-[10px] text-slate-500">Cuenta: {user.email}</span>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-orange-500 transition-colors flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Inicio</Link>
                    <Link to="/inbox" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-blue-500 transition-colors flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Comunicaciones</Link>
                    <Link to="/perfil-empresa" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-500 transition-colors flex items-center gap-2"><UserIcon className="w-4 h-4" /> Mi Perfil</Link>
                    <Link to="/apps" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-purple-500 transition-colors flex items-center gap-2"><Grid2X2 className="w-4 h-4" /> Módulos</Link>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-red-500 transition-colors flex items-center gap-2"><Shield className="w-4 h-4" /> Super Admin</Link>
                    <button onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="text-left text-red-600 dark:text-red-400 hover:text-red-500 transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col space-y-4">
                  <button onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }} className="text-left text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-2">
                    Solicitar Cotización
                  </button>
                  <button onClick={() => { setIsAuthOpen(true); setIsMobileMenuOpen(false); }} className="text-left hover:text-slate-900 dark:hover:text-white transition-colors">
                    Ingresar
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
