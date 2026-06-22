import {
  CompanyConfig,
  SystemUser,
  BankTransaction,
  Invoice,
  Expense,
  Project,
  Task,
  CRMContact,
  SubvencionHelp
} from './types';

export const INITIAL_COMPANY_CONFIG: CompanyConfig = {
  name: "Construcciones Innovadoras S.L.",
  nif: "B87654321",
  address: "Calle de la Gran Vía 45, 4ºB, 28013 Madrid",
  email: "contacto@construccionesinnovadoras.es",
  phone: "+34 912 345 678",
  premiumTier: 'Profesional',
  defaultIva: 21,
  defaultIrpf: 15
};

export const INITIAL_SYSTEM_USERS: SystemUser[] = [
  {
    id: "user-1",
    name: "Draiton Innova",
    email: "draiton@ec-innova.es",
    role: "Administrador",
    active: true,
    joinedAt: "2025-01-10"
  },
  {
    id: "user-2",
    name: "María Gómez",
    email: "m.gomez@construccionesinnovadoras.es",
    role: "Contable",
    active: true,
    joinedAt: "2025-03-15"
  },
  {
    id: "user-3",
    name: "Carlos Pérez",
    email: "c.perez@construccionesinnovadoras.es",
    role: "Operador",
    active: true,
    joinedAt: "2025-05-20"
  },
  {
    id: "user-4",
    name: "Sofía Ruiz",
    email: "sofia.ruiz@externo.es",
    role: "Operador",
    active: false,
    joinedAt: "2026-02-01"
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: "bank-1",
    date: "2026-06-15",
    concept: "TRANSFERENCIA RECIBIDA UNIÓN COOP",
    amount: 5445.00,
    type: "ingreso",
    reconciled: true,
    reconciledWithId: "inv-2"
  },
  {
    id: "bank-2",
    date: "2026-06-14",
    concept: "RECIBO MENSUAL SERVIDORES STRATO",
    amount: 145.20,
    type: "gasto",
    reconciled: false
  },
  {
    id: "bank-3",
    date: "2026-06-12",
    concept: "PAGO FACTURA OFICINAS CENTRO MADRID S.A.",
    amount: 1815.00,
    type: "gasto",
    reconciled: true,
    reconciledWithId: "exp-2"
  },
  {
    id: "bank-4",
    date: "2026-06-10",
    concept: "COBRO FACTURA TECNOLOGÍAS ABAL S.L.",
    amount: 12100.00,
    type: "ingreso",
    reconciled: false
  },
  {
    id: "bank-5",
    date: "2026-06-08",
    concept: "COMPRA TARJETA TARGETA GASTOS CORREOS EXPRESS",
    amount: 48.40,
    type: "gasto",
    reconciled: false
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    number: "F-2026-001",
    clientName: "Tecnologías Abal S.L.",
    clientNif: "B12345678",
    date: "2026-06-01",
    dueDate: "2026-07-01",
    subtotal: 10000.00,
    ivaRate: 21,
    ivaAmount: 2100.00,
    irpfRate: 0,
    irpfAmount: 0.00,
    total: 12100.00,
    status: "Enviada",
    items: [
      { description: "Fase 1: Implantación de Infraestructura y Redes", quantity: 1, price: 10000, total: 10000 }
    ]
  },
  {
    id: "inv-2",
    number: "F-2026-002",
    clientName: "Unión Coop S.C.",
    clientNif: "F88776655",
    date: "2026-06-10",
    dueDate: "2026-07-10",
    subtotal: 4500.00,
    ivaRate: 21,
    ivaAmount: 945.00,
    irpfRate: 0,
    irpfAmount: 0.00,
    total: 5445.00,
    status: "Pagada",
    items: [
      { description: "Mantenimiento Técnico Sistemas Jun-Nov", quantity: 1, price: 4500, total: 4500 }
    ],
    isAiGenerated: true
  },
  {
    id: "inv-3",
    number: "F-2026-003",
    clientName: "Estudios Geotecnia Segovia S.L.",
    clientNif: "B40392813",
    date: "2026-05-15",
    dueDate: "2026-06-15",
    subtotal: 3000.00,
    ivaRate: 21,
    ivaAmount: 630.00,
    irpfRate: 15,
    irpfAmount: 450.00,
    total: 3180.00,
    status: "Vencida",
    items: [
      { description: "Estudio geotécnico parcela 4 residencial", quantity: 1, price: 3000, total: 3000 }
    ]
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    provider: "Hostinger S.L.",
    date: "2026-06-02",
    concept: "Suscripción Premium Anual Nube Cloud",
    amount: 299.00,
    ivaAmount: 62.79,
    category: "Software",
    isAiProcessed: true,
    notes: "Deducible 100% como gasto de actividad tecnológica."
  },
  {
    id: "exp-2",
    provider: "Oficinas Centro Madrid S.A.",
    date: "2026-06-11",
    concept: "Alquiler mensual oficina principal Madrid",
    amount: 1815.00,
    ivaAmount: 315.00,
    category: "Alquiler",
    notes: "Factura recibida en papel y escaneada."
  },
  {
    id: "exp-3",
    provider: "Iberdrola Clientes S.A.U.",
    date: "2026-05-28",
    concept: "Suministro eléctrico locales e iluminación taller",
    amount: 452.10,
    ivaAmount: 94.94,
    category: "Suministros",
    isAiProcessed: true,
    notes: "Gasto sujeto a IVA ordinario del 21%."
  },
  {
    id: "exp-4",
    provider: "Sueldos y Seguridad Social",
    date: "2026-05-31",
    concept: "Nóminas plantilla oficial de mayo",
    amount: 7200.00,
    ivaAmount: 0.00,
    category: "Personal",
    notes: "Salarios exentos de IVA. Deducción directa en IRPF Sociedades."
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Digitalización Integral GestorSaaS",
    description: "Desarrollo del portal SaaS y digitalización de canal de ventas corporativas.",
    clientName: "Tecnologías Abal S.L.",
    budget: 25000.00,
    spent: 10000.00,
    startDate: "2026-05-01",
    endDate: "2026-09-30",
    status: "En Marcha"
  },
  {
    id: "proj-2",
    name: "Consultoría Arquitectónica Sostenible",
    description: "Análisis ambiental de envolventes térmicas para nuevo edificio coop.",
    clientName: "Unión Coop S.C.",
    budget: 8000.00,
    spent: 4500.00,
    startDate: "2026-06-01",
    endDate: "2026-08-15",
    status: "En Marcha"
  },
  {
    id: "proj-3",
    name: "Auditoría de Procesos de Negocio",
    description: "Revisión fiscal, administrativa y optimización con modelos inteligentes.",
    clientName: "Estudios Geotecnia Segovia S.L.",
    budget: 5000.00,
    spent: 0.00,
    startDate: "2026-07-01",
    endDate: "2026-08-30",
    status: "Planificación"
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Redacción del Acta Inicial de Requerimientos",
    description: "Definir módulos funcionales y flujos de datos.",
    assignedToUser: "user-1",
    status: "Completada",
    dueDate: "2026-05-15"
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "Entrega de Prototipos de UI/UX Homologados",
    description: "Diseñar interfaces en Figma para versión responsive móvil y tablet.",
    assignedToUser: "user-3",
    status: "En Progreso",
    dueDate: "2026-06-30"
  },
  {
    id: "task-3",
    projectId: "proj-2",
    title: "Simulación de Eficiencia Lumínica Estival",
    description: "Correr las pruebas de sombreado y reflectancia térmica en software 3D.",
    assignedToUser: "user-2",
    status: "En Progreso",
    dueDate: "2026-07-15"
  },
  {
    id: "task-4",
    projectId: "proj-3",
    title: "Preparación de Documentación Fiscal de Enlace",
    description: "Reunir los balances e IVA del último año de la empresa cliente.",
    assignedToUser: "user-1",
    status: "Pendiente",
    dueDate: "2026-07-10",
    aiSuggested: true
  }
];

