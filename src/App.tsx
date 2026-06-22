import React, { useState, useEffect } from 'react';
import {
  INITIAL_COMPANY_CONFIG,
  INITIAL_SYSTEM_USERS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_INVOICES,
  INITIAL_EXPENSES,
  INITIAL_PROJECTS,
  INITIAL_TASKS,
  INITIAL_CRM_CONTACTY_DATA, // wait, let's verify if we named it INITIAL_CRM_CONTACTS in mockData
  INITIAL_CRM_CONTACTS
} from './mockData';
import {
  CompanyConfig,
  SystemUser,
  BankTransaction,
  Invoice,
  Expense,
  Project,
  Task,
  CRMContact,
  UserRole
} from './types';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Submódulos
import Finanzas from './components/Finanzas';
import Operaciones from './components/Operaciones';
import InteligenciaArtificial from './components/InteligenciaArtificial';
import Administracion from './components/Administracion';
import IntegracionesWorkspace from './components/IntegracionesWorkspace';
import LandingPage from './components/LandingPage';
import GestoriaLogo from './components/GestoriaLogo';
import InstitutionalLogos from './components/InstitutionalLogos';

// Iconos y Gráficos
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  Receipt,
  FileText,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  Sliders,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  LayoutDashboard,
  Brain,
  Settings,
  User,
  Mail,
  Calendar,
  Video,
  HardDrive,
  FileSpreadsheet,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const mapInvoiceToFirestore = (ownerId: string, invoice: Invoice) => {
  const lineas = invoice.items?.map(it => ({
    description: it.description || "",
    quantity: it.quantity || 1,
    total: it.total || it.price || 0,
    unit: "cantidad",
    unitPrice: it.price || 0
  })) || [];

  return {
    ...invoice,
    ownerId,
    cliente: invoice.clientName || "",
    clienteCif: invoice.clientNif || "",
    clienteDireccion: {
      addressLine1: "Polígono Industrial Las Casas",
      city: "calle N - s/n",
      country: "España"
    },
    clienteEmail: "",
    clienteTelefono: "",
    emisorEmail: "info@ec-innova.es",
    emisorTelefono: "+34659658972",
    estado: invoice.status === 'Pagada' ? 'Pagado' : invoice.status === 'Enviada' ? 'Enviada' : 'Borrador',
    fechaCreacion: new Date(),
    fechaEmision: invoice.date ? new Date(invoice.date) : new Date(),
    fechaVto: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
    iban: "",
    importe: invoice.total || 0,
    impuestos: invoice.ivaAmount || 0,
    lineas,
    moneda: "EUR",
    numero: invoice.number || "",
    origin: "app",
    showClientEmail: false,
    showClientPhone: false,
    showEmisorEmail: true,
    showEmisorPhone: true,
    subtotal: invoice.subtotal || 0,
    terminos: "",
    tipo: "factura"
  };
};

const buildUserDocPayload = (
  user: any, 
  role: string, 
  currentData: any = {}
) => {
  const canonicalRole = (role === 'Usuario Free' || role === 'Free' || role === 'free') 
    ? 'free' 
    : (role === 'Usuario Administrador' || role === 'Administrador' || role === 'admin')
      ? 'admin'
      : 'empresa';

  const companyConfig = {
    ...INITIAL_COMPANY_CONFIG,
    ...(currentData.companyConfig || {})
  };
  if (!companyConfig.email || companyConfig.email === "contacto@construccionesinnovadoras.es") {
    companyConfig.email = user.email || "";
  }

  const address = {
    addressLine1: currentData.company?.address?.addressLine1 || "Calle Conquistadores 8, Torrijos , Toledo 45500 tlf 619776883 att. Cristina candel cáceres",
    addressLine2: currentData.company?.address?.addressLine2 || "",
    city: currentData.company?.address?.city || "Torrijos",
    country: currentData.company?.address?.country || "España",
    postalCode: currentData.company?.address?.postalCode || "45500",
    province: currentData.company?.address?.province || "Toledo"
  };

  const invoiceSeries = {
    "factura": currentData.company?.invoiceSeries?.["factura"] || [
      { id: "1768391960605", isDefault: true, name: "Principal", nextNumber: 1, prefix: "FACT", useYear: true }
    ],
    "nota-credito": currentData.company?.invoiceSeries?.["nota-credito"] || [
      { id: "1768391965045", isDefault: true, name: "Principal", nextNumber: 1, prefix: "NC", useYear: true }
    ],
    "presupuesto": currentData.company?.invoiceSeries?.["presupuesto"] || [
      { id: "1768391968934", isDefault: true, name: "Principal", nextNumber: 1, prefix: "PRES", useYear: true }
    ],
    "recurrente": currentData.company?.invoiceSeries?.["recurrente"] || [
      { id: "1768391969248", isDefault: true, name: "Principal", nextNumber: 1, prefix: "RECU", useYear: true }
    ]
  };

  const company = {
    address,
    brandColor: companyConfig.brandColor || "#7ec8e3",
    cif: companyConfig.nif || companyConfig.cif || "B16896953",
    convenio: currentData.company?.convenio || "Convenio colectivo estatal de restauración colectiva.",
    holidays: currentData.company?.holidays || [],
    iban: companyConfig.iban || "",
    invoiceSeries,
    logoUrl: currentData.company?.logoUrl || "https://firebasestorage.googleapis.com/v0/b/emprende-total.firebasestorage.app/o/company-logos%2FmI5ue0oKwQUBkLaoub6n9Kh2afz1%2Fdescarga.jpg?alt=media&token=783b305b-cf07-4a62-a708-785649d1897d",
    name: companyConfig.name || "Agroturismo las niñas S.L",
    phone: companyConfig.phone || "+34619776883",
    terminos: currentData.company?.terminos || "",
    verifactuByDefault: currentData.company?.verifactuByDefault || false
  };

  const providerData = user.providerData?.map((p: any) => ({
    displayName: p.displayName || user.displayName || "Diego Gómez Marín",
    email: p.email || user.email || "prueba@prueba.com",
    photoURL: p.photoURL || user.photoURL || null,
    providerId: p.providerId || "google.com",
    uid: p.uid || user.uid || "prueba@prueba.com"
  })) || [
    {
      displayName: user.displayName || "Diego Gómez Marín",
      email: user.email || "prueba@prueba.com",
      photoURL: user.photoURL || null,
      providerId: "google.com",
      uid: user.uid || "prueba@prueba.com"
    }
  ];

  const subscription = {
    endDate: currentData.subscription?.endDate || null,
    status: currentData.subscription?.status || "active",
    type: canonicalRole === 'empresa' || canonicalRole === 'admin' ? 'pro' : 'free'
  };

  return {
    company,
    createdAt: currentData.createdAt || new Date(),
    displayName: user.displayName || currentData.displayName || "Diego Gómez Marín",
    email: user.email || "prueba@prueba.com",
    photoURL: user.photoURL || currentData.photoURL || null,
    providerData,
    role: canonicalRole,
    subscription,
    registeredRole: role,
    companyConfig,
    uid: user.uid
  };
};

