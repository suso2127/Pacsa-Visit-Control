"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  UserPlus, 
  CreditCard,
  User,
  QrCode,
  Scan,
  ScanBarcode,
  Loader2,
  CheckCircle2,
  Building2,
  Briefcase,
  Car,
  Volume2,
  VolumeX,
  ShieldCheck,
  X,
  History,
  LogOut,
  Clock,
  Search,
  Save,
  ArrowLeft,
  ArrowRight,
  MessageSquareText,
  AlertCircle,
  Database,
  Camera
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { collection, addDoc, serverTimestamp, query, getDocs, limit, orderBy, doc, updateDoc } from "firebase/firestore"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { Badge } from "@/components/ui/badge"
import { Html5Qrcode } from "html5-qrcode"

export default function GuardDashboard() {
  const db = useFirestore()
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isReading, setIsReading] = React.useState(false)
  const [isCapturingPlate, setIsCapturingPlate] = React.useState(false)
  const [soundEnabled, setSoundEnabled] = React.useState(false)
  const [visitorSearchTerm, setVisitorSearchTerm] = React.useState("")
  const [isSessionStarted, setIsSessionStarted] = React.useState(false)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  
  const [guardSession, setGuardSession] = React.useState({
    name: "",
    puesto: ""
  })

  const [formData, setFormData] = React.useState({
    guardName: "",
    guardPuesto: "",
    name: "",
    documentId: "",
    torre: "",
    apartamento: "",
    category: "VISITAS",
    company: "",
    plate: "",
    platePhoto: null as string | null
  })

  const [showScanner, setShowScanner] = React.useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = React.useState(false)
  const [showPlateCamera, setShowPlateCamera] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [lastRegistered, setLastRegistered] = React.useState<any>(null)
  
  const qrScannerRef = React.useRef<Html5Qrcode | null>(null)
  const barcodeScannerRef = React.useRef<Html5Qrcode | null>(null)

  React.useEffect(() => {
    const saved = localStorage.getItem('pacsa_guard_session')
    if (saved) {
      const parsed = JSON.parse(saved)
      setGuardSession(parsed)
      setIsSessionStarted(true)
      setFormData(prev => ({
        ...prev,
        guardName: parsed.name,
        guardPuesto: parsed.puesto
      }))
    }
  }, [])

  const visitorsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "visitas"), orderBy("checkInTime", "desc"))
  }, [db])

  const { data: visitors, loading: loadingVisitors } = useCollection(visitorsQuery)

  const activeVisitors = React.useMemo(() => {
    return visitors?.filter(v => v.status === 'active') || []
  }, [visitors])

  const filteredActiveVisitors = React.useMemo(() => {
    if (!visitorSearchTerm) return activeVisitors
    return activeVisitors.filter(v => 
      v.name?.toLowerCase().includes(visitorSearchTerm.toLowerCase()) || 
      v.documentId?.toLowerCase().includes(visitorSearchTerm.toLowerCase())
    )
  }, [activeVisitors, visitorSearchTerm])

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showScanner) {
      timeoutId = setTimeout(async () => {
        try {
          const scannerElement = document.getElementById("qr-reader");
          if (!scannerElement) return;

          qrScannerRef.current = new Html5Qrcode("qr-reader")
          await qrScannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              try {
                const data = JSON.parse(decodedText)
                setFormData(prev => ({
                  ...prev,
                  name: (data.nombre || "").toUpperCase(),
                  documentId: (data.cedula || "").toUpperCase(),
                  torre: (data.torre || "").toUpperCase(),
                  apartamento: (data.apartamento || "").toUpperCase(),
                  category: (data.categoria || "VISITAS").toUpperCase()
                }))
                toast({ title: "Pase Digital Leído", description: "Datos autocompletados con éxito." })
                handleStopScanner(qrScannerRef)
                setShowScanner(false)
              } catch (e) {
                handleLegacyScan(decodedText)
              }
            },
            () => {}
          )
        } catch (err) {
          console.error("Error al iniciar scanner QR:", err)
          toast({ variant: "destructive", title: "Error de Cámara", description: "No se pudo acceder a la cámara o el contenedor no está listo." })
        }
      }, 150)
    } else {
      handleStopScanner(qrScannerRef)
    }
    return () => {
      clearTimeout(timeoutId)
      handleStopScanner(qrScannerRef)
    }
  }, [showScanner])

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showBarcodeScanner) {
      timeoutId = setTimeout(async () => {
        try {
          const scannerElement = document.getElementById("barcode-reader");
          if (!scannerElement) return;

          barcodeScannerRef.current = new Html5Qrcode("barcode-reader")
          await barcodeScannerRef.current.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 300, height: 150 } },
            (decodedText) => {
              setFormData(prev => ({
                ...prev,
                documentId: decodedText.toUpperCase()
              }))
              toast({ title: "ID Escaneado", description: "Cédula registrada en el formulario." })
              handleStopScanner(barcodeScannerRef)
              setShowBarcodeScanner(false)
            },
            () => {}
          )
        } catch (err) {
          console.error("Error al iniciar scanner Barcode:", err)
          toast({ variant: "destructive", title: "Error de Cámara", description: "No se pudo acceder a la cámara o el contenedor no está listo." })
        }
      }, 150)
    } else {
      handleStopScanner(barcodeScannerRef)
    }
    return () => {
      clearTimeout(timeoutId)
      handleStopScanner(barcodeScannerRef)
    }
  }, [showBarcodeScanner])

  const handleStopScanner = (ref: React.MutableRefObject<Html5Qrcode | null>) => {
    if (ref.current && ref.current.isScanning) {
      ref.current.stop().then(() => {
        ref.current?.clear()
        ref.current = null
      }).catch(err => console.error("Error deteniendo scanner:", err))
    }
  }

  const handleLegacyScan = async (id: string) => {
    if (!db) return
    const q = query(collection(db, "previsitas"), orderBy("createdAt", "desc"), limit(1))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const visitData = snapshot.docs[0].data()
      setFormData(prev => ({
        ...prev,
        name: (visitData.visitorName || "").toUpperCase(),
        documentId: (visitData.visitorId || "").toUpperCase(),
        torre: (visitData.torre || "").toUpperCase(),
        apartamento: (visitData.apartamento || "").toUpperCase(),
        category: (visitData.visitType || "VISITAS").toUpperCase()
      }))
      toast({ title: "Buscando Pre-Registro", description: "Datos encontrados por correlación." })
      setShowScanner(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleGuardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGuardSession(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleRegisterGuard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guardSession.name || !guardSession.puesto) {
      toast({
        variant: "destructive",
        title: "Datos Faltantes",
        description: "Debe ingresar su nombre y código de puesto.",
      })
      return
    }

    localStorage.setItem('pacsa_guard_session', JSON.stringify(guardSession))
    setFormData(prev => ({
      ...prev,
      guardName: guardSession.name,
      guardPuesto: guardSession.puesto
    }))
    setIsSessionStarted(true)
    toast({
      title: "Sesión Iniciada",
      description: "Datos del guardia sincronizados correctamente.",
    })
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }))
  }

  const handleRegisterVisit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!db) return
    
    setIsSubmitting(true)
    
    const dataToSave = {
      ...formData,
      status: "active",
      checkInTime: new Date().toISOString(),
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "visitas"), dataToSave)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'visitas',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    setLastRegistered(dataToSave)
    setShowSuccess(true)
    
    setFormData(prev => ({
      ...prev,
      name: "",
      documentId: "",
      torre: "",
      apartamento: "",
      category: "VISITAS",
      company: "",
      plate: "",
      platePhoto: null
    }))
    setIsSubmitting(false)

    toast({
      title: "Visita Registrada",
      description: "Ingreso autorizado correctamente en GRUPO PACSA S.A",
    })
  }

  const handleSignOut = (visitorId: string) => {
    if (!db) return
    const docRef = doc(db, "visitas", visitorId)
    updateDoc(docRef, {
      status: "checked-out",
      checkOutTime: new Date().toISOString()
    }).catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: { status: 'checked-out' }
      })
      errorEmitter.emit('permission-error', permissionError)
    })

    toast({
      title: "Salida Registrada",
      description: "El visitante ha abandonado las instalaciones.",
    })
  }

  const handleCapturePlatePhoto = () => {
    setIsCapturingPlate(true)
    setTimeout(() => {
      const simulatedPlate = "ABC-" + Math.floor(Math.random() * 9999);
      setFormData(prev => ({
        ...prev,
        plate: simulatedPlate,
        platePhoto: "data:image/jpeg;base64,..."
      }))
      setIsCapturingPlate(false)
      setShowPlateCamera(false)
      toast({
        title: "Placa Capturada",
        description: `Matrícula ${simulatedPlate} registrada visualmente.`,
      })
    }, 1500)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    if (!soundEnabled) {
      toast({
        title: "Alarmas Activadas",
        description: "Sonido de alerta habilitado para nuevas visitas.",
      })
    }
  }

  const handleNotifyWhatsApp = () => {
    if (!lastRegistered) return;
    const text = `*NOTIFICACIÓN DE ACCESO - GRUPO PACSA S.A.*\n\nSe informa que el acceso para:\n\n👤 *Visitante:* ${lastRegistered.name}\n🆔 *ID/Cédula:* ${lastRegistered.documentId}\n📍 *Destino:* Torre ${lastRegistered.torre} - Apt ${lastRegistered.apartamento}\n🏢 *Empresa/Placa:* ${lastRegistered.company || 'PARTICULAR'} ${lastRegistered.plate ? `(${lastRegistered.plate})` : ''}\n\nHa sido *AUTORIZADO* e ingresado al PH bajo la supervisión del guardia: ${lastRegistered.guardName}.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isSessionStarted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
          <Card className="border-none shadow-2xl bg-[#1e1b4b] text-white overflow-hidden rounded-[2rem]">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                  <ShieldCheck className="h-5 w-5 text-indigo-300" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-widest text-white">Gestión Operativa</h2>
              </div>

              <form onSubmit={handleRegisterGuard} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">
                      Nombre del Guardia
                    </Label>
                    <Input 
                      name="name"
                      value={guardSession.name}
                      onChange={handleGuardInputChange}
                      placeholder="ESCRIBA SU NOMBRE"
                      className="bg-white/10 border-none h-14 rounded-2xl font-black text-xs uppercase px-4 text-white placeholder:text-indigo-300/30 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-indigo-300 uppercase tracking-widest ml-1">
                      Puesto Guardia
                    </Label>
                    <Input 
                      name="puesto"
                      value={guardSession.puesto}
                      onChange={handleGuardInputChange}
                      placeholder="CÓDIGO PUESTO"
                      className="bg-white/10 border-none h-14 rounded-2xl font-black text-xs uppercase px-4 text-white placeholder:text-indigo-300/30 focus-visible:ring-2 focus-visible:ring-indigo-500/30"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-16 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-black/20 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <Save className="h-5 w-5" /> Registrar Sesión Operativa
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/selection">
              <Button variant="ghost" className="text-[10px] font-black text-muted-foreground hover:text-indigo-600 uppercase tracking-widest gap-2">
                <ArrowLeft className="h-3.5 w-3.5" /> Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <audio 
        ref={audioRef} 
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" 
        preload="auto"
      />
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950">Seguridad</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">GRUPO PACSA S.A</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSound}
              className={soundEnabled ? "text-indigo-600 bg-indigo-50 rounded-full" : "text-slate-400 rounded-full"}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                localStorage.removeItem('pacsa_guard_session')
                setIsSessionStarted(false)
              }}
              className="text-red-500 hover:bg-red-50 rounded-full"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Card className="bg-[#1e1b4b] border-none shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <p className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest">Oficial en Servicio</p>
                </div>
                <p className="text-sm font-black text-white uppercase">{guardSession.name}</p>
                <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">{guardSession.puesto}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest mb-1">Hora</p>
                <p className="text-3xl font-black text-indigo-400 leading-none">
                  {format(currentTime, "hh:mm aa")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Programadas</p>
                <div className="bg-red-500/10 rounded-lg py-2">
                  <p className="text-[10px] font-black text-white">{visitors?.length || 0}</p>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Consignas</p>
                <div className="bg-red-500/10 rounded-lg py-2">
                  <p className="text-[10px] font-black text-white">0</p>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Visitantes</p>
                <div className="bg-red-500/10 rounded-lg py-2">
                  <p className="text-[10px] font-black text-white">{activeVisitors.length}</p>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Lista Negra</p>
                <div className="bg-red-500/10 rounded-lg py-2">
                  <p className="text-[10px] font-black text-white">0</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Dialog open={showScanner} onOpenChange={setShowScanner}>
              <DialogTrigger asChild>
                <Button 
                  type="button"
                  className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-4 group transition-transform active:scale-95"
                >
                  <QrCode className="h-7 w-7 group-hover:scale-110 transition-transform" />
                  LEER PASE DIGITAL (QR)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
                <div className="bg-[#1e1b4b] p-6 text-center text-white relative">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black uppercase tracking-widest text-white">Escáner PACSA</DialogTitle>
                  </DialogHeader>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase mt-1">Apunte la cámara al código QR</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="aspect-square w-full bg-black rounded-2xl relative overflow-hidden ring-4 ring-indigo-500/10">
                    <div id="qr-reader" className="w-full h-full"></div>
                    <div className="absolute inset-x-10 top-1/2 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse pointer-events-none" />
                  </div>
                  <Button 
                    onClick={() => setShowScanner(false)} 
                    className="w-full h-14 bg-indigo-900 text-white font-black text-xs uppercase tracking-widest rounded-xl"
                  >
                    CANCELAR LECTURA
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
              <DialogTrigger asChild>
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full h-14 border-2 border-dashed border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <ScanBarcode className="h-5 w-5" />
                  LEER CÉDULA (BARRA)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
                <div className="bg-[#064e3b] p-6 text-center text-white relative">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black uppercase tracking-widest text-white">Lector Documentos</DialogTitle>
                  </DialogHeader>
                  <p className="text-[10px] text-emerald-200 font-bold uppercase mt-1">Escanee el código de barras</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="aspect-[16/9] w-full bg-black rounded-2xl relative overflow-hidden ring-4 ring-emerald-500/10">
                    <div id="barcode-reader" className="w-full h-full"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse pointer-events-none" />
                  </div>
                  <Button onClick={() => setShowBarcodeScanner(false)} className="w-full h-14 bg-emerald-900 text-white font-black text-xs uppercase tracking-widest rounded-xl">
                    CANCELAR LECTURA
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="px-1 pt-2">
            <h2 className="text-[14px] font-black uppercase text-indigo-950 mb-1">REGISTRO DE VISITA</h2>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              <h3 className="font-black text-[10px] uppercase tracking-widest text-indigo-900">DATOS DE INGRESO</h3>
            </div>
          </div>
          
          <Card className="border-none shadow-xl shadow-indigo-500/5 bg-card overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <form onSubmit={handleRegisterVisit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 mb-2">
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black text-indigo-950 uppercase ml-1">Guardia</Label>
                    <p className="text-[11px] font-black text-indigo-600 uppercase px-1">{guardSession.name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] font-black text-indigo-950 uppercase ml-1">Puesto</Label>
                    <p className="text-[11px] font-black text-indigo-600 uppercase px-1">{guardSession.puesto}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Nombre Completo del Visitante</Label>
                    <div className="relative">
                      <Input 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="NOMBRE" 
                        className="bg-muted/30 border-none h-11 rounded-xl pr-10 uppercase font-bold text-xs"
                        required
                      />
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Cédula / ID</Label>
                    <div className="relative">
                      <Input 
                        name="documentId"
                        value={formData.documentId}
                        onChange={handleInputChange}
                        placeholder="IDENTIFICACIÓN" 
                        className="bg-muted/30 border-none h-11 rounded-xl pr-10 uppercase font-bold text-xs"
                        required
                      />
                      <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Torre</Label>
                    <Input 
                      name="torre"
                      value={formData.torre}
                      onChange={handleInputChange}
                      placeholder="T1" 
                      className="bg-muted/30 border-none h-11 rounded-xl uppercase font-bold text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Apartamento</Label>
                    <Input 
                      name="apartamento"
                      value={formData.apartamento}
                      onChange={handleInputChange}
                      placeholder="APT" 
                      className="bg-muted/30 border-none h-11 rounded-xl uppercase font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Categoría</Label>
                    <Select value={formData.category} onValueChange={handleSelectChange}>
                      <SelectTrigger className="bg-muted/30 border-none h-11 rounded-xl font-bold uppercase text-[10px]">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VISITAS">VISITAS</SelectItem>
                        <SelectItem value="MUDANZA">MUDANZA</SelectItem>
                        <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                        <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
                        <SelectItem value="MANTENIMIENTO">TÉCNICO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Placa / Matrícula</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input 
                          name="plate"
                          value={formData.plate}
                          onChange={handleInputChange}
                          placeholder="PLACA" 
                          className="bg-muted/30 border-none h-11 rounded-xl uppercase font-bold text-xs pr-10"
                        />
                        <Car className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      </div>
                      <Dialog open={showPlateCamera} onOpenChange={setShowPlateCamera}>
                        <DialogTrigger asChild>
                          <Button 
                            type="button"
                            size="icon"
                            className="h-11 w-11 bg-indigo-100 text-indigo-900 hover:bg-indigo-200 rounded-xl shrink-0"
                          >
                            <Camera className="h-5 w-5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
                          <div className="bg-[#1e1b4b] p-6 text-center text-white relative">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-black uppercase tracking-widest text-white">Captura de Placa</DialogTitle>
                            </DialogHeader>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase mt-1">Enfoque la matrícula del vehículo</p>
                          </div>
                          <div className="p-6 space-y-4">
                            <div className="aspect-[4/3] w-full bg-black rounded-2xl relative overflow-hidden ring-4 ring-indigo-500/10">
                              <div id="plate-reader" className="w-full h-full"></div>
                              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-20 border-2 border-indigo-400 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
                                <p className="text-[8px] text-indigo-400 font-black uppercase">ALINEAR PLACA AQUÍ</p>
                              </div>
                            </div>
                            <Button 
                              onClick={handleCapturePlatePhoto} 
                              disabled={isCapturingPlate}
                              className="w-full h-14 bg-indigo-900 text-white font-black text-xs uppercase tracking-widest rounded-xl"
                            >
                              {isCapturingPlate ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Camera className="mr-2 h-4 w-4" />}
                              {isCapturingPlate ? "CAPTURANDO..." : "TOMAR FOTO DE PLACA"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Empresa (Si aplica)</Label>
                  <div className="relative">
                    <Input 
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="NOMBRE DE EMPRESA" 
                      className="bg-muted/30 border-none h-11 rounded-xl uppercase font-bold text-xs pr-10"
                    />
                    <Briefcase className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-indigo-500/20 mt-2 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "REGISTRAR E INGRESAR"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="px-1 flex items-center justify-between mb-1">
            <h2 className="text-[14px] font-black uppercase text-indigo-950">Visitantes en el PH</h2>
          </div>

          <div className="relative group">
            <Input 
              placeholder="BUSCAR VISITANTE EN PH..." 
              value={visitorSearchTerm}
              onChange={(e) => setVisitorSearchTerm(e.target.value.toUpperCase())}
              className="h-12 bg-white border-none rounded-2xl shadow-lg pl-12 text-[10px] font-black placeholder:text-muted-foreground/50 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/20"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
            <Badge className="absolute right-3 top-3.5 bg-emerald-500 text-white border-none font-black text-[9px] px-2 h-5 flex items-center">
              {activeVisitors.length} ACTIVOS
            </Badge>
          </div>

          {loadingVisitors ? (
             <div className="text-center py-10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sincronizando historial activo...</div>
          ) : filteredActiveVisitors.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-indigo-100 text-[10px] font-black uppercase text-muted-foreground">
              {visitorSearchTerm ? "No se encontraron resultados." : "No hay visitantes activos."}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActiveVisitors.map((visitor) => (
                <Card key={visitor.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-3xl overflow-hidden group">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{visitor.name}</h4>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">ID: {visitor.documentId}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black border-indigo-100 text-indigo-600 uppercase">
                        {visitor.category}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <Building2 className="h-2.5 w-2.5" /> Ubicación
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase">T{visitor.torre} - Apt {visitor.apartamento}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> Guardia
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{visitor.guardName}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        <p className="text-[9px] font-black text-emerald-600 uppercase">
                          Entrada: {format(new Date(visitor.checkInTime), "hh:mm aa", { locale: es })}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleSignOut(visitor.id)}
                        variant="outline" 
                        size="sm" 
                        className="h-9 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 font-black text-[9px] uppercase tracking-widest rounded-xl px-4 flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        MARCAR SALIDA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 mt-6">
          <Link href="/resident-database?context=security" className="block">
            <Card className="border-none shadow-lg bg-indigo-50 border-2 border-indigo-100 active:scale-[0.98] transition-all rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-indigo-900" />
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider text-indigo-950">Base de Datos Residentes</h3>
                    <p className="text-[9px] text-indigo-600 font-medium uppercase">Consulta de información interna</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-900" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/history?context=security" className="block">
            <Card className="border-none shadow-lg bg-indigo-900 text-white active:scale-[0.98] transition-all rounded-2xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5 text-indigo-200" />
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider">Historial Completo</h3>
                    <p className="text-[9px] text-indigo-200 font-medium uppercase">Ver todos los registros de ingreso</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
          <div className="bg-emerald-600 p-8 text-center text-white relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 text-white hover:bg-white/10" 
              onClick={() => setShowSuccess(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-widest text-white text-center">Ingreso Autorizado</DialogTitle>
            </DialogHeader>
            <p className="text-[10px] text-emerald-100 font-bold uppercase mt-2 tracking-widest text-center">GRUPO PACSA S.A - VERIFICADO</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Guardia Responsable</span>
                  <span className="text-xs font-black text-indigo-900 uppercase truncate max-w-[150px]">{lastRegistered?.guardName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Visitante</span>
                  <span className="text-xs font-black text-indigo-950 uppercase">{lastRegistered?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase">ID/Cédula</span>
                  <span className="text-xs font-black text-indigo-950 uppercase">{lastRegistered?.documentId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-[9px] font-black text-muted-foreground uppercase">Destino</span>
                  <span className="text-xs font-black text-indigo-950 uppercase">T{lastRegistered?.torre} - Apt {lastRegistered?.apartamento}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={handleNotifyWhatsApp}
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                   <MessageSquareText className="h-5 w-5" /> NOTIFICAR POR WHATSAPP
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline"
                    className="h-12 border-indigo-200 text-indigo-900 font-black text-[10px] uppercase tracking-widest rounded-xl"
                    onClick={() => setShowSuccess(false)}
                  >
                    NUEVO REGISTRO
                  </Button>
                  <Button 
                    variant="ghost"
                    className="h-12 text-slate-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50"
                    onClick={() => setShowSuccess(false)}
                  >
                    CERRAR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