export const INITIAL_CRM_CONTACTS: CRMContact[] = [
  {
    id: "crm-1",
    name: "Ana Belis",
    nif: "A12345678",
    email: "a.belis@tecnologiasabal.es",
    phone: "+34 654 321 098",
    type: "Cliente",
    company: "Tecnologías Abal S.L.",
    notes: "Socia fundadora, contacto muy cercano y proactivo.",
    leadStatus: "Activo"
  },
  {
    id: "crm-2",
    name: "José Ramón",
    nif: "F88776655",
    email: "jr.presidente@unioncoop.es",
    phone: "+34 601 202 303",
    type: "Cliente",
    company: "Unión Coop S.C.",
    notes: "Requiere facturas con fecha fija a principios de mes.",
    leadStatus: "Activo"
  },
  {
    id: "crm-3",
    name: "Leticia González",
    nif: "B40392813",
    email: "leticia@geotecniasegovia.com",
    phone: "+34 699 887 766",
    type: "Cliente",
    company: "Estudios Geotecnia Segovia S.L.",
    notes: "Empresa de Segovia. Pendiente de firmar segundo proyecto.",
    leadStatus: "Negociando"
  },
  {
    id: "crm-4",
    name: "Strato Hosting Europe",
    nif: "N9283748B",
    email: "billing@strato-hosting.com",
    phone: "+49 30 300 130",
    type: "Proveedor",
    company: "Strato AG",
    notes: "Proveedor de DNS y servidores VPS de desarrollo.",
    leadStatus: "Activo"
  }
];

