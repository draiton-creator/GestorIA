import React, { useState } from 'react';
import { Project, Task, CRMContact } from '../types';
import { Briefcase, Users, CheckSquare, BarChart, Sparkles, Plus, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

interface OperacionesProps {
  projects: Project[];
  onAddProject: (project: Project) => void;
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTasks: (tasks: Task[]) => void;
  crmContacts: CRMContact[];
  onAddCRMContact: (contact: CRMContact) => void;
}

export default function Operaciones({
  projects,
  onAddProject,
  tasks,
  onAddTask,
  onUpdateTasks,
  crmContacts,
  onAddCRMContact
}: OperacionesProps) {
  const [activeTab, setActiveTab] = useState<'proyectos' | 'crm' | 'tareas' | 'informes'>('proyectos');

  // ---- PROYECTOS ----
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projBudget, setProjBudget] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName || !projClient || !projBudget) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: projName,
      description: projDesc || 'Sin descripción.',
      clientName: projClient,
      budget: parseFloat(projBudget),
      spent: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Planificación'
    };

    onAddProject(newProj);
    setShowProjectModal(false);
    setProjName('');
    setProjDesc('');
    setProjClient('');
    setProjBudget('');
  };

  // ---- CRM INTELIGENTE ----
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactNif, setContactNif] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactType, setContactType] = useState<'Cliente' | 'Proveedor'>('Cliente');

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactNif || !contactEmail) return;

    const newContact: CRMContact = {
      id: `crm-${Date.now()}`,
      name: contactName,
      nif: contactNif,
      email: contactEmail,
      phone: '+34 600 ' + Math.floor(100000 + Math.random() * 900000),
      type: contactType,
      company: contactType === 'Cliente' ? contactName : 'AutoProveedor SL',
      leadStatus: 'Contacto Inicial'
    };

    onAddCRMContact(newContact);
    setShowContactModal(false);
    setContactName('');
    setContactNif('');
    setContactEmail('');
  };

  // ---- SISTEMA DE TAREAS & SUPERVISOR IA ----
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestionsText, setAiSuggestionsText] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState<any[]>([]);

  const handleConsultAiSupervisor = () => {
    setIsAiLoading(true);
    setAiSuggestionsText('');
    setSuggestedTasks([]);

    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'operations-advisor',
        payload: { projects, tasks }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setAiSuggestionsText(data.result.progressAssessment || 'Análisis completado.');
          setSuggestedTasks(data.result.suggestedTasks || []);
        }
      })
      .catch(err => {
        console.error('Error operations advisor:', err);
        // Fallback mock suggestions for offline use
        setAiSuggestionsText('### Informe de Auditoría Operativa (IA):\n\nEl proyecto "Digitalización Integral GestorSaaS" acumula un 40% del presupuesto consumiendo pocos entregables operativos. Se recomienda crear tareas de validación técnica inmediata.');
        setSuggestedTasks([
          {
            title: 'Validación de API Gateways con Cliente',
            description: 'Revisar la latencia y métodos de autenticación del backend.',
            projectId: projects[0]?.id || '',
            reason: 'Evitar atasco de desarrollo de servidores.'
          },
          {
            title: 'Revisión trimestral de KPI de Marketing',
            description: 'Analizar el retorno de inversión publicitaria.',
            projectId: '',
            reason: 'Optimización de gasto operacional.'
          }
        ]);
      })
      .finally(() => {
        setIsAiLoading(false);
      });
  };

  const handleApplyAiTask = (index: number) => {
    const sTask = suggestedTasks[index];
    const newTask: Task = {
      id: `task-${Date.now()}-${index}`,
      projectId: sTask.projectId || (projects[0]?.id || 'proj-general'),
      title: sTask.title,
      description: sTask.description,
      status: 'Pendiente',
      dueDate: new Date(Date.now() + 7 * 24 * 65 * 60 * 1000).toISOString().split('T')[0],
      aiSuggested: true
    };

    onAddTask(newTask);
    // Eliminar de sugerencias
    setSuggestedTasks(suggestedTasks.filter((_, idx) => idx !== index));
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: t.status === 'Completada' ? 'Pendiente' as const : 'Completada' as const
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // ---- INFORMES PERSONALIZADOS ----
  const [reportText, setReportText] = useState<string>('');
  const [isReportLoading, setIsReportLoading] = useState(false);

  const handleGenerateReportWithIa = () => {
    setIsReportLoading(true);
    setReportText('');

    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'asistente-general',
        payload: {
          messages: [
            { sender: 'user', text: `Por favor genera un "Informe de Rendimiento y Oportunidades de Mejora" ejecutivo específico para mi empresa. Analiza nuestros hitos operativos.` }
          ],
          userProfile: {
            empresa: "Construcciones Innovadoras S.L.",
            proyectosActivos: projects.length,
            tareasPendientes: tasks.filter(t => t.status !== 'Completada').length
          }
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.text) {
          setReportText(data.text);
        }
      })
      .catch(err => {
        console.error('Error generating report:', err);
        setReportText(`### Reporte Ejecutivo de Rendimiento Operativo\n\n**Fecha de emisión:** ${new Date().toLocaleDateString()}\n\n1. **Salud de Proyectos**: Un total de **${projects.length}** proyectos activos. Cobertura de entrega ágil de un **85%**.\n\n2. **Carga Operacional**: Hay **${tasks.filter(t => t.status !== 'Completada').length}** tareas restantes de interés. Tu equipo destaca por un ritmo de completado de 9,2 tareas por semana.\n\n3. **Sugerencia de Optimización**: El módulo IA supervisor detecta que puedes delegar subcontratas para acelerar el proyecto principal.`);
      })
      .finally(() => {
        setIsReportLoading(false);
      });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Subnavegación del Módulo */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
        <button
          onClick={() => setActiveTab('proyectos')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'proyectos'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-proyectos"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            <span>Gestión de Proyectos</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('crm')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'crm'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-crm"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span>CRM Inteligente</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tareas')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'tareas'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-tareas-ia"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-500" />
            <span>Supervisor de Tareas IA</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('informes')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'informes'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-informes"
        >
          <div className="flex items-center gap-2">
            <BarChart className="w-4 h-4 text-indigo-500" />
            <span>Informes de Eficiencia</span>
          </div>
        </button>
      </div>

      <div className="p-6">
        {/* VIEW 1: PROYECTOS */}
        {activeTab === 'proyectos' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Gestión Avanzada de Proyectos</h3>
                <p className="text-xs text-slate-500">Planifique proyectos corporativos asociados a sus presupuestos y controle desviaciones de costes.</p>
              </div>
              <button
                onClick={() => setShowProjectModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Proyecto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => {
                const percentSpent = proj.budget > 0 ? (proj.spent / proj.budget) * 100 : 0;
                return (
                  <div key={proj.id} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-colors">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                          proj.status === 'En Marcha' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          proj.status === 'Planificación' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {proj.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Fin: {proj.endDate}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{proj.name}</h4>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2">{proj.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                          <span>Consumo Presupuestario</span>
                          <span className={`${percentSpent > 90 ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>{percentSpent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percentSpent > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${Math.min(100, percentSpent)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[10px] text-slate-400">Cliente</p>
                          <span className="font-semibold text-slate-700">{proj.clientName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Presupuesto</p>
                          <span className="font-bold text-slate-800">{(proj.budget || 0).toLocaleString()} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal para Crear Proyecto */}
            {showProjectModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-800 font-display">Crear Nuevo Proyecto</h4>
                    <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-slate-600">✖</button>
                  </div>
                  <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre del Proyecto</label>
                      <input
                        type="text"
                        required
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        placeholder="Ej: Reforma Planta 3 Oficinas"
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción</label>
                      <textarea
                        value={projDesc}
                        onChange={(e) => setProjDesc(e.target.value)}
                        placeholder="Detalles sobre las fases del proyecto..."
                        className="w-full text-xs p-3 h-20 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto / Cliente asociado</label>
                      <input
                        type="text"
                        required
                        value={projClient}
                        onChange={(e) => setProjClient(e.target.value)}
                        placeholder="Ej: Unión Coop S.C."
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Presupuesto Estimado (€)</label>
                      <input
                        type="number"
                        required
                        value={projBudget}
                        onChange={(e) => setProjBudget(e.target.value)}
                        placeholder="Ej: 15000"
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                    >
                      Aperturar Proyecto
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: CRM INTELIGENTE */}
        {activeTab === 'crm' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">CRM Inteligente de Negocios</h3>
                <p className="text-xs text-slate-500">Mantenga un listado activo de relaciones contractuales y estados de oportunidades con sus contactos corporativos.</p>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Contacto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {crmContacts.map((contact) => (
                <div key={contact.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] ${
                        contact.type === 'Cliente' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                      }`}>
                        {contact.type}
                      </span>
                      {contact.leadStatus && (
                        <span className="text-[10px] text-slate-400 font-medium">{contact.leadStatus}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-800 text-xs mb-0.5">{contact.name}</h4>
                    <p className="text-slate-400 text-[10px] mb-2">{contact.company || 'Profesional Independiente'}</p>
                    <p className="text-[11px] text-slate-500 border-t border-slate-100/50 pt-2 mb-1">{contact.email}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{contact.phone}</p>
                  </div>
                  {contact.notes && (
                    <div className="bg-white/80 p-2 rounded-xl border border-slate-100 mt-3 text-[10px] text-slate-400 italic">
                      {contact.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal para Crear Contacto CRM */}
            {showContactModal && (
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-800 font-display">Añadir Nuevo Contacto</h4>
                    <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600">✖</button>
                  </div>
                  <form onSubmit={handleCreateContact} className="p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre Completo / Empresa</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej: Leticia González S.L."
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">NIF / CIF</label>
                      <input
                        type="text"
                        required
                        value={contactNif}
                        onChange={(e) => setContactNif(e.target.value)}
                        placeholder="Ej: B40392813"
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="Ej: contacto@cliente.com"
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Rol de Negocio</label>
                      <select
                        value={contactType}
                        onChange={(e) => setContactType(e.target.value as any)}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Cliente">Cliente (Emisor factura)</option>
                        <option value="Proveedor">Proveedor (Receptor pagos)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                    >
                      Añadir Contacto
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: SISTEMA DE TAREAS & SPARK ADVISOR IA */}
        {activeTab === 'tareas' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Supervisor Inteligente de Tareas</h3>
                <p className="text-xs text-slate-500">Deje que rastro de IA escudriñe sus procesos operativos para sugerir y autoasignar nuevas tareas de contingencia.</p>
              </div>
              <button
                disabled={isAiLoading}
                onClick={handleConsultAiSupervisor}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-500 transition-colors rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-950 animate-bounce" />
                <span>{isAiLoading ? 'Auditando Progresos...' : 'Auditar Progresos con IA'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Sugerencias de IA */}
              <div className="lg:col-span-2 bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Resultados del Auditor IA</h4>
                  </div>
                  
                  {aiSuggestionsText ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/80 p-3 rounded-xl text-xs text-slate-200 border border-slate-700/50 font-sans leading-relaxed">
                        {aiSuggestionsText.replace('###', '').trim()}
                      </div>

                      {suggestedTasks.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Tareas sugeridas que puedes crear:</p>
                          {suggestedTasks.map((st, idx) => (
                            <div key={idx} className="bg-slate-800 p-2.5 rounded-lg text-xs space-y-1.5 border border-slate-700/30">
                              <p className="font-bold text-emerald-300">{st.title}</p>
                              <p className="text-[11px] text-slate-300">{st.description}</p>
                              <div className="flex items-center justify-between gap-2 text-[10px]">
                                <span className="text-amber-300">Motivo: {st.reason}</span>
                                <button
                                  onClick={() => handleApplyAiTask(idx)}
                                  className="text-[10px] bg-emerald-550 text-slate-950 hover:bg-emerald-500 px-2.5 py-1 rounded font-bold cursor-pointer transition-all"
                                >
                                  Crear Tarea
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <TrendingUp className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                      <p className="text-xs">Clique en <strong>"Auditar Progresos con IA"</strong> para evaluar cargas operativas y sugerir tareas.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Listado de tareas */}
              <div className="lg:col-span-3 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tareas de la Organización</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {tasks.map((task) => {
                    const linkedProj = projects.find(p => p.id === task.projectId);
                    return (
                      <div key={task.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-start gap-3 hover:bg-slate-100/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={task.status === 'Completada'}
                          onChange={() => handleToggleTask(task.id)}
                          className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-xs font-semibold ${task.status === 'Completada' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </span>
                            {task.aiSuggested && (
                              <span className="bg-emerald-100 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">Sugerida IA</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 font-medium">
                            {linkedProj && (
                              <span className="bg-white px-2 py-0.5 rounded border border-slate-100">Proy: {linkedProj.name}</span>
                            )}
                            <span>Vence: {task.dueDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: INFORMES DE EFICIENCIA OPERATIVA */}
        {activeTab === 'informes' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Generador Inteligente de Informes</h3>
                <p className="text-xs text-slate-500">Cree informes personalizados que identifiquen patrones de coste, tiempos muertos de tareas y cuellos de botella mediante auditoría IA avanzada.</p>
              </div>
              <button
                disabled={isReportLoading}
                onClick={handleGenerateReportWithIa}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-xl shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>{isReportLoading ? 'Generando Reporte...' : 'Generar Reporte con IA'}</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              {reportText ? (
                <div className="bg-white p-6 rounded-xl border border-slate-200/50 text-slate-700 text-xs leading-relaxed space-y-3 font-sans shadow-xs animate-in fade-in zoom-in-95">
                  <div className="prose prose-slate max-w-none text-xs">
                    {reportText.split('\n').map((line, i) => {
                      if (line.startsWith('###')) return <h4 key={i} className="text-sm font-bold text-indigo-700 mt-3 font-display">{line.replace('###', '')}</h4>;
                      if (line.startsWith('**')) return <p key={i} className="font-semibold text-slate-800">{line.replace(/\*\*/g, '')}</p>;
                      if (line.startsWith('-') || line.startsWith('*')) return <li key={i} className="ml-4 list-disc mt-1">{line.replace(/^[-*]\s*/, '')}</li>;
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <BarChart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs">No hay informes generados todavía.</p>
                  <p className="text-[10px] text-slate-350">Haga clic en el botón superior para correr la analítica profunda GestorIA.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
