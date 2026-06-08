'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Activity, 
  Download, 
  MapPin, 
  Phone, 
  LogOut,
  User,
  Heart,
  RefreshCw,
  Clock,
  CheckCircle2,
  PackageCheck,
  Eye,
  X,
  Printer,
  FileCheck,
  FileSpreadsheet,
  Check,
  ArrowRight,
  ShieldCheck,
  Building,
  Info,
  CreditCard,
  QrCode,
  DollarSign,
  AlertTriangle,
  Receipt
} from 'lucide-react';

interface PatientViewProps {
  patientName: string;
  patientEmail: string;
  onLogout: () => void;
}

interface Recipe {
  id: string;
  date: string;
  expiryDate: string;
  medication: string;
  dosage: string;
  instructions: string;
  doctor: string;
  specialty: string;
  doctorLicense: string;
  status: 'Activo' | 'Expirado';
}

const MOCK_RECIPES: Recipe[] = [
  {
    id: 'REC-2026-904',
    date: '06 Jun, 2026',
    expiryDate: '06 Dic, 2026',
    medication: 'Ramipril 5mg',
    dosage: '28 Comprimidos',
    instructions: 'Tomar 1 comprimido al día por la mañana en ayunas.',
    doctor: 'Dr. Alejandro Ríos',
    specialty: 'Cardiología',
    doctorLicense: 'M.P. 28.490/7',
    status: 'Activo'
  },
  {
    id: 'REC-2026-901',
    date: '01 Jun, 2026',
    expiryDate: '01 Dic, 2026',
    medication: 'Aspirina 100mg',
    dosage: '30 Comprimidos Gastrorresistentes',
    instructions: 'Tomar 1 comprimido diario durante el almuerzo.',
    doctor: 'Dr. Alejandro Ríos',
    specialty: 'Cardiología',
    doctorLicense: 'M.P. 28.490/7',
    status: 'Activo'
  },
  {
    id: 'REC-2026-712',
    date: '15 Abr, 2026',
    expiryDate: '15 May, 2026',
    medication: 'Amoxicilina 875mg + Ácido Clavulánico 125mg',
    dosage: '14 Comprimidos',
    instructions: 'Tomar 1 comprimido cada 12 horas con las comidas por 7 días.',
    doctor: 'Dr. Alejandro Ríos',
    specialty: 'Medicina General',
    doctorLicense: 'M.P. 28.490/7',
    status: 'Expirado'
  }
];

interface ProposalItem {
  id: string;
  medication: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
}

