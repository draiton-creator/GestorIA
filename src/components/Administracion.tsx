import React, { useState } from 'react';
import { CompanyConfig, SystemUser, UserRole } from '../types';
import { Settings, Users, ShieldAlert, BadgeCheck, Save, CheckCircle2, Sliders, BellDot } from 'lucide-react';

interface AdministracionProps {
  companyConfig: CompanyConfig;
  onUpdateCompanyConfig: (config: CompanyConfig) => void;
  users: SystemUser[];
  onUpdateUsers: (users: SystemUser[]) => void;
  currentUserRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  invoiceCount: number;
  expenseCount: number;
  projectCount: number;
}

export default function Administracion({
  companyConfig,
  onUpdateCompanyConfig,
  users,
  onUpdateUsers,
  currentUserRole,
  onChangeUserRole,
  invoiceCount,
  expenseCount,
  projectCount
}: AdministracionProps) {
  const [activeTab, setActiveTab] = useState<'usuarios' | 'ajustes'>('ajustes');

  // Ajustes form state
  const [compName, setCompName] = useState(companyConfig.name);
  const [compNif, setCompNif] = useState(companyConfig.nif);
  const [compAddress, setCompAddress] = useState(companyConfig.address);
  const [compEmail, setCompEmail] = useState(companyConfig.email);
  const [compPhone, setCompPhone] = useState(companyConfig.phone);
  const [defaultIva, setDefaultIva] = useState(companyConfig.defaultIva);
  const [defaultIrpf, setDefaultIrpf] = useState(companyConfig.defaultIrpf);
  const [premiumTier, setPremiumTier] = useState(companyConfig.premiumTier);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Synchronize state with props when companyConfig updates from Firebase load
  React.useEffect(() => {
    setCompName(companyConfig.name || '');
    setCompNif(companyConfig.nif || '');
    setCompAddress(companyConfig.address || '');
    setCompEmail(companyConfig.email || '');
    setCompPhone(companyConfig.phone || '');
    setDefaultIva(companyConfig.defaultIva ?? 21);
    setDefaultIrpf(companyConfig.defaultIrpf ?? 15);
    setPremiumTier(companyConfig.premiumTier || 'Profesional');
  }, [
    companyConfig.name,
    companyConfig.nif,
    companyConfig.address,
    companyConfig.email,
    companyConfig.phone,
    companyConfig.defaultIva,
    companyConfig.defaultIrpf,
    companyConfig.premiumTier
  ]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyConfig({
      ...companyConfig,
      name: compName,
      nif: compNif,
      address: compAddress,
      email: compEmail,
      phone: compPhone,
      defaultIva: Number(defaultIva),
      defaultIrpf: Number(defaultIrpf),
      premiumTier
    });
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 3000);
  };

  const handleToggleUserStatus = (userId: string) => {
    const updated = users.map(user => {
      if (user.id === userId) {
        return { ...user, active: !user.active };
      }
      return user;
    });
    onUpdateUsers(updated);
  };

  const handleRoleChangeInList = (userId: string, newRole: UserRole) => {
    const updated = users.map(user => {
      if (user.id === userId) {
        return { ...user, role: newRole };
      }
      return user;
    });
    onUpdateUsers(updated);
  };

  // Subscription plan limits
  const invoiceLimit = premiumTier === 'Básico' ? 5 : premiumTier === 'Profesional' ? 15 : 100;
  const expenseLimit = premiumTier === 'Básico' ? 10 : premiumTier === 'Profesional' ? 30 : 250;
  const projectLimit = premiumTier === 'Básico' ? 2 : premiumTier === 'Profesional' ? 5 : 25;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
      {/* Subnavegación del Módulo Administración */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'usuarios'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-admin-users"
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Usuarios, Roles y Permisos</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ajustes')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'ajustes'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
          id="tab-settings"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            <span>Configuración Corporativa</span>
          </div>
        </button>
      </div>

      <div className="p-6">
        {/* VIEW 1: USUARIOS, ROLES Y PERMISOS */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Administración de Accesos de GestorIA</h3>
                <p className="text-xs text-slate-500">Gestione los miembros del equipo que colaboran en el ERP y cambie sus permisos de forma centralizada.</p>
              </div>

              {/* Simulador de Rol actual en el iFrame */}
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-emerald-650 uppercase font-bold tracking-wider">Simular Rol Activo:</span>
                  <p className="font-semibold text-emerald-950">Estás operando como {currentUserRole}</p>
                </div>
                <select
                  value={currentUserRole}
                  onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
                  className="bg-white border border-emerald-300 rounded text-xs p-1 focus:outline-none"
                  id="select-sim-role"
                >
                  <option value="Usuario Administrador">Usuario Administrador</option>
                  <option value="Usuario Empresa">Usuario Empresa</option>
                  <option value="Usuario Free">Usuario Free</option>
                </select>
              </div>
            </div>

            {/* Listado de personal corporativo */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs font-semibold uppercase border-b border-slate-100">
                    <th className="p-4">Colaborador</th>
                    <th className="p-4">Usuario Principal</th>
                    <th className="p-4">Rol Asignado</th>
                    <th className="p-4">Habilitado</th>
                    <th className="p-4 text-center">Permisos Auditores</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">
                        <p>{u.name}</p>
                        <span className="text-[10px] text-slate-400 font-normal">Alta: {u.joinedAt}</span>
                      </td>
                      <td className="p-4 font-mono text-slate-500">{u.email}</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChangeInList(u.id, e.target.value as UserRole)}
                          className="bg-white border border-slate-200 p-1.5 rounded-lg text-xs text-slate-700"
                        >
                          <option value="Usuario Administrador">Usuario Administrador</option>
                          <option value="Usuario Empresa">Usuario Empresa</option>
                          <option value="Usuario Free">Usuario Free</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                            u.active 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/50' 
                              : 'bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100/50'
                          }`}
                        >
                          {u.active ? 'Habilitado' : 'Suspendido'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        {u.role === 'Usuario Administrador' ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[9px] font-bold border border-purple-100">💻 Total Acceso</span>
                        ) : u.role === 'Usuario Empresa' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[9px] font-bold border border-emerald-100">📊 Finanzas</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold border border-amber-100">⚙️ Operaciones</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Aviso legal ley de protección de datos */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex gap-2.5 items-start">
              <ShieldAlert className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600">
                <p className="font-bold text-slate-800">Compromiso de RGPD y Seguridad Bancaria</p>
                <p className="text-slate-400 mt-1">Conforme a la RGPD de España y Directiva Europea PSD2, las contraseñas de accesos de colaboradores se cifran directamente en Firestore y las autorizaciones OpenBanking expiran automáticamente a los 90 días.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: AJUSTES CORPORATIVOS */}
        {activeTab === 'ajustes' && (
          <div className="space-y-6">
            {/* Cabecera de Ajustes con botón de guardar arriba-derecha */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Configuración de la Empresa</h3>
                <p className="text-xs text-slate-500">Actualice la razón social, NIF, datos de contacto e impuestos aplicables por defecto en sus facturas.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="submit"
                  form="company-settings-form"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-xs cursor-pointer active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración</span>
                </button>
                {showSaveSuccess && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Guardado con éxito!</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Formulario de Configuración */}
              <form id="company-settings-form" onSubmit={handleSaveConfig} className="lg:col-span-3 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Razón Social de la PYME</label>
                    <input
                      type="text"
                      required
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">NIF de la Organización</label>
                    <input
                      type="text"
                      required
                      value={compNif}
                      onChange={(e) => setCompNif(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Domicilio Fiscal Oficial</label>
                  <input
                    type="text"
                    required
                    value={compAddress}
                    onChange={(e) => setCompAddress(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">E-mail corporativo</label>
                    <input
                      type="email"
                      required
                      value={compEmail}
                      onChange={(e) => setCompEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Teléfono</label>
                    <input
                      type="text"
                      required
                      value={compPhone}
                      onChange={(e) => setCompPhone(e.target.value)}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Tasa estándar de IVA de Venta (%)</label>
                    <input
                      type="number"
                      required
                      value={defaultIva}
                      onChange={(e) => setDefaultIva(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Retención Estándar de IRPF (%)</label>
                    <input
                      type="number"
                      required
                      value={defaultIrpf}
                      onChange={(e) => setDefaultIrpf(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Plan de Suscripción GestorIA</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Básico', 'Profesional', 'Empresarial'].map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => setPremiumTier(plan as any)}
                        className={`p-3 text-xs border rounded-xl font-semibold transition-all ${
                          premiumTier === plan 
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700' 
                            : 'border-slate-200 text-slate-500 hover:bg-slate-55'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all rounded-xl shadow-xs cursor-pointer active:scale-98"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Configuración</span>
                  </button>

                  {showSaveSuccess && (
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Cambios guardados correctamente!</span>
                    </span>
                  )}
                </div>
              </form>

              {/* Consumos y Límites de Suscripción */}
              <div className="lg:col-span-2 bg-slate-50/70 rounded-2xl p-5 border border-slate-150 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sliders className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Uso de Límites del Plan</h4>
                  </div>

                  <div className="space-y-4">
                    {/* LIMITE INVOICES */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Facturas Emitidas</span>
                        <span className="font-bold">{invoiceCount} / {invoiceLimit}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500" 
                          style={{ width: `${Math.min(100, (invoiceCount / invoiceLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* LIMITE EXPENSES */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Tickets Escaneados con IA</span>
                        <span className="font-bold">{expenseCount} / {expenseLimit}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-500" 
                          style={{ width: `${Math.min(100, (expenseCount / expenseLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* LIMITE PROJECTS */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Proyectos Activos</span>
                        <span className="font-bold">{projectCount} / {projectLimit}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-blue-500" 
                          style={{ width: `${Math.min(100, (projectCount / projectLimit) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-900 text-white rounded-xl p-4 mt-6 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold flex items-center gap-1.5 text-amber-300">
                      <BadgeCheck className="w-4 h-4" />
                      <span>Plan {premiumTier}</span>
                    </p>
                    <p className="text-[10px] text-indigo-200 mt-1">Tu suscripción se renovará el 01 de Julio de 2026.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Iniciando checkout seguro para contratar el plan Empresarial Ilimitado.`)}
                    className="bg-white hover:bg-slate-55 text-indigo-950 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                  >
                    Mejorar Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
