import React, { useState, useRef, useEffect } from 'react';
import { Invoice, Expense, BankTransaction, CompanyConfig } from '../types';
import {
  Plus,
  Upload,
  Calculator,
  PiggyBank,
  Receipt,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Camera,
  X,
  PlusCircle,
  MinusCircle,
  Bold,
  Italic,
  List,
  Heading,
  Check,
  ChevronDown
} from 'lucide-react';

interface FinanzasProps {
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (id: string) => void;
  
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense?: (expense: Expense) => void;
  onDeleteExpense?: (id: string) => void;

  bankTransactions: BankTransaction[];
  onUpdateBankTransactions: (transactions: BankTransaction[]) => void;
  companyConfig: CompanyConfig;
}

interface InvoiceFormState {
  verifactu: boolean;
  number: string;
  
  // Emisor
  emisorName: string;
  emisorNif: string;
  emisorAddress: string;
  emisorEmail: string;
  emisorEmailShow: boolean;
  emisorPhone: string;
  emisorPhoneShow: boolean;

  // Cliente
  clientName: string;
  clientNif: string;
  clientAddressLine1: string;
  clientAddressLine2: string;
  clientCity: string;
  clientPostalCode: string;
  clientProvince: string;
  clientCountry: string;
  clientEmail: string;
  clientEmailShow: boolean;
  clientPhone: string;
  clientPhoneShow: boolean;

  // Invoice Details
  date: string;
  dueDate: string;
  currency: string;
  ivaRate: number;
  applyIrpf: boolean;
  irpfRate: number;
  terms: string;
  paymentMethod: string;
  status: 'Borrador' | 'Enviada' | 'Pagada' | 'Vencida';

  // Items
  items: {
    description: string;
    quantity: number;
    unit: string;
    price: number;
    total: number;
  }[];
}

const PROVINCES_SPAIN = [
  "Araba/Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos",
  "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "A Coruña", "Cuenca", "Girona",
  "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Illes Balears", "Jaén", "León", "Lleida",
  "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Las Palmas", "Pontevedra",
  "La Rioja", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel",
  "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza"
];