export const SPANISH_SUBVENCIONES: SubvencionHelp[] = [
  {
    id: "sub-1",
    title: "Programa Kit Digital: Soluciones de Digitalización",
    organization: "Ministerio de Asuntos Económicos y Transformación Digital",
    amount: "Hasta 12.000 €",
    deadline: "31 de Diciembre de 2026",
    description: "Ayudas directas no reembolsables destinadas a la implantación de comercio electrónico, redes sociales, Business Intelligence, CRM y ciberseguridad.",
    link: "https://www.acelerapyme.gob.es/kit-digital",
    category: "Digitalización"
  },
  {
    id: "sub-2",
    title: "Líneas de Financiación ENISA para Jóvenes Emprendedores",
    organization: "Empresa Nacional de Innovación S.A. (ENISA)",
    amount: "De 25.000 € a 75.000 €",
    deadline: "Convocatoria abierta todo el año",
    description: "Préstamos participativos sin avales de fianza para PYMEs de reciente creación con proyectos viables, innovadores y liderados por menores de 40 años.",
    link: "https://www.enisa.es/",
    category: "Innovación"
  },
  {
    id: "sub-3",
    title: "Ayudas de Apoyo al Empleo Autónomo y autoempleo",
    organization: "Servicio de Empleo Autonómico (Comunidad de Madrid)",
    amount: "Hasta 5.500 €",
    deadline: "Ventanilla Abierta permanente",
    description: "Subvenciones para compensar los gastos iniciales necesarios para la puesta en marcha de una nueva actividad como profesional de alta en el RETA.",
    link: "https://www.comunidad.madrid/",
    category: "Autónomos"
  },
  {
    id: "sub-4",
    title: "Proyectos de Innovación Tecnológica (CDTI)",
    organization: "Centro para el Desarrollo Tecnológico Industrial",
    amount: "Hasta el 85% del presupuesto financiado",
    deadline: "Convocatorias específicas periódicas",
    description: "Apoyo financiero preferente a proyectos empresariales de I+D+i enfocados en la creación o mejora sustancial de procesos de producción.",
    link: "https://www.cdti.es",
    category: "Innovación"
  }
];
