"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  User, 
  Building2, 
  Home, 
  Clock, 
  QrCode as QrIcon, 
  X, 
  ShieldCheck, 
  MessageSquareText,
  Save,
  Briefcase,
  Tag,
  Calendar as CalendarIcon,
  Loader2,
  CreditCard,
  Phone,
  ArrowRight,
  ArrowLeft,
  FileText
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { format } from "date-fns"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { QRCodeSVG } from "qrcode.react"

export default function PreRegisterPage() {
  const db = useFirestore()
  const [step, setStep] = React.useState<'verify' | 'form'>('verify')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showQR, setShowQR] = React.useState(false)
  const [residentPhone, setResidentPhone] = React.useState("")

  const [formData, setFormData] = React.useState({
    residentName: "",
    name: "",
    documentId: "",
    torre: "",
    apartamento: "",
    visitType: "VISITAS",
    company: "",
    time: "12:00 PM",
    date: format(new Date(), "yyyy-MM-dd")
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value.toUpperCase() }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db || !residentPhone) return

    setIsVerifying(true)
    
    const q = query(
      collection(db, "residentes"), 
      where("phone", "==", residentPhone.trim()),
      limit(1)
    )

    try {
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const residentData = querySnapshot.docs[0].data()
        setFormData(prev => ({
          ...prev,
          residentName: residentData.name || "",
          torre: residentData.torre || "",
          apartamento: residentData.apartamento || ""
        }))
        setStep('form')
        toast({
          title: "BIENVENIDO",
          description: "RESIDENTE VERIFICADO, YA PUEDE REALIZAR EL PRE-REGISTRO",
        })
      } else {
        toast({
          variant: "destructive",
          title: "ACCESO DENEGADO",
          description: "El número de teléfono no se encuentra registrado.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "ERROR DE CONEXIÓN",
        description: "No se pudo validar el acceso. Verifique su conexión.",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleShareWhatsApp = () => {
    const text = `*Pase Digital - GRUPO PACSA S.A*\n\nHola *${formData.name}*, se ha generado tu pase de acceso.\n\n🆔 *Cédula:* ${formData.documentId}\n📍 *Ubicación:* Torre ${formData.torre} - Apt ${formData.apartamento}\n🏷️ *Categoría:* ${formData.visitType}\n📅 *Fecha:* ${formData.date}\n⏰ *Hora:* ${formData.time}\n\nPresenta este código en garita para tu ingreso rápido.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  const calculateExpirationTime = (dateStr: string, timeStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      let [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (hours === 12) hours = 0;
      if (modifier === 'PM') hours += 12;

      const expirationDate = new Date(year, month - 1, day, hours, minutes);
      expirationDate.setHours(expirationDate.getHours() + 2);
      return expirationDate.toISOString();
    } catch (e) {
      return null;
    }
  }

  const handleGenerateQR = () => {
    if (!formData.name || !formData.residentName || !formData.torre || !formData.apartamento) {
      toast({ 
        variant: "destructive", 
        title: "Datos Incompletos", 
        description: "Por favor complete todos los campos obligatorios." 
      });
      return;
    }
    setShowQR(true)
  }

  const handleRegister = () => {
    if (!formData.name || !formData.residentName || !formData.torre || !formData.apartamento) {
      toast({ variant: "destructive", title: "Datos Incompletos", description: "Complete los campos obligatorios para el registro." });
      return;
    }
    if (!db) return

    setIsSubmitting(true)
    
    const expirationTime = calculateExpirationTime(formData.date, formData.time);
    
    const dataToSave = {
      residentName: formData.residentName,
      apartamento: formData.apartamento,
      torre: formData.torre,
      visitorName: formData.name,
      visitorId: formData.documentId,
      time: formData.time,
      date: formData.date,
      visitType: formData.visitType,
      company: formData.company,
      fechaExpiracion: expirationTime,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "previsitas"), dataToSave)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'previsitas',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    toast({
      title: "Registro Exitoso",
      description: "Su visita ha sido registrada en la agenda de seguridad.",
    })

    setFormData({
      residentName: "",
      name: "",
      documentId: "",
      torre: "",
      apartamento: "",
      visitType: "VISITAS",
      company: "",
      time: "12:00 PM",
      date: format(new Date(), "yyyy-MM-dd")
    })
    
    setIsSubmitting(false)
    setStep('verify')
    setResidentPhone("")
  }

  const qrData = {
    nombre: formData.name,
    cedula: formData.documentId,
    torre: formData.torre,
    apartamento: formData.apartamento,
    categoria: formData.visitType,
    fecha: formData.date,
    hora: formData.time,
    expiracion: calculateExpirationTime(formData.date, formData.time) || ""
  };
  const qrValue = JSON.stringify(qrData);

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
        
        <div className="px-1 pt-2">
          <h2 className="text-3xl font-black tracking-tighter text-[#1e1b4b]">
            {step === 'verify' ? "Verificación" : "Pre-Registro"}
          </h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">PACSA VISIT CONTROL</p>
        </div>

        {step === 'verify' ? (
          <Card className="border-none shadow-2xl shadow-indigo-500/10 overflow-hidden rounded-[2.5rem] bg-white">
            <CardContent className="p-8 space-y-7">
              <div className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black uppercase text-indigo-950">Acceso Residente</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">INGRESE con su número de teléfono</p>
              </div>

              <form onSubmit={handleVerifyPhone} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                    <Phone className="h-3 w-3 text-indigo-600" /> TELÉFONO REGISTRADO
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={residentPhone}
                    onChange={(e) => setResidentPhone(e.target.value)}
                    placeholder="Escriba su número" 
                    className="bg-muted/30 border-none h-14 rounded-2xl font-bold text-sm px-5 focus-visible:ring-indigo-500/20"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isVerifying}
                  className="w-full h-16 bg-[#2e2b70] hover:bg-[#1e1b4b] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <>
                      Verificar Identidad <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-none shadow-2xl shadow-indigo-500/10 overflow-hidden rounded-[2.5rem] bg-white">
            <CardContent className="p-8 space-y-7">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">Residente</p>
                  <p className="text-xs font-black text-indigo-900 uppercase">{formData.residentName}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep('verify')}
                  className="h-8 text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> Cambiar
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-1.5 ml-1">
                      <Building2 className="h-3 w-3 text-indigo-600" /> TORRE
                    </Label>
                    <Input 
                      value={formData.torre}
                      readOnly
                      className="bg-muted/30 border-none h-14 rounded-2xl font-black text-xs px-5 text-indigo-900/60 uppercase" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-1.5 ml-1">
                      <Home className="h-3 w-3 text-indigo-600" /> APT
                    </Label>
                    <Input 
                      value={formData.apartamento}
                      readOnly
                      className="bg-muted/30 border-none h-14 rounded-2xl font-black text-xs px-5 text-indigo-900/60 uppercase" 
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                    <User className="h-3 w-3 text-indigo-600" /> NOMBRE DEL INVITADO
                  </Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ESCRIBA EL NOMBRE DEL INVITADO" 
                    className="bg-muted/30 border-none h-14 rounded-2xl font-bold uppercase text-xs px-5 focus-visible:ring-indigo-500/20" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentId" className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                    <CreditCard className="h-3 w-3 text-indigo-600" /> CÉDULA / ID DEL INVITADO
                  </Label>
                  <Input 
                    id="documentId" 
                    value={formData.documentId}
                    onChange={handleInputChange}
                    placeholder="N° DE IDENTIFICACIÓN" 
                    className="bg-muted/30 border-none h-14 rounded-2xl font-bold uppercase text-xs px-5 focus-visible:ring-indigo-500/20" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                      <Tag className="h-3 w-3 text-indigo-600" /> CATEGORÍA
                    </Label>
                    <Select value={formData.visitType} onValueChange={(v) => handleSelectChange('visitType', v)}>
                      <SelectTrigger className="border-none bg-muted/30 h-14 rounded-2xl font-black text-xs uppercase text-left px-5 focus:ring-indigo-500/20">
                        <SelectValue placeholder="TIPO" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="VISITAS">VISITAS</SelectItem>
                        <SelectItem value="MUDANZA">MUDANZA</SelectItem>
                        <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                        <SelectItem value="MANTENIMIENTO">TÉCNICO</SelectItem>
                        <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                      <Briefcase className="h-3 w-3 text-indigo-600" /> EMPRESA
                    </Label>
                    <Input 
                      id="company" 
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="EMPRESA" 
                      className="bg-muted/30 border-none h-14 rounded-2xl font-bold uppercase text-xs px-5 focus-visible:ring-indigo-500/20" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                      <CalendarIcon className="h-3 w-3 text-indigo-600" /> FECHA
                    </Label>
                    <Input 
                      id="date" 
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="bg-muted/30 border-none h-14 rounded-2xl font-black uppercase text-xs px-5 focus-visible:ring-indigo-500/20" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                      <Clock className="h-3 w-3 text-indigo-600" /> HORA ESTIMADA
                    </Label>
                    <Select value={formData.time} onValueChange={(v) => handleSelectChange('time', v)}>
                      <SelectTrigger className="border-none bg-muted/30 h-14 rounded-2xl font-black text-xs px-5 focus:ring-indigo-500/20">
                        <SelectValue placeholder="HORA" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="06:00 AM">06:00 AM</SelectItem>
                        <SelectItem value="07:00 AM">07:00 AM</SelectItem>
                        <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                        <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                        <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                        <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                        <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                        <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                        <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                        <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                        <SelectItem value="07:00 PM">07:00 PM</SelectItem>
                        <SelectItem value="08:00 PM">08:00 PM</SelectItem>
                        <SelectItem value="09:00 PM">09:00 PM</SelectItem>
                        <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  type="button" 
                  onClick={handleGenerateQR}
                  className="w-full h-16 bg-[#2e2b70] hover:bg-[#1e1b4b] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 rounded-[1.25rem] flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <QrIcon className="h-5 w-5" /> GENERAR CÓDIGO QR
                </Button>
                
                <Button 
                  type="button" 
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full h-16 border-2 border-indigo-100 bg-white hover:bg-indigo-50 text-[#2e2b70] font-black text-xs uppercase tracking-[0.2em] rounded-[1.25rem] flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><FileText className="h-5 w-5" /> REGISTRAR</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-[2.5rem] border-none">
            <div className="bg-[#1e1b4b] p-8 text-center text-white relative">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-widest text-white text-center">Pase Digital PACSA</DialogTitle>
              </DialogHeader>
              <p className="text-[10px] text-indigo-300 font-bold uppercase mt-2 tracking-widest text-center">CÓDIGO GENERADO</p>
              <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-white hover:bg-white/10" onClick={() => setShowQR(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="p-8 space-y-6 text-center">
              <div className="mx-auto w-[280px] h-[280px] bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 border-indigo-50 overflow-hidden">
                <QRCodeSVG
                  value={qrValue}
                  size={256}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-2 border border-slate-100">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Invitado</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Cédula</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.documentId}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Torre/Apt</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.torre} - {formData.apartamento}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Válido</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Hora</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.time}</span>
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl gap-2 transition-transform active:scale-95"
                onClick={handleShareWhatsApp}
              >
                <MessageSquareText className="h-5 w-5" /> COMPARTIR POR WHATSAPP
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
