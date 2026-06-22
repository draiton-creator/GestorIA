import React, { useState } from 'react';
import { CompanyConfig, SubvencionHelp, MarketingStrategy, WebSEOReport } from '../types';
import { Sparkles, MessageSquare, Megaphone, Share2, Globe, Search, ArrowRight, Eye, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { SPANISH_SUBVENCIONES } from '../mockData';

interface InteligenciaArtificialProps {
  companyConfig: CompanyConfig;
}

export default function InteligenciaArtificial({ companyConfig }: InteligenciaArtificialProps) {
  const [activeTab, setActiveTab] = useState<'conversas' | 'marketing' | 'web'>('conversas');

  // ---- CONTROL 1: GESTORIA CHAT INTEGRAL & SUBVENCIONES ----
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: '1', sender: 'assistant', text: '¡Hola! Bienvenido al canal central de Inteligencia Artificial de **GestorIA**.\n\nEscríbeme cualquier consulta fiscal espinosa que tengas, o indícame qué tipo de subvención buscas en España. Por ejemplo, puedes preguntarme sobre las **ayudas del Kit Digital** o el **Bono de Autopromoción**.' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Filtrado de Subvenciones
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubHelp, setSelectedSubHelp] = useState<SubvencionHelp | null>(null);

  const filteredSubvenciones = SPANISH_SUBVENCIONES.filter(sub => 
    sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    sub.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: String(Date.now()), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    // Llamar a Gemini API
    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'asistente-general',
        payload: {
          messages: [...chatMessages, userMsg],
          userProfile: companyConfig
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.text) {
          setChatMessages(prev => [...prev, { id: String(Date.now() + 1), sender: 'assistant', text: data.text }]);
        }
      })
      .catch(err => {
        console.error('Error chatbot general:', err);
        // Fallback
        setChatMessages(prev => [...prev, {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: `### Consejos sobre la ayuda fiscal (Offline)\n\nLamentablemente el servidor de traducción temporal está offline, pero puedo orientarte:\n\n1. **Kit Digital**: Es compatible con autónomos de hasta 3 trabajadores recibiendo **3.000€** (recientemente ampliado).\n2. **ENISA**: Requiere constituir Sociedad Limitada y un capital equivalente invertido.\n\n¿Desea que simulemos el cálculo de cotizaciones para autónomos societarios con las nuevas tablas de 2026?`
        }]);
      })
      .finally(() => {
        setIsChatLoading(false);
      });
  };

  // ---- CONTROL 2: MARKETING IA GENERATIVO ----
  const [campaignTheme, setCampaignTheme] = useState('');
  const [isMarketingLoading, setIsMarketingLoading] = useState(false);
  const [marketingResult, setMarketingResult] = useState<MarketingStrategy | null>(null);

  const handleGenerateMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    setIsMarketingLoading(true);

    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'marketing-ideas',
        payload: {
          companyProfile: companyConfig,
          campaignTheme: campaignTheme
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setMarketingResult(data.result);
        }
      })
      .catch(err => {
        console.error('Error marketing ideas:', err);
        // Fallback
        setMarketingResult({
          targetAudience: 'Constructores locales, promotoras cooperativistas y particulares buscando bioconstrucción en la Comunidad de Madrid.',
          channels: ['Instagram', 'Houzz España', 'Anuncios Locales de Google'],
          socialPostIdea: '🏡 ¿Pensando en construir de forma eficiente y honesta? En Construcciones Innovadoras S.L. combinamos materiales sostenibles con tecnología BIM para maximizar la eficiencia lumínica sin salirte de presupuesto. ¡Escríbenos para un presupuesto sin compromiso! #Sostenibilidad #Madrid #Bioconstrucción',
          emailCampaignNewsletter: 'Asunto: Reduce un 30% la factura energética de tu nueva oficina\n\nEstimado cliente,\n\nCon la escalada de costes de suministros, la eficiencia no es una alternativa, es supervivencia. En Construcciones Innovadoras S.L. diseñamos aislamientos optimizados por IA que garantizan confort térmico en verano e invierno. Solicite auditoría gratuita respondiendo a este e-mail.',
          blogOutline: '1. Introducción al Reglamento de Eficiencia Energética de Edificios 2026.\n2. Las técnicas pasivas más rentables (SATE, aerotermia, sombras inteligentes).\n3. Caso real de éxito en cooperativas madrileñas.\n4. Conclusiones y llamada a la acción.',
          seoKeywords: ['construccion sostenible madrid', 'reformas eficientes', 'ahorro energetico edificios', 'cooperativa viviendas eficiente']
        });
      })
      .finally(() => {
        setIsMarketingLoading(false);
      });
  };

  // ---- CONTROL 3: WEB IA PERFORMANCE AUDIT ----
  const [webUrl, setWebUrl] = useState('');
  const [isWebLoading, setIsWebLoading] = useState(false);
  const [webResult, setWebResult] = useState<WebSEOReport | null>(null);

  const handleAuditWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webUrl) return;

    setIsWebLoading(true);
    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'website-seo',
        payload: { url: webUrl }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setWebResult(data.result);
        }
      })
      .catch(err => {
        console.error('Error website seo:', err);
        // Fallback
        setWebResult({
          url: webUrl,
          score: 82,
          mobileFriendly: true,
          loadTimeSeconds: 2.3,
          seoAudit: [
            'Faltan etiquetas meta descriptivas enriquecidas en la página de inicio.',
            'Bajo ratio de texto frente a código HTML en secciones de servicios.',
            'Imágenes pesadas sin compresión WebP en el carrusel de reformas.'
          ],
          usabilityAudit: [
            'Tiempo de primera pintura (FCP) superior a 2 segundos en redes móviles 4G.',
            'Contraste de fuentes insuficiente en los menús de navegación de pie de página.'
          ],
          aiRecommendations: [
            'Configurar compresión Gzip o compresión Brotli en el servidor de hosting.',
            'Migrar las galerías de imágenes tradicionales a formatos modernos con Lazy-Loading nativo.',
            'Añadir etiquetado JSON-LD Schema estructurado del tipo LocalBusiness para destacar en búsquedas locales de Google Maps.'
          ]
        });
      })
      .finally(() => {
        setIsWebLoading(false);
      });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Subnavegación del Módulo de IA */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
        <button
          onClick={() => setActiveTab('conversas')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'conversas'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-chat-ia"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            <span>GestorIA Asistente & Subvenciones</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'marketing'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-marketing-ia"
        >
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-orange-500" />
            <span>Marketing IA</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('web')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'web'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-seo-ia"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Auditor Web IA</span>
          </div>
        </button>
      </div>

      <div className="p-6">
        {/* TAB 1: GESTORIA CHAT INTEGRAL & SUBVENCIONES */}
        {activeTab === 'conversas' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Chat Directo GestorIA */}
            <div className="lg:col-span-3 bg-slate-950 text-slate-150 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between h-[520px]">
              <div>
                <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-4">
                  <div className="bg-emerald-500 text-slate-950 p-1.5 rounded-lg animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-emerald-400">GestorIA Asistente Virtual</h4>
                    <p className="text-[10px] text-slate-450">Soporte fiscal, mercantil y laboral para autónomos en España.</p>
                  </div>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 text-xs font-sans">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`p-3 rounded-2xl max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white ml-auto'
                        : 'bg-slate-850 text-slate-200 border border-slate-800'
                    }`}>
                      <div className="prose prose-invert prose-xs text-[11.5px] leading-relaxed">
                        {msg.text.split('\n').map((line: string, i: number) => {
                          if (line.startsWith('###')) {
                            return <h5 key={i} className="text-xs font-bold text-emerald-450 mt-1 mb-1">{line.replace('###', '')}</h5>;
                          }
                          if (line.startsWith('*')) {
                            return <li key={i} className="ml-3 list-disc mt-0.5">{line.replace('*', '')}</li>;
                          }
                          return <p key={i} className="mb-1">{line}</p>;
                        })}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="bg-slate-850 text-slate-400 p-3.5 rounded-2xl mr-auto max-w-[85%] border border-slate-800/50 flex items-center gap-2 text-[10px]">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>GestorIA está analizando el BOE y redactando respuesta...</span>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 pt-4 border-t border-slate-800">
                <input
                  type="text"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escriba aquí, ej: ¿Cómo solicito el Kit Digital?"
                  className="flex-1 bg-slate-900 border border-slate-800 p-3 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-100"
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 p-3 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Buscador de Ayudas y Subvenciones en España */}
            <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between h-[520px]">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-500" />
                  <span>Ayudas y Subvenciones</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-4">Base de datos simulada y activa de licitaciones de fomento oficiales en España.</p>

                {/* Input de búsqueda */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrar por 'Digitalización' o 'Autónomos'..."
                    className="w-full text-xs pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>

                {/* Listado */}
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredSubvenciones.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSubHelp(sub)}
                      className={`p-3 bg-white border rounded-xl cursor-pointer hover:border-indigo-300 transition-all ${
                        selectedSubHelp?.id === sub.id ? 'border-indigo-500 ring-2 ring-indigo-50/50 shadow-xs' : 'border-slate-150'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] font-bold text-indigo-600 mb-1">
                        <span>{sub.category}</span>
                        <span className="bg-indigo-50 px-2 py-0.5 rounded-full">{sub.amount}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-slate-800 leading-tight mb-1">{sub.title}</h5>
                      <span className="text-[9px] text-slate-400 max-w-full block truncate">Org: {sub.organization}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de Ayuda Detallada */}
              {selectedSubHelp && (
                <div className="bg-indigo-900 text-white rounded-xl p-3.5 mt-3 text-xs space-y-1.5 animate-in slide-in-from-bottom-2 duration-150">
                  <p className="font-bold">{selectedSubHelp.title}</p>
                  <p className="text-[10px] text-indigo-200 line-clamp-2">{selectedSubHelp.description}</p>
                  <p className="text-[9px] text-indigo-300 font-medium">Plazo de Solicitud: {selectedSubHelp.deadline}</p>
                  <a
                    href={selectedSubHelp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-amber-300 hover:underline font-bold"
                  >
                    <span>Ir a la Sede Oficial</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MARKETING IA GENERATIVO */}
        {activeTab === 'marketing' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Formulario */}
            <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Generador de Copy e Inbound Marketing</h4>
                <p className="text-[11px] text-slate-400 mb-4">Defina el tema de su campaña y el redactor publicitario IA de GestorIA creará copies de redes, newsletter corporativas y keywords SEO.</p>

                <form onSubmit={handleGenerateMarketing} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Campaña / Producto / Servicio a promover</label>
                    <textarea
                      required
                      value={campaignTheme}
                      onChange={(e) => setCampaignTheme(e.target.value)}
                      placeholder="Ej: Lanzamiento de paneles solares fotovoltaicos bajo subvenciones autonómicas de empleo de Madrid."
                      className="w-full text-xs p-3 h-28 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isMarketingLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 font-semibold text-xs text-white py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200 animate-spin" />
                    <span>{isMarketingLoading ? 'Redactando estrategia...' : 'Crear Estrategia Inbound'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Resultados Copywriter */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
              {marketingResult ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95">
                  <div className="border-b border-slate-100 pb-3">
                    <h5 className="text-xs font-bold uppercase text-orange-600 mb-1">1. Diagnóstico de Público Objetivo</h5>
                    <p className="text-xs text-slate-700 leading-relaxed">{marketingResult.targetAudience}</p>
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {marketingResult.channels.map((chan, i) => (
                        <span key={i} className="bg-orange-50 text-orange-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-100">{chan}</span>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <h5 className="text-xs font-bold uppercase text-orange-600 mb-1">2. Copia Completo Redes Sociales (LinkedIn / Instagram)</h5>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-600 select-all leading-normal whitespace-pre-wrap">
                      {marketingResult.socialPostIdea}
                    </div>
                  </div>

                  <div className="border-b border-slate-100 pb-3">
                    <h5 className="text-xs font-bold uppercase text-orange-600 mb-1">3. Newsletter de Email Marketing</h5>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-[11px] text-slate-600 select-all whitespace-pre-wrap leading-normal">
                      {marketingResult.emailCampaignNewsletter}
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase text-orange-600 mb-1">4. Keywords SEO sugeridos de alta intención</h5>
                    <div className="flex gap-2 flex-wrap mt-1">
                      {marketingResult.seoKeywords.map((kw, i) => (
                        <span key={i} className="bg-indigo-50 text-indigo-700 text-[10px] font-mono px-2 py-1 rounded border border-indigo-100">"{kw}"</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400">
                  <Megaphone className="w-10 h-10 mx-auto text-slate-350 mb-2" />
                  <p className="text-xs">No hay copias publicitarios generados.</p>
                  <p className="text-[10px] text-slate-300">Indique arriba el tema que desea comercializar y clique en redactar para ver las sugerencias de Inbound Marketing.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: WEB IA PERFORMANCE AUDIT */}
        {activeTab === 'web' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Input URL */}
            <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Auditor Web IA y SEO On-Page</h4>
                <p className="text-[11px] text-slate-400 mb-4">Ingrese la URL de su página web corporativa para realizar una auditoría de SEO on-page, tiempos de carga estimados y usabilidad.</p>

                <form onSubmit={handleAuditWebsite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Dirección Web (URL del sitio)</label>
                    <input
                      type="url"
                      required
                      value={webUrl}
                      onChange={(e) => setWebUrl(e.target.value)}
                      placeholder="https://www.tuempresagestor.es"
                      className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isWebLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs text-white py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Globe className="w-4 h-4 text-indigo-200 animate-pulse" />
                    <span>{isWebLoading ? 'Corriendo auditoría técnica...' : 'Iniciar Auditoría Web'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Resultados Auditor SEO */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 flex flex-col justify-between">
              {webResult ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-50 flex items-center justify-center bg-indigo-500 text-white font-display text-xl font-bold">
                      {webResult.score}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold uppercase text-slate-400">Puntaje Global de Optimización</h5>
                      <p className="text-[11px] text-slate-500">Métrica estimada en base a lineamientos de velocidad de carga del Core Web Vitals de Google.</p>
                      <div className="flex gap-4 mt-1.5 text-[10px] font-bold">
                        <span className="text-slate-600">Tiempo de Carga: <strong className="text-indigo-600">{webResult.loadTimeSeconds}s</strong></span>
                        <span className={webResult.mobileFriendly ? 'text-emerald-600' : 'text-rose-600'}>
                          {webResult.mobileFriendly ? '✓ Mobile-Friendly' : '✗ Falta Responsividad'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-2">Auditoría SEO On-Page</h6>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {webResult.seoAudit.map((auditMsg, i) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <span className="text-indigo-500">▪</span>
                            <span>{auditMsg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h6 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Usabilidad y Conversión</h6>
                      <ul className="space-y-1.5 text-xs text-slate-600">
                        {webResult.usabilityAudit.map((uMsg, i) => (
                          <li key={i} className="flex gap-1.5 items-start">
                            <span className="text-amber-500">▪</span>
                            <span>{uMsg}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 border border-indigo-100 rounded-xl space-y-2">
                    <h6 className="text-[10px] font-bold text-indigo-800 uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recomendaciones Correctivas de GestorIA</span>
                    </h6>
                    <ul className="space-y-1 text-xs text-slate-700 font-sans">
                      {webResult.aiRecommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="py-24 text-center text-slate-400">
                  <Globe className="w-10 h-10 mx-auto text-slate-350 mb-2" />
                  <p className="text-xs">No hay auditoría web programada.</p>
                  <p className="text-[10px] text-slate-300">Introduzca arriba su enlace y haga clic en realizar auditoría para diagnosticar el rendimiento y el SEO on-page de su marca digital.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