export default function PatientView({ patientName, patientEmail, onLogout }: PatientViewProps) {
  // Navigation Tabs: 'recipes' (P.1), 'proposals' (P.2), 'payment' (P.3)
  const [activeSubTab, setActiveSubTab] = useState<'recipes' | 'proposals' | 'payment'>('recipes');

  const [recipes] = useState<Recipe[]>(MOCK_RECIPES);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Last Order State (P.1)
  const [lastOrderStatus, setLastOrderStatus] = useState<'Pendiente por retirar' | 'Listo para retirar' | 'Retirado'>('Listo para retirar');
  
  // QR Code Expiry State
  const [qrToken, setQrToken] = useState('PX-992-8812');
  const [qrSecondsLeft, setQrSecondsLeft] = useState(30);

  // Proposal states (P.2)
  const [proposalItems] = useState<ProposalItem[]>([
    { id: 'prop-1', medication: 'Ramipril 5mg (28 Comprimidos)', quantity: 1, unitPrice: 12.50, discountPercent: 20 },
    { id: 'prop-2', medication: 'Aspirina 100mg (30 Comprimidos)', quantity: 1, unitPrice: 6.00, discountPercent: 10 }
  ]);
  const [selectedBranch, setSelectedBranch] = useState('Farma-Humana Central (Av. de la Castellana 210)');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Payment states (P.3)
  const [pendingPayment, setPendingPayment] = useState(false);
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState(900); // 15 minutes (900s)
  const [paymentActive, setPaymentActive] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'Pendiente' | 'Completado'>('Pendiente');
  const [paymentMethod, setPaymentMethod] = useState<'bizum' | 'transfer' | 'card'>('card');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Payment Form Fields
  const [phoneBizum, setPhoneBizum] = useState('');
  const [refBizum, setRefBizum] = useState('');
  const [refTransfer, setRefTransfer] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // Calculations for Proposal
  const calculateItemSubtotal = (item: ProposalItem) => {
    const originalSub = item.unitPrice * item.quantity;
    const savings = originalSub * (item.discountPercent / 100);
    return originalSub - savings;
  };

  const getProposalTotals = () => {
    let grossTotal = 0;
    let totalSavings = 0;
    proposalItems.forEach(item => {
      grossTotal += item.unitPrice * item.quantity;
      totalSavings += (item.unitPrice * item.quantity) * (item.discountPercent / 100);
    });

    const netSubtotal = grossTotal - totalSavings;
    const vat = netSubtotal * 0.21; // 21% VAT
    const netTotal = netSubtotal + vat;

    return {
      grossTotal,
      totalSavings,
      netSubtotal,
      vat,
      netTotal
    };
  };

  const totals = getProposalTotals();

  // QR Code rotative timer
  useEffect(() => {
    const timer = setInterval(() => {
      setQrSecondsLeft((prev) => {
        if (prev <= 1) {
          const rand = Math.floor(1000 + Math.random() * 9000);
          setQrToken(`PX-992-${rand}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 15-Minute Payment Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (paymentActive && paymentSecondsLeft > 0 && paymentStatus === 'Pendiente') {
      timer = setInterval(() => {
        setPaymentSecondsLeft(prev => {
          if (prev <= 1) {
            setPaymentStatus('Pendiente');
            setPaymentActive(false);
            setPendingPayment(false);
            alert('El tiempo de reserva de inventario de 15 minutos ha expirado. Por favor valide e intente nuevamente.');
            setActiveSubTab('proposals');
            return 900;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [paymentActive, paymentSecondsLeft, paymentStatus]);

  const handleRefreshQR = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setQrToken(`PX-992-${rand}`);
    setQrSecondsLeft(30);
  };

  const cycleOrderStatus = () => {
    if (lastOrderStatus === 'Pendiente por retirar') setLastOrderStatus('Listo para retirar');
    else if (lastOrderStatus === 'Listo para retirar') setLastOrderStatus('Retirado');
    else setLastOrderStatus('Pendiente por retirar');
  };

  // P.2 Dispatch Action
  const handleConfirmProposal = () => {
    if (!termsAccepted) {
      alert('Debe aceptar los Términos y Condiciones de Farma-Humana.');
      return;
    }
    
    // Dispatch to branch -> Allocate inventory and trigger payment passthrough (P.3)
    setPendingPayment(true);
    setPaymentSecondsLeft(900); // 15 mins
    setPaymentActive(true);
    setPaymentStatus('Pendiente');
    setLastOrderStatus('Pendiente por retirar');
    
    // Navigate straight to P.3
    setActiveSubTab('payment');
  };

  // P.3 Submit Payment Action
  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations based on selected method
    if (paymentMethod === 'bizum') {
      if (!phoneBizum || !refBizum) {
        alert('Por favor complete todos los datos de Pago Móvil / Bizum.');
        return;
      }
    } else if (paymentMethod === 'transfer') {
      if (!refTransfer) {
        alert('Por favor introduzca el número de referencia de la transferencia.');
        return;
      }
    } else if (paymentMethod === 'card') {
      if (!cardNum || !cardHolder || !cardCVV) {
        alert('Por favor rellene todos los campos de su tarjeta de crédito.');
        return;
      }
    }

    // Process payment
    const randReceipt = `FAC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setInvoiceNumber(randReceipt);
    setPaymentStatus('Completado');
    setLastOrderStatus('Listo para retirar'); // Order transitions to ready for pickup!
    setPaymentActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-855 flex flex-col h-full shrink-0 text-slate-300">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-850 bg-slate-950/20">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-base leading-none">Mi Salud</h1>
            <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Portal de Pacientes</span>
          </div>
        </div>

        {/* Dynamic QR Code Sidebar Card */}
        <div className="p-4 border-b border-slate-855 bg-slate-950/30 space-y-3">
          <div className="flex justify-between items-center text-2xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Credencial QR Dinámica</span>
            <button 
              onClick={handleRefreshQR} 
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3 animate-spin-slow" />
              <span>Rotar</span>
            </button>
          </div>

          <div className="flex flex-col items-center bg-white p-3 rounded-xl shadow-inner relative group border border-slate-700/10">
            <svg viewBox="0 0 100 100" className="w-28 h-28 text-slate-900">
              <rect x="0" y="0" width="20" height="20" fill="currentColor" />
              <rect x="5" y="5" width="10" height="10" fill="white" />
              <rect x="80" y="0" width="20" height="20" fill="currentColor" />
              <rect x="85" y="5" width="10" height="10" fill="white" />
              <rect x="0" y="80" width="20" height="20" fill="currentColor" />
              <rect x="5" y="85" width="10" height="10" fill="white" />
              
              <rect x="30" y="10" width="10" height="5" fill="currentColor" />
              <rect x="45" y="5" width="5" height="15" fill="currentColor" />
              <rect x="60" y="0" width="10" height="10" fill="currentColor" />
              <rect x="35" y="30" width="15" height="10" fill="currentColor" />
              <rect x="10" y="35" width="10" height="15" fill="currentColor" />
              <rect x="55" y="45" width="20" height="5" fill="currentColor" />
              <rect x="30" y="60" width="15" height="15" fill="currentColor" />
              <rect x="80" y="30" width="10" height="20" fill="currentColor" />
              <rect x="75" y="60" width="15" height="10" fill="currentColor" />
              <rect x="50" y="80" width="25" height="15" fill="currentColor" />
              <rect x="85" y="85" width="10" height="10" fill="currentColor" />
            </svg>
            
            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                TOKEN: {qrToken}
              </span>
              <p className="text-[8px] text-slate-500 font-medium mt-0.5">
                Vence en <span className="text-rose-500 font-bold">{qrSecondsLeft}s</span>
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="px-4 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Mi Historial
          </div>
          
          <button 
            onClick={() => setActiveSubTab('recipes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'recipes'
                ? 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-white border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border-l-2 border-transparent'
            }`}
          >
            <FileText className={`h-5 w-5 ${activeSubTab === 'recipes' ? 'text-indigo-400' : ''}`} />
            <span>Récipes Médicos</span>
          </button>
          
          <button 
            onClick={() => setActiveSubTab('proposals')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'proposals'
                ? 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-white border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border-l-2 border-transparent'
            }`}
          >
            <FileSpreadsheet className={`h-5 w-5 ${activeSubTab === 'proposals' ? 'text-indigo-400' : ''}`} />
            <span>Propuestas de Compra</span>
          </button>

          {/* Conditional Payment Sidebar Tab */}
          <button 
            onClick={() => setActiveSubTab('payment')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === 'payment'
                ? 'bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 text-white border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-250 hover:bg-slate-850/50 border-l-2 border-transparent'
            }`}
          >
            <CreditCard className={`h-5 w-5 ${activeSubTab === 'payment' ? 'text-indigo-400' : ''}`} />
            <div className="flex-1 text-left flex justify-between items-center">
              <span>Pasarela de Pago</span>
              {pendingPayment && paymentStatus === 'Pendiente' && (
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </div>
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 border-l-2 border-transparent">
            <Calendar className="h-5 w-5" />
            <span>Consultas</span>
          </button>
        </nav>

        {/* Footer Profile & Logout */}
        <div className="p-4 border-t border-slate-855 bg-slate-950/20 space-y-3">
          <div className="flex items-center gap-3 p-1">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              SP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{patientName}</p>
              <p className="text-[10px] text-slate-500 truncate">Paciente ID #8849</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-550" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-900 flex items-center justify-between px-8 bg-slate-950/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Portal del Paciente Activo</span>
          </div>
          <span className="text-xs font-bold text-slate-350">{patientEmail}</span>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">

            {/* TAB 1: RECIPES VIEW (Pantalla P.1) */}
            {activeSubTab === 'recipes' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Historial de Récipes Médicos</h2>
                  <p className="text-sm text-slate-400">Consulte, visualice e imprima sus recetas prescritas vigentes.</p>
                </div>

                {/* Progress Stepper for last order */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group">
                  <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Última Orden de Farmacia</span>
                      <span className="text-xs font-mono font-semibold text-slate-500">ID: #ORD-9923</span>
                    </div>
                    <h3 className="text-sm font-bold text-white">Retiro de Medicamentos (Receta Activa)</h3>
                    <p className="text-xs text-slate-400">Retira en {selectedBranch}</p>
                  </div>

                  <div className="flex flex-col space-y-2 z-10 shrink-0">
                    <span className="text-[10px] text-slate-500 font-bold uppercase md:text-right">Progreso de Entrega</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl gap-6">
                        {/* Step 1: Pendiente */}
                        <div className="flex items-center gap-2 relative">
                          <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            lastOrderStatus === 'Pendiente por retirar' 
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {lastOrderStatus === 'Listo para retirar' || lastOrderStatus === 'Retirado' ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                            ) : '1'}
                          </span>
                          <span className={`text-2xs font-semibold ${
                            lastOrderStatus === 'Pendiente por retirar' ? 'text-amber-400 font-bold' : 'text-slate-500'
                          }`}>Pendiente</span>
                        </div>

                        <span className="h-0.5 w-6 bg-slate-800"></span>

                        {/* Step 2: Listo */}
                        <div className="flex items-center gap-2 relative">
                          <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            lastOrderStatus === 'Listo para retirar' 
                              ? 'bg-indigo-500 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.5)]' 
                              : lastOrderStatus === 'Retirado'
                              ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                              : '2'
                          }`}>
                            {lastOrderStatus === 'Retirado' ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                            ) : '2'}
                          </span>
                          <span className={`text-2xs font-semibold ${
                            lastOrderStatus === 'Listo para retirar' ? 'text-indigo-400 font-bold' : 'text-slate-500'
                          }`}>Listo para Retirar</span>
                        </div>

                        <span className="h-0.5 w-6 bg-slate-800"></span>

                        {/* Step 3: Retirado */}
                        <div className="flex items-center gap-2 relative">
                          <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            lastOrderStatus === 'Retirado' 
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            3
                          </span>
                          <span className={`text-2xs font-semibold ${
                            lastOrderStatus === 'Retirado' ? 'text-emerald-400 font-bold' : 'text-slate-500'
                          }`}>Retirado</span>
                        </div>
                      </div>

                      <button 
                        onClick={cycleOrderStatus} 
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                        title="Simular actualización del estado de entrega"
                      >
                        <PackageCheck className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`absolute top-0 right-0 h-1 w-full bg-gradient-to-r ${
                    lastOrderStatus === 'Pendiente por retirar' 
                      ? 'from-amber-400 to-amber-600' 
                      : lastOrderStatus === 'Listo para retirar'
                      ? 'from-indigo-400 to-purple-600'
                      : 'from-emerald-400 to-teal-500'
                  }`}></div>
                </div>

                {/* Recipes Table Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Récipes Emitidos por Especialistas</h3>
                    <p className="text-xs text-slate-400">Listado cronológico de recetas autorizadas.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-850 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="pb-3">Código</th>
                          <th className="pb-3">Fecha de Emisión</th>
                          <th className="pb-3">Medicamento</th>
                          <th className="pb-3">Especialista</th>
                          <th className="pb-3">Estado</th>
                          <th className="pb-3 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {recipes.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-850/25 transition-colors group">
                            <td className="py-4 font-mono font-bold text-xs text-white">{rec.id}</td>
                            <td className="py-4 text-xs text-slate-400">{rec.date}</td>
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-200">{rec.medication}</span>
                                <span className="text-[10px] text-slate-500">{rec.dosage}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-200 font-semibold">{rec.doctor}</span>
                                <span className="text-[10px] text-slate-500">{rec.specialty}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-0.5 text-2xs font-semibold border rounded-full ${
                                rec.status === 'Activo' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {rec.status}
                              </span>
                            </td>
                            <td className="py-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => setSelectedRecipe(rec)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  <span>Visualizar / PDF</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMMERCIAL PROPOSAL & BILLING (Pantalla P.2) */}
            {activeSubTab === 'proposals' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Confirmación de Pedido y Facturación</h2>
                  <p className="text-sm text-slate-400">Valide la propuesta comercial enviada desde la consulta de su médico especialista.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-white text-base">Desglose de Medicamentos Recetados</h3>
                        <p className="text-xs text-slate-400">Descuentos exclusivos aplicados por su médico.</p>
                      </div>
                      <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2 py-0.5 rounded font-bold">
                        PROPUESTA #PR-2026
                      </span>
                    </div>

                    <div className="divide-y divide-slate-850">
                      {proposalItems.map((item) => {
                        const originalSub = item.unitPrice * item.quantity;
                        const finalSub = calculateItemSubtotal(item);
                        const discountAmt = originalSub - finalSub;
                        return (
                          <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="text-sm font-bold text-slate-200">{item.medication}</h4>
                              <p className="text-xs text-slate-550 flex items-center gap-2">
                                <span>Cant: {item.quantity}</span>
                                <span>•</span>
                                <span>Precio Unitario: ${item.unitPrice.toFixed(2)}</span>
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-4 text-right">
                              {item.discountPercent > 0 && (
                                <div className="space-y-0.5">
                                  <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold">
                                    -{item.discountPercent}% Médico
                                  </span>
                                  <p className="text-[10px] text-rose-400/80 font-medium">Ahorras: -${discountAmt.toFixed(2)}</p>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-white">${finalSub.toFixed(2)}</p>
                                {item.discountPercent > 0 && (
                                  <span className="text-2xs text-slate-500 line-through">${originalSub.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        {termsAccepted ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-455 flex items-center justify-center border border-rose-500/25">
                            <Info className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <span className="text-xs text-slate-350">
                          {termsAccepted 
                            ? 'Términos y condiciones aceptados.' 
                            : 'Requiere la aceptación de Términos y Condiciones Farma-Humana.'
                          }
                        </span>
                      </div>

                      <button
                        onClick={() => setIsTermsModalOpen(true)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                      >
                        {termsAccepted ? 'Ver Términos' : 'Aceptar Términos'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                      <h3 className="font-bold text-white text-base">Resumen de Facturación</h3>

                      <div className="space-y-2.5 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Subtotal Bruto</span>
                          <span className="font-medium text-slate-300">${totals.grossTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-rose-400">
                          <span>Ahorro Exclusivo</span>
                          <span className="font-bold">-${totals.totalSavings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal Neto</span>
                          <span className="font-medium text-slate-300">${totals.netSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>IVA (21%)</span>
                          <span className="font-medium text-slate-300">${totals.vat.toFixed(2)}</span>
                        </div>
                        
                        <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                          <span className="font-bold text-white text-sm">Total Neto</span>
                          <span className="text-xl font-black text-indigo-400">${totals.netTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
                      <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Building className="h-4 w-4 text-slate-400" />
                        <span>Sucursal de Envío</span>
                      </h3>
                      
                      <div className="space-y-2">
                        <label className="text-2xs text-slate-550 font-bold uppercase">Seleccione Sucursal de Destino</label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="Farma-Humana Central (Av. de la Castellana 210)">Farma-Humana Central (Av. Castellana 210)</option>
                          <option value="Farma-Humana Norte (Calle Serrano 80)">Farma-Humana Norte (Calle Serrano 80)</option>
                          <option value="Farma-Humana Sur (Av. de la Albufera 14)">Farma-Humana Sur (Av. Albufera 14)</option>
                        </select>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Al confirmar, la receta electrónica y el detalle del carrito serán despachados automáticamente a esta sucursal para su posterior retiro físico.
                      </p>
                    </div>

                    <button
                      onClick={handleConfirmProposal}
                      disabled={!termsAccepted}
                      className={`w-full py-3.5 font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        termsAccepted 
                          ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-indigo-650/10 hover:shadow-indigo-650/25 hover:from-indigo-600 hover:to-cyan-600'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      }`}
                    >
                      <span>Confirmar y Enviar Carrito</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 3: PAYMENT GATEWAY & TIMER (Pantalla P.3) */}
            {activeSubTab === 'payment' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Pasarela de Confirmación de Pago</h2>
                  <p className="text-sm text-slate-400">Complete su pago digital antes de que finalice la reserva temporal de su inventario.</p>
                </div>

                {!pendingPayment || paymentStatus === 'Completado' ? (
                  /* Completed State or No Pending Payments */
                  <div className="space-y-6">
                    {paymentStatus === 'Completado' ? (
                      /* Printable Invoice/Receipt layout */
                      <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-8 shadow-2xl space-y-6 max-w-2xl mx-auto print:p-0 print:border-none print:shadow-none">
                        
                        {/* Receipt Header */}
                        <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-indigo-900">
                              <Receipt className="h-7 w-7 text-indigo-650" />
                              <h1 className="text-xl font-black tracking-tight font-serif uppercase">Farma-Humana</h1>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Sucursal asociada: {selectedBranch}<br />
                              Fecha Pago: {new Date().toLocaleDateString('es-ES')}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold bg-slate-100 border border-slate-350 px-2.5 py-1 rounded-full text-slate-750">
                              {invoiceNumber}
                            </span>
                            <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase text-emerald-600">Comprobante de Venta</p>
                          </div>
                        </div>

                        {/* Invoice Metadata */}
                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Cliente / Paciente</span>
                            <p className="font-bold text-slate-800 mt-0.5">{patientName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Correo: {patientEmail}</p>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Método Pago Registrado</span>
                            <p className="font-bold text-slate-800 mt-0.5 capitalize">
                              {paymentMethod === 'bizum' ? 'Bizum / Pago Móvil' : paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Tarjeta de Crédito'}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Estado: Transacción Verificada</p>
                          </div>
                        </div>

                        {/* Invoice Items */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-indigo-950 uppercase tracking-widest border-b border-slate-200 pb-1">Concepto de Facturación</h4>
                          <div className="divide-y divide-slate-150 text-xs">
                            {proposalItems.map(item => (
                              <div key={item.id} className="py-2.5 flex justify-between">
                                <div>
                                  <span className="font-bold text-slate-800">{item.medication}</span>
                                  <p className="text-[10px] text-slate-500">Cant: {item.quantity} • Descuento médico aplicado</p>
                                </div>
                                <span className="font-bold text-slate-800">${calculateItemSubtotal(item).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total breakdowns */}
                        <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs space-y-1.5">
                          <div className="flex justify-between w-48 text-slate-550">
                            <span>Subtotal Neto</span>
                            <span>${totals.netSubtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between w-48 text-slate-550">
                            <span>IVA (21%)</span>
                            <span>${totals.vat.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between w-48 text-slate-900 border-t border-slate-200 pt-1.5 font-bold">
                            <span className="text-sm">Total Pagado</span>
                            <span className="text-sm text-indigo-650">${totals.netTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Transaction Verification footer details */}
                        <div className="border-t border-slate-200 pt-5 flex items-center justify-between text-[9px] text-slate-400">
                          <div>
                            <p className="font-bold uppercase text-slate-500">Farma-Humana Digital Safe</p>
                            <p className="mt-0.5">Firmado criptográficamente por Farma-Humana Co.</p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600 font-bold uppercase border border-emerald-500/20 bg-emerald-50 px-2.5 py-1 rounded-lg select-none">
                            <Check className="h-3.5 w-3.5" />
                            <span>PAGO APROBADO</span>
                          </div>
                        </div>

                        {/* Receipt action controls */}
                        <div className="pt-4 flex justify-end gap-2 print:hidden">
                          <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="h-4 w-4" />
                            <span>Imprimir Comprobante</span>
                          </button>
                          <button
                            onClick={() => {
                              setPendingPayment(false);
                              setPaymentStatus('Pendiente');
                              setActiveSubTab('recipes'); // Return to recipes view
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                          >
                            Ir a Mis Récipes
                          </button>
                        </div>

                      </div>
                    ) : (
                      /* No Pending Payments screen */
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto space-y-4">
                        <div className="h-12 w-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-white text-base">Sin Pagos Pendientes</h3>
                          <p className="text-xs text-slate-400">No tienes ninguna propuesta comercial pendiente de facturación en este momento.</p>
                        </div>
                        <button
                          onClick={() => setActiveSubTab('proposals')}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Ir a Propuestas de Compra
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Active Pending Payment Gateway with Countdown Timer */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Payment registration form (2/3 width) */}
                    <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-5">
                      <div className="border-b border-slate-850 pb-4">
                        <h3 className="font-bold text-white text-base">Método de Pago Seleccionado</h3>
                        <p className="text-xs text-slate-400">Seleccione su canal de pago preferido para registrar la transacción.</p>
                      </div>

                      {/* Payment method selector buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <CreditCard className="h-5 w-5" />
                          <span className="text-2xs font-bold uppercase">Tarjeta Crédito</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bizum')}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'bizum'
                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Phone className="h-5 w-5" />
                          <span className="text-2xs font-bold uppercase">Bizum / Pago</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('transfer')}
                          className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                            paymentMethod === 'transfer'
                              ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                              : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <Building className="h-5 w-5" />
                          <span className="text-2xs font-bold uppercase">Transferencia</span>
                        </button>
                      </div>

                      {/* Payment registration forms */}
                      <form onSubmit={handleRegisterPayment} className="space-y-4">
                        
                        {/* 1. Credit Card Form */}
                        {paymentMethod === 'card' && (
                          <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-850 rounded-xl animate-in fade-in duration-150">
                            <div className="space-y-1.5">
                              <label className="text-2xs font-bold text-slate-400 uppercase">Número de Tarjeta</label>
                              <input
                                type="text"
                                placeholder="4000 1234 5678 9010"
                                value={cardNum}
                                onChange={(e) => setCardNum(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-2xs font-bold text-slate-400 uppercase">Titular de Tarjeta</label>
                                <input
                                  type="text"
                                  placeholder="Sofia Peralta"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-2xs font-bold text-slate-400 uppercase">CVV</label>
                                <input
                                  type="password"
                                  placeholder="•••"
                                  maxLength={3}
                                  value={cardCVV}
                                  onChange={(e) => setCardCVV(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. Bizum / Pago Móvil Form */}
                        {paymentMethod === 'bizum' && (
                          <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 animate-in fade-in duration-150">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-lg text-[10px] text-indigo-350 leading-relaxed">
                              Realice el pago móvil / Bizum por el importe exacto al número <strong>+34 600 123 456</strong> y registre los datos a continuación.
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1.5">
                                <label className="text-2xs font-bold text-slate-400 uppercase">Número de Teléfono</label>
                                <input
                                  type="text"
                                  placeholder="612 345 678"
                                  value={phoneBizum}
                                  onChange={(e) => setPhoneBizum(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-2xs font-bold text-slate-400 uppercase">Referencia de Pago</label>
                                <input
                                  type="text"
                                  placeholder="REF-99120"
                                  value={refBizum}
                                  onChange={(e) => setRefBizum(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 3. Bank Transfer Form */}
                        {paymentMethod === 'transfer' && (
                          <div className="space-y-3 p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-3 animate-in fade-in duration-150">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/15 rounded-lg text-[10px] text-indigo-350 leading-relaxed font-mono">
                              IBAN FARMA-HUMANA: ES21 0049 1500 0512 3456 7890<br />
                              Beneficiario: Farma-Humana S.A.
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-2xs font-bold text-slate-400 uppercase">Número de Referencia de Transferencia</label>
                              <input
                                type="text"
                                placeholder="TR-2026-99238"
                                value={refTransfer}
                                onChange={(e) => setRefTransfer(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-650/10 hover:shadow-indigo-650/25 hover:from-indigo-600 hover:to-cyan-600 transition-all cursor-pointer"
                        >
                          Enviar Registro de Pago
                        </button>
                      </form>
                    </div>

                    {/* Timer Countdown Panel (1/3 width) */}
                    <div className="space-y-6">
                      
                      {/* Interactive countdown widget */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md text-center space-y-4 relative overflow-hidden">
                        <div className="space-y-1 z-10 relative">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tiempo Límite de Reserva</span>
                          <div className={`text-3xl font-black font-mono tracking-widest py-2 select-none animate-pulse ${
                            paymentSecondsLeft <= 60 
                              ? 'text-rose-500' 
                              : paymentSecondsLeft <= 300 
                              ? 'text-amber-500' 
                              : 'text-indigo-400'
                          }`}>
                            {formatTime(paymentSecondsLeft)}
                          </div>
                        </div>

                        {/* Progress bar visual indicators */}
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden z-10 relative">
                          <div 
                            className={`h-full transition-all duration-1000 ease-linear ${
                              paymentSecondsLeft <= 60 
                                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' 
                                : paymentSecondsLeft <= 300 
                                ? 'bg-amber-500' 
                                : 'bg-indigo-500'
                            }`}
                            style={{ width: `${(paymentSecondsLeft / 900) * 100}%` }}
                          ></div>
                        </div>

                        <div className="flex items-start gap-2.5 p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-left text-[10px] text-slate-400 leading-relaxed z-10 relative">
                          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>
                            Su inventario ha sido apartado en la sucursal de Farma-Humana. Complete el pago antes de que finalice el temporizador o la reserva será liberada.
                          </span>
                        </div>
                      </div>

                      {/* Pay Summary info widget */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resumen de Factura</h4>
                        <div className="text-xs text-slate-400 space-y-2">
                          <div className="flex justify-between">
                            <span>Concepto</span>
                            <span className="text-white font-semibold">2 Medicamentos</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sucursal Destino</span>
                            <span className="text-white font-semibold truncate max-w-[150px]">{selectedBranch}</span>
                          </div>
                          <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline font-bold">
                            <span className="text-white">Total a Pagar</span>
                            <span className="text-base text-indigo-400">${totals.netTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        </main>
      </div>

      {/* Printable Clinical Prescription Modal (PDF View for P.1) */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setSelectedRecipe(null)}></div>
          
          <div className="relative bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] print:max-h-full print:shadow-none print:w-full print:rounded-none">
            
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800 print:hidden">
              <span className="text-xs font-bold font-mono text-indigo-400 flex items-center gap-1.5">
                <FileCheck className="h-4.5 w-4.5" />
                VISTA PREVIA DEL RECETARIO CLÍNICO
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 text-xs bg-slate-850 hover:bg-slate-800 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-700"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir / PDF</span>
                </button>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto print:overflow-visible bg-white print:p-0">
              
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-900">
                    <Activity className="h-7 w-7 text-indigo-700" />
                    <h1 className="text-2xl font-black tracking-tight font-serif uppercase">Clínica Zenith</h1>
                  </div>
                  <p className="text-2xs text-slate-500 font-medium">
                    Servicios de Cardiología y Diagnóstico Especializado<br />
                    Av. de la Castellana 210, Madrid • Tel: +34 912 345 678
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold bg-slate-100 border border-slate-300 px-3 py-1 rounded-full text-slate-700 font-mono">
                    {selectedRecipe.id}
                  </span>
                  <p className="text-2xs text-slate-400 mt-2">Documento Digital Firmado</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Paciente</p>
                  <p className="font-bold text-slate-850 text-sm mt-0.5">{patientName}</p>
                  <p className="text-slate-500 mt-1">ID: #8849-SP • Correo: {patientEmail}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Fecha Prescripción</p>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedRecipe.date}</p>
                  <p className="text-slate-555 mt-1">Validez: Hasta el {selectedRecipe.expiryDate}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest border-b border-slate-200 pb-1.5 font-sans">
                  Rx Prescripción Médica
                </h3>
                
                <div className="p-4 bg-slate-50/20 border border-dashed border-slate-300 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 font-serif">{selectedRecipe.medication}</h4>
                      <p className="text-xs font-semibold text-slate-600 mt-1">{selectedRecipe.dosage}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] font-bold text-indigo-950 uppercase">Instrucciones de Dosificación:</p>
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                      "{selectedRecipe.instructions}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-between items-end gap-6">
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-850">{selectedRecipe.doctor}</p>
                  <p className="text-[10px] text-slate-550">{selectedRecipe.specialty}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedRecipe.doctorLicense}</p>
                </div>
                
                <div className="flex flex-col items-center relative pr-4">
                  <div className="h-14 w-32 border-2 border-indigo-700/60 rounded-lg flex flex-col items-center justify-center p-1 text-indigo-750 rotate-3 font-serif select-none pointer-events-none bg-white/50 backdrop-blur-2xs">
                    <span className="text-[7px] font-bold uppercase tracking-wider">Médico Autorizado</span>
                    <span className="text-2xs font-extrabold uppercase my-0.5 tracking-tight font-sans">D.A. Ríos</span>
                    <span className="text-[7px] font-mono leading-none">REGISTRADO EN SISTEMA</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1">Firma Digital Verificada</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Código de Verificación Único</span>
                  <span className="text-2xs font-mono font-medium text-slate-600">
                    SEC-TOKEN: {selectedRecipe.id}-A9812-7
                  </span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <svg viewBox="0 0 100 20" className="w-36 h-6 text-slate-900">
                    <rect x="0" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="3" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="5" y="0" width="3" height="20" fill="currentColor" />
                    <rect x="10" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="13" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="17" y="0" width="4" height="20" fill="currentColor" />
                    <rect x="23" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="25" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="29" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="32" y="0" width="3" height="20" fill="currentColor" />
                    <rect x="37" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="40" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="44" y="0" width="4" height="20" fill="currentColor" />
                    <rect x="50" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="53" y="0" width="3" height="20" fill="currentColor" />
                    <rect x="58" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="61" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="65" y="0" width="4" height="20" fill="currentColor" />
                    <rect x="71" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="74" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="78" y="0" width="3" height="20" fill="currentColor" />
                    <rect x="83" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="86" y="0" width="2" height="20" fill="currentColor" />
                    <rect x="90" y="0" width="4" height="20" fill="currentColor" />
                    <rect x="96" y="0" width="1" height="20" fill="currentColor" />
                    <rect x="98" y="0" width="2" height="20" fill="currentColor" />
                  </svg>
                  <span className="text-[7px] font-mono text-slate-400">Verificar autenticidad en portal.zenithclinica.com</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Mandatory Terms & Conditions Modal (Farma-Humana) (P.2) */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={() => setIsTermsModalOpen(false)}></div>
          
          <div className="relative bg-slate-900 border border-slate-800 text-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-855 bg-slate-955/40">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-400" />
                <span>Términos y Condiciones Farma-Humana</span>
              </h3>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs text-slate-400 leading-relaxed">
              <p className="font-bold text-white">1. Tratamiento de Datos Personales y de Salud</p>
              <p>
                Al aceptar estos términos, autoriza expresamente a Farma-Humana al tratamiento de sus datos sensibles de salud, incluyendo prescripciones médicas, medicamentos recetados y diagnóstico clínico relacionado, de acuerdo con la Ley Orgánica de Protección de Datos de Carácter Personal (LOPD). Sus datos serán confidenciales y procesados únicamente para fines de expendio farmacéutico.
              </p>
              
              <p className="font-bold text-white">2. Despacho y Recogida en Sucursales</p>
              <p>
                Los medicamentos serán reservados en la sucursal seleccionada durante un plazo máximo de 7 días hábiles a partir de la confirmación digital. Transcurrido este periodo, la orden será automáticamente cancelada y los productos serán reincorporados al stock disponible.
              </p>

              <p className="font-bold text-white">3. Validación Física de la Receta</p>
              <p>
                Para el retiro efectivo de medicamentos controlados o sujetos a prescripción obligatoria, el paciente deberá presentar la Credencial QR Dinámica vigente generada en esta aplicación, junto con su documento nacional de identidad original en el mostrador de atención.
              </p>
            </div>

            <div className="p-4 bg-slate-955/65 border-t border-slate-855 flex flex-col gap-3">
              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-850 text-[11px] text-slate-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
                />
                <span>He leído y acepto expresamente los términos de tratamiento de datos y políticas de retiro físico de Farma-Humana.</span>
              </label>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setTermsAccepted(false);
                    setIsTermsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 transition-all cursor-pointer"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => setIsTermsModalOpen(false)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-650/10 hover:shadow-indigo-650/20 transition-all cursor-pointer"
                >
                  Aceptar y Continuar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
