import React, { useState } from 'react';
import { motion } from 'motion/react';
import GestoriaLogo from './GestoriaLogo';
import InstitutionalLogos from './InstitutionalLogos';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Layers,
  ArrowRight,
  Check,
  CheckCircle,
  Clock,
  Briefcase,
  Users,
  LineChart,
  User,
  Eye,
  EyeOff,
  Database,
  Lock,
  Zap,
  CheckSquare,
  AlertCircle,
  Calculator,
  HelpCircle,
  PiggyBank
} from 'lucide-react';

interface LandingPageProps {
  onLoginEmail: (email: string, pass: string) => Promise<boolean>;
  onRegisterEmail: (email: string, pass: string, role: string) => Promise<boolean>;
  onLoginGoogle: (preferredRole?: string) => Promise<void>;
  onEnterDemoMode: (simulatedRole: string) => void;
  errorMsg: string | null;
  setErrorMsg: (msg: string | null) => void;
}

export default function LandingPage({
  onLoginEmail,
  onRegisterEmail,
  onLoginGoogle,
  onEnterDemoMode,
  errorMsg,
  setErrorMsg
}: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Free' | 'Empresa' | 'Administrador'>('Free');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active module preview index in the features section
  const [activePreviewTab, setActivePreviewTab] = useState<'finanzas' | 'operaciones' | 'ia' | 'admin'>('finanzas');

  // ROI Interactive Estimator State (Inspired by 21st.dev UI custom tools)
  const [numInvoices, setNumInvoices] = useState<number>(35);
  const [companyType, setCompanyType] = useState<'autonomo' | 'pyme'>('autonomo');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setErrorMsg(null);
  };

  const handleCloseAuth = () => {
    setShowAuthModal(false);
    setEmail('');
    setPassword('');
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos.');
      setLoading(false);
      return;
    }

    const normalizedRole = selectedRole === 'Free' 
      ? 'Usuario Free' 
      : selectedRole === 'Empresa' 
        ? 'Usuario Empresa' 
        : 'Usuario Administrador';

    // Validation for Administrator Role
    if (selectedRole === 'Administrador') {
      if (email.trim().toLowerCase() !== 'draiton@ec-innova.es') {
        setErrorMsg('Acceso denegado: Solo el administrador oficial (draiton@ec-innova.es) con su contraseña autorizada tiene privilegios para registrarse con el rol de Administrador.');
        setLoading(false);
        return;
      }
      if (password !== 'Alexandra01.') {
        setErrorMsg('Cuentas oficiales de administrador: La contraseña para draiton@ec-innova.es debe ser estrictamente "Alexandra01.".');
        setLoading(false);
        return;
      }
    }

    try {
      if (authMode === 'register') {
        // Enforce admin constraints on registration level
        if (email.trim().toLowerCase() === 'draiton@ec-innova.es' && selectedRole !== 'Administrador') {
          setErrorMsg('El correo draiton@ec-innova.es está reservado como Administrador. Por favor selecciona el rol de Administrador.');
          setLoading(false);
          return;
        }
        
        await onRegisterEmail(email, password, normalizedRole);
      } else {
        await onLoginEmail(email, password);
      }
      handleCloseAuth();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error al autenticar en el sistema.');
    } finally {
      setLoading(false);
    }
  };

  // ROI calculations
  const manualHours = Math.round((numInvoices * 8) / 60);
  const gestoriaHours = Math.round((numInvoices * 0.5) / 60 * 10) / 10;
  const timeSaved = Math.max(1, Math.round(manualHours - gestoriaHours));
  
  const costPerHour = companyType === 'autonomo' ? 45 : 75;
  const monetarySavings = timeSaved * costPerHour;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white overflow-x-hidden antialiased font-sans">
      
      {/* 1. HEADER / NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <GestoriaLogo className="h-10 w-auto" />
            <span className="hidden sm:inline-block ml-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md">
              SaaS BOE 2026
            </span>
          </div>

          {/* Links for Jump Sections */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-650">
            <a href="#why-best" className="hover:text-indigo-600 transition-colors">¿Por qué GestorIA?</a>
            <a href="#modules" className="hover:text-indigo-600 transition-colors">Módulos ERP</a>
            <a href="#estimador" className="hover:text-indigo-600 transition-colors">Calculadora Ahorro</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Planes y Precios</a>
            <a href="#firebase-info" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>Sincronización Nube</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAuth('login')}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => handleOpenAuth('register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <span>Registrarse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Soft Modern Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[200px] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-850 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-650 animate-bounce" />
            <span>Versión Homologada Reglamento Fiscal y BOE 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-display leading-[1.12] text-slate-900 tracking-tight">
            La Gestión Empresarial Inteligente,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">Simplificada al Máximo con IA de Google</span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-sans leading-relaxed">
            GestorIA centraliza tu facturación inteligente, el control de gastos mediante OCR, gestión comercial CRM de operaciones e informes financieros predictivos con la potencia real de Firestore.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => handleOpenAuth('register')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-650 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-700/30"
            >
              <span>Comenzar Ahora</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              onClick={() => onEnterDemoMode('Free')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-2xl text-sm border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Probar Demo Local (Sin Registro)</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Sincronización segura de datos en la nube en tiempo real mediante Firebase Google Console
          </p>

        </div>

        {/* Interactive App Preview / Mockup (Inspired by 21st.dev elegant interactive design blocks) */}
        <div className="mt-16 w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-4 relative group shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/50 via-transparent to-transparent rounded-3xl" />
          <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-150 aspect-[16/9] flex flex-col">
            
            {/* Window bar */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono bg-slate-100 px-3 py-1 rounded-md border border-slate-200/50">
                https://gestor-ia.es/dashboard
              </div>
              <div className="w-6" />
            </div>

            {/* Dashboard Mockup Content */}
            <div className="p-4 sm:p-6 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 text-left overflow-hidden select-none">
              
              {/* Financial Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Ingresos y Gastos</span>
                  <p className="text-sm font-semibold text-slate-800">Resumen de Facturación</p>
                  <p className="text-xl font-extrabold text-emerald-600">12.100,00 €</p>
                </div>
                <div className="h-20 bg-slate-50 rounded-lg border border-slate-100 mt-3 p-2 flex items-end justify-between gap-1 overflow-hidden">
                  <div className="w-5 bg-indigo-500/10 h-[30%] rounded-sm" />
                  <div className="w-5 bg-indigo-500/20 h-[45%] rounded-sm" />
                  <div className="w-5 bg-indigo-500/30 h-[60%] rounded-sm" />
                  <div className="w-5 bg-indigo-500/45 h-[50%] rounded-sm" />
                  <div className="w-5 bg-emerald-500/60 h-[80%] rounded-sm" />
                  <div className="w-5 bg-emerald-500 h-[95%] rounded-sm" />
                </div>
              </div>

              {/* Operations Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Proyectos CRM</span>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-150">Activos</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">Rehabilitación Oficinas Gran Vía</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[70%] h-full bg-indigo-600 rounded-full" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Presupuesto Ejecutado: 70%</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-650">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-650 text-[9px]">✓</div>
                    <span>Factura de compra emitida</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-650">
                    <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-650 text-[9px]">✓</div>
                    <span>Cálculo tributario Modelo 303 listo</span>
                  </div>
                </div>
              </div>

              {/* AI Cerebro Box */}
              <div className="bg-gradient-to-b from-indigo-50/50 to-white p-4 rounded-xl border border-indigo-150 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Algoritmo GestorIA</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-150 text-[11px] text-slate-700 italic leading-relaxed shadow-2xs">
                    "Detectado un exceso de 345,21€ en software. Consejo fiscal: Se recomienda deducir como gasto tecnológico del ejercicio 2026."
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-[10px] text-slate-550 flex items-center justify-between">
                    <span>Salud Presupuestaria:</span>
                    <span className="text-indigo-600 font-bold">92%</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. WHY GESTORIA IS THE BEST SECTION (Lighter bento inspired layout) */}
      <section id="why-best" className="relative py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold text-indigo-600 tracking-widest">Tecnología de Vanguardia Administrativa</h2>
            <p className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-slate-900">¿Por qué GestorIA es el mejor SaaS del mercado?</p>
            <p className="text-slate-600 text-sm">
              Olvídate de las hojas de cálculo confusas y de los asesores tradicionales lentos. GestorIA acopla tu facturación e histocial con algoritmos predictivos y la capacidad ilimitada de autogestión BOE 2026.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:border-indigo-300 hover:bg-white transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Modelos Predictivos Integrados</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Utilizamos algoritmos de IA de última generación para procesar tu facturación e identificar caídas o crecimientos financieros antes de que ocurran, previniendo problemas de liquidez.
              </p>
            </div>

            {/* Box 2 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:border-indigo-300 hover:bg-white transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-650 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Asesoría Fiscal BOE Asegurada</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Nuestro Cerebro IA está configurado con las normativas tributarias. Al instante calcula amortizaciones, evalúa deducibilidades y responde dudas de Modelos 303, 130 o IRPF.
              </p>
            </div>

            {/* Box 3 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/80 space-y-4 hover:border-indigo-300 hover:bg-white transition-all shadow-sm group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Digitalización Inteligente por IA</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sube la foto o archivo de tus tickets de gastos, facturas o comidas. El algoritmo de Gemini extrae los conceptos, fecha, base imponible e IVA con precisión asombrosa.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. MODULE_PREVIEWS SECTION */}
      <section id="modules" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-xs uppercase font-extrabold text-indigo-600 tracking-widest">Estructura ERP Modular Integral</h2>
          <p className="text-3xl font-bold font-display tracking-tight text-slate-900 font-display">Descubre el poder modular integrado</p>
          <p className="text-slate-600 text-sm">
            Nuestros submódulos están interconectados. El CRM alimenta tus proyectos, las facturas sincronizan tus ingresos en tiempo real, y la IA analiza todo para darte un reporte inmediato.
          </p>
        </div>

        {/* Custom Tab list */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-2xl mx-auto border border-slate-200">
          <button
            onClick={() => setActivePreviewTab('finanzas')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activePreviewTab === 'finanzas'
                ? 'bg-white text-indigo-650 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Módulo Finanzas
          </button>
          <button
            onClick={() => setActivePreviewTab('operaciones')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activePreviewTab === 'operaciones'
                ? 'bg-white text-indigo-650 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Módulo Operaciones
          </button>
          <button
            onClick={() => setActivePreviewTab('ia')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activePreviewTab === 'ia'
                ? 'bg-white text-indigo-650 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Asistentes IA y SEO
          </button>
          <button
            onClick={() => setActivePreviewTab('admin')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              activePreviewTab === 'admin'
                ? 'bg-white text-indigo-650 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Administración Central
          </button>
        </div>

        {/* Tab contents description */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-xs">
          
          <div className="space-y-6">
            {activePreviewTab === 'finanzas' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 font-display">Módulo de Facturación, Gastos y Tesorería</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Crea facturas profesionales que cumplen con el reglamento fiscal español. Importa tus transacciones bancarias, concilia ingresos con facturas emitidas y cataloga gastos mediante OCR de tickets automático.
                </p>
                <ul className="space-y-2.5 text-slate-700 text-xs font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Impuestos auto-calculados (IVA 21%, IRPF 15%)</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Sincronización en la base de datos segura</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Digitalización OCR inteligente de tickets y facturas</li>
                </ul>
              </>
            )}

            {activePreviewTab === 'operaciones' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 font-display">Módulo de Operaciones, CRM e Hitos</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Planifica tus obras o servicios corporativos asignando presupuestos, tareas con estados visuales de ejecución y control de márgenes. Mantén clientes y proveedores bajo un CRM integrado.
                </p>
                <ul className="space-y-2.5 text-slate-700 text-xs font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Seguimiento analítico de presupuestos vs gastos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Asignación de hitos corporativos y tareas de equipo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Base de contactos CRM con flujos comerciales</li>
                </ul>
              </>
            )}

            {activePreviewTab === 'ia' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 font-display">Suite Inteligente: Copywriting, SEO y Auditorías</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Utiliza el motor Google Gemini para automatizar tu marketing local y responder tus dudas contables al instante. Genera posts listos para redes, estrategias de palabras clave u obtén informes técnicos de tu web.
                </p>
                <ul className="space-y-2.5 text-slate-700 text-xs font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Copywriter SEO para blogs y boletines corporativos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Auditor de velocidad y accesibilidad técnica web</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Consulta directa de legislación tributaria en lenguaje natural</li>
                </ul>
              </>
            )}

            {activePreviewTab === 'admin' && (
              <>
                <h3 className="text-2xl font-bold text-slate-900 font-display">Módulo de Administración, Configuración y Roles</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Personaliza los parámetros globales corporativos: NIF, dirección, correo corporativo, y asigne tipos de IVA e IRPF por defecto para tu facturación automática.
                </p>
                <ul className="space-y-2.5 text-slate-700 text-xs font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Roles de seguridad: Usuario Free, Empresa y Administrador</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Configuración corporativa flexible y panel de límites</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Métricas de salud del sistema, registros y auditoría</li>
                </ul>
              </>
            )}

            <button
              onClick={() => handleOpenAuth('register')}
              className="mt-4 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Probar gratis con mi cuenta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right illustration / Mockup state inside modules section */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-center min-h-[300px] shadow-inner">
            {activePreviewTab === 'finanzas' && (
              <div className="space-y-4 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-450 block">PREVISUALIZACIÓN FINANCIERA</span>
                <div className="p-3.5 bg-white rounded-xl border border-slate-150 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono">Factura: F-2026-004</p>
                    <p className="text-sm font-bold text-slate-800">Servicios Tecnológicos Innova</p>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full font-bold">Cobrada</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-150 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono">Gasto: G-2026-012</p>
                    <p className="text-sm font-bold text-slate-800">Suministro Eléctrico Digital</p>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-250 px-2 py-0.5 rounded-full font-bold">Deducible</span>
                </div>
              </div>
            )}

            {activePreviewTab === 'operaciones' && (
              <div className="space-y-3 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-455 block">MÁRGENES DE PROYECTO</span>
                <div className="space-y-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-150 flex items-center justify-between shadow-2xs">
                    <span className="text-xs font-semibold text-slate-700">Rehabilitación Oficinas Gran Vía</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.5 rounded font-bold">Activo</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-150 flex items-center justify-between shadow-2xs">
                    <span className="text-xs font-semibold text-slate-700">Construcción Chalet en Ibiza</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-1.5 py-0.5 rounded font-bold">Completado</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'ia' && (
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-1.5 text-xs text-indigo-700">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span className="font-bold text-indigo-700 font-mono">Recomendación Fiscal IA</span>
                </div>
                <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-150 text-[11px] leading-relaxed shadow-xs">
                  <p className="text-slate-700 font-medium italic">"Se ha detectado que el 85% de tus facturas de taxi se pueden imputar como gasto deducible Modelo 130 conforme al reglamento fiscal 2026."</p>
                  <p className="text-slate-400 font-sans text-[10px]">Ahorro potencial estimado: 240 € en el trimestre fiscal actual.</p>
                </div>
              </div>
            )}

            {activePreviewTab === 'admin' && (
              <div className="space-y-3 font-mono text-left">
                <span className="text-[10px] uppercase font-bold text-slate-455 block">ROLES DISPONIBLES</span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded bg-white border border-slate-150 shadow-2xs">
                    <p className="text-xs text-indigo-600 font-bold">Free</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">Básico</p>
                  </div>
                  <div className="text-center p-2 rounded bg-white border border-indigo-200 shadow-2xs">
                    <p className="text-xs text-emerald-600 font-bold">Empresa</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">SaaS Total</p>
                  </div>
                  <div className="text-center p-2 rounded bg-white border border-amber-200 shadow-2xs">
                    <p className="text-xs text-amber-600 font-bold">Admin</p>
                    <p className="text-[8px] text-slate-500 mt-0.5">Master</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-sans italic pt-1">Acceso restringido perimetral por encriptación Google Firebase.</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ROI ESTIMATOR SECTION - "Functions of this type" to make it highly visual (Inspired by 21st.dev elegant interactive micro-tools) */}
      <section id="estimador" className="py-20 bg-slate-100/50 border-y border-slate-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-8 relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-2xl opacity-50 -mr-10 -mt-10" />
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-150">
              <Calculator className="w-3.5 h-3.5" />
              <span>Simulador de Retorno de Inversión (ROI)</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">¿Cuánto tiempo y dinero te ahorras con GestorIA?</h3>
            <p className="text-slate-550 text-sm">Prueba nuestra calculadora interactiva impulsada por IA para descubrir el impacto en tu negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
            {/* Range Controls */}
            <div className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Tipo de Organización</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCompanyType('autonomo')}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
                      companyType === 'autonomo'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Profesional Autónomo
                  </button>
                  <button
                    onClick={() => setCompanyType('pyme')}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all border ${
                      companyType === 'pyme'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    PYME o Empresa
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="uppercase tracking-wider">Facturas y tickets al mes</span>
                  <span className="text-indigo-600 font-mono text-sm bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{numInvoices} u.</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={numInvoices}
                  onChange={(e) => setNumInvoices(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 facturas</span>
                  <span>100 u.</span>
                  <span>200+ u.</span>
                </div>
              </div>

            </div>

            {/* Results Grid - Dynamic styling */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">TU EVALUACIÓN DE EFICIENCIA REAL</span>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs">
                  <span className="text-[10px] text-slate-450 font-medium block">Tiempo Ahorrado</span>
                  <p className="text-2xl font-black text-indigo-600 mt-1 font-display tracking-tight">~{timeSaved} horas</p>
                  <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Cada mes administrativamente</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-2xs">
                  <span className="text-[10px] text-slate-450 font-medium block">Ahorro Mensual</span>
                  <p className="text-2xl font-black text-emerald-600 mt-1 font-display tracking-tight">{monetarySavings} €</p>
                  <span className="text-[9px] text-slate-400 font-mono block mt-0.5">En coste de horas de equipo</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-650">
                <PiggyBank className="w-4 h-4 text-emerald-500 animate-bounce" />
                <span>Impacto estimado anual: <strong>{(monetarySavings * 12).toLocaleString()} €</strong> de beneficio directo.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold text-indigo-600 tracking-widest">Sencillo, Transparente y Sin Sorpresas</h2>
            <p className="text-3xl font-bold font-display tracking-tight text-slate-900">Planes de Suscripción Flexibles</p>
            <p className="text-slate-600 text-sm">
              Empiece gratis con nuestro plan básico autónomo y escale a corporación cuando su plantilla lo requiera. Cancele o suba de nivel en un solo clic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* PRICING 1: FREE */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 hover:bg-white transition-all shadow-sm relative">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Plan Autónomo Free</h3>
                  <p className="text-slate-500 text-xs mt-1">Perfecto para trabajadores individuales, digital nomads o freelances de España.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">0€</span>
                  <span className="text-slate-500 text-xs">/ mes</span>
                </div>
                <hr className="border-slate-200/80" />
                <ul className="space-y-4 text-xs text-slate-650">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Facturación ilimitada borrador</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Límite de 5 facturas finales al mes</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Sincronización en la base de datos Firestore</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Consultas básicas de asesores IA</li>
                </ul>
              </div>
              <button
                onClick={() => { setSelectedRole('Free'); handleOpenAuth('register'); }}
                className="w-full mt-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs"
              >
                Registrar Cuenta Free
              </button>
            </div>

            {/* PRICING 2: EMPRESA (PROFESIONAL) */}
            <div className="bg-white p-8 rounded-3xl border-2 border-indigo-600 flex flex-col justify-between relative shadow-lg">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-650 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Recomendado
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-indigo-950 font-display">Plan Empresa Profesional</h3>
                  <p className="text-indigo-600/85 text-xs mt-1">Óptimo para PYMEs, sociedades limitadas o agencias comerciales.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-indigo-950">29€</span>
                  <span className="text-slate-500 text-xs">/ mes</span>
                </div>
                <hr className="border-indigo-100" />
                <ul className="space-y-4 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Facturación ilimitada con PDF premium</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Escaneado OCR inteligente de tickets por IA</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Hasta 15 proyectos activos simultáneos</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Informes fiscales y auditorías automáticas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-600" /> Gestión multiusuario selectiva de roles</li>
                </ul>
              </div>
              <button
                onClick={() => { setSelectedRole('Empresa'); handleOpenAuth('register'); }}
                className="w-full mt-8 py-3.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-650/10 transition-all cursor-pointer"
              >
                Registrar Cuenta Empresa
              </button>
            </div>

            {/* PRICING 3: ADMINISTRADOR ESPECIAL */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 flex flex-col justify-between hover:border-indigo-300 hover:bg-white transition-all shadow-sm relative">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">Plan Administrador Especial</h3>
                  <p className="text-slate-500 text-xs mt-1">Control supremo y perimetral de la organización titular.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">89€</span>
                  <span className="text-slate-500 text-xs">/ mes</span>
                </div>
                <hr className="border-slate-200/80" />
                <ul className="space-y-4 text-xs text-slate-650">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Gestión total perimetral e histórica del ERP</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Asignación ilimitada de colaboradores de equipo</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Asistencia jurídica directa de gestoría española</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-indigo-650 shrink-0" /> Restringido a: <strong>draiton@ec-innova.es</strong></li>
                </ul>
              </div>
              <button
                onClick={() => { setSelectedRole('Administrador'); handleOpenAuth('register'); }}
                className="w-full mt-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer shadow-xs"
              >
                Registrar Administrador Oficial
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. CLARIFYING FIREBASE SYNC SECTION */}
      <section id="firebase-info" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-white to-slate-100/50 rounded-3xl p-8 sm:p-12 border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xs">
          
          <div className="space-y-4 md:max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Database className="w-4 h-4" />
              <span>¿Qué es la sincronización con Cuenta Firebase?</span>
            </div>
            
            <h3 className="text-2xl font-bold text-indigo-950 font-display">Seguridad Perimetral en la Nube</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              En otras aplicaciones de demostración verás datos ficticios que desaparecen al limpiar o recargar su navegador. Con GestorIA no es así: al conectarte con tu cuenta (sea por correo o Google Sign-In), se inicializa un Workspace exclusivo y cifrado en la infraestructura de <strong>Google Cloud Firestore</strong>.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              Esto significa que cada factura que emitas, ticket de gastos digitalizado mediante IA u hito laboral se almacenará de manera permanente. Podrás hacer seguimiento financiero de tu empresa desde el móvil, tablet o cualquier ordenador portátil sin riesgo alguno de pérdida.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-250/70 p-6 space-y-4 shrink-0 w-full md:w-80 shadow-xs text-left">
            <h4 className="text-xs text-slate-900 font-bold uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Garantías de Google Firebase</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-650">
              <div className="flex gap-2 font-medium">
                <span className="text-emerald-500">✓</span>
                <span>Región de bases de datos: UE (Europa)</span>
              </div>
              <div className="flex gap-2 font-medium">
                <span className="text-emerald-500">✓</span>
                <span>Copias de seguridad diarias automatizadas</span>
              </div>
              <div className="flex gap-2 font-medium">
                <span className="text-emerald-500">✓</span>
                <span>Cumplimiento estricto de RGPD</span>
              </div>
              <div className="flex gap-2 font-medium">
                <span className="text-emerald-500">✓</span>
                <span>Cifrado SSL perimetral en reposo</span>
              </div>
            </div>
            <button
              onClick={() => onLoginGoogle(selectedRole)}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Sincronizar cuenta Google</span>
            </button>
          </div>

        </div>
      </section>

      {/* 7. AUTHENTICATION MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={handleCloseAuth} />
          
          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
            
            {/* Upper Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-indigo-50 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <span className="text-xs font-bold font-mono text-slate-400">
                {authMode === 'register' ? 'PASO 1: CONSTITUIR SU ESPACIO' : 'PASO 1: INICIAR SESIÓN CORPORATIVA'}
              </span>
              <button onClick={handleCloseAuth} className="text-slate-400 hover:text-slate-650 font-bold cursor-pointer text-sm">✕</button>
            </div>

            <h3 className="text-xl font-bold text-slate-900 font-display mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-650" />
              <span>{authMode === 'register' ? 'Bienvenido a GestorIA' : 'Entrar en GestorIA'}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              {authMode === 'register' 
                ? 'Constituya su cuenta segura para mantener sincronizado su negocio a la base de datos Firestore y operar funciones IA.' 
                : 'Introduzca sus credenciales para acceder a sus informes fiscales, presupuestos de proyectos y facturación.'}
            </p>

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* AUTH FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-850 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Contraseña de Acceso</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña de mínimo 6 digitos"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-850 placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500 focus:bg-white transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ROLE SELECTOR (Only in Register mode) */}
              {authMode === 'register' && (
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tipo de Usuario / Rol Solicitado</label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    
                    {/* Free Role */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('Free');
                        setErrorMsg(null);
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                        selectedRole === 'Free'
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-0.5">
                        <span className="text-[11px] font-bold">Usuario Free</span>
                        {selectedRole === 'Free' && <div className="w-2 h-2 rounded-full bg-indigo-650" />}
                      </div>
                      <span className="text-[9px] text-slate-400 leading-normal">0€/mes. Autónomos iniciales.</span>
                    </button>

                    {/* Empresa Role */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('Empresa');
                        setErrorMsg(null);
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                        selectedRole === 'Empresa'
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-0.5">
                        <span className="text-[11px] font-bold">Usuario Empresa</span>
                        {selectedRole === 'Empresa' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </div>
                      <span className="text-[9px] text-slate-400 leading-normal">29€/mes. Multi-usuario premium.</span>
                    </button>

                    {/* Administrador Role */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('Administrador');
                        setErrorMsg(null);
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
                        selectedRole === 'Administrador'
                          ? 'border-amber-500 bg-amber-50/50 text-amber-950 font-bold'
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center mb-0.5">
                        <span className="text-[11px] font-bold">Administrador</span>
                        {selectedRole === 'Administrador' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                      <span className="text-[9px] text-slate-400 leading-normal">89€/mes. Control absoluto oficial.</span>
                    </button>

                  </div>
                </div>
              )}

              {/* Guard on Administrator and warning */}
              {selectedRole === 'Administrador' && authMode === 'register' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-relaxed font-medium">
                  <strong>🔒 Acceso de Administrador Oficial:</strong> Este rol está asignado por políticas de seguridad estrictas. Solo puede registrarse con la cuenta homologada: <code>draiton@ec-innova.es</code> y su clave autorizada.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-4 shadow-sm"
              >
                <span>{loading ? 'Sincronizando de forma segura...' : authMode === 'register' ? 'Registrar mi Cuenta de ERP' : 'Acceder al ERP Corporativo'}</span>
              </button>

            </form>

            {/* Google / Quick Login triggers */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-4">
              
              <div className="text-xs text-slate-500">
                {authMode === 'register' ? (
                  <span>¿Ya posee una cuenta registrada?{' '}
                    <button onClick={() => { setAuthMode('login'); setErrorMsg(null); }} className="text-indigo-650 hover:underline font-bold cursor-pointer">Inicie sesión</button>
                  </span>
                ) : (
                  <span>¿Aún no se ha registrado?{' '}
                    <button onClick={() => { setAuthMode('register'); setErrorMsg(null); }} className="text-indigo-650 hover:underline font-bold cursor-pointer">Registrese gratis</button>
                  </span>
                )}
              </div>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-150" />
                <span className="mx-2 text-[9px] text-slate-400 font-bold font-mono tracking-wider">O TAMBIÉN EN LA NUBE</span>
                <div className="flex-1 border-t border-slate-150" />
              </div>

              {/* Google Sign-in element configured correctly to save chosen role metadata */}
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await onLoginGoogle(selectedRole);
                    handleCloseAuth();
                  } catch (e: any) {
                    setErrorMsg(e.message || 'Error al autenticar con Google Console.');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                id="modal-login-google"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 shrink-0" alt="Google logo" />
                <span>Registrarse/Entrar con Cuenta de Google</span>
              </button>

              <button
                type="button"
                className="text-[10px] text-slate-450 hover:text-slate-700 hover:underline cursor-pointer font-medium"
                onClick={() => {
                  onEnterDemoMode(selectedRole);
                  handleCloseAuth();
                }}
              >
                Probar y simular en Modo Demo offline local temporal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 8. FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 text-xs text-center text-slate-550 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <InstitutionalLogos lightMode={true} />
          
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-50 p-2 rounded-xl border border-indigo-150/40">
                <Sparkles className="w-4 h-4 text-indigo-650" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-sm">Espacios Castellanos de Innovación, SLU (EC-Innova)</span>
            </div>
            <p>© 2026 Espacios Castellanos de Innovación, SLU (EC-Innova). Todos los derechos reservados. Cumplimiento BOE y Agencia Tributaria Española.</p>
            <p className="max-w-2xl mx-auto text-[10px] text-slate-400 font-mono">
              Sistemas de reconocimiento de facturas y auditoría modular. Base de datos persistente integrada mediante Google Cloud Firestore y seguridad perimetral de Firebase Auth. Consola Cloud Node ID: 2abfa251.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
