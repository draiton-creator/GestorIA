export type UserRole = 'Usuario Administrador' | 'Usuario Empresa' | 'Usuario Free';

export interface CompanyConfig {
  name: string;
  nif: string;
  address: string;
  email: string;
  phone: string;
  premiumTier: 'Básico' | 'Profesional' | 'Empresarial';
  avatarUrl?: string;
  defaultIva: number;
  defaultIrpf: number;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  joinedAt: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  concept: string;
  amount: number;
  type: 'ingreso' | 'gasto';
  reconciled: boolean;
  reconciledWithId?: string; // ID of Invoice or Expense matched
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientNif: string;
  date: string;
  dueDate: string;
  subtotal: number;
  ivaRate: number; // e.g. 21 for 21%
  ivaAmount: number;
  irpfRate: number; // e.g. 15 for 15%
  irpfAmount: number;
  total: number;
  status: 'Borrador' | 'Enviada' | 'Pagada' | 'Vencida';
  items: { 
    description: string; 
    quantity: number; 
    price: number; 
    total: number;
    unit?: string;
  }[];
  isAiGenerated?: boolean;
  isBudget?: boolean; // True if this document is a Budget (Presupuesto) instead of an Invoice
  
  // Extended fields for professional invoices
  verifactu?: boolean;
  emisorName?: string;
  emisorNif?: string;
  emisorAddress?: string;
  emisorEmail?: string;
  emisorEmailShow?: boolean;
  emisorPhone?: string;
  emisorPhoneShow?: boolean;

  clientAddressLine1?: string;
  clientAddressLine2?: string;
  clientCity?: string;
  clientPostalCode?: string;
  clientProvince?: string;
  clientCountry?: string;
  clientEmail?: string;
  clientEmailShow?: boolean;
  clientPhone?: string;
  clientPhoneShow?: boolean;

  currency?: string;
  applyIrpf?: boolean;
  terms?: string;
  paymentMethod?: string;
}

export interface Expense {
  id: string;
  provider: string;
  date: string;
  concept: string;
  amount: number;
  ivaAmount: number;
  category: 'Suministros' | 'Alquiler' | 'Personal' | 'Marketing' | 'Software' | 'Transporte' | 'Otros';
  imageUrl?: string;
  isAiProcessed?: boolean;
  notes?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedToUser?: string; // User ID
  status: 'Pendiente' | 'En Progreso' | 'Completada';
  dueDate: string;
  aiSuggested?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  status: 'Planificación' | 'En Marcha' | 'Pausado' | 'Finalizado';
}

export interface CRMContact {
  id: string;
  name: string;
  nif: string;
  email: string;
  phone: string;
  type: 'Cliente' | 'Proveedor';
  company?: string;
  notes?: string;
  leadStatus?: 'Contacto Inicial' | 'Negociando' | 'Activo' | 'Inactivo';
}

export interface SubvencionHelp {
  id: string;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  description: string;
  link: string;
  category: 'Autónomos' | 'Digitalización' | 'Sostenibilidad' | 'Innovación';
}

export interface MarketingStrategy {
  targetAudience: string;
  channels: string[];
  socialPostIdea: string;
  emailCampaignNewsletter: string;
  blogOutline: string;
  seoKeywords: string[];
}

export interface WebSEOReport {
  url: string;
  score: number; // 0-100
  mobileFriendly: boolean;
  loadTimeSeconds: number;
  seoAudit: string[];
  usabilityAudit: string[];
  aiRecommendations: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