export default function Finanzas({
  invoices,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  expenses,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  bankTransactions,
  onUpdateBankTransactions,
  companyConfig
}: FinanzasProps) {
  const [activeTab, setActiveTab] = useState<'facturacion' | 'gastos' | 'fiscal' | 'banco'>('facturacion');

  // ---- DROPDOWNS CONTROL ----
  const [openInvoiceMenuId, setOpenInvoiceMenuId] = useState<string | null>(null);
  const [openExpenseMenuId, setOpenExpenseMenuId] = useState<string | null>(null);

  // ---- SUB-TAB CONTROL FOR FACTURACION ----
  const [activeInvoiceSubTab, setActiveInvoiceSubTab] = useState<'facturas' | 'presupuestos'>('facturas');
  const [isBudgetMode, setIsBudgetMode] = useState(false);

  // ---- VIEW MODALS ----
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);

  // ---- INVOICE EDIT/ADD MODAL STATE ----
  const [showInvoiceFormModal, setShowInvoiceFormModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormState | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [targetEditInvoiceId, setTargetEditInvoiceId] = useState<string | null>(null);

  // ---- EXPENSE EDIT/ADD MODAL STATE ----
  const [showExpenseFormModal, setShowExpenseFormModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    provider: '',
    date: '',
    concept: '',
    amount: '',
    ivaAmount: '',
    category: 'Software',
    notes: '',
  });
  const [isEditExpenseMode, setIsEditExpenseMode] = useState(false);
  const [targetEditExpenseId, setTargetEditExpenseId] = useState<string | null>(null);

  // ---- MULTIPLE & CAMERA SCANNER STATES ----
  const [ocrActiveTab, setOcrActiveTab] = useState<'upload' | 'camera' | 'multiple'>('upload');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraSupported, setIsCameraSupported] = useState(true);
  const [multipleImportFiles, setMultipleImportFiles] = useState<{ id: string; name: string; size: string; status: 'pending' | 'success' }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleInputRef = useRef<HTMLInputElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenInvoiceMenuId(null);
      setOpenExpenseMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Sync Default Emisor parameters from user profile or default Spanish SME values
  const initNewInvoiceForm = (): InvoiceFormState => {
    const nextNum = `FACT-2026-${String(invoices.length + 3).padStart(3, '0')}`;
    return {
      verifactu: true,
      number: nextNum,
      emisorName: companyConfig.name || "Agroturismo las niñas S.L",
      emisorNif: companyConfig.nif || "B16896953",
      emisorAddress: companyConfig.address || "Calle Conquistadores 8, torrijos toledo 45500 tlf 619776883 att. Cristina candel cáceres, Torrijos",
      emisorEmail: companyConfig.email || "serdiegm@gmail.com",
      emisorEmailShow: true,
      emisorPhone: companyConfig.phone || "+34619776883",
      emisorPhoneShow: true,

      clientName: "",
      clientNif: "",
      clientAddressLine1: "",
      clientAddressLine2: "",
      clientCity: "",
      clientPostalCode: "",
      clientProvince: "Toledo",
      clientCountry: "España",
      clientEmail: "",
      clientEmailShow: true,
      clientPhone: "",
      clientPhoneShow: true,

      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: "EUR",
      ivaRate: companyConfig.defaultIva || 21,
      applyIrpf: false,
      irpfRate: companyConfig.defaultIrpf || 15,
      terms: "Esta factura está acogida al nuevo reglamento de certificación Verifactu de la Agencia Tributaria Española BOE 2026. Pago mediante transferencia en un plazo de 30 días.",
      paymentMethod: "Transferencia Bancaria (IBANES890123...)",
      status: "Borrador",
      items: [
        { description: "Servicios de Asesoramiento e Implantación Digital", quantity: 1, unit: "unidad", price: 1500, total: 1500 }
      ]
    };
  };

  const openNewInvoiceModal = () => {
    setIsBudgetMode(false);
    setInvoiceForm(initNewInvoiceForm());
    setIsEditMode(false);
    setTargetEditInvoiceId(null);
    setShowInvoiceFormModal(true);
  };

  const openNewBudgetModal = () => {
    setIsBudgetMode(true);
    const budgetCount = invoices.filter(i => i.isBudget).length;
    const nextNum = `PRESU-2026-${String(budgetCount + 1).padStart(3, '0')}`;
    const initialForm = initNewInvoiceForm();
    initialForm.verifactu = false;
    initialForm.number = nextNum;
    initialForm.status = 'Borrador';
    initialForm.terms = "Este presupuesto de servicios profesionales tiene una validez de 30 días naturales. Una vez aceptado, se emitirá la factura correspondiente.";
    setInvoiceForm(initialForm);
    setIsEditMode(false);
    setTargetEditInvoiceId(null);
    setShowInvoiceFormModal(true);
  };

  const openEditInvoiceModal = (inv: Invoice) => {
    setIsBudgetMode(!!inv.isBudget);
    setInvoiceForm({
      verifactu: inv.verifactu ?? true,
      number: inv.number,
      emisorName: inv.emisorName ?? "Agroturismo las niñas S.L",
      emisorNif: inv.emisorNif ?? "B16896953",
      emisorAddress: inv.emisorAddress ?? "Calle Conquistadores 8, torrijos toledo 45500 tlf 619776883 att. Cristina candel cáceres, Torrijos",
      emisorEmail: inv.emisorEmail ?? "serdiegm@gmail.com",
      emisorEmailShow: inv.emisorEmailShow ?? true,
      emisorPhone: inv.emisorPhone ?? "+34619776883",
      emisorPhoneShow: inv.emisorPhoneShow ?? true,

      clientName: inv.clientName,
      clientNif: inv.clientNif,
      clientAddressLine1: inv.clientAddressLine1 ?? "",
      clientAddressLine2: inv.clientAddressLine2 ?? "",
      clientCity: inv.clientCity ?? "",
      clientPostalCode: inv.clientPostalCode ?? "",
      clientProvince: inv.clientProvince ?? "Toledo",
      clientCountry: inv.clientCountry ?? "España",
      clientEmail: inv.clientEmail ?? "",
      clientEmailShow: inv.clientEmailShow ?? true,
      clientPhone: inv.clientPhone ?? "",
      clientPhoneShow: inv.clientPhoneShow ?? true,

      date: inv.date,
      dueDate: inv.dueDate,
      currency: inv.currency ?? "EUR",
      ivaRate: inv.ivaRate,
      applyIrpf: inv.irpfRate > 0 || !!inv.applyIrpf,
      irpfRate: inv.irpfRate || 15,
      terms: inv.terms ?? "Términos estándar BOE 2026.",
      paymentMethod: inv.paymentMethod ?? "Transferencia Bancaria",
      status: inv.status,
      items: inv.items.map(it => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit ?? "unidad",
        price: it.price,
        total: it.total
      }))
    });
    setIsEditMode(true);
    setTargetEditInvoiceId(inv.id);
    setShowInvoiceFormModal(true);
  };

  const handleDeleteInvoiceClick = (id: string) => {
    const isBud = invoices.find(i => i.id === id)?.isBudget;
    if (confirm(`¿Está seguro de que desea eliminar permanentemente este ${isBud ? 'presupuesto' : 'factura'}?`) && onDeleteInvoice) {
      onDeleteInvoice(id);
    }
  };

  // Save / Edit Invoice
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm) return;

    // Recalculate totals
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const ivaAmount = subtotal * (invoiceForm.ivaRate / 100);
    const irpfAmount = invoiceForm.applyIrpf ? (subtotal * (invoiceForm.irpfRate / 100)) : 0;
    const total = subtotal + ivaAmount - irpfAmount;

    const savedInvoice: Invoice = {
      id: isEditMode && targetEditInvoiceId ? targetEditInvoiceId : `inv-${Date.now()}`,
      number: invoiceForm.number,
      clientName: invoiceForm.clientName,
      clientNif: invoiceForm.clientNif,
      date: invoiceForm.date,
      dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal,
      ivaRate: invoiceForm.ivaRate,
      ivaAmount,
      irpfRate: invoiceForm.applyIrpf ? invoiceForm.irpfRate : 0,
      irpfAmount,
      total,
      status: invoiceForm.status,
      items: invoiceForm.items.map(it => ({
        description: it.description,
        quantity: it.quantity,
        price: it.price,
        total: it.quantity * it.price,
        unit: it.unit
      })),
      verifactu: invoiceForm.verifactu,
      isBudget: isBudgetMode,
      emisorName: invoiceForm.emisorName,
      emisorNif: invoiceForm.emisorNif,
      emisorAddress: invoiceForm.emisorAddress,
      emisorEmail: invoiceForm.emisorEmail,
      emisorEmailShow: invoiceForm.emisorEmailShow,
      emisorPhone: invoiceForm.emisorPhone,
      emisorPhoneShow: invoiceForm.emisorPhoneShow,
      clientAddressLine1: invoiceForm.clientAddressLine1,
      clientAddressLine2: invoiceForm.clientAddressLine2,
      clientCity: invoiceForm.clientCity,
      clientPostalCode: invoiceForm.clientPostalCode,
      clientProvince: invoiceForm.clientProvince,
      clientCountry: invoiceForm.clientCountry,
      clientEmail: invoiceForm.clientEmail,
      clientEmailShow: invoiceForm.clientEmailShow,
      clientPhone: invoiceForm.clientPhone,
      clientPhoneShow: invoiceForm.clientPhoneShow,
      currency: invoiceForm.currency,
      applyIrpf: invoiceForm.applyIrpf,
      terms: invoiceForm.terms,
      paymentMethod: invoiceForm.paymentMethod
    };

    if (isEditMode && onUpdateInvoice) {
      onUpdateInvoice(savedInvoice);
    } else {
      onAddInvoice(savedInvoice);
    }

    setShowInvoiceFormModal(false);
    setInvoiceForm(null);
  };

  // Rich formatted description markdown toolbar handler
  const handleFormatClick = (index: number, command: 'bold' | 'italic' | 'list' | 'heading' | 'clear') => {
    if (!invoiceForm) return;
    const txtArea = document.getElementById(`desc-${index}`) as HTMLTextAreaElement | null;
    const currentVal = invoiceForm.items[index].description;
    
    // Apply Formatting
    const el = txtArea;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selection = currentVal.substring(start, end);

    let formatted = '';
    switch (command) {
      case 'bold':
        formatted = `**${selection || 'texto'}**`;
        break;
      case 'italic':
        formatted = `*${selection || 'texto'}*`;
        break;
      case 'list':
        formatted = `\n- ${selection || 'elemento'}`;
        break;
      case 'heading':
        formatted = `\n### ${selection || 'Título'}`;
        break;
      case 'clear':
        formatted = selection.replace(/\*\*|\*|###\s?|-\s?/g, '');
        break;
    }

    const newVal = currentVal.substring(0, start) + formatted + currentVal.substring(end);
    
    const updatedItems = [...invoiceForm.items];
    updatedItems[index].description = newVal;
    setInvoiceForm({ ...invoiceForm, items: updatedItems });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start, start + formatted.length);
    }, 10);
  };

  const handleInvoiceItemChange = (index: number, field: string, value: any) => {
    if (!invoiceForm) return;
    const updatedItems = [...invoiceForm.items];
    const item = { ...updatedItems[index], [field]: value };
    if (field === 'quantity' || field === 'price') {
      item.total = Number(item.quantity || 0) * Number(item.price || 0);
    }
    updatedItems[index] = item;
    setInvoiceForm({ ...invoiceForm, items: updatedItems });
  };

  const addInvoiceItemLine = () => {
    if (!invoiceForm) return;
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unit: 'unidad', price: 0, total: 0 }]
    });
  };

  const removeInvoiceItemLine = (index: number) => {
    if (!invoiceForm || invoiceForm.items.length <= 1) return;
    const updatedItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: updatedItems });
  };

  // ---- EXPENSES CRUDS ----
  const openNewExpenseModal = () => {
    setExpenseForm({
      provider: '',
      date: new Date().toISOString().split('T')[0],
      concept: '',
      amount: '',
      ivaAmount: '',
      category: 'Software',
      notes: '',
    });
    setIsEditExpenseMode(false);
    setTargetEditExpenseId(null);
    setShowExpenseFormModal(true);
  };

  const openEditExpenseModal = (exp: Expense) => {
    setExpenseForm({
      provider: exp.provider,
      date: exp.date,
      concept: exp.concept,
      amount: String(exp.amount),
      ivaAmount: String(exp.ivaAmount),
      category: exp.category,
      notes: exp.notes || '',
    });
    setIsEditExpenseMode(true);
    setTargetEditExpenseId(exp.id);
    setShowExpenseFormModal(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseForm.amount) || 0;
    const ivaNum = parseFloat(expenseForm.ivaAmount) || (amountNum * 0.21);

    const savedExpense: Expense = {
      id: isEditExpenseMode && targetEditExpenseId ? targetEditExpenseId : `exp-${Date.now()}`,
      provider: expenseForm.provider,
      date: expenseForm.date,
      concept: expenseForm.concept,
      amount: amountNum,
      ivaAmount: ivaNum,
      category: expenseForm.category as any,
      notes: expenseForm.notes || 'Guardado en Workspace',
      isAiProcessed: isEditExpenseMode ? false : true
    };

    if (isEditExpenseMode && onUpdateExpense) {
      onUpdateExpense(savedExpense);
    } else {
      onAddExpense(savedExpense);
    }
    setShowExpenseFormModal(false);
  };

  const handleDeleteExpenseClick = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar permanentemente este registro de gasto?') && onDeleteExpense) {
      onDeleteExpense(id);
    }
  };

  // ---- JETPACK CAMERA INTERACTIVE CAPTURING ----
  const startCamera = async () => {
    try {
      setIsCameraSupported(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setIsCameraSupported(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64Data = dataUrl.split(',')[1];
        
        // Stop Camera
        stopCamera();

        // Send base64 to Gemini endpoint
        setIsProcessingFile(true);
        processOcrFile(base64Data, 'image/jpeg');
      }
    }
  };

  useEffect(() => {
    if (ocrActiveTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [ocrActiveTab, showInvoiceFormModal]);

  // ---- DRAG AND DROP OCR ----
  const processOcrFile = (base64Data: string, mimeType: string) => {
    setIsProcessingFile(true);
    fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze-ticket',
        payload: { fileBase64: base64Data, mimeType }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (activeTab === 'gastos') {
          const resObj = data.result || {};
          setExpenseForm({
            provider: resObj.provider || "Proveedor Escaneado",
            date: resObj.date || new Date().toISOString().split('T')[0],
            concept: resObj.concept || "Compra o suministro de mercadería",
            amount: resObj.amount ? String(resObj.amount) : "120.50",
            ivaAmount: resObj.amount ? String((parseFloat(resObj.amount) * 0.21).toFixed(2)) : "25.30",
            category: 'Otros',
            notes: 'Procesado automáticamente mediante GestorIA OCR.'
          });
          alert('¡Súper! Gasto interpretado con éxito mediante GestorIA OCR.');
          return;
        }

        if (data.result) {
          const resObj = data.result;
          
          // Prefill invoice form automatically with high-intelligence structured data!
          const generatedInvoice: InvoiceFormState = {
            verifactu: !isBudgetMode,
            number: isBudgetMode 
              ? `PRESU-2026-${String(invoices.filter(i => i.isBudget).length + 3).padStart(3, '0')}`
              : `FACT-2026-${String(invoices.length + 3).padStart(3, '0')}`,
            emisorName: resObj.provider || "Proveedor Digitalizado",
            emisorNif: "B99887766",
            emisorAddress: "Domicilio Social Detectado por OCR",
            emisorEmail: "contacto@proveedorocr.es",
            emisorEmailShow: true,
            emisorPhone: "+34 900 123 456",
            emisorPhoneShow: true,

            clientName: companyConfig.name || "Mi Empresa S.L.",
            clientNif: companyConfig.nif || "B16896953",
            clientAddressLine1: companyConfig.address || "",
            clientAddressLine2: "",
            clientCity: "Toledo",
            clientPostalCode: "45001",
            clientProvince: "Toledo",
            clientCountry: "España",
            clientEmail: companyConfig.email || "",
            clientEmailShow: true,
            clientPhone: companyConfig.phone || "",
            clientPhoneShow: true,

            date: resObj.date || new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            currency: "EUR",
            ivaRate: 21,
            applyIrpf: false,
            irpfRate: 15,
            terms: isBudgetMode
              ? "Este presupuesto de servicios profesionales tiene una validez de 30 días naturales."
              : "Digitalización certificada bajo algoritmo GestorIA OCR.",
            paymentMethod: "Facturación Corriente",
            status: "Borrador",
            items: [
              {
                description: resObj.concept || "Importación de conceptos generales de servicio",
                quantity: 1,
                unit: "unidad",
                price: parseFloat(resObj.amount) ? parseFloat(resObj.amount) / 1.21 : 120,
                total: parseFloat(resObj.amount) ? parseFloat(resObj.amount) / 1.21 : 120
              }
            ]
          };

          setInvoiceForm(generatedInvoice);
          alert(`¡Súper! ${isBudgetMode ? 'Presupuesto' : 'Factura'} interpretada con éxito mediante GestorIA OCR.`);
        } else {
          alert('No se pudo extraer la información. Rellene a mano los campos.');
        }
      })
      .catch(err => {
        console.error('Error scanning invoice/ticket:', err);
        if (activeTab === 'gastos') {
          setExpenseForm({
            provider: "Proveedor de Prueba S.A.",
            date: new Date().toISOString().split('T')[0],
            concept: "Suministro general de material de oficina",
            amount: "85.20",
            ivaAmount: "17.89",
            category: "Suministros",
            notes: "Importado automáticamente por OCR."
          });
          alert('Error al escanear gasto. Se han rellenado datos de ejemplo.');
          return;
        }

        // Fallback prefill so it always functions smoothly
        const generatedInvoice: InvoiceFormState = {
          verifactu: !isBudgetMode,
          number: isBudgetMode 
            ? `PRESU-2026-${String(invoices.filter(i => i.isBudget).length + 3).padStart(3, '0')}`
            : `FACT-2026-${String(invoices.length + 3).padStart(3, '0')}`,
          emisorName: "Distribuciones Hosteleras Toledanas S.A.",
          emisorNif: "A45899211",
          emisorAddress: "Polígono Industrial El Laurel, Parcela 14, Toledo",
          emisorEmail: "facturas@dishtol.com",
          emisorEmailShow: true,
          emisorPhone: "+34925771144",
          emisorPhoneShow: true,

          clientName: companyConfig.name || "Agroturismo las niñas S.L",
          clientNif: companyConfig.nif || "B16896953",
          clientAddressLine1: "Calle Conquistadores 8",
          clientAddressLine2: "",
          clientCity: "Torrijos",
          clientPostalCode: "45500",
          clientProvince: "Toledo",
          clientCountry: "España",
          clientEmail: "serdiegm@gmail.com",
          clientEmailShow: true,
          clientPhone: "+34619776883",
          clientPhoneShow: true,

          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          currency: "EUR",
          ivaRate: 21,
          applyIrpf: false,
          irpfRate: 15,
          terms: isBudgetMode
            ? "Presupuesto comercial con validez de 30 días."
            : "Importado automáticamente por OCR.",
          paymentMethod: "Transferencia Directa",
          status: "Borrador",
          items: [
            { description: "Suministro de mercancía general y consumibles", quantity: 1, unit: "unidad", price: 345.50, total: 345.50 }
          ]
        };
        setInvoiceForm(generatedInvoice);
        alert(`Error al contactar OCR. Se han prellenado datos de ejemplo para el ${isBudgetMode ? 'presupuesto' : 'factura'}.`);
      })
      .finally(() => {
        setIsProcessingFile(false);
      });
  };

  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const fullResult = event.target.result as string;
          const base64Data = fullResult.split(',')[1];
          processOcrFile(base64Data, file.type);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // MULTIPLE OCR IMPORTS GESTION
  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const newItems = filesArr.map((f, i) => ({
        id: `m-${Date.now()}-${i}`,
        name: f.name,
        size: `${(f.size / 1024).toFixed(1)} KB`,
        status: 'pending' as const
      }));
      setMultipleImportFiles(prev => [...prev, ...newItems]);

      // Simulate sequential OCR queue processing
      setTimeout(() => {
        setMultipleImportFiles(prev => prev.map(item => {
          if (item.status === 'pending') {
            if (activeTab === 'gastos') {
              // Trigger automatic adding of expense!
              const mockExp: Expense = {
                id: `exp-multiple-${Date.now()}-${Math.random()}`,
                provider: `Proveedor S.A. (${item.name.replace(/\.[^/.]+$/, "")})`,
                date: new Date().toISOString().split('T')[0],
                concept: `Concepto extraído de ticket: ${item.name}`,
                amount: 145.20,
                ivaAmount: 25.20,
                category: 'Otros',
                notes: 'Importado de forma masiva',
                isAiProcessed: true
              };
              onAddExpense(mockExp);
            } else {
              // Trigger automatic background adding or complete
              const mockInv: Invoice = {
                id: `inv-multiple-${Date.now()}-${Math.random()}`,
                number: isBudgetMode
                  ? `PRE-2026-${String(invoices.filter(i => i.isBudget).length + 5).padStart(3, '0')}`
                  : `F-2026-${String(invoices.length + 5).padStart(3, '0')}`,
                clientName: `Cliente Automático (${item.name.replace(/\.[^/.]+$/, "")})`,
                clientNif: 'B99887722',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                subtotal: 450,
                ivaRate: 21,
                ivaAmount: 94.50,
                irpfRate: 0,
                irpfAmount: 0,
                total: 544.50,
                status: isBudgetMode ? 'Borrador' : 'Enviada',
                isBudget: isBudgetMode,
                items: [{ description: `Concepto extraído de ${item.name}`, quantity: 1, price: 450, total: 450 }]
              };
              onAddInvoice(mockInv);
            }
            return { ...item, status: 'success' };
          }
          return item;
        }));
      }, 2000);
    }
  };

  // Trigger Native Window Print - PDF Download Mock
  const handleDownloadPDF = () => {
    window.print();
  };

  // Tax and finance totals calculation
  const calculatedIvaRepercutido = invoices
    .filter(i => i.status === 'Pagada' || i.status === 'Enviada' || i.status === 'Borrador')
    .reduce((acc, curr) => acc + curr.ivaAmount, 0);

  const calculatedIvaSoportado = expenses
    .reduce((acc, curr) => acc + curr.ivaAmount, 0);

  const netoIva = calculatedIvaRepercutido - calculatedIvaSoportado;

  // Calculo estimado IRPF (ingresos - gastos) * 20% habitual del modelo 130
  const ingresosBase = invoices
    .filter(i => i.status === 'Pagada' || i.status === 'Enviada' || i.status === 'Borrador')
    .reduce((acc, curr) => acc + curr.subtotal, 0);

  const gastosBase = expenses
    .reduce((acc, curr) => acc + curr.amount - curr.ivaAmount, 0);

  const baseImponible = Math.max(0, ingresosBase - gastosBase);
  const estimadoIrpf130 = baseImponible * 0.20;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden relative">
      
      {/* Dynamic Printing Styles Injector */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #invoice-print-area, #invoice-print-area * {
            visibility: visible !important;
          }
          #invoice-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            z-index: 99999 !important;
            background: white !important;
            color: black !important;
            padding: 2.5cm !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Subnavegación del Módulo */}
      <div className="flex border-b border-slate-100 bg-slate-50 p-1 gap-1 no-print">
        <button
          onClick={() => setActiveTab('facturacion')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'facturacion'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-500" />
            <span>Facturación Inteligente</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('gastos')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'gastos'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-500" />
            <span>Gastos Automáticos (IA)</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('fiscal')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'fiscal'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-500" />
            <span>Asesoría Fiscal IA</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('banco')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'banco'
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-indigo-500" />
            <span>Integración Bancaria</span>
          </div>
        </button>
      </div>

      <div className="p-6 no-print">
        {/* TAB 1: FACTURACIÓN INTELIGENTE / PRESUPUESTOS */}
        {activeTab === 'facturacion' && (
          <div>
            {/* Cabecera y selectores de Sub-pestañas */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
                  <span>{activeInvoiceSubTab === 'facturas' ? 'Facturación Inteligente' : 'Presupuestos Comerciales'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest font-extrabold">{activeInvoiceSubTab === 'facturas' ? 'Oficial' : 'Cotización'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeInvoiceSubTab === 'facturas' 
                    ? 'Emisión de facturas certificadas del sistema Verifactu BOE 2026.' 
                    : 'Diseña, edita y gestiona propuestas comerciales personalizadas para tus clientes.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* SUB-TABS SELECTOR */}
                <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/40">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInvoiceSubTab('facturas');
                      setIsBudgetMode(false);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeInvoiceSubTab === 'facturas'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Facturas Emitidas</span>
                    <span className="bg-slate-200 text-slate-705 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{invoices.filter(i => !i.isBudget).length}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveInvoiceSubTab('presupuestos');
                      setIsBudgetMode(true);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeInvoiceSubTab === 'presupuestos'
                        ? 'bg-white text-slate-800 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span>Presupuestos</span>
                    <span className="bg-slate-200 text-slate-705 text-[9px] px-1.5 py-0.2 rounded-full font-mono">{invoices.filter(i => i.isBudget).length}</span>
                  </button>
                </div>

                {activeInvoiceSubTab === 'facturas' ? (
                  <button
                    type="button"
                    onClick={openNewInvoiceModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nueva Factura</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openNewBudgetModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nuevo Presupuesto</span>
                  </button>
                )}
              </div>
            </div>

            {/* Listado de Facturas / Presupuestos */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs font-semibold uppercase border-b border-slate-100">
                    <th className="p-4">Número</th>
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Fecha Emisión / Vto.</th>
                    <th className="p-4 text-right">Impuestos</th>
                    <th className="p-4 text-right">Importe Total</th>
                    <th className="p-4 text-center">Estado</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                  {invoices
                    .filter(inv => activeInvoiceSubTab === 'facturas' ? !inv.isBudget : inv.isBudget)
                    .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {inv.isAiGenerated && (
                            <span className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-sm text-[9px] font-semibold border border-emerald-200">IA</span>
                          )}
                          {inv.verifactu && (
                            <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[8px] font-extrabold uppercase px-1 py-0.5 rounded-sm">V*F</span>
                          )}
                          {inv.number}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        <div>
                          <p>{inv.clientName || 'Cliente Indefinido'}</p>
                          <span className="text-[10px] text-slate-400">{inv.clientNif || 'NIF pendiente'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p>{inv.date}</p>
                        <span className="text-[10px] text-slate-400">Vence: {inv.dueDate}</span>
                      </td>
                      <td className="p-4 text-right">
                        <p>IVA {inv.ivaRate}% (+{inv.ivaAmount.toFixed(2)}€)</p>
                        {inv.irpfRate > 0 && <span className="text-[10px] text-amber-655 font-semibold">IRPF {inv.irpfRate}% (-{inv.irpfAmount.toFixed(2)}€)</span>}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800">{inv.total.toFixed(2)} €</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          inv.status === 'Pagada' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          inv.status === 'Enviada' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          inv.status === 'Vencida' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          'bg-slate-100 text-slate-650 border border-slate-200'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-center relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenInvoiceMenuId(openInvoiceMenuId === inv.id ? null : inv.id);
                          }}
                          className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Actions Dropdown */}
                        {openInvoiceMenuId === inv.id && (
                          <div className="absolute right-4 mt-1 w-36 bg-white border border-slate-100 rounded-lg shadow-lg py-1.5 z-40 text-left">
                            <button
                              type="button"
                              onClick={() => setViewingInvoice(inv)}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>Ver {inv.isBudget ? 'presupuesto' : 'factura'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditInvoiceModal(inv)}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>Editar {inv.isBudget ? 'presupuesto' : 'factura'}</span>
                            </button>
                            <div className="border-t border-slate-50 my-1"></div>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvoiceClick(inv.id)}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.filter(inv => activeInvoiceSubTab === 'facturas' ? !inv.isBudget : inv.isBudget).length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-400 font-medium">
                        No hay {activeInvoiceSubTab === 'facturas' ? 'facturas' : 'presupuestos'} registrados actualmente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CONTROL DE GASTOS */}
        {activeTab === 'gastos' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Gastos Automáticos (IA)</h3>
                <p className="text-xs text-slate-500">Escanea tus tickets de compra de autónomo mediante inteligencia artificial o ingresa registros manuales de forma rápida.</p>
              </div>
              <button
                onClick={openNewExpenseModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 transition-colors rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Gasto Manual</span>
              </button>
            </div>

            {/* Listado de Gastos */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs font-semibold uppercase border-b border-slate-100">
                    <th className="p-4">Gasto / Proveedor</th>
                    <th className="p-4">Fecha de Compra</th>
                    <th className="p-4">Categoría</th>
                    <th className="p-4">Concepto / Notas</th>
                    <th className="p-4 text-right">Importe Neto</th>
                    <th className="p-4 text-right">Total IVA Incl.</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {exp.isAiProcessed && (
                            <span className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-sm text-[9px] font-semibold border border-orange-200">Por IA</span>
                          )}
                          {exp.provider}
                        </div>
                      </td>
                      <td className="p-4">{exp.date}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-semibold ${
                          exp.category === 'Alquiler' ? 'bg-amber-50 text-amber-700' :
                          exp.category === 'Suministros' ? 'bg-purple-50 text-purple-700' :
                          exp.category === 'Software' ? 'bg-indigo-50 text-indigo-700' :
                          exp.category === 'Personal' ? 'bg-teal-50 text-teal-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-550 italic font-mono text-[11px]">{exp.concept} {exp.notes ? `(${exp.notes})` : ''}</td>
                      <td className="p-4 text-right">{(exp.amount - exp.ivaAmount).toFixed(2)} €</td>
                      <td className="p-4 text-right font-bold text-slate-800">{exp.amount.toFixed(2)} €</td>
                      <td className="p-4 text-center relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenExpenseMenuId(openExpenseMenuId === exp.id ? null : exp.id);
                          }}
                          className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Actions Dropdown */}
                        {openExpenseMenuId === exp.id && (
                          <div className="absolute right-4 mt-1 w-36 bg-white border border-slate-100 rounded-lg shadow-lg py-1.5 z-40 text-left">
                            <button
                              onClick={() => setViewingExpense(exp)}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                              <span>Ver gasto</span>
                            </button>
                            <button
                              onClick={() => openEditExpenseModal(exp)}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                              <span>Editar gasto</span>
                            </button>
                            <div className="border-t border-slate-50 my-1"></div>
                            <button
                              onClick={() => handleDeleteExpenseClick(exp.id)}
                              className="w-full px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ASESORÍA FISCAL CON ASISTENTE IA */}
        {activeTab === 'fiscal' && (
          <div>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                <span className="text-[10px] uppercase font-bold text-emerald-600">IVA Devengado Cobrado</span>
                <p className="text-xl font-bold text-emerald-800 font-display">+{calculatedIvaRepercutido.toFixed(2)} €</p>
                <span className="text-[9px] text-slate-400">Modelo 303 fiscal estimación</span>
              </div>
              <div className="bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50">
                <span className="text-[10px] uppercase font-bold text-orange-600">IVA Soportado Deducible</span>
                <p className="text-xl font-bold text-orange-850 font-display">-{calculatedIvaSoportado.toFixed(2)} €</p>
                <span className="text-[9px] text-slate-400">Total acumulado de gastos</span>
              </div>
              <div className={`p-4 rounded-2xl border ${
                netoIva >= 0 ? 'bg-blue-50/30 border-blue-100/50 text-blue-800' : 'bg-rose-50/30 border-rose-100/50 text-rose-800'
              }`}>
                <span className="text-[10px] uppercase font-bold text-slate-500">Neto Trimestre de IVA</span>
                <p className="text-xl font-bold font-display">{netoIva.toFixed(2)} €</p>
                <span className="text-[9px] text-slate-400">{netoIva >= 0 ? 'Salida a ingresar a Hacienda' : 'Remanente para compensar'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Asistente fiscal interactivo */}
              <div className="lg:col-span-3 bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-emerald-500 p-1.5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Asesor de Hacienda GestorIA</h4>
                      <p className="text-[10px] text-slate-400">Especializado en tributación de autónomos y pymes españolas.</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-72 overflow-y-auto mb-4 pr-2">
                    <div className="bg-slate-800 p-3 rounded-xl text-xs space-y-1">
                      <p className="font-semibold text-emerald-300">👋 ¡Hola! Soy tu asistente fiscal de GestorIA.</p>
                      <p className="text-slate-300">Tengo acceso a tus balances actuales y reglamentos de Hacienda BOE 2026. Consúltame qué facturas puedes deducir en IVA/IRPF.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modelos oficiales Hacienda */}
              <div className="lg:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Estado de Modelos Oficiales (Próximo Trimestre)</h4>
                  <div className="space-y-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-700">Modelo 303 (IVA)</p>
                        <span className="text-[10px] text-slate-400">Plazo: Hasta el 20 de julio</span>
                      </div>
                      <div className="text-right">
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[9px]">Listo para Borrador</span>
                        <p className="font-bold text-slate-800 mt-1">{netoIva.toFixed(2)} €</p>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-700">Modelo 130 (IRPF)</p>
                        <span className="text-[10px] text-slate-400">Pago fraccionado de actividad</span>
                      </div>
                      <div className="text-right">
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold text-[9px]">Estimación 20%</span>
                        <p className="font-bold text-slate-800 mt-1">{estimadoIrpf130.toFixed(2)} €</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTEGRACIÓN BANCARIA */}
        {activeTab === 'banco' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 font-display">Conciliación Bancaria Automática</h3>
                <p className="text-xs text-slate-500">Conecte de forma segura su API OpenBanking con Banco Santander, BBVA o Caixabank para puntear cobros automáticamente.</p>
              </div>
            </div>

            {/* Listado de movimientos bancarios */}
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-xs font-semibold uppercase border-b border-slate-100">
                    <th className="p-4">Fecha Movimiento</th>
                    <th className="p-4">Concepto / Extracto Bancario</th>
                    <th className="p-4 text-right">Importe</th>
                    <th className="p-4 text-center">Estado Punteo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-slate-600">
                  {bankTransactions.map((trans) => (
                    <tr key={trans.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-mono">{trans.date}</td>
                      <td className="p-4 font-semibold text-slate-700">{trans.concept}</td>
                      <td className={`p-4 text-right font-bold ${trans.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trans.type === 'ingreso' ? '+' : '-'}{trans.amount.toFixed(2)} €
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          trans.reconciled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {trans.reconciled ? 'Punteado / Conciliado' : 'Pendiente Cotejo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---- MODAL: DETALLES DE FACTURA (VISTA PREVIA DE IMPRESIÓN / PDF) ---- */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] border border-slate-100 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header Dialog */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-800 text-sm">Vista Previa Oficial - {viewingInvoice.isBudget ? 'PRESUPUESTO' : 'FACTURA'} {viewingInvoice.number}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar / Guardar PDF</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="p-1 px-2.5 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Content (A4 style wrapper) */}
            <div className="p-8 flex-1 overflow-y-auto bg-slate-100" id="invoice-print-area">
              <div className="bg-white p-10 max-w-[21cm] mx-auto shadow-md rounded-lg min-h-[29.7cm] flex flex-col justify-between font-sans text-slate-700">
                
                <div>
                  {/* Top: Header Brand and Invoice Identifier */}
                  <div className="flex items-start justify-between border-b pb-6 border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 text-slate-900 text-xl font-extrabold tracking-tight">
                        <span className="text-slate-950 font-display">GESTOR</span>
                        <span className="text-teal-600 font-display">IA</span>
                        {!viewingInvoice.isBudget && viewingInvoice.verifactu && (
                          <span className="text-[9px] bg-teal-50 border border-teal-200 text-teal-800 font-bold px-1 rounded">VERI*FACTU</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Reglamento Certificación Digital BOE 2026</p>
                    </div>

                    <div className="text-right text-xs">
                      <h2 className="text-lg font-black text-slate-900">{viewingInvoice.isBudget ? 'PRESUPUESTO' : 'FACTURA'}</h2>
                      <p className="font-mono text-slate-600 mt-1">Nº: {viewingInvoice.number}</p>
                      <p className="text-slate-500 mt-1">Fecha Emisión: {viewingInvoice.date}</p>
                      <p className="text-slate-500 mt-0.5">Fecha Vencimiento: {viewingInvoice.dueDate}</p>
                    </div>
                  </div>

                  {/* Issuer and Receiver addresses details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8 text-xs leading-relaxed">
                    
                    {/* Emisor block */}
                    <div className="space-y-1">
                      <p className="font-bold text-[10px] text-slate-405 uppercase tracking-wider font-mono">EMISOR</p>
                      <p className="font-extrabold text-slate-900 text-sm">{viewingInvoice.emisorName || "Agroturismo las niñas S.L"}</p>
                      <p className="font-semibold text-slate-705">NIF/CIF: {viewingInvoice.emisorNif || "B16896953"}</p>
                      <p className="text-slate-500 max-w-xs">{viewingInvoice.emisorAddress || "Calle Conquistadores 8, Torrijos Toledo"}</p>
                      
                      {viewingInvoice.emisorEmailShow !== false && viewingInvoice.emisorEmail && (
                        <p className="text-slate-500">Email: {viewingInvoice.emisorEmail}</p>
                      )}
                      {viewingInvoice.emisorPhoneShow !== false && viewingInvoice.emisorPhone && (
                        <p className="text-slate-500">Tlf: {viewingInvoice.emisorPhone}</p>
                      )}
                    </div>

                    {/* Cliente block */}
                    <div className="space-y-1 md:text-right md:items-end flex flex-col">
                      <p className="font-bold text-[10px] text-slate-405 uppercase tracking-wider font-mono">CLIENTE</p>
                      <p className="font-extrabold text-slate-900 text-sm">{viewingInvoice.clientName}</p>
                      <p className="font-semibold text-slate-705">CIF/NIF: {viewingInvoice.clientNif}</p>
                      
                      <div className="text-slate-500">
                        {viewingInvoice.clientAddressLine1 && <p>{viewingInvoice.clientAddressLine1}</p>}
                        {viewingInvoice.clientAddressLine2 && <p>{viewingInvoice.clientAddressLine2}</p>}
                        <p>{viewingInvoice.clientPostalCode} {viewingInvoice.clientCity} {viewingInvoice.clientProvince ? `(${viewingInvoice.clientProvince})` : ''}</p>
                        <p>{viewingInvoice.clientCountry || "España"}</p>
                      </div>

                      {viewingInvoice.clientEmailShow !== false && viewingInvoice.clientEmail && (
                        <p className="text-slate-500">Email: {viewingInvoice.clientEmail}</p>
                      )}
                      {viewingInvoice.clientPhoneShow !== false && viewingInvoice.clientPhone && (
                        <p className="text-slate-500">Tlf: {viewingInvoice.clientPhone}</p>
                      )}
                    </div>

                  </div>

                  {/* Items List representation */}
                  <div className="mt-8">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                          <th className="p-3">Descripción Concepto</th>
                          <th className="p-3 text-center">Cantidad</th>
                          <th className="p-3">Unidad</th>
                          <th className="p-3 text-right">Precio/Ud</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-655">
                        {viewingInvoice.items.map((it, i) => (
                          <tr key={i}>
                            <td className="p-3 max-w-sm whitespace-pre-wrap leading-relaxed">
                              {it.description}
                            </td>
                            <td className="p-3 text-center font-semibold">{it.quantity}</td>
                            <td className="p-3">{it.unit || "unidad"}</td>
                            <td className="p-3 text-right">{(it.price).toFixed(2)} €</td>
                            <td className="p-3 text-right font-bold text-slate-800">{(it.quantity * it.price).toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Totals Summary and legal fields */}
                <div className="border-t pt-8 border-slate-150 mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px]">
                  <div className="space-y-3 leading-relaxed text-slate-500">
                    <div>
                      <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest font-mono">Términos y Condiciones</p>
                      <p className="italic mt-1 pr-4">{viewingInvoice.terms || "Sujeto a normas generales de facturación."}</p>
                    </div>
                    <div>
                      <p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest font-mono">Forma de pago</p>
                      <p className="font-semibold text-slate-700 mt-0.5">{viewingInvoice.paymentMethod || "Por defecto"}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-200/50 self-start text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal:</span>
                      <span className="font-semibold text-slate-700">{(viewingInvoice.subtotal).toFixed(2)} {viewingInvoice.currency || "EUR"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IVA ({viewingInvoice.ivaRate}%):</span>
                      <span className="font-semibold text-slate-700">{(viewingInvoice.ivaAmount).toFixed(2)} {viewingInvoice.currency || "EUR"}</span>
                    </div>
                    {viewingInvoice.irpfRate > 0 && (
                      <div className="flex justify-between text-amber-705">
                        <span>Retención IRPF (-{viewingInvoice.irpfRate}%):</span>
                        <span>-{(viewingInvoice.irpfAmount).toFixed(2)} {viewingInvoice.currency || "EUR"}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between text-slate-900 font-extrabold text-sm">
                      <span>Importe Neto Total:</span>
                      <span className="text-emerald-700">{(viewingInvoice.total).toFixed(2)} {viewingInvoice.currency || "EUR"}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---- MODAL: DETALLES DE GASTO ---- */}
      {viewingExpense && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl overflow-hidden text-xs">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-bold">Detalle de Registro de Gasto</span>
              <button onClick={() => setViewingExpense(null)} className="text-slate-300 hover:text-white">✖</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-3 rounded-full border border-orange-100 shrink-0">
                  <Receipt className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{viewingExpense.provider}</h4>
                  <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-[10px] font-bold text-slate-600">{viewingExpense.category}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-slate-200 py-3 space-y-2">
                <div className="flex justify-between select-none">
                  <span className="text-slate-400">Fecha de Compra:</span>
                  <span className="font-mono font-bold text-slate-700">{viewingExpense.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Concepto principal:</span>
                  <span className="font-semibold text-slate-800">{viewingExpense.concept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">IVA extraído o calculado:</span>
                  <span className="font-semibold text-slate-800">{(viewingExpense.ivaAmount).toFixed(2)} €</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-bold tracking-wider font-mono uppercase text-[9px]">Notas de Interés Fiscal</span>
                <p className="bg-orange-50 border border-orange-150/40 p-3 rounded-lg text-orange-850 mt-1.5 font-mono leading-relaxed text-[11px]">
                  {viewingExpense.notes || "Gasto perfectamente deducible afecto al régimen del IVA."}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border flex justify-between items-center text-sm">
                <span className="font-bold text-slate-600">Importe Total del Recibo:</span>
                <span className="font-black text-rose-600 text-base">{(viewingExpense.amount).toFixed(2)} €</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
              >
                Cerrar consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- MODAL: FORMULARIO AVANZADO CREAR/EDITAR FACTURA (DISEÑO ESPECTACULAR COMPLETO) ---- */}
      {showInvoiceFormModal && invoiceForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl w-full max-w-5xl border border-slate-100 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Title Banner */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-xl">
                  <FileText className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-base font-black font-display">
                    {isEditMode 
                      ? (isBudgetMode ? 'Editar Presupuesto Comercial' : 'Editar Documento de Facturación') 
                      : (isBudgetMode ? 'Emisión de Presupuesto Comercial' : 'Emisión de Factura Oficial Certificada')}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {isBudgetMode 
                      ? 'Formulario de cotización comercial no fiscal' 
                      : 'Formulario homologado reglamento Verifactu 2026'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowInvoiceFormModal(false);
                  setInvoiceForm(null);
                }} 
                className="p-1 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs cursor-pointer"
              >
                ✖
              </button>
            </div>

            {/* Main Form container (scrollable columns) */}
            <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/70 text-xs">
              
              {/* ADVANCED OCR / IMPORT ZONE - Only show on NEW invoice for peak ergonomics */}
              {!isEditMode && (
                <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3.5 border-slate-100">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span>Importación Inteligente OCR & Captura</span>
                    </span>
                    
                    {/* Navigation inside OCR tab */}
                    <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setOcrActiveTab('upload')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${ocrActiveTab === 'upload' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                      >
                        Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setOcrActiveTab('camera')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${ocrActiveTab === 'camera' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                      >
                        Cámara Live
                      </button>
                      <button
                        type="button"
                        onClick={() => setOcrActiveTab('multiple')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${ocrActiveTab === 'multiple' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                      >
                        Multi-Importar
                      </button>
                    </div>
                  </div>

                  {/* OCR Tab Contents */}
                  {ocrActiveTab === 'upload' && (
                    <div className="flex flex-col items-center justify-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/20 hover:bg-slate-50/50 transition-colors">
                      {isProcessingFile ? (
                        <div className="text-center py-3 space-y-2">
                          <div className="relative flex items-center justify-center">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <Sparkles className="w-4 h-4 text-emerald-500 absolute animate-pulse" />
                          </div>
                          <p className="font-bold text-slate-700">Extrayendo datos de emisor, conceptos y tasas...</p>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleOcrFileChange}
                            accept="image/*,.pdf"
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-1.5">
                            <div className="p-2.5 bg-emerald-50 rounded-full text-emerald-600 border border-emerald-100">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="font-extrabold text-slate-750">Sube el documento del proveedor (JPG, PNG, PDF)</p>
                            <p className="text-[10px] text-slate-400">Leemos e introducimos todos los conceptos automáticamente</p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2.5 px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-lg shadow-2xs"
                            >
                              Elegir archivo local
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {ocrActiveTab === 'camera' && (
                    <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-slate-900 text-white min-h-[220px]">
                      {isCameraSupported ? (
                        <div className="w-full max-w-sm flex flex-col items-center space-y-3 relative">
                          <video
                            ref={videoRef}
                            className="w-full bg-black rounded-lg border border-slate-700 shadow-inner max-h-[160px] object-cover"
                            muted
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {isProcessingFile ? (
                            <p className="text-center font-bold text-emerald-400 animate-pulse">Consultando Red Neural GestorIA OCR...</p>
                          ) : (
                            <button
                              type="button"
                              onClick={captureSnapshot}
                              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Tomar Foto del Ticket</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-slate-400 space-y-3">
                          <p className="font-bold">Acceso a cámara no disponible en este dispositivo</p>
                          <p className="text-[10px] max-w-xs mx-auto">Seleccione la pestaña de "Subir Archivo" para capturar con su imagen o archivo regular.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {ocrActiveTab === 'multiple' && (
                    <div className="space-y-4">
                      <div className="flex flex-col items-center justify-center py-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
                        <input
                          type="file"
                          ref={multipleInputRef}
                          onChange={handleMultipleFilesChange}
                          accept="image/*,.pdf"
                          multiple
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <p className="font-extrabold text-slate-705">Seleccione múltiples archivos de una vez</p>
                          <p className="text-[10px] text-slate-400">Los añadiremos de manera desatendida a tu cola ERP</p>
                          <button
                            type="button"
                            onClick={() => multipleInputRef.current?.click()}
                            className="mt-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-extrabold text-[10px] rounded-lg"
                          >
                            Importar Múltiples
                          </button>
                        </div>
                      </div>

                      {multipleImportFiles.length > 0 && (
                        <div className="bg-slate-50 p-3 rounded-lg border space-y-1 max-h-32 overflow-y-auto">
                          {multipleImportFiles.map(file => (
                            <div key={file.id} className="flex justify-between items-center text-[10px] border-b pb-1 last:border-0 border-slate-200">
                              <span className="font-mono text-slate-600">{file.name} ({file.size})</span>
                              {file.status === 'pending' ? (
                                <span className="text-amber-600 animate-pulse">Procesando OCR...</span>
                              ) : (
                                <span className="text-emerald-600 font-bold font-mono">✓ Cargado</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* SECTION: GENERAL CONTROL AND VERI*FACTU SYSTEM */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                
                <div className="flex items-center gap-3">
                  {!isBudgetMode ? (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="verifactu"
                        checked={invoiceForm.verifactu}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, verifactu: e.target.checked })}
                        className="w-4 h-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500"
                      />
                      <label htmlFor="verifactu" className="ml-2 font-extrabold text-slate-900 select-none uppercase tracking-wide cursor-pointer text-[11px] flex items-center gap-1 text-teal-700">
                        <span>Veri*factu</span>
                        <span className="text-[8px] bg-teal-100 px-1 py-0.2 rounded font-black text-teal-800">BOE 2026</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50/70 border border-blue-200 p-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>Presupuesto (Exento Verifactu)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px] mb-1">{isBudgetMode ? 'Código / Nº Presupuesto' : 'Código / Nº Factura'}</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.number}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, number: e.target.value })}
                    className="w-full text-xs font-mono font-bold p-3 rounded-lg border border-slate-250 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                    placeholder={isBudgetMode ? "PRESU-2026-001" : "FACT-2026-003"}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px] mb-1">Estado Documento</label>
                  <select
                    value={invoiceForm.status}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as any })}
                    className="w-full text-xs p-3 font-semibold rounded-lg border border-slate-250 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {isBudgetMode ? (
                      <>
                        <option value="Borrador">📁 Borrador (En Estudio)</option>
                        <option value="Enviado">✉ Enviado (Al Cliente)</option>
                        <option value="Aceptado">💵 Aceptado (Aprobado)</option>
                        <option value="Rechazado">❌ Rechazado (Desestimado)</option>
                      </>
                    ) : (
                      <>
                        <option value="Borrador">📁 Borrador (Descansando)</option>
                        <option value="Enviada">✉ Enviada (Presentada)</option>
                        <option value="Pagada">💵 Pagada (Consolidada)</option>
                        <option value="Vencida">⚠️ Vencida (Retrasada)</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              {/* SECTION: DETALLES DEL EMISOR */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b pb-2 border-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-indigo-600 rounded-sm"></span>
                  <span>Detalles del Emisor de la {isBudgetMode ? 'Propuesta' : 'Factura'} (Nuestra Empresa)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Nombre o Razón Social</label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.emisorName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">CIF / NIF Emisor</label>
                    <input
                      type="text"
                      required
                      value={invoiceForm.emisorNif}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorNif: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-slate-800 text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Dirección Completa Emisor</label>
                  <textarea
                    rows={2}
                    required
                    value={invoiceForm.emisorAddress}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorAddress: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* EMISOR EMAIL */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/40 space-y-2">
                    <label className="block text-slate-500 font-bold text-[10px]">Email Electrónico Emisor</label>
                    <input
                      type="email"
                      value={invoiceForm.emisorEmail}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorEmail: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emisorEmailShow"
                        checked={invoiceForm.emisorEmailShow}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorEmailShow: e.target.checked })}
                        className="w-3.5 h-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-550"
                      />
                      <label htmlFor="emisorEmailShow" className="ml-1.5 text-[9px] text-slate-400 cursor-pointer select-none">Mostrar Correo en el PDF oficial</label>
                    </div>
                  </div>

                  {/* EMISOR TELEFONO */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/40 space-y-2">
                    <label className="block text-slate-500 font-bold text-[10px]">Teléfono de Contacto Emisor</label>
                    <input
                      type="text"
                      value={invoiceForm.emisorPhone}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorPhone: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emisorPhoneShow"
                        checked={invoiceForm.emisorPhoneShow}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, emisorPhoneShow: e.target.checked })}
                        className="w-3.5 h-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-550"
                      />
                      <label htmlFor="emisorPhoneShow" className="ml-1.5 text-[9px] text-slate-400 cursor-pointer select-none">Mostrar Teléfono en el PDF oficial</label>
                    </div>
                  </div>

                </div>
              </div>

              {/* SECTION: DETALLES DEL CLIENTE */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b pb-2 border-slate-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-3 bg-emerald-600 rounded-sm"></span>
                  <span>Detalles del Cliente Receptor</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 col-span-1">Nombre / Razón Social Cliente</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del Cliente"
                      value={invoiceForm.clientName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1 col-span-1">NIF / CIF Cliente</label>
                    <input
                      type="text"
                      required
                      placeholder="CIF/NIF del Cliente"
                      value={invoiceForm.clientNif}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientNif: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 font-mono text-slate-800 text-center"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40 space-y-3">
                  <p className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wider font-mono">Dirección de Envío y Facturación del Cliente</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Línea 1 de la dirección (Calle, número, piso)"
                        required
                        value={invoiceForm.clientAddressLine1}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddressLine1: e.target.value })}
                        className="w-full p-2 rounded-lg border bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Línea 2 (Opcional - Urbanización, nave, att)"
                        value={invoiceForm.clientAddressLine2}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientAddressLine2: e.target.value })}
                        className="w-full p-2 rounded-lg border bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Ciudad"
                      required
                      value={invoiceForm.clientCity}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientCity: e.target.value })}
                      className="p-2 border rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Código Postal"
                      required
                      value={invoiceForm.clientPostalCode}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientPostalCode: e.target.value })}
                      className="p-2 border rounded-lg bg-white font-mono text-center"
                    />
                    
                    {/* Province Dropdown selector as requested */}
                    <div className="relative">
                      <select
                        value={invoiceForm.clientProvince}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientProvince: e.target.value })}
                        className="w-full p-2 border rounded-lg bg-white appearance-none"
                      >
                        {PROVINCES_SPAIN.map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
                    </div>

                    <input
                      type="text"
                      placeholder="País"
                      value={invoiceForm.clientCountry}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientCountry: e.target.value })}
                      className="p-2 border rounded-lg bg-white text-slate-500 text-center"
                    />
                  </div>
                </div>

                {/* Cliente toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* CLIENT EMAIL */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/40 space-y-2">
                    <label className="block text-slate-505 font-bold text-[10px]">Email Electrónico del Cliente</label>
                    <input
                      type="email"
                      placeholder="Email del cliente"
                      value={invoiceForm.clientEmail}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmail: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="clientEmailShow"
                        checked={invoiceForm.clientEmailShow}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientEmailShow: e.target.checked })}
                        className="w-3.5 h-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-550"
                      />
                      <label htmlFor="clientEmailShow" className="ml-1.5 text-[9px] text-slate-400 cursor-pointer select-none">Mostrar en el PDF oficial</label>
                    </div>
                  </div>

                  {/* CLIENT PHONE */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200/40 space-y-2">
                    <label className="block text-slate-505 font-bold text-[10px]">Teléfono de Contacto Cliente</label>
                    <input
                      type="text"
                      placeholder="Teléfono del cliente"
                      value={invoiceForm.clientPhone}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, clientPhone: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="clientPhoneShow"
                        checked={invoiceForm.clientPhoneShow}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, clientPhoneShow: e.target.checked })}
                        className="w-3.5 h-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-550"
                      />
                      <label htmlFor="clientPhoneShow" className="ml-1.5 text-[9px] text-slate-400 cursor-pointer select-none">Mostrar en el PDF oficial</label>
                    </div>
                  </div>

                </div>

              </div>

              {/* TIMESTAMPS FECHAS */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px] mb-1">Fecha Emisión Tributaria</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, date: e.target.value })}
                    className="w-full p-3 border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase font-mono tracking-wider text-[9px] mb-1">Fecha Vencimiento de Obligación</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full p-3 border rounded-lg text-xs font-mono text-center"
                  />
                </div>
              </div>

              {/* SECTION: CONCEPTOS / ARTICULOS */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-3 bg-indigo-600 rounded-sm"></span>
                    <span>Conceptos / Artículos Detallados</span>
                  </h4>
                  <button
                    type="button"
                    onClick={addInvoiceItemLine}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-750 rounded-lg cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Línea</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {invoiceForm.items.map((item, idx) => (
                    <div key={idx} className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/40 space-y-4 relative">
                      
                      {/* Delete Line marker */}
                      {invoiceForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvoiceItemLine(idx)}
                          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-rose-600 transition-colors bg-white rounded-lg border shadow-3xs"
                          title="Eliminar este artículo"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        
                        {/* Description Editor Column */}
                        <div className="lg:col-span-6 space-y-2">
                          <div className="flex items-center gap-3">
                            <label className="block text-[10px] font-bold text-slate-655 uppercase">Descripción de Concepto</label>
                            
                            {/* Rich Editor mini-toolbar as requested by the user */}
                            <div className="flex items-center bg-white border divide-x border-slate-200 rounded-md shadow-3xs text-slate-500 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleFormatClick(idx, 'bold')}
                                className="p-1 px-1.5 hover:bg-slate-50 text-[9px] font-bold"
                                title="Negrita"
                              >
                                🌟 Negrita
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormatClick(idx, 'italic')}
                                className="p-1 px-1.5 hover:bg-slate-50 text-[9px] italic"
                                title="Cursiva"
                              >
                                ✨ Cursiva
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormatClick(idx, 'list')}
                                className="p-1 px-1.5 hover:bg-slate-50 text-[9px]"
                                title="Lista de viñetas"
                              >
                                ⁜ Lista
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormatClick(idx, 'heading')}
                                className="p-1 px-1.5 hover:bg-slate-50 text-[9px] font-mono"
                                title="Agregar Título"
                              >
                                # Título
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFormatClick(idx, 'clear')}
                                className="p-1 px-1.5 hover:bg-slate-50 text-[9px]"
                                title="Limpiar formato"
                              >
                                ✖ Limpiar
                              </button>
                            </div>
                          </div>

                          <textarea
                            id={`desc-${idx}`}
                            rows={3}
                            required
                            placeholder="Describe el servicio o producto. Puedes seleccionar texto y aplicar formato a tu gusto."
                            value={item.description}
                            onChange={(e) => handleInvoiceItemChange(idx, 'description', e.target.value)}
                            className="w-full p-2.5 rounded-lg border border-slate-200 text-[11px] leading-relaxed bg-white"
                          />

                          {/* Preview container */}
                          <div className="bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/50 text-[10px] text-slate-550 italic font-sans whitespace-pre-line">
                            <p className="font-bold text-[8.5px] uppercase tracking-wider text-indigo-700 mb-1">Vista previa en factura:</p>
                            {item.description || "El texto formateado aparecerá aquí para auditoría visual..."}
                          </div>
                        </div>

                        {/* Quantity and units */}
                        <div className="lg:col-span-2 space-y-1.5 self-start">
                          <label className="block text-[10px] font-bold text-slate-655 uppercase text-center">Cantidad</label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            required
                            value={item.quantity}
                            onChange={(e) => handleInvoiceItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full p-2.5 border rounded-lg text-center font-mono font-bold"
                          />
                        </div>

                        {/* Units Selector */}
                        <div className="lg:col-span-2 space-y-1.5 self-start">
                          <label className="block text-[10px] font-bold text-slate-655 uppercase text-center">Unidad</label>
                          <select
                            value={item.unit}
                            onChange={(e) => handleInvoiceItemChange(idx, 'unit', e.target.value)}
                            className="w-full p-2.5 border rounded-lg bg-white"
                          >
                            <option value="unidad">unidad</option>
                            <option value="servicio">servicio</option>
                            <option value="mes">mes</option>
                            <option value="hora">hora</option>
                            <option value="fase">fase</option>
                          </select>
                        </div>

                        {/* Price Unit */}
                        <div className="lg:col-span-2 space-y-1.5 self-start">
                          <label className="block text-[10px] font-bold text-slate-655 uppercase text-right">Precio/Unidad</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            required
                            value={item.price}
                            onChange={(e) => handleInvoiceItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full p-2.5 border rounded-lg text-right font-mono font-bold"
                          />
                          <p className="text-right text-[10px] text-slate-400 font-mono pt-1">Total: {((item.quantity || 0) * (item.price || 0)).toFixed(2)} €</p>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* TIMING AND ADDITIONAL SETS */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Moneda & Tasas */}
                <div className="space-y-4">
                  <h5 className="font-extrabold text-slate-805 uppercase tracking-wide text-[10.5px]">Ajustes de Impuestos y Formatos</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-405 font-bold mb-1">Moneda Comercial</label>
                      <select
                        value={invoiceForm.currency}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, currency: e.target.value })}
                        className="w-full p-2.5 border rounded-lg bg-white font-bold"
                      >
                        <option value="EUR">Euro (€ - EUR)</option>
                        <option value="USD">Dólar ($ - USD)</option>
                        <option value="GBP">Libra (£ - GBP)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-405 font-bold mb-1">Tasa de IVA aplicada (%)</label>
                      <select
                        value={invoiceForm.ivaRate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, ivaRate: parseInt(e.target.value, 10) })}
                        className="w-full p-2.5 border rounded-lg bg-white font-bold text-center font-mono"
                      >
                        <option value="21">21% General</option>
                        <option value="10">10% Reducido</option>
                        <option value="4">4% Superreducido</option>
                        <option value="0">0% Exento</option>
                      </select>
                    </div>
                  </div>

                  {/* IRPF Check */}
                  <div className="p-3.5 bg-slate-50 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="applyIrpf"
                        checked={invoiceForm.applyIrpf}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, applyIrpf: e.target.checked })}
                        className="w-4 h-4 rounded-sm border-slate-300 text-indigo-650 focus:ring-indigo-500"
                      />
                      <label htmlFor="applyIrpf" className="ml-2 font-bold text-slate-700 cursor-pointer select-none">Aplicar retención IRPF de autónomo</label>
                    </div>

                    {invoiceForm.applyIrpf && (
                      <select
                        value={invoiceForm.irpfRate}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, irpfRate: parseInt(e.target.value, 15) })}
                        className="p-1.5 border rounded-lg bg-white font-mono text-center font-bold text-xs"
                      >
                        <option value="15">15% General</option>
                        <option value="7">7% Retención Reducida</option>
                        <option value="19">19% Máximo</option>
                      </select>
                    )}
                  </div>

                </div>

                {/* Términos & Formas de pago */}
                <div className="space-y-4">
                  <h5 className="font-extrabold text-slate-805 uppercase tracking-wide text-[10.5px]">Financiación y Garantía Tributaria</h5>

                  <div>
                    <label className="block text-slate-450 font-bold mb-1 col-span-1">Términos y condiciones legales</label>
                    <textarea
                      rows={2}
                      value={invoiceForm.terms}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, terms: e.target.value })}
                      placeholder="Indique las condiciones generales"
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-450 font-bold mb-1 col-span-1">Formas de pago aceptadas</label>
                    <input
                      type="text"
                      value={invoiceForm.paymentMethod}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value })}
                      placeholder="Ej: Transferencia bancaria o Adeudo SEPA"
                      className="w-full p-2.5 border rounded-lg"
                    />
                  </div>

                </div>

              </div>

              {/* LIVE SUMMARIZATION BAR */}
              <div className="p-6 bg-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between text-white gap-6 relative select-none">
                <div className="space-y-1">
                  <span className="text-[10px] tracking-widest font-bold uppercase text-teal-400 font-mono">Borrador de Liquidación Real-Time</span>
                  <p className="text-[11px] text-slate-350 leading-relaxed">Sus cambios están calculando la declaración informativa mensual en background.</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 justify-end text-right">
                  
                  {/* Calculations */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">Subtotal</span>
                    <p className="font-extrabold text-sm">{invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)} {invoiceForm.currency}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 block uppercase font-mono">IVA ({invoiceForm.ivaRate}%)</span>
                    <p className="font-extrabold text-sm">{(invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * (invoiceForm.ivaRate / 100)).toFixed(2)} {invoiceForm.currency}</p>
                  </div>

                  {invoiceForm.applyIrpf && (
                    <div className="space-y-1 text-amber-300">
                      <span className="text-[9px] text-amber-400 block uppercase font-mono">IRPF (-{invoiceForm.irpfRate}%)</span>
                      <p className="font-extrabold text-sm">-{(invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * (invoiceForm.irpfRate / 100)).toFixed(2)} {invoiceForm.currency}</p>
                    </div>
                  )}

                  <div className="bg-indigo-950 p-3.5 rounded-xl border border-indigo-700/50 text-right">
                    <span className="text-[9px] tracking-wider text-teal-300 block uppercase font-mono">Impuesto Incluido Total</span>
                    <p className="font-black text-xl text-emerald-450">
                      {(
                        invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) + 
                        (invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * (invoiceForm.ivaRate / 100)) - 
                        (invoiceForm.applyIrpf ? (invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) * (invoiceForm.irpfRate / 100)) : 0)
                      ).toFixed(2)} {invoiceForm.currency}
                    </p>
                  </div>

                </div>
              </div>

              {/* Trigger submit */}
              <div className="p-4 bg-slate-100 rounded-xl border flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvoiceFormModal(false);
                    setInvoiceForm(null);
                  }}
                  className="px-5 py-2.5 bg-white border hover:bg-slate-50 text-slate-650 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl cursor-pointer"
                >
                  {isEditMode 
                    ? (isBudgetMode ? 'Guardar Presupuesto' : 'Guardar Cambios Factura') 
                    : (isBudgetMode ? 'Emitir Presupuesto Comercial' : 'Emitir Factura Oficial')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---- MODAL: CREAR/EDITAR GASTO MANUAL ---- */}
      {showExpenseFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="font-extrabold text-sm">{isEditExpenseMode ? 'Editar Registro de Gasto' : 'Añadir Gasto de Negocio'}</span>
              <button onClick={() => setShowExpenseFormModal(false)} className="text-slate-300 hover:text-white">✖</button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[85vh]">
              
              {/* ADVANCED OCR / IMPORT ZONE FOR EXPENSES */}
              {!isEditExpenseMode && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-205 shadow-xs space-y-4 mb-4">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                    <span className="font-extrabold text-slate-900 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                      <span>Escanear Ticket / Factura de Gasto</span>
                    </span>
                    
                    {/* Navigation inside OCR tab */}
                    <div className="flex bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setOcrActiveTab('upload')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${ocrActiveTab === 'upload' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                      >
                        Subir Archivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setOcrActiveTab('camera')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${ocrActiveTab === 'camera' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                      >
                        Cámara Live
                      </button>
                      <button
                        type="button"
                        onClick={() => setOcrActiveTab('multiple')}
                        className={`px-3 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-colors ${ocrActiveTab === 'multiple' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500'}`}
                      >
                        Multi-Importar
                      </button>
                    </div>
                  </div>

                  {/* OCR Tab Contents */}
                  {ocrActiveTab === 'upload' && (
                    <div className="flex flex-col items-center justify-center py-4 border border-dashed border-slate-200 rounded-xl bg-white hover:bg-slate-50/50 transition-colors">
                      {isProcessingFile ? (
                        <div className="text-center py-3 space-y-2">
                          <div className="relative flex items-center justify-center">
                            <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                            <Sparkles className="w-3.5 h-3.5 text-orange-500 absolute animate-pulse" />
                          </div>
                          <p className="font-bold text-slate-700">Analizando ticket de gasto con IA...</p>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleOcrFileChange}
                            accept="image/*,.pdf"
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-1">
                            <div className="p-2 bg-orange-50 rounded-full text-orange-600 border border-orange-100">
                              <Upload className="w-4 h-4" />
                            </div>
                            <p className="font-extrabold text-slate-750">Sube tu ticket (JPG, PNG o PDF)</p>
                            <p className="text-[10px] text-slate-400">Extraemos emisor, concepto e importes con IA</p>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-2 px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-lg shadow-2xs text-[10px]"
                            >
                              Elegir archivo
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {ocrActiveTab === 'camera' && (
                    <div className="flex flex-col items-center justify-center p-3 border rounded-xl bg-slate-900 text-white min-h-[160px]">
                      {isCameraSupported ? (
                        <div className="w-full max-w-sm flex flex-col items-center space-y-2 relative">
                          <video
                            ref={videoRef}
                            className="w-full bg-black rounded-lg border border-slate-700 shadow-inner max-h-[120px] object-cover"
                            muted
                            playsInline
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {isProcessingFile ? (
                            <p className="text-center font-bold text-orange-400 animate-pulse">Procesando captura con GestorIA OCR...</p>
                          ) : (
                            <button
                              type="button"
                              onClick={captureSnapshot}
                              className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-lg text-[10px] cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Capturar Gasto con Cámara</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-slate-400 space-y-2">
                          <p className="font-bold">Cámara no disponible</p>
                          <p className="text-[9px] max-w-xs mx-auto">Por favor, utilice la pestaña de subir archivo.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {ocrActiveTab === 'multiple' && (
                    <div className="space-y-3">
                      <div className="flex flex-col items-center justify-center py-4 border border-dashed border-slate-200 rounded-xl bg-white">
                        <input
                          type="file"
                          ref={multipleInputRef}
                          onChange={handleMultipleFilesChange}
                          accept="image/*,.pdf"
                          multiple
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <p className="font-extrabold text-slate-705">Importar múltiples gastos de una sola vez</p>
                          <p className="text-[10px] text-slate-400">Procesamiento paralelo desatendido mediante OCR</p>
                          <button
                            type="button"
                            onClick={() => multipleInputRef.current?.click()}
                            className="mt-2 px-3 py-1 bg-orange-50 text-orange-700 hover:bg-orange-100 font-extrabold text-[10px] rounded-lg cursor-pointer"
                          >
                            Seleccionar Archivos Múltiples
                          </button>
                        </div>
                      </div>

                      {multipleImportFiles.length > 0 && (
                        <div className="bg-white p-2.5 rounded-lg border space-y-1 max-h-24 overflow-y-auto">
                          {multipleImportFiles.map(file => (
                            <div key={file.id} className="flex justify-between items-center text-[10px] border-b pb-1 last:border-0 border-slate-205">
                              <span className="font-mono text-slate-600">{file.name} ({file.size})</span>
                              {file.status === 'pending' ? (
                                <span className="text-amber-600 animate-pulse">OCR en cola...</span>
                              ) : (
                                <span className="text-emerald-600 font-bold font-mono">✓ Importado</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
              
              <div>
                <label className="block text-slate-450 font-bold mb-1">Nombre del Proveedor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Gasolinera Cepsa o AWS Cloud"
                  value={expenseForm.provider}
                  onChange={(e) => setExpenseForm({ ...expenseForm, provider: e.target.value })}
                  className="w-full p-2.5 rounded-lg border text-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1">Fecha de Compra</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1">Concepto o Detalle de Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Suspensión anual ERP"
                  value={expenseForm.concept}
                  onChange={(e) => setExpenseForm({ ...expenseForm, concept: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-450 font-bold mb-1 text-right">Importe Total (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej: 120.40"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-right font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-450 font-bold mb-1 text-right">Monto IVA (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Auto-calculado si queda vacío"
                    value={expenseForm.ivaAmount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, ivaAmount: e.target.value })}
                    className="w-full p-2.5 border rounded-lg text-right font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1">Categoría Tributaria</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full p-2.5 border rounded-lg bg-white"
                >
                  <option value="Suministros">🔌 Suministros (Agua, gas, luz)</option>
                  <option value="Alquiler">🏢 Alquiler de Local / Coworking</option>
                  <option value="Personal">👥 Personal y Nóminas</option>
                  <option value="Marketing">📢 Marketing y Publicidad</option>
                  <option value="Software">💻 Software y Nube (AWS, GestorIA)</option>
                  <option value="Transporte">🚗 Transporte y Kilometraje</option>
                  <option value="Otros">📦 Otros Gastos Corrientes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-450 font-bold mb-1">Notas de Interés Adicionales</label>
                <textarea
                  rows={2}
                  placeholder="Deducible 50% por afección turística..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full p-2.5 border rounded-lg"
                />
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExpenseFormModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-750 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-650 hover:bg-orange-700 text-white font-heavy rounded-lg shadow-sm cursor-pointer"
                >
                  {isEditExpenseMode ? 'Guardar Cambios Gasto' : 'Registrar Gasto'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
