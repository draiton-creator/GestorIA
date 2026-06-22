import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Calendar, 
  Video, 
  HardDrive, 
  FileSpreadsheet, 
  FileText, 
  Send, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  UserCheck,
  Building
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Invoice, Expense, Project, Task, CRMContact } from '../types';

interface IntegracionesWorkspaceProps {
  currentUser: User | null;
  workspaceToken: string | null;
  onConnectWorkspace: () => Promise<void>;
  onDisconnectWorkspace?: () => void;
  invoices: Invoice[];
  expenses: Expense[];
  projects: Project[];
  tasks: Task[];
  crmContacts: CRMContact[];
  companyName: string;
}

export default function IntegracionesWorkspace({
  currentUser,
  workspaceToken,
  onConnectWorkspace,
  onDisconnectWorkspace,
  invoices,
  expenses,
  projects,
  tasks,
  crmContacts,
  companyName
}: IntegracionesWorkspaceProps) {
  // Tabs activos: 'gmail' | 'calendar' | 'drive' | 'sheets' | 'docs' | 'meet'
  const [activeTab, setActiveTab] = useState<'gmail' | 'calendar' | 'drive' | 'sheets' | 'docs' | 'meet'>('gmail');
  
  // Estados para datos de las APIs
  const [emails, setEmails] = useState<any[]>([]);
  const [isAnalyzingEmails, setIsAnalyzingEmails] = useState(false);
  const [emailAnalyses, setEmailAnalyses] = useState<Record<string, { priority: string; category: string; summary: string; actionItem: string }>>({});
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [driveFiles, setDriveFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Formulario Gmail
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Formulario Evento Calendar o Meet
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00');
  const [eventDuration, setEventDuration] = useState('60'); // en minutos
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [generatedMeetLink, setGeneratedMeetLink] = useState<string | null>(null);

  // Auto-llenado para emails/docs
  const [selectedInvoiceForExport, setSelectedInvoiceForExport] = useState<string>('');

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (apiError) {
      const timer = setTimeout(() => setApiError(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [apiError]);

  // Cargar datos reales si poseemos token, si no usaremos hermosos Mock adaptados en tiempo real
  useEffect(() => {
    if (workspaceToken) {
      fetchGmailMessages();
      fetchCalendarEvents();
      fetchDriveFiles();
    } else {
      // Cargar mock data inicial si no está conectado
      loadMockData();
    }
  }, [workspaceToken]);

  // Creador de datos mock informativos para previsualización impecable
  const [mockEmails, setMockEmails] = useState<any[]>([]);
  const [mockEvents, setMockEvents] = useState<any[]>([]);
  const [mockFiles, setMockFiles] = useState<any[]>([]);

  const loadMockData = () => {
    setMockEmails([
      {
        id: 'mock-1',
        from: 'Agencia Tributaria <no-reply@aeat.es>',
        subject: '🚀 Notificación de Presentación de Autoliquidación Trimestral conforme IVA',
        date: 'Hoy, 10:45',
        snippet: 'Estimado contribuyente, le informamos que el Modelo 303 de IVA del Trimestre actual ha quedado registrado correctamente en sede electrónica...'
      },
      {
        id: 'mock-2',
        from: 'Banc Sabadell Empresas <soporte@bancsabadell.com>',
        subject: '🏦 Confirmación de Pago de Factura - GestorIA ERP Sync',
        date: 'Ayer, 18:20',
        snippet: 'Le confirmamos la transferencia en concepto de Facturas de Proveedores Emitidas por valor de 4,500.00 EUR con total abono en cuenta...'
      },
      {
        id: 'mock-3',
        from: 'Suministros Industriales S.L. <ventas@suministroslapeñes.es>',
        subject: '⚠️ Factura Pendiente de Envío y Firma Digital',
        date: '18 Jun, 12:15',
        snippet: 'Adjunto enviamos el archivo de presupuestos consolidado para la adecuación de vuestro proyecto energético. Agradecemos su validación...'
      }
    ]);

    setMockEvents([
      {
        id: 'mock-ev-1',
        summary: '📞 Auditoría Trimestral IVA GestorIA',
        description: 'Reunión con el Asesor de GestorIA para validar tickets deducibles e impuestos calculados para el Modelo 130 y 303.',
        start: { dateTime: `${new Date().toISOString().split('T')[0]}T11:00:00+02:00` },
        end: { dateTime: `${new Date().toISOString().split('T')[0]}T12:00:00+02:00` },
        meetLink: 'https://meet.google.com/abc-defg-hij'
      },
      {
        id: 'mock-ev-2',
        summary: '💼 Cierre de Presupuesto con Cliente S.L.',
        description: 'Repaso final sobre operaciones, cobro y facturas en euros pendientes de procesar.',
        start: { dateTime: `${new Date(Date.now() + 86400000).toISOString().split('T')[0]}T16:30:00+02:00` },
        end: { dateTime: `${new Date(Date.now() + 86400000).toISOString().split('T')[0]}T17:30:00+02:00` },
        meetLink: 'https://meet.google.com/xyz-uvwx-yza'
      }
    ]);

    setMockFiles([
      {
        id: 'mock-fl-1',
        name: '📁 Gastos_Deducibles_Q2_Organizado.xlsx',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        modifiedTime: 'Hace 2 horas',
        webViewLink: 'https://docs.google.com/spreadsheets'
      },
      {
        id: 'mock-fl-2',
        name: '📄 Informe_Auditoria_Fiscal_Consolidada.docx',
        mimeType: 'application/vnd.google-apps.document',
        modifiedTime: 'Ayer, 14:10',
        webViewLink: 'https://docs.google.com/document'
      },
      {
        id: 'mock-fl-3',
        name: '📊 Facturas_Servicios_Emitidas_2026.pdf',
        mimeType: 'application/pdf',
        modifiedTime: '15 Jun, 10:20',
        webViewLink: 'https://drive.google.com'
      }
    ]);
  };

  const handleAnalyzeEmails = async () => {
    setIsAnalyzingEmails(true);
    setApiError(null);
    try {
      const targetEmails = workspaceToken && emails.length > 0 ? emails : mockEmails;
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'analyze-gmail',
          payload: { emails: targetEmails }
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con el servicio de análisis de GestorIA.");
      }

      const data = await response.json();
      if (data.result && data.result.analyses) {
        const analysesMap: Record<string, any> = {};
        data.result.analyses.forEach((item: any) => {
          const id = item.id;
          if (id) {
            analysesMap[id] = {
              priority: item.priority || 'Media',
              category: item.category || 'Informativo',
              summary: item.summary || 'Trámite detectado.',
              actionItem: item.actionItem || 'Verificar contenido.'
            };
          }
        });
        setEmailAnalyses(analysesMap);
        setSuccessMessage("¡Análisis inteligente de correos realizado con éxito!");
      } else {
        throw new Error("El formato de respuesta de la IA no fue el esperado.");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Error durante el análisis inteligente de correos: " + err.message);
    } finally {
      setIsAnalyzingEmails(false);
    }
  };

  // --- SOLICITUDES GOOGLE WORKSPACE REALES ---

  // 1. Fetch Gmail Messages
  const fetchGmailMessages = async () => {
    if (!workspaceToken) return;
    setIsLoading(true);
    try {
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${workspaceToken}` }
      });
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const fetchedEmails = [];
        for (const msg of data.messages) {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { Authorization: `Bearer ${workspaceToken}` }
          });
          const detail = await detailRes.json();
          
          const headers = detail.payload?.headers || [];
          const from = headers.find((h: any) => h.name === 'From')?.value || 'Desconocido';
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Sin Asunto';
          const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
          
          fetchedEmails.push({
            id: detail.id,
            from,
            subject,
            date: dateHeader ? new Date(dateHeader).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
            snippet: detail.snippet || ''
          });
        }
        setEmails(fetchedEmails);
      } else {
        setEmails([]);
      }
    } catch (err: any) {
      console.error("Error cargando correos:", err);
      setApiError("Error de comunicación durante la lectura de Gmail. Asegúrate de conceder permisos.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Calendar Events
  const fetchCalendarEvents = async () => {
    if (!workspaceToken) return;
    setIsLoading(true);
    try {
      const nowIso = new Date().toISOString();
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${nowIso}&maxResults=5&orderBy=startTime&singleEvents=true`, {
        headers: { Authorization: `Bearer ${workspaceToken}` }
      });
      const data = await response.json();
      if (data.items) {
        setCalendarEvents(data.items.map((item: any) => ({
          id: item.id,
          summary: item.summary || 'Sin Título',
          description: item.description || '',
          start: item.start || {},
          end: item.end || {},
          meetLink: item.hangoutLink || item.conferenceData?.entryPoints?.[0]?.uri || null
        })));
      } else {
        setCalendarEvents([]);
      }
    } catch (err: any) {
      console.error("Error cargando eventos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Fetch Drive Files
  const fetchDriveFiles = async () => {
    if (!workspaceToken) return;
    setIsLoading(true);
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=5&fields=files(id,name,mimeType,modifiedTime,webViewLink)', {
        headers: { Authorization: `Bearer ${workspaceToken}` }
      });
      const data = await response.json();
      if (data.files) {
        setDriveFiles(data.files);
      } else {
        setDriveFiles([]);
      }
    } catch (err: any) {
      console.error("Error cargando Drive:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-completar cuerpo del email basándose en la factura seleccionada
  const handleSelectInvoiceForMail = (invoiceId: string) => {
    setSelectedInvoiceForExport(invoiceId);
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const invNum = invoice.number || invoice.id.substring(0,8).toUpperCase();
      const invConcept = (invoice.items && invoice.items[0]?.description) || 'Servicios Prestados';
      const invSubtotal = invoice.subtotal || invoice.total || 0;
      const invIva = invoice.ivaAmount || (invSubtotal * (invoice.ivaRate || 21) / 100);
      const invTotal = invoice.total || (invSubtotal + invIva);

      setEmailSubject(`📎 Factura Oficial - GestorIA - ${invNum}`);
      setEmailBody(`Estimado Cliente,

Adjunto le remitimos la Factura Oficial correspondiente a los servicios realizados.

Detalles de la operación:
- Emisor: ${companyName}
- Factura Nº: ${invNum}
- Concepto: ${invConcept}
- Base Imponible: ${invSubtotal.toLocaleString()} €
- Cálculo de IVA: ${invIva.toLocaleString()} €
- Total a liquidar: ${invTotal.toLocaleString()} €

Este justificante se encuentra oficialmente certificado en el sistema GestorCuentas, adaptándose a los reglamentos de contabilidad vigentes de la AEAT.

Atentamente,
El Equipo Contable de ${companyName}`);
    }
  };

  // 4. Enviar un Gmail real
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceToken) {
      setApiError("Debes estar conectado a Google Workspace para enviar emails reales.");
      return;
    }
    if (!emailTo || !emailSubject || !emailBody) {
      setApiError("Por favor completa destinatario, asunto y mensaje.");
      return;
    }

    setIsSendingEmail(true);
    try {
      // Requerir confirmación antes de la operación (MANDATORIO)
      const confirmed = window.confirm(`¿Confirmas que deseas enviar un correo real a "${emailTo}" con el asunto "${emailSubject}" actuando como tu cuenta de Google?`);
      if (!confirmed) {
        setIsSendingEmail(false);
        return;
      }

      // Codificar en Base64 seguro para Gmail
      const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(emailSubject)))}?=`;
      const emailContent = [
        `To: ${emailTo}`,
        `Subject: ${utf8Subject}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        ``,
        emailBody
      ].join('\r\n');

      const base64Safe = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: base64Safe })
      });

      if (response.ok) {
        setSuccessMessage(`¡Correo enviado con total éxito a ${emailTo}!`);
        setEmailTo('');
        setEmailSubject('');
        setEmailBody('');
        fetchGmailMessages();
      } else {
        const errData = await response.json();
        throw new Error(errData.error?.message || "Ocurrió un error");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Error de envío a través de Gmail: " + err.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 5. Crear Evento en Calendar + Meet (O Meet quick space)
  const handleCreateMeeting = async (e: React.FormEvent, injectMeet: boolean = true) => {
    e.preventDefault();
    if (!workspaceToken) {
      setApiError("Por favor, vincula tu cuenta de Google para programar reuniones reales.");
      return;
    }
    if (!eventTitle) {
      setApiError("Se requiere un título descriptivo para la reunión.");
      return;
    }

    setIsCreatingEvent(true);
    try {
      const nowStr = eventDate ? `${eventDate}T${eventTime}:00` : new Date(Date.now() + 3600000).toISOString().slice(0, 16);
      const startObj = new Date(nowStr);
      const endObj = new Date(startObj.getTime() + parseInt(eventDuration) * 60 * 1000);

      const eventPayload: any = {
        summary: eventTitle,
        description: eventDesc || "Programado mediante el módulo avanzado de integraciones de GestorIA.",
        start: {
          dateTime: startObj.toISOString(),
          timeZone: 'Europe/Madrid'
        },
        end: {
          dateTime: endObj.toISOString(),
          timeZone: 'Europe/Madrid'
        }
      };

      if (injectMeet) {
        eventPayload.conferenceData = {
          createRequest: {
            requestId: `meet-evt-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet"
            }
          }
        };
      }

      const confirmed = window.confirm(`¿Deseas programar el evento "${eventTitle}" en tu Calendario de Google para el ${startObj.toLocaleString()}?`);
      if (!confirmed) {
        setIsCreatingEvent(false);
        return;
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        const created = await response.json();
        const meetUrl = created.hangoutLink || created.conferenceData?.entryPoints?.[0]?.uri || null;
        if (meetUrl) {
          setGeneratedMeetLink(meetUrl);
        }
        setSuccessMessage(`¡Reunión en Google Calendar creada! Título: ${created.summary}.`);
        setEventTitle('');
        setEventDesc('');
        fetchCalendarEvents();
      } else {
        const errJson = await response.json();
        throw new Error(errJson.error?.message || "Error al crear el evento");
      }
    } catch (err: any) {
      console.error(err);
      setApiError("Error al sincronizar con Google Calendar: " + err.message);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // 6. Google Meet Quick One-Click Creator
  const handleQuickMeetSpace = async () => {
    if (!workspaceToken) {
      setApiError("Se requiere vincular la cuenta para agendar una sesión instantánea en Meet.");
      return;
    }

    setIsLoading(true);
    try {
      const startObj = new Date();
      const endObj = new Date(startObj.getTime() + 45 * 60 * 1000); // 45 min

      const eventPayload = {
        summary: `🎥 Reunión Instantánea Contable - GestorIA`,
        description: `Sesión de consulta rápida creada con un click desde GestorIA. Unirse pulsando el botón de Google Meet.`,
        start: {
          dateTime: startObj.toISOString(),
          timeZone: 'Europe/Madrid'
        },
        end: {
          dateTime: endObj.toISOString(),
          timeZone: 'Europe/Madrid'
        },
        conferenceData: {
          createRequest: {
            requestId: `quick-meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet"
            }
          }
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        const created = await response.json();
        const meetUrl = created.hangoutLink || created.conferenceData?.entryPoints?.[0]?.uri || null;
        if (meetUrl) {
          setGeneratedMeetLink(meetUrl);
          setSuccessMessage(`🎥 ¡Sala de Google Meet generada de inmediato! Enlace guardado en el portapapeles.`);
          navigator.clipboard?.writeText(meetUrl);
        } else {
          setSuccessMessage(`Reunión instantánea fijada en el calendario con éxito.`);
        }
        fetchCalendarEvents();
      } else {
        throw new Error("No se pudo obtener enlace de videoconferencia.");
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Exportar Financiero de GestorIA a Google Docs
  const handleExportToGoogleDocs = async () => {
    if (!workspaceToken) {
      setApiError("Se necesita vinculación activa para generar un documento en Google Drive.");
      return;
    }

    setIsLoading(true);
    try {
      // Requerir confirmación antes de la operación (MANDATORIO)
      const confirmed = window.confirm(`¿Confirmas que deseas crear un nuevo informe oficial "Auditoría de Operaciones y Conciliación GestorIA" en los documentos de tu Google Drive?`);
      if (!confirmed) {
        setIsLoading(false);
        return;
      }

      // 1. Crear documento en blanco
      const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `GestorIA Reporte Fiscal Consolidado - ${companyName}`
        })
      });

      if (!createRes.ok) throw new Error("Fallo al crear archivo base de Google Doc.");
      const docData = await createRes.json();
      const documentId = docData.documentId;

      // 2. Insertar contenidos estructurados de tus facturas y resumen
      const totalAmountEarned = invoices.reduce((sum, item) => sum + (item.total || 0), 0);
      const totalActiveExpenses = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
      const profit = totalAmountEarned - totalActiveExpenses;
      const estimatedTaxes = profit > 0 ? profit * 0.20 : 0; // IRPF estimativo

      const bodyContent = `--------------------------------------------------
GESTORIA SAAS - CONTABILIDAD REGULADA TRIMESTRAL
--------------------------------------------------
Documento Comercial Oficial Generado el: ${new Date().toLocaleString('es-ES')}
Denominación Social: ${companyName}

RESUMEN FINANCIERO DEL EJERCICIO ACUMULADO DESDE ERP:
* Total de Ingresos Brutos Registrados: ${totalAmountEarned.toLocaleString()} EUR
* Total de Gastos Generales Auditados: ${totalActiveExpenses.toLocaleString()} EUR
* Margen de Beneficio de Operaciones Directas: ${profit.toLocaleString()} EUR
* Proyección de Provisión de IRPF Acumulado (Modelo 130 estimativo 20%): ${estimatedTaxes.toLocaleString()} EUR

DETALLE DE ÚLTIMAS FACTURAS ASENTADAS:
${invoices.map((inv, idx) => {
  const num = inv.number || 'Borrador';
  const concept = (inv.items && inv.items[0]?.description) || 'Servicios Prestados';
  const base = inv.subtotal || inv.total || 0;
  return `${idx + 1}. Num Factura: ${num} | Concepto: ${concept} | Base: ${base} EUR | Fecha: ${inv.date}`;
}).join('\n')}

ESTADO DEL CRM Y OPERACIONES:
* Clientes Totales Históricos: ${crmContacts.length}
* Proyectos activos en Producción: ${projects.length}
* Tareas operativas en curso: ${tasks.length}

Este reporte es confidencial y ha sido certificado por los algoritmos analíticos de GestorIA en Cloud, conforme a las normativas vigentes en España.
`;

      // Hacer llamadas de actualización en lote de Google Doc
      const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                endOfSegmentLocation: {},
                text: bodyContent
              }
            }
          ]
        })
      });

      if (updateRes.ok) {
        setSuccessMessage(`¡Reporte Oficial guardado con éxito en un nuevo Google Doc!`);
        fetchDriveFiles();
        // Abrir ventana al documento
        window.open(`https://docs.google.com/document/d/${documentId}/edit`, '_blank');
      } else {
        throw new Error("No se pudieron insertar textos en el documento.");
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Exportar a Google Sheets (Soporte contable para Excel / Sheets)
  const handleExportToGoogleSheets = async () => {
    if (!workspaceToken) {
      setApiError("Se necesita vinculación activa para generar un libro de Google Sheets.");
      return;
    }

    setIsLoading(true);
    try {
      const confirmed = window.confirm(`¿Deseas exportar todas las facturas e ingresos actuales a una hoja de cálculo real de Google Sheets?`);
      if (!confirmed) {
        setIsLoading(false);
        return;
      }

      // 1. Crear la hoja
      const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: `Contabilidad Fiscal Consolidada - ${companyName}`
          }
        })
      });

      if (!createRes.ok) throw new Error("Fallo al crear libro de Sheets.");
      const sheetData = await createRes.json();
      const spreadsheetId = sheetData.spreadsheetId;

      // 2. Insertar cabeceras y filas de datos
      const values = [
        ["FECHA SEÑALADA", "FAC. NÚMERO", "CONCEPTO EMISOR", "CLIENTE/PROVEEDOR", "IMPORTE BASE (EUR)", "TIPO DE IVA", "ESTADO COMERCIAL"],
        ...invoices.map(inv => [
          inv.date,
          inv.number || inv.id.substring(0,8).toUpperCase(),
          (inv.items && inv.items[0]?.description) || 'Servicios Prestados',
          inv.clientName,
          inv.subtotal || inv.total || 0,
          `${inv.ivaRate || 21}%`,
          inv.status === 'Pagada' ? 'COBRADO' : 'PENDIENTE'
        ]),
        [],
        ["RESUMEN ACUMULADO"],
        ["Inversión Total Base", invoices.reduce((s, i) => s + (i.subtotal || i.total || 0), 0)]
      ];

      const writeRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:G${values.length}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${workspaceToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
      });

      if (writeRes.ok) {
        setSuccessMessage(`¡Hoja de Conciliación creada! Se exportaron ${invoices.length} facturas.`);
        fetchDriveFiles();
        window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`, '_blank');
      } else {
        throw new Error("Fallo al escribir registros en las celdas.");
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Estado de Integración de Google Workspace */}
      <div className={`p-6 rounded-2xl border transition-all ${
        workspaceToken 
          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' 
          : 'bg-indigo-50/40 border-indigo-150 text-indigo-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3.5 rounded-xl shrink-0 shadow-3xs ${
              workspaceToken ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'
            }`}>
              <Layers className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight font-display">
                  {workspaceToken ? '¡Conexión Activa con Google Workspace!' : 'Vincular Servicios de Google'}
                </h2>
                {workspaceToken && (
                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md font-mono animate-pulse">
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mt-1 max-w-xl">
                {workspaceToken 
                  ? `Sincronización en tiempo real habilitada con tu cuenta de Google. Tu ERP de GestorIA está preparado para interactuar con tus documentos, programar videollamadas con Meet e interactuar con Gmail de manera nativa sin salir de la app.`
                  : 'Integra Gmail, Google Drive, Calendario, Documentos, Hojas de Cálculo y Salas de Meet para automatizar tu facturación y operaciones con los datos consolidados de tu negocio.'}
              </p>
              
              {/* Información de Scopes activos */}
              <div className="flex flex-wrap gap-2 mt-3 font-mono text-[9px] text-slate-400">
                <span>📧 Correo</span>
                <span>•</span>
                <span>📅 Calendario</span>
                <span>•</span>
                <span>💾 Almacenamiento Drive</span>
                <span>•</span>
                <span>🎥 Google Meet</span>
                <span>•</span>
                <span>📈 Hojas de Cálculo</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:items-end gap-2 text-right">
            {workspaceToken ? (
              <div className="space-y-1.5 flex flex-col items-end">
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                  <UserCheck className="w-3.5 h-3.5" />
                  Listo para operar en Cloud
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={onConnectWorkspace}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 bg-white border border-slate-200 shadow-3xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Actualizar</span>
                  </button>
                  {onDisconnectWorkspace && (
                    <button
                      onClick={onDisconnectWorkspace}
                      className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 bg-white border border-rose-250 shadow-3xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Desvincular</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col items-start sm:items-end">
                <span className="text-[9px] text-indigo-600 font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg font-mono">
                  Modo Simulación Activo
                </span>
                <button
                  onClick={onConnectWorkspace}
                  className="px-5 py-3 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-500 shadow-md rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 self-start sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Vincular Cuenta de Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas de Éxito / Error */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3.5 rounded-xl text-xs flex items-center gap-2.5 font-semibold transition-all">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {apiError && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3.5 rounded-xl text-xs flex items-center gap-2.5 font-semibold transition-all">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* CONTENDEDOR BI-DIRECCIONAL: PESTAÑAS DE INTEGRACIÓN */}
      <div className="bg-white border border-slate-150/60 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de pestañas */}
        <div className="flex overflow-x-auto whitespace-nowrap bg-slate-50/50 border-b border-slate-200/50 px-4 py-1.5">
          {[
            { id: 'gmail', label: 'Gmail', icon: Mail, color: 'text-rose-500' },
            { id: 'calendar', label: 'Calendario', icon: Calendar, color: 'text-blue-500' },
            { id: 'meet', label: 'Google Meet', icon: Video, color: 'text-teal-500' },
            { id: 'drive', label: 'Google Drive', icon: HardDrive, color: 'text-amber-500' },
            { id: 'sheets', label: 'Sheets', icon: FileSpreadsheet, color: 'text-emerald-500' },
            { id: 'docs', label: 'Docs', icon: FileText, color: 'text-indigo-500' },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setGeneratedMeetLink(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-indigo-600 bg-white text-indigo-700 shadow-3xs' 
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DE LA PESTAÑA SELECCIONADA */}
        <div className="p-6">
          
          {/* MODO PREVENTIVO / DEMO MOCK PREVIEW NOTICE */}
          {!workspaceToken && (
            <div className="mb-5 bg-amber-50/60 text-amber-800 border border-amber-200 rounded-xl p-3 text-[11px] font-sans flex items-center gap-2">
              <span className="shrink-0 text-xs">⚠️</span>
              <p>
                <strong>Modo Simulación Activo:</strong> Estás viendo una vista previa de cómo se mostrarán e interactuarán tus datos reales con la suite de Google Workspace. Haz clic en "Vincular Cuenta de Google Workspace" arriba de esta sección para habilitar la sincronización directa.
              </p>
            </div>
          )}

          {/* 1. SECCIÓN GMAIL */}
          {activeTab === 'gmail' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado Izquierdo: Redactar Mensaje */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">Redactar Mensaje Contable</h3>
                  <p className="text-[10px] text-slate-500">Envía tus facturas, presupuestos o resúmenes directamente por correo corporativo.</p>
                </div>

                {/* Autocompletable desde facturas */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1.5">Auto-completar desde Factura</label>
                  <select 
                    value={selectedInvoiceForExport}
                    onChange={(e) => handleSelectInvoiceForMail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- Selecciona una Factura para Redactar --</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.number || inv.id.substring(0,8).toUpperCase()} - {(inv.items && inv.items[0]?.description) || 'Servicios Prestados'} ({(inv.total || 0).toLocaleString()} €)
                      </option>
                    ))}
                  </select>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Destinatario (Cliente / Emisor)</label>
                    <input 
                      type="email" 
                      placeholder="correo@ejemplo.com"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Asunto</label>
                    <input 
                      type="text" 
                      placeholder="Envío de presupuesto o factura certificada"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Cuerpo del Mensaje</label>
                    <textarea 
                      rows={5}
                      placeholder="Redacta el mensaje o selecciona una factura del desplegable de arriba para generar automáticamente una plantilla con el desglose de IVA..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-750 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:bg-rose-300"
                  >
                    {isSendingEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enviando por Gmail...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar mensaje con mi Gmail</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Lado Derecho: Recibidos / Mensajes Recientes */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Recibidos Recientes (Contabilidad)</h3>
                    <p className="text-[10px] text-slate-500">Bandeja de entrada sincronizada para el rastreo de cobros.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleAnalyzeEmails}
                      disabled={isAnalyzingEmails || (workspaceToken ? emails : mockEmails).length === 0}
                      className="p-1 px-2.5 text-[10px] font-extrabold border border-indigo-200 rounded-md bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer text-indigo-700 font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      <span>{isAnalyzingEmails ? 'Clasificando...' : 'Analizar con IA'}</span>
                    </button>
                    {workspaceToken && (
                      <button 
                        onClick={fetchGmailMessages}
                        className="p-1 px-2.5 text-[10px] font-extrabold border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-slate-600"
                      >
                        <RefreshCw className="w-3 h-3" /> Actualizar
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {(workspaceToken ? emails : mockEmails).map((mail) => {
                    const analysis = emailAnalyses[mail.id];
                    return (
                      <div 
                        key={mail.id} 
                        className="p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors space-y-2 relative"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-black text-rose-600 truncate max-w-[170px]" title={mail.from}>
                            {mail.from}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap font-mono shrink-0">
                            {mail.date}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{mail.subject}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-sans">{mail.snippet}</p>

                        {/* AI Analysis Info Block */}
                        {analysis && (
                          <div className="mt-2.5 pt-2 border-t border-dashed border-indigo-150 bg-indigo-50/40 p-2 text-[10px] rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wide border font-mono ${
                                analysis.priority === 'Alta' 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                  : analysis.priority === 'Media'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}>
                                Prioridad {analysis.priority}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wide bg-slate-100 border border-slate-200 text-slate-600 font-mono">
                                {analysis.category}
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium">
                              <strong className="text-indigo-800">IA Resumen:</strong> {analysis.summary}
                            </p>
                            <p className="text-indigo-950 font-bold flex items-center gap-1.5 bg-indigo-100/40 p-1 px-1.5 rounded-md border border-indigo-100/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0"></span>
                              <span><strong>Acción:</strong> {analysis.actionItem}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(workspaceToken ? emails : mockEmails).length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-10 font-medium">Bandeja de entrada sin mensajes recientes coincidentes.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. SECCIÓN CALENDARIO */}
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado Izquierdo: Crear Evento */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">Agendar Reunión o Consulta</h3>
                  <p className="text-[10px] text-slate-500">Crea citas fiscales y compártelas de forma automática en tu Google Calendar.</p>
                </div>

                <form onSubmit={(e) => handleCreateMeeting(e, true)} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Título del Evento</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Revisión trimestral GestorIA"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Notas / Descripción</label>
                    <textarea 
                      rows={2}
                      placeholder="Escribe comentarios u objetivos clave a tratar durante la reunión..."
                      value={eventDesc}
                      onChange={(e) => setEventDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Fecha</label>
                      <input 
                        type="date" 
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Hora inicio</label>
                      <input 
                        type="time" 
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-1">Duración estimada</label>
                    <select
                      value={eventDuration}
                      onChange={(e) => setEventDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="30">30 Minutos</option>
                      <option value="60">1 Hora (Recomendada)</option>
                      <option value="90">1 Hora y 30 minutos</option>
                      <option value="120">2 Horas</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingEvent}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-750 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:bg-blue-300"
                  >
                    {isCreatingEvent ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sincronizando Calendario...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        <span>Programar con Google Calendar & Meet</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Lado Derecho: Listado de citas */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Próximos Eventos de tu Agenda</h3>
                    <p className="text-[10px] text-slate-500">Controla tus plazos fiscales en tu agenda laboral de Google.</p>
                  </div>
                  {workspaceToken && (
                    <button 
                      onClick={fetchCalendarEvents}
                      className="p-1 px-2.5 text-[10px] font-extrabold border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-slate-600"
                    >
                      <RefreshCw className="w-3 h-3" /> Actualizar
                    </button>
                  )}
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {(workspaceToken ? calendarEvents : mockEvents).map((event) => {
                    const dateStr = event.start?.dateTime || event.start?.date || '';
                    const dateFormatted = dateStr 
                      ? new Date(dateStr).toLocaleString('es-ES', { weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : 'Fecha No Definida';

                    return (
                      <div 
                        key={event.id} 
                        className="p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors space-y-2"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-black text-slate-850">{event.summary}</h4>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2 py-0.5 rounded-lg border border-blue-100 uppercase shrink-0">
                            Cita
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-semibold leading-normal font-mono">{dateFormatted}</p>
                        {event.description && (
                          <p className="text-[10px] text-slate-500 font-sans leading-relaxed line-clamp-2">{event.description}</p>
                        )}
                        {event.meetLink && (
                          <a 
                            href={event.meetLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-teal-600 hover:text-teal-750 bg-teal-50 hover:bg-teal-100 border border-teal-150 rounded-lg px-2.5 py-1 z-10 transition-all"
                          >
                            <Video className="w-3 h-3" />
                            <span>Unirme a Google Meet</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    );
                  })}

                  {(workspaceToken ? calendarEvents : mockEvents).length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-10 font-medium">No se detectan reuniones programadas.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. SECCIÓN GOOGLE MEET */}
          {activeTab === 'meet' && (
            <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="p-4 bg-teal-50 text-teal-800 border border-teal-200 rounded-2xl inline-flex shadow-3xs">
                <Video className="w-10 h-10 text-teal-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-850 font-display">🎥 Salas Instantáneas con Google Meet</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                  Genera una sala privada e instantánea de Google Meet con un solo toque y compártela a clientes, gestores o socios de negocios para realizar videollamadas de auditoría.
                </p>
              </div>

              <button
                type="button"
                onClick={handleQuickMeetSpace}
                disabled={isLoading}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-750 text-white font-extrabold text-xs rounded-xl shadow-md tracking-wide transition-all cursor-pointer flex items-center gap-2.5 mx-auto active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Iniciando transmisión segura...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-4.5 h-4.5" />
                    <span>Lanzar Videollamada Google Meet</span>
                  </>
                )}
              </button>

              {/* Contenedor del enlace generado */}
              {generatedMeetLink && (
                <div className="p-5 bg-slate-900 border border-slate-755 rounded-2xl space-y-3 max-w-md mx-auto text-left animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md font-mono border border-indigo-500/10">Sala Lista</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Copiado en Portapapeles 📋</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200">Se ha creado una sala en línea dedicada para ti:</p>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/60 p-2.5 rounded-xl">
                    <span className="text-xs font-mono font-bold text-teal-400 truncate flex-1">{generatedMeetLink}</span>
                    <a 
                      href={generatedMeetLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-[10px] rounded-lg tracking-wider uppercase flex items-center gap-1 shrink-0"
                    >
                      <span>Entrar</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. SECCIÓN GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lado Izquierdo: Gestión de Archivos y Exportación Directa */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800">Caja de Seguridad en Google Drive</h3>
                  <p className="text-[10px] text-slate-500">Exporta e indexa expedientes de tickets homologados y recibos comerciales.</p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex gap-3">
                    <div className="p-3 bg-amber-500 text-white rounded-xl shadow-3xs shrink-0 self-start">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Exportar Reportes Fiscales Inteligentes</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                        Al pulsar, se transformarán tus registros ERP contables vigentes en un libro o informe técnico y se depositarán de forma segura en tu carpeta personal de Google Drive.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleExportToGoogleDocs}
                      disabled={isLoading}
                      className="px-4 py-3 border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>Generar Google Doc</span>
                    </button>

                    <button
                      onClick={handleExportToGoogleSheets}
                      disabled={isLoading}
                      className="px-4 py-3 border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>Exportar Sheets</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 border border-indigo-100 bg-indigo-50/20 rounded-2xl flex items-start gap-3">
                  <span className="text-indigo-600 text-sm mt-0.5">💡</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    <strong>Integración Segura:</strong> Cualquier exportación se realiza con la API segura de Google, garantizando los más altos estándares de protección del RGPD comercial.
                  </p>
                </div>
              </div>

              {/* Lado Derecho: Archivos Recientes */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Documentos y Reportes de GestorIA</h3>
                    <p className="text-[10px] text-slate-500">Últimos archivos cargados o generados para auditoría.</p>
                  </div>
                  {workspaceToken && (
                    <button 
                      onClick={fetchDriveFiles}
                      className="p-1 px-2.5 text-[10px] font-extrabold border border-slate-200 rounded-md bg-white hover:bg-slate-50 flex items-center gap-1 cursor-pointer text-slate-600"
                    >
                      <RefreshCw className="w-3 h-3" /> Actualizar
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {(workspaceToken ? driveFiles : mockFiles).map((file) => {
                    const isSheet = file.mimeType?.includes('spreadsheet');
                    const isDoc = file.mimeType?.includes('document');

                    return (
                      <div 
                        key={file.id} 
                        className="p-3.5 rounded-xl border border-slate-150 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${
                            isSheet ? 'bg-emerald-100 text-emerald-700' : isDoc ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isSheet ? <FileSpreadsheet className="w-4 h-4" /> : isDoc ? <FileText className="w-4 h-4" /> : <HardDrive className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-850 truncate max-w-[190px]" title={file.name}>
                              {file.name}
                            </h4>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Modificado: {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('es-ES') : "Reciente"}</p>
                          </div>
                        </div>

                        {file.webViewLink && (
                          <a 
                            href={file.webViewLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition-transform cursor-pointer"
                            title="Abrir en pestaña nueva"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    );
                  })}

                  {(workspaceToken ? driveFiles : mockFiles).length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-10 font-medium">Workspace vacío. No se han encontrado reportes.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5. SECCIÓN SHEETS */}
          {activeTab === 'sheets' && (
            <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl inline-flex shadow-3xs">
                <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-850 font-display">📈 Hoja de Contabilidad de Google Sheets</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                  Exporta automáticamente todo tu diario contable (ingresos bases, cargos de IVA calculados de facturas registradas y estados comerciales) en un libro oficial estructurado de Google Sheets.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-left text-xs max-w-sm mx-auto space-y-2">
                <div className="flex justify-between font-semibold border-b border-slate-200 pb-1.5 text-slate-700">
                  <span>Módulo exportado</span>
                  <span>Registros</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Facturas Emitidas</span>
                  <span className="font-bold text-slate-700">{invoices.length}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Socio de operaciones</span>
                  <span className="font-bold text-slate-700">{crmContacts.length}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleExportToGoogleSheets}
                disabled={isLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold text-xs rounded-xl shadow-md tracking-wide transition-all cursor-pointer flex items-center gap-2.5 mx-auto active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Construyendo celdas y filas...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                    <span>Exportar y abrir en Google Sheets</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 6. SECCIÓN DOCUMENTOS */}
          {activeTab === 'docs' && (
            <div className="max-w-2xl mx-auto text-center space-y-6 py-6">
              <div className="p-4 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-2xl inline-flex shadow-3xs">
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-850 font-display">📄 Reporte Estratégico en Google Docs</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
                  Redacta automáticamente un informe fiscal integral en Google Docs con tus ratios de rentabilidad, balance condensado y análisis predictivos elaborados por inteligencia artificial.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportToGoogleDocs}
                disabled={isLoading}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold text-xs rounded-xl shadow-md tracking-wide transition-all cursor-pointer flex items-center gap-2.5 mx-auto active:scale-98"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Redactando informe ejecutivo...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4.5 h-4.5" />
                    <span>Escribir y abrir en Google Docs</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