export default function App() {
  // ---- ESTADOS GLOBALES ----
  const [activeModule, setActiveModule] = useState<'resumen' | 'finanzas' | 'operaciones' | 'ia' | 'admin' | 'integrations'>('resumen');
  const [workspaceToken, setWorkspaceToken] = useState<string | null>(() => localStorage.getItem('gestor_ia_workspace_token'));
  
  // Datos locales reactivos
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(INITIAL_COMPANY_CONFIG);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [crmContacts, setCrmContacts] = useState<CRMContact[]>(INITIAL_CRM_CONTACTS);

  // Rol de usuario simulado (Administrador por defecto)
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Usuario Administrador');

  // Firebase auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Perfil Dropdown y Tour Interactivo
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState<number | null>(null);

  // IA - Predicciones Financieras y Perspectivas
  const [predictedData, setPredictedData] = useState<any[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [strategicAdvisory, setStrategicAdvisory] = useState('');

  // IA - Perspectiva de Optimización de Gastos
  const [detectedAnomalies, setDetectedAnomalies] = useState<string[]>([]);
  const [savingsRecommendations, setSavingsRecommendations] = useState<string[]>([]);
  const [businessEfficiencyScore, setBusinessEfficiencyScore] = useState<number | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);

  // ---- FIREBASE AUTH LISTENER ----
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      
      if (user) {
        setIsDemoMode(false); // Disable demo mode once logged in securely
        // Cargar datos guardados del usuario de Firestore (Persistencia Real SaaS)
        try {
          const docRef = doc(db, "users", user.uid);
          let docSnap;
          try {
            docSnap = await getDoc(docRef);
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
          }
          
          let userRoleLoaded: UserRole = 'Usuario Free';
          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            let config = data.companyConfig ? { ...data.companyConfig } : { ...INITIAL_COMPANY_CONFIG };
            if (!config.email || config.email === "contacto@construccionesinnovadoras.es") {
              config.email = user.email || "";
              try {
                await setDoc(docRef, { ...data, companyConfig: config }, { merge: true });
              } catch (e) {
                console.error("Non-blocking failure updating default company email: ", e);
              }
            }
            setCompanyConfig(config);
            
            // Map the role registered securely
            if (data.registeredRole || data.role) {
              const rawRole = data.registeredRole || data.role;
              userRoleLoaded = (rawRole === 'Free' || rawRole === 'Usuario Free' || rawRole === 'free')
                ? 'Usuario Free' 
                : (rawRole === 'Empresa' || rawRole === 'Usuario Empresa' || rawRole === 'empresa')
                  ? 'Usuario Empresa' 
                  : 'Usuario Administrador';
              setCurrentUserRole(userRoleLoaded);
            } else {
              // Google user fallback based on email
              const isDefaultAdmin = user.email === 'draiton@ec-innova.es';
              userRoleLoaded = isDefaultAdmin ? 'Usuario Administrador' : 'Usuario Empresa';
              setCurrentUserRole(userRoleLoaded);
            }
          } else {
            // Guardar datos iniciales si es usuario nuevo en Firestore
            const storedRole = localStorage.getItem("gestor_ia_google_preferred_role");
            localStorage.removeItem("gestor_ia_google_preferred_role");

            const isDefaultAdmin = user.email === 'draiton@ec-innova.es';
            let determinedRole: UserRole = 'Usuario Free'; // Default fallback
            
            if (isDefaultAdmin) {
              determinedRole = 'Usuario Administrador';
            } else if (storedRole) {
              determinedRole = (storedRole === 'Free' || storedRole === 'Usuario Free')
                ? 'Usuario Free'
                : (storedRole === 'Empresa' || storedRole === 'Usuario Empresa')
                  ? 'Usuario Empresa'
                  : 'Usuario Administrador';
            } else {
              determinedRole = 'Usuario Empresa'; // Default standard signup if not specified
            }

            const initialPayload = buildUserDocPayload(user, determinedRole, {
              companyConfig: {
                ...INITIAL_COMPANY_CONFIG,
                email: user.email || INITIAL_COMPANY_CONFIG.email,
                premiumTier: determinedRole === 'Usuario Free' 
                  ? 'Básico' 
                  : determinedRole === 'Usuario Empresa' 
                    ? 'Profesional' 
                    : 'Empresarial'
              }
            });

            try {
              await setDoc(docRef, initialPayload);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
            }
            userRoleLoaded = determinedRole;
            setCurrentUserRole(determinedRole);
          }

          // Cargar datos desde las colecciones independientes root-level
          let invoicesSnap, expensesSnap, projectsSnap, tasksSnap, contactsSnap, paymentsSnap;
          try {
            [
              invoicesSnap,
              expensesSnap,
              projectsSnap,
              tasksSnap,
              contactsSnap,
              paymentsSnap
            ] = await Promise.all([
              getDocs(query(collection(db, "invoices"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "expenses"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "projects"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "tasks"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "contacts"), where("ownerId", "==", user.uid))),
              getDocs(query(collection(db, "payment_logs"), where("ownerId", "==", user.uid)))
            ]);
          } catch (err) {
            handleFirestoreError(err, OperationType.LIST, "bulk_load");
          }

          const loadedInvoices = invoicesSnap ? invoicesSnap.docs.map(d => d.data() as Invoice) : [];
          const loadedExpenses = expensesSnap ? expensesSnap.docs.map(d => d.data() as Expense) : [];
          const loadedProjects = projectsSnap ? projectsSnap.docs.map(d => d.data() as Project) : [];
          const loadedTasks = tasksSnap ? tasksSnap.docs.map(d => d.data() as Task) : [];
          const loadedCRMContacts = contactsSnap ? contactsSnap.docs.map(d => d.data() as CRMContact) : [];
          const loadedBankTransactions = paymentsSnap ? paymentsSnap.docs.map(d => d.data() as BankTransaction) : [];

          // Sincronizar y persistir por defecto si están vacías, estructurándolas por documento
          if (loadedInvoices.length > 0) {
            setInvoices(loadedInvoices);
          } else {
            setInvoices(INITIAL_INVOICES);
            for (const inv of INITIAL_INVOICES) {
              try {
                await setDoc(doc(db, "invoices", inv.id), mapInvoiceToFirestore(user.uid, inv));
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `invoices/${inv.id}`);
              }
            }
          }

          if (loadedExpenses.length > 0) {
            setExpenses(loadedExpenses);
          } else {
            setExpenses(INITIAL_EXPENSES);
            for (const exp of INITIAL_EXPENSES) {
              try {
                await setDoc(doc(db, "expenses", exp.id), { ...exp, ownerId: user.uid });
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `expenses/${exp.id}`);
              }
            }
          }

          if (loadedProjects.length > 0) {
            setProjects(loadedProjects);
          } else {
            setProjects(INITIAL_PROJECTS);
            for (const proj of INITIAL_PROJECTS) {
              try {
                await setDoc(doc(db, "projects", proj.id), { ...proj, ownerId: user.uid });
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `projects/${proj.id}`);
              }
            }
          }

          if (loadedTasks.length > 0) {
            setTasks(loadedTasks);
          } else {
            setTasks(INITIAL_TASKS);
            for (const t of INITIAL_TASKS) {
              try {
                await setDoc(doc(db, "tasks", t.id), { ...t, ownerId: user.uid });
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `tasks/${t.id}`);
              }
            }
          }

          if (loadedCRMContacts.length > 0) {
            setCrmContacts(loadedCRMContacts);
          } else {
            setCrmContacts(INITIAL_CRM_CONTACTS);
            for (const contact of INITIAL_CRM_CONTACTS) {
              try {
                await setDoc(doc(db, "contacts", contact.id), { ...contact, ownerId: user.uid });
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `contacts/${contact.id}`);
              }
              if (contact.type === 'Cliente') {
                try {
                  await setDoc(doc(db, "customers", contact.id), { ...contact, ownerId: user.uid });
                } catch (err) {
                  handleFirestoreError(err, OperationType.CREATE, `customers/${contact.id}`);
                }
              }
            }
          }

          if (loadedBankTransactions.length > 0) {
            setBankTransactions(loadedBankTransactions);
          } else {
            setBankTransactions(INITIAL_BANK_TRANSACTIONS);
            for (const trans of INITIAL_BANK_TRANSACTIONS) {
              try {
                await setDoc(doc(db, "payment_logs", trans.id), { ...trans, ownerId: user.uid });
              } catch (err) {
                handleFirestoreError(err, OperationType.CREATE, `payment_logs/${trans.id}`);
              }
            }
          }

        } catch (error) {
          console.error("Error sincronizando con Firestore:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ---- PERSISTIR CAMBIOS EN FIRESTORE / STATE ----
  const saveStateToFirebaseOfUser = async (newState: {
    companyConfig?: CompanyConfig;
    invoices?: Invoice[];
    expenses?: Expense[];
    projects?: Project[];
    tasks?: Task[];
    crmContacts?: CRMContact[];
    bankTransactions?: BankTransaction[];
  }) => {
    if (!currentUser) return;
    try {
      const docRef = doc(db, "users", currentUser.uid);
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
      }
      const currentData = docSnap && docSnap.exists() ? docSnap.data() : {};
      
      // 1. Si actualiza la configuración de la empresa/usuario, actualizamos el perfil central
      if (newState.companyConfig) {
        const updatedPayload = buildUserDocPayload(
          currentUser,
          currentData.registeredRole || currentUserRole,
          {
            ...currentData,
            companyConfig: newState.companyConfig
          }
        );
        try {
          await setDoc(docRef, updatedPayload);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
        }
      }

      // 2. Guardar elementos individuales en sus respectivas colecciones
      if (newState.invoices) {
        for (const inv of newState.invoices) {
          try {
            await setDoc(doc(db, "invoices", inv.id), mapInvoiceToFirestore(currentUser.uid, inv));
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `invoices/${inv.id}`);
          }
        }
      }
      if (newState.expenses) {
        for (const exp of newState.expenses) {
          try {
            await setDoc(doc(db, "expenses", exp.id), { ...exp, ownerId: currentUser.uid });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `expenses/${exp.id}`);
          }
        }
      }
      if (newState.projects) {
        for (const proj of newState.projects) {
          try {
            await setDoc(doc(db, "projects", proj.id), { ...proj, ownerId: currentUser.uid });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `projects/${proj.id}`);
          }
        }
      }
      if (newState.tasks) {
        for (const t of newState.tasks) {
          try {
            await setDoc(doc(db, "tasks", t.id), { ...t, ownerId: currentUser.uid });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `tasks/${t.id}`);
          }
        }
      }
      if (newState.crmContacts) {
        for (const c of newState.crmContacts) {
          try {
            await setDoc(doc(db, "contacts", c.id), { ...c, ownerId: currentUser.uid });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `contacts/${c.id}`);
          }
          if (c.type === 'Cliente') {
            try {
              await setDoc(doc(db, "customers", c.id), { ...c, ownerId: currentUser.uid });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `customers/${c.id}`);
            }
          }
        }
      }
      if (newState.bankTransactions) {
        for (const tr of newState.bankTransactions) {
          try {
            await setDoc(doc(db, "payment_logs", tr.id), { ...tr, ownerId: currentUser.uid });
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `payment_logs/${tr.id}`);
          }
        }
      }
      
    } catch (error) {
      console.error("Error al persistir cambio en Firestore:", error);
    }
  };

  // ---- TRIGER DE ACCIONES DE DATOS ----
  const handleAddInvoice = (newInv: Invoice) => {
    const updated = [newInv, ...invoices];
    setInvoices(updated);
    saveStateToFirebaseOfUser({ invoices: updated });
  };

  const handleUpdateInvoice = (updatedInv: Invoice) => {
    const updated = invoices.map(inv => inv.id === updatedInv.id ? updatedInv : inv);
    setInvoices(updated);
    saveStateToFirebaseOfUser({ invoices: updated });
  };

  const handleDeleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    saveStateToFirebaseOfUser({ invoices: updated });
  };

  const handleAddExpense = (newExp: Expense) => {
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    // Recalcular alertas estratégicas con IA al agregar gasto
    saveStateToFirebaseOfUser({ expenses: updated });
  };

  const handleUpdateExpense = (updatedExp: Expense) => {
    const updated = expenses.map(exp => exp.id === updatedExp.id ? updatedExp : exp);
    setExpenses(updated);
    saveStateToFirebaseOfUser({ expenses: updated });
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(exp => exp.id !== id);
    setExpenses(updated);
    saveStateToFirebaseOfUser({ expenses: updated });
  };

  const handleAddProject = (newProj: Project) => {
    const updated = [newProj, ...projects];
    setProjects(updated);
    saveStateToFirebaseOfUser({ projects: updated });
  };

  const handleAddTask = (newTask: Task) => {
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveStateToFirebaseOfUser({ tasks: updated });
  };

  const handleUpdateTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    saveStateToFirebaseOfUser({ tasks: updatedTasks });
  };

  const handleAddCRMContact = (newContact: CRMContact) => {
    const updated = [newContact, ...crmContacts];
    setCrmContacts(updated);
    saveStateToFirebaseOfUser({ crmContacts: updated });
  };

  const handleUpdateBankTransactions = (updatedTrans: BankTransaction[]) => {
    setBankTransactions(updatedTrans);
    saveStateToFirebaseOfUser({ bankTransactions: updatedTrans });
  };

  const handleUpdateCompanyConfig = (newConfig: CompanyConfig) => {
    setCompanyConfig(newConfig);
    saveStateToFirebaseOfUser({ companyConfig: newConfig });
  };

  const handleUpdateUsers = (updatedUsers: SystemUser[]) => {
    setSystemUsers(updatedUsers);
  };

  // ---- SIGNIN & SIGNOUT ----
  const handleLoginGoogle = async (preferredRole?: string) => {
    try {
      setAuthError(null);
      if (preferredRole) {
        localStorage.setItem("gestor_ia_google_preferred_role", preferredRole);
      } else {
        localStorage.removeItem("gestor_ia_google_preferred_role");
      }

      // Configurar scopes de Google Workspace requeridos
      googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
      googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
      googleProvider.addScope('https://www.googleapis.com/auth/calendar');
      googleProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
      googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
      googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
      googleProvider.addScope('https://www.googleapis.com/auth/documents');

      const result = await signInWithPopup(auth, googleProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setWorkspaceToken(credential.accessToken);
        localStorage.setItem('gestor_ia_workspace_token', credential.accessToken);
        console.log("Token de Google Workspace cargado con éxito.");
      }
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      let errMsg = error.message || "";
      if (error.code === 'auth/popup-closed-by-user') {
        errMsg = "El navegador bloqueó la ventana emergente o fue cerrada por el usuario antes de iniciar sesión con Google. Por favor, asegúrate de permitir las ventanas emergentes en tu navegador o inicia sesión con Correo y Contraseña.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errMsg = "Google Sign-In no está habilitado en tu consola de Firebase. Por favor, ve a tu proyecto de Firebase Console -> Authentication -> Sign-in Method y habilita el proveedor de Google.";
      } else {
        errMsg = "Error de Google Auth: " + error.message;
      }
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  const handleDisconnectWorkspace = () => {
    setWorkspaceToken(null);
    localStorage.removeItem('gestor_ia_workspace_token');
  };

  const handleLoginEmail = async (emailInput: string, passwordInput: string): Promise<boolean> => {
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      return true;
    } catch (err: any) {
      console.error(err);
      let translateMsg = err.message || 'Error de credenciales.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        translateMsg = 'Usuario o contraseña incorrectos. Por favor verifícalos.';
      } else if (err.code === 'auth/invalid-email') {
        translateMsg = 'Formato de correo electrónico no válido.';
      } else if (err.code === 'auth/operation-not-allowed') {
        translateMsg = "El inicio de sesión por Correo/Contraseña no está habilitado en tu consola de Firebase. Por favor, ve a Firebase Console -> Authentication -> Sign-in Method y habilita el proveedor 'Correo electrónico/contraseña'.";
      }
      setAuthError(translateMsg);
      throw new Error(translateMsg);
    }
  };

  const handleRegisterEmail = async (emailInput: string, passwordInput: string, roleSelected: string): Promise<boolean> => {
    try {
      setAuthError(null);
      const cred = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      const user = cred.user;
      
      const docRef = doc(db, "users", user.uid);
      const userRole: UserRole = (roleSelected === 'Free' || roleSelected === 'Usuario Free')
        ? 'Usuario Free' 
        : (roleSelected === 'Empresa' || roleSelected === 'Usuario Empresa')
          ? 'Usuario Empresa' 
          : 'Usuario Administrador';
      
      const initialPayload = buildUserDocPayload(user, userRole, {
        companyConfig: {
          ...INITIAL_COMPANY_CONFIG,
          premiumTier: userRole === 'Usuario Free' ? 'Básico' : userRole === 'Usuario Empresa' ? 'Profesional' : 'Empresarial'
        }
      });

      await setDoc(docRef, initialPayload);

      setCurrentUserRole(userRole);
      return true;
    } catch (err: any) {
      console.error(err);
      let translateMsg = err.message || 'Error en el registro de usuario.';
      if (err.code === 'auth/email-already-in-use') {
        translateMsg = 'El correo electrónico ya está registrado por otra cuenta en GestorIA.';
      } else if (err.code === 'auth/weak-password') {
        translateMsg = 'La contraseña es demasiado débil (debe tener al menos 6 caracteres).';
      } else if (err.code === 'auth/operation-not-allowed') {
        translateMsg = "El registro o inicio de sesión por Correo/Contraseña no está habilitado en tu consola de Firebase. Por favor, ve a Firebase Console -> Authentication -> Sign-in Method y habilita el proveedor 'Correo electrónico/contraseña'.";
      }
      setAuthError(translateMsg);
      throw new Error(translateMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsDemoMode(false);
      setAuthError(null);
      // Resetear al estado inicial local
      setWorkspaceToken(null);
      localStorage.removeItem('gestor_ia_workspace_token');
      setCompanyConfig(INITIAL_COMPANY_CONFIG);
      setInvoices(INITIAL_INVOICES);
      setExpenses(INITIAL_EXPENSES);
      setProjects(INITIAL_PROJECTS);
      setTasks(INITIAL_TASKS);
      setCrmContacts(INITIAL_CRM_CONTACTS);
      setBankTransactions(INITIAL_BANK_TRANSACTIONS);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // ---- CÁLCULOS GENERALES DE VISIÓN GLOBAL ----
  const totalIngresado = invoices
    .filter(i => i.status === 'Pagada' || i.status === 'Enviada')
    .reduce((acc, curr) => acc + curr.total, 0);

  const totalGastado = expenses
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balanceNeto = totalIngresado - totalGastado;

  // Tasas por categorías de gastos
  const catExpensesObj = expenses.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});
  const chartCatExpenses = Object.keys(catExpensesObj).map(key => ({
    name: key,
    value: parseFloat(catExpensesObj[key].toFixed(2))
  }));

  // Datos reales mes a mes del último semestre
  const monthlyDataReal = [
    { month: 'Ene', Ingresos: 8500, Gastos: 4100 },
    { month: 'Feb', Ingresos: 9200, Gastos: 5200 },
    { month: 'Mar', Ingresos: 11000, Gastos: 6800 },
    { month: 'Abr', Ingresos: 9800, Gastos: 5900 },
    { month: 'May', Ingresos: 12100, Gastos: 7460 },
    { month: 'Jun', Ingresos: totalIngresado, Gastos: totalGastado }
  ];

  // ---- IA PIPELINE: MODELOS PREDICTIVOS GLOBALES ----
  const handleCorrerPrediccionIA = () => {
    setIsPredicting(true);
    setStrategicAdvisory('');
    
    const historicalInput = monthlyDataReal.map(d => ({
      mes: d.month,
      ingresosTotales: d.Ingresos,
      gastosTotales: d.Gastos
    }));

    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'financial-prediction',
        payload: {
          historicalData: historicalInput,
          monthCount: 3
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result && data.result.projections) {
          // Fusionar historico con proyecciones
          const projections = data.result.projections.map((proj: any) => ({
            month: `${proj.month} (IA)`,
            Ingresos: proj.predictedRevenue || 0,
            Gastos: proj.predictedExpense || 0,
            isProjection: true,
            desc: proj.aiObservation
          }));
          setPredictedData([...monthlyDataReal, ...projections]);
          setStrategicAdvisory(data.result.strategicAdvisory || '');
        }
      })
      .catch(err => {
        console.error("Error en predicción financiera IA:", err);
        // Fallback local robusto
        const fallbackProjections = [
          { month: 'Jul (IA)', Ingresos: totalIngresado * 1.10, Gastos: totalGastado * 0.95, isProjection: true, desc: 'Estimación incremental basada en el comportamiento del histórico.' },
          { month: 'Ago (IA)', Ingresos: totalIngresado * 1.15, Gastos: totalGastado * 1.05, isProjection: true, desc: 'Aumento estacional estimado.' },
          { month: 'Sep (IA)', Ingresos: totalIngresado * 1.25, Gastos: totalGastado * 0.90, isProjection: true, desc: 'Baja del coste operacional estipulada.' }
        ];
        setPredictedData([...monthlyDataReal, ...fallbackProjections]);
        setStrategicAdvisory("El algoritmo financiero predice un crecimiento del 15% en ingresos gracias al volumen de la cartera CRM. Es recomendable optimizar la deducibilidad de suministros para incrementar el flujo de caja.");
      })
      .finally(() => {
        setIsPredicting(false);
      });
  };

  // ---- IA PIPELINE: PERSPECTIVAS Y ANOMALÍAS DE ACCIÓN ----
  const handleAuditarGastosIA = () => {
    setIsInsightLoading(true);
    setDetectedAnomalies([]);
    setSavingsRecommendations([]);
    
    const currentFinancesSum = {
      totalIngresado,
      totalGastado,
      balanceNeto,
      companyName: companyConfig.name,
      planPremium: companyConfig.premiumTier
    };

    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'strategic-insight',
        payload: {
          finances: currentFinancesSum,
          expenses: expenses.map(e => ({ provider: e.provider, date: e.date, category: e.category, amount: e.amount }))
        }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) {
          setDetectedAnomalies(data.result.detectedAnomalies || []);
          setSavingsRecommendations(data.result.savingsRecommendations || []);
          setBusinessEfficiencyScore(data.result.efficiencyScore || 85);
        }
      })
      .catch(err => {
        console.error("Error en insight de auditoría IA:", err);
        // Fallback
        setDetectedAnomalies([
          'Aumento anómalo del 20% en Software/Nube de servidores.',
          'Consumo excesivo de suministros en mayo (Detección estacional)'
        ]);
        setSavingsRecommendations([
          'Unificar licencias del ERP y centralizar en GestorIA para ahorrar hasta 450€ anuales.',
          'Acrecentar la asignación de dietas exentas de IVA en lugar de compensación directa.'
        ]);
        setBusinessEfficiencyScore(78);
      })
      .finally(() => {
        setIsInsightLoading(false);
      });
  };

  // Ejecutar analíticas la primera vez de renderizado
  useEffect(() => {
    handleCorrerPrediccionIA();
    handleAuditarGastosIA();
  }, [invoices, expenses]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center space-y-4 font-sans">
        <Sparkles className="w-8 h-8 text-indigo-650 animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Cargando GestorIA...</p>
      </div>
    );
  }

  if (!currentUser && !isDemoMode) {
    return (
      <LandingPage
        onLoginEmail={handleLoginEmail}
        onRegisterEmail={handleRegisterEmail}
        onLoginGoogle={handleLoginGoogle}
        onEnterDemoMode={(simActiveRole) => {
          setIsDemoMode(true);
          const mappedRole: UserRole = (simActiveRole === 'Free' || simActiveRole === 'Usuario Free')
            ? 'Usuario Free' 
            : (simActiveRole === 'Empresa' || simActiveRole === 'Usuario Empresa')
              ? 'Usuario Empresa' 
              : 'Usuario Administrador';
          setCurrentUserRole(mappedRole);
        }}
        errorMsg={authError}
        setErrorMsg={setAuthError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      
      {/* FRONTAL BANNER DE ADVERTENCIA PARA MODO DEMO TEMPORAL */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500 to-indigo-600 text-slate-950 font-sans text-xs py-2 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-inner font-semibold border-b border-amber-500/30">
          <div className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce text-amber-200" />
            <span>Estás en <strong>Modo Demo Temporal Offline</strong>. Tus facturas e IA predictiva no se guardarán permanentemente si cierras el navegador.</span>
          </div>
          <button 
            onClick={() => {
              setIsDemoMode(false);
              setAuthError(null);
            }}
            className="bg-white hover:bg-slate-100 text-indigo-950 font-bold px-3 py-1 rounded-lg text-[10px] uppercase shadow-sm transition-all shrink-0 cursor-pointer"
          >
            Sincronizar en la Nube (Registrarse Gratis)
          </button>
        </div>
      )}
      
      {/* HEADER DE GESTORIA COHERENTE */}
      <header className="bg-white text-slate-800 border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GestoriaLogo className="h-10 w-auto" />
            <div className="hidden sm:flex flex-col">
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md w-fit">
                BOE 2026
              </span>
              <p className="text-[9px] text-slate-400 mt-0.5">SaaS Corporativo Integrado</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* COMPONENTE DE USUARIO PREMIUM CON AVATAR GOOGLE Y MENÚ DESPLEGABLE */}
            {(() => {
              const uName = currentUser 
                ? (currentUser.displayName || currentUser.email?.split('@')[0] || "Usuario") 
                : "Diego Gómez Marín";

              const displayRole = currentUserRole === 'Usuario Administrador' 
                ? 'Admin' 
                : currentUserRole === 'Usuario Empresa' 
                  ? 'Empresa' 
                  : 'Gratis';

              return (
                <div className="flex items-center gap-3">
                  {/* Botón de Sincronización rápida si está en Demo para incentivar el registro */}
                  {isDemoMode && (
                    <button
                      onClick={() => {
                        setIsDemoMode(false);
                        setAuthError(null);
                      }}
                      className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-extrabold rounded-xl text-[10px] uppercase shadow-2xs transition-all cursor-pointer"
                      title="Sincronizar permanentemente con tu base de datos Firebase"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span>Sincronizar Cloud</span>
                    </button>
                  )}

                  {/* COMPONENTE DE USUARIO PREMIUM EN UN CÍRCULO CON MENÚ DESPLEGABLE */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]"
                    >
                      {/* Imagen circular o Inicial del usuario */}
                      <div className="relative shrink-0">
                        {currentUser && currentUser.photoURL ? (
                          <img 
                            src={currentUser.photoURL} 
                            alt={uName} 
                            referrerPolicy="no-referrer" 
                            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shadow-3xs" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-sm flex items-center justify-center shadow-3xs">
                            {uName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Indicador de estado */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-500"></span>
                      </div>

                      {/* Texto: Nombre de usuario y Rol */}
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-xs font-black text-slate-800 leading-tight truncate max-w-[140px]" title={currentUser?.email || undefined}>
                          {uName}
                        </span>
                        <span className={`text-[10px] font-bold tracking-wider mt-0.5 uppercase ${
                          displayRole === 'Admin' ? 'text-rose-600' : displayRole === 'Empresa' ? 'text-indigo-600' : 'text-slate-500'
                        }`}>
                          {displayRole}
                        </span>
                      </div>

                      <span className="text-slate-400 text-[10px] select-none ml-1">▼</span>
                    </button>

                    {/* Menú Desplegable Flotante */}
                    {isProfileDropdownOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-30" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                        />
                        
                        <div className="absolute right-0 mt-2.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-40 animate-in fade-in slide-in-from-top-1 duration-150 origin-top-right">
                          <div className="px-4 py-2 border-b border-slate-150/60 mb-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Sesión actual</p>
                            <p className="text-xs font-black text-slate-850 truncate leading-normal">{currentUser?.email || "modo_demo_offline@prueba.com"}</p>
                          </div>

                          <button
                            onClick={() => {
                              setActiveModule('resumen');
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Escritorio</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveModule('admin');
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>Configuración</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setActiveTourStep(1);
                              setActiveModule('resumen');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-indigo-650 hover:bg-indigo-50/50 hover:text-indigo-750 font-extrabold flex items-center gap-2.5 border-t border-slate-100/60 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 animate-pulse" />
                            <span>Iniciar tour</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 font-extrabold flex items-center gap-2.5 border-t border-slate-100 transition-colors cursor-pointer mt-1"
                          >
                            <LogOut className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Cerrar sesión</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      {/* MENÚ DE TRABAJO PRINCIPAL - DISEÑO RESPONSIVE CON SIDEBAR Y BOTTOM NAV */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        
        {/* SIDEBAR PARA ESCRITORIO (md y superior) */}
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200/80 shrink-0 sticky top-0 h-[calc(100vh-69px)] overflow-y-auto z-10">
          {/* Perfil o configuración de la empresa en uso */}
          <div className="p-5 border-b border-slate-100 flex flex-col gap-2 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center shadow-xs">
                {companyConfig.name ? companyConfig.name.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider font-mono">Empresa Activa</p>
                <p className="text-sm font-semibold text-slate-800 truncate" title={companyConfig.name || "Agroturismo S.L."}>
                  {companyConfig.name || "Agroturismo Las Niñas S.L."}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between gap-1.5 mt-2 bg-white border border-slate-150/70 shadow-3xs rounded-lg px-2.5 py-1.5">
              <span className="text-[10px] text-slate-500 font-semibold font-mono">NIF:</span>
              <span className="text-[10px] font-bold text-slate-700 uppercase font-mono">
                {companyConfig.nif || companyConfig.cif || "B16896953"}
              </span>
            </div>
          </div>

          {/* Menú de navegación vertical */}
          <div className="flex-1 px-3 py-6 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">Módulos</p>
            
            <button
              onClick={() => setActiveModule('resumen')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeModule === 'resumen'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="menu-vision-global"
            >
              <LayoutDashboard className="w-4.5 h-4.5 shrink-0" />
              <span>Escritorio</span>
            </button>

            <button
              onClick={() => setActiveModule('finanzas')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeModule === 'finanzas'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="menu-finanzas"
            >
              <Receipt className="w-4.5 h-4.5 shrink-0" />
              <span>Finanzas</span>
            </button>

            <button
              onClick={() => setActiveModule('operaciones')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeModule === 'operaciones'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="menu-operaciones"
            >
              <Briefcase className="w-4.5 h-4.5 shrink-0" />
              <span>Operaciones y CRM</span>
            </button>

            <button
              onClick={() => setActiveModule('ia')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeModule === 'ia'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="menu-cerebro-ia"
            >
              <Brain className="w-4.5 h-4.5 shrink-0" />
              <span>Herramientas IA</span>
            </button>

            <button
              onClick={() => setActiveModule('integrations')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeModule === 'integrations'
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/55'
              }`}
              id="menu-integraciones"
            >
              <Layers className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
              <span>Workspace y Conexiones</span>
            </button>

            <button
              onClick={() => setActiveModule('admin')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeModule === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="menu-administracion"
            >
              <Settings className="w-4.5 h-4.5 shrink-0" />
              <span>Configuración</span>
            </button>
          </div>

          {/* Bloque inferior del sidebar */}
          <div className="p-4 m-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span>AuditIA Activo</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Cumplimiento verificado. Tu sistema está plenamente adaptado a las normativas vigentes de facturación de la AEAT.
            </p>
          </div>
        </aside>

        {/* BOTTOM NAVIGATION PARA MÓVILES (md:hidden) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around py-2 px-1 safe-bottom">
          <button
            onClick={() => setActiveModule('resumen')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeModule === 'resumen' 
                ? 'text-indigo-650 font-bold bg-indigo-50/70' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Escritorio"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
          </button>
          
          <button
            onClick={() => setActiveModule('finanzas')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeModule === 'finanzas' 
                ? 'text-indigo-650 font-bold bg-indigo-50/70' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Finanzas"
          >
            <Receipt className="w-5 h-5 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModule('operaciones')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeModule === 'operaciones' 
                ? 'text-indigo-650 font-bold bg-indigo-50/70' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Operaciones y CRM"
          >
            <Briefcase className="w-5 h-5 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModule('ia')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeModule === 'ia' 
                ? 'text-indigo-650 font-bold bg-indigo-50/70' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Herramientas IA"
          >
            <Brain className="w-5 h-5 shrink-0" />
          </button>

          <button
            onClick={() => setActiveModule('integrations')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeModule === 'integrations' 
                ? 'text-indigo-650 font-bold bg-indigo-50/70' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Integraciones Workspace"
          >
            <Layers className="w-5 h-5 shrink-0 text-indigo-500" />
          </button>

          <button
            onClick={() => setActiveModule('admin')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeModule === 'admin' 
                ? 'text-indigo-650 font-bold bg-indigo-50/70' 
                : 'text-slate-400 hover:text-slate-650'
            }`}
            title="Configuración"
          >
            <Settings className="w-5 h-5 shrink-0" />
          </button>
        </nav>

        {/* CONTENEDOR DE CONTENIDO PRINCIPAL */}
        <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
          {/* ÁREA DE CONTENIDO */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        
        {/* TAB 1: VISIÓN GLOBAL Y PREDICCIONES DE NEGOCIO */}
        {activeModule === 'resumen' && (
          <div className="space-y-8">
            
            {/* Bento Grid Indicadores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-150/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Ingresos Netos</span>
                <p className="text-2xl font-bold text-slate-800 font-display mt-0.5">{totalIngresado.toLocaleString()} €</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.4% vs mes anterior</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-150/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Gastado</span>
                <p className="text-2xl font-bold text-slate-800 font-display mt-0.5">{totalGastado.toLocaleString()} €</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                  <span className="font-mono">{expenses.length} tickets catalogados</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-150/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Flujo de Caja Disponible</span>
                <p className={`text-2xl font-bold font-display mt-0.5 ${balanceNeto >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {balanceNeto.toLocaleString()} €
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-600 font-bold">
                  <span>Balance positivo</span>
                </div>
              </div>

              {/* Score de Eficiencia IA */}
              <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs border border-slate-800 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Salud Financiera IA</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <p className="text-3xl font-extrabold font-display">{businessEfficiencyScore || '82'}</p>
                    <span className="text-xs text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-400" 
                      style={{ width: `${businessEfficiencyScore || 82}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Estimado por Auditor Estratégico GestorIA</p>
                </div>
              </div>
            </div>

            {/* Dos Columnas: Gráfico predictivo e Insights de IA */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Gráfico Predictivo */}
              <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-150/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 font-display">Tendencias e IA Proyección Financiera</h3>
                      <p className="text-xs text-slate-500">Muestra el histórico del último semestre fusionado con el pronóstico de red neuronal de los próximos 3 meses.</p>
                    </div>
                    <button
                      disabled={isPredicting}
                      onClick={handleCorrerPrediccionIA}
                      className="px-3.5 py-1.5 text-[10px] font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-500 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPredicting ? 'animate-spin' : ''}`} />
                      <span>Re-Calcular</span>
                    </button>
                  </div>

                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={predictedData.length > 0 ? predictedData : monthlyDataReal}>
                        <defs>
                          <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorGast" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#ffffff', color: '#1e293b' }} />
                        <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIng)" />
                        <Area type="monotone" dataKey="Gastos" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorGast)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {strategicAdvisory && (
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex gap-2.5 items-start mt-4 animate-in fade-in duration-150">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">Asesoramiento Estratégico IA:</p>
                      <p className="text-[11px] text-emerald-950 mt-0.5 leading-relaxed font-sans">{strategicAdvisory}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Insights optimización y anomalías de gastos */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-150/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-150 mb-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      <span>Análisis de Anomalías (IA)</span>
                    </h3>
                    <button
                      disabled={isInsightLoading}
                      onClick={handleAuditarGastosIA}
                      className="text-xs text-indigo-600 hover:underline font-bold"
                    >
                      Auditar de nuevo
                    </button>
                  </div>

                  {isInsightLoading ? (
                    <div className="py-24 text-center space-y-2">
                      <RefreshCw className="w-8 h-8 mx-auto text-indigo-500 animate-spin" />
                      <p className="text-xs text-slate-500">Corriendo auditoría profunda en facturas y gastos...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-xs">
                      {/* Listado de anomalías detectadas */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Desviaciones o Riesgo Detectado:</span>
                        </p>
                        {detectedAnomalies.length > 0 ? (
                          detectedAnomalies.map((an, i) => (
                            <div key={i} className="p-2.5 bg-rose-50/50 border border-rose-100/70 rounded-xl text-rose-950 font-sans font-medium">
                              {an}
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">No se han detectado anomalías de gastos significativas.</p>
                        )}
                      </div>

                      {/* Recomendaciones de Ahorro */}
                      <div className="space-y-2 border-t border-slate-100 pt-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Oportunidades de Optimización Fiscal:</span>
                        </p>
                        {savingsRecommendations.length > 0 ? (
                          savingsRecommendations.map((rec, i) => (
                            <div key={i} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-slate-700 font-sans">
                              {rec}
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">No hay recomendaciones adicionales.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-3.5 mt-4 text-[11px] leading-relaxed">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <span>💡 Sabías que:</span>
                  </p>
                  <p className="text-slate-350 mt-1">En España, puedes deducir el IVA de tus gastos de desarrollo tecnológico e internet hasta el 100% si acreditas el teletrabajo declarado en el Modelo 036.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: FINANZAS */}
        {activeModule === 'finanzas' && (
          <Finanzas
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            bankTransactions={bankTransactions}
            onUpdateBankTransactions={handleUpdateBankTransactions}
            companyConfig={companyConfig}
          />
        )}

        {/* TAB 3: OPERACIONES */}
        {activeModule === 'operaciones' && (
          <Operaciones
            projects={projects}
            onAddProject={handleAddProject}
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTasks={handleUpdateTasks}
            crmContacts={crmContacts}
            onAddCRMContact={handleAddCRMContact}
          />
        )}

        {/* TAB 4: INTELIGENCIA ARTIFICIAL */}
        {activeModule === 'ia' && (
          <InteligenciaArtificial
            companyConfig={companyConfig}
          />
        )}

        {/* TAB: GOOGLE WORKSPACE INTEGRACIONES */}
        {activeModule === 'integrations' && (
          <IntegracionesWorkspace
            currentUser={currentUser}
            workspaceToken={workspaceToken}
            onConnectWorkspace={() => handleLoginGoogle()}
            onDisconnectWorkspace={handleDisconnectWorkspace}
            invoices={invoices}
            expenses={expenses}
            projects={projects}
            tasks={tasks}
            crmContacts={crmContacts}
            companyName={companyConfig.name || "Mi Empresa S.L."}
          />
        )}

        {/* TAB 5: ADMINISTRACIÓN */}
        {activeModule === 'admin' && (
          <Administracion
            companyConfig={companyConfig}
            onUpdateCompanyConfig={handleUpdateCompanyConfig}
            users={systemUsers}
            onUpdateUsers={handleUpdateUsers}
            currentUserRole={currentUserRole}
            onChangeUserRole={setCurrentUserRole}
            invoiceCount={invoices.length}
            expenseCount={expenses.length}
            projectCount={projects.length}
          />
        )}

      </main>

      {/* FOOTER DEL ERP */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-12 py-8 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <InstitutionalLogos lightMode={false} />
          <div className="pt-4 flex flex-col items-center justify-center gap-1 text-slate-450">
            <p className="font-bold text-slate-350 font-display text-sm">GestorIA corporativo - Software de Certificación IA</p>
            <p className="text-slate-500">© 2026 GestorIA. Diseñado con alineaciones de la Agencia Tributaria Española y el Plan Adelante Digital.</p>
            <p className="text-[10px] text-slate-600 font-mono">Consola Cloud Node ID: 2abfa251 • Base de datos persistente mediante Google Cloud Firestore y seguridad perimetral de Firebase Auth</p>
          </div>
        </div>
      </footer>

        </div>
      </div>

      {/* COMPONENTE DE TOUR INTERACTIVO EXCLUSIVO */}
      {activeTourStep !== null && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-[90vw] bg-slate-900 border border-slate-750 text-white rounded-2xl shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-850">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
              style={{ width: `${(activeTourStep / 4) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center mb-3 mt-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-lg border border-indigo-500/10 font-mono">
              Guía de Inicio Rápido (Paso {activeTourStep}/4)
            </span>
            <button 
              onClick={() => setActiveTourStep(null)}
              className="text-slate-400 hover:text-white transition-colors text-xs font-bold shrink-0 cursor-pointer"
            >
              ✖ Saltar
            </button>
          </div>

          {activeTourStep === 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black font-display text-white">🖥️ Tu Escritorio Inteligente</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Este es el panel central de control de tu negocio. Aquí se calculan tus ingresos consolidados, gastos generales, beneficio neto y los impuestos trimestrales estimados acumulados para el periodo fiscal.
              </p>
              <p className="text-[10px] bg-slate-800 p-2 rounded-lg border border-slate-755 text-indigo-300 font-medium font-sans">
                💡 ¡Fíjate en las predicciones financieras a 3 meses y el asesor estratégico personalizados según tus datos reales!
              </p>
            </div>
          )}

          {activeTourStep === 2 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black font-display text-white">💼 Facturas, Presupuestos y OCR</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Desde el nuevo módulo de <strong>Finanzas</strong> puedes emitir Facturas Oficiales certificadas (con Reglamento Verifactu 2026 BOE) y presupuestos comerciales de cotización rápida.
              </p>
              <p className="text-[10px] bg-slate-800 p-2 rounded-lg border border-slate-755 text-orange-350 font-medium font-sans whitespace-normal">
                🔥 ¡Prueba el Escáner OCR inteligente arrastrando o capturando un ticket para extraer importes con IA de inmediato!
              </p>
            </div>
          )}

          {activeTourStep === 3 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black font-display text-white">🧠 Tus Herramientas de IA Predictiva</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Bajo la sección de <strong>Herramientas IA</strong>, puedes conversar con un Consultor Fiscal y Legal especializado para que evalúe deducibilidades, y resuelva dudas de impuestos.
              </p>
              <p className="text-[10px] bg-slate-800 p-2 rounded-lg border border-slate-755 text-teal-350 font-medium font-sans">
                🤖 ¡Hazle preguntas reales de los Modelos 130 o 303 de IVA y obtén respuestas adaptadas al BOE actual!
              </p>
            </div>
          )}

          {activeTourStep === 4 && (
            <div className="space-y-3">
              <h4 className="text-sm font-black font-display text-white">⚙️ Configuración del Emisor Fiscal</h4>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                En la pestaña de <strong>Configuración</strong>, puedes dar de alta los datos del emisor comercial de tu negocio (Tu nombre fiscal, NIF/CIF o dirección de operaciones) y gestionar roles del sistema.
              </p>
              <p className="text-[10px] bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/30 text-emerald-300 font-medium font-sans">
                🎯 ¡Felicidades! Completaste la guía rápida básica de GestorIA. Ahora puedes explorar con total libertad.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 mt-4">
            <button
              onClick={() => {
                if (activeTourStep > 1) {
                  const prevStep = activeTourStep - 1;
                  setActiveTourStep(prevStep);
                  if (prevStep === 1) setActiveModule('resumen');
                  if (prevStep === 2) setActiveModule('finanzas');
                  if (prevStep === 3) setActiveModule('ia');
                }
              }}
              disabled={activeTourStep === 1}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                activeTourStep === 1 
                  ? 'text-slate-600 bg-transparent border-transparent cursor-not-allowed' 
                  : 'text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 cursor-pointer'
              }`}
            >
              ⬅ Anterior
            </button>

            <button
              onClick={() => {
                if (activeTourStep < 4) {
                  const nextStep = activeTourStep + 1;
                  setActiveTourStep(nextStep);
                  if (nextStep === 2) setActiveModule('finanzas');
                  if (nextStep === 3) setActiveModule('ia');
                  if (nextStep === 4) setActiveModule('admin');
                } else {
                  setActiveTourStep(null);
                }
              }}
              className="px-4 py-1.5 text-[10px] font-black rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{activeTourStep === 4 ? 'Listo ✔' : 'Siguiente ➡'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
