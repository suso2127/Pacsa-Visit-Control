
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
  QrCode, 
  X, 
  Share2, 
  ShieldCheck, 
  MessageSquareText,
  Save,
  Briefcase,
  Tag,
  Calendar
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
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useFirestore } from "@/firebase"
import { format } from "date-fns"

export default function PreRegisterPage() {
  const db = useFirestore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showQR, setShowQR] = React.useState(false)

  const [formData, setFormData] = React.useState({
    residentName: "",
    name: "",
    torre: "T1",
    apartamento: "",
    visitType: "VISITAS",
    company: "",
    time: "12:00 PM",
    date: format(new Date(), "yyyy-MM-dd")
  })

  // Carga automática de la información del residente registrado desde localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('pacsa_residente_settings')
    if (saved) {
      try {
        const profile = JSON.parse(saved)
        setFormData(prev => ({
          ...prev,
          residentName: profile.residentName || "",
          torre: profile.torre || "T1",
          apartamento: profile.apartamento || ""
        }))
      } catch (e) {
        console.error("Error cargando perfil:", e)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value.toUpperCase() }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleShareWhatsApp = () => {
    const text = `*Pase Digital - GRUPO PACSA S.A*\n\nHola *${formData.name}*, se ha generado tu pase de acceso.\n\n📍 *Ubicación:* Torre ${formData.torre} - Apt ${formData.apartamento}\n🏷️ *Categoría:* ${formData.visitType}\n📅 *Fecha:* ${formData.date}\n⏰ *Hora Estimada:* ${formData.time}\n\nPresenta este código en garita para tu ingreso rápido.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  const handleShareGeneric = async () => {
    const shareText = `Pase de Acceso - GRUPO PACSA S.A\nVisitante: ${formData.name}\nCategoría: ${formData.visitType}\nUbicación: Torre ${formData.torre} - Apt ${formData.apartamento}\nFecha: ${formData.date}\nHora Estimada: ${formData.time}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pase Digital PACSA',
          text: shareText,
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado",
        description: "Información copiada al portapapeles.",
      });
    }
  }

  const handleGenerateQR = () => {
    if (!formData.name) {
      toast({ variant: "destructive", title: "Datos Incompletos", description: "Ingrese el nombre del invitado." });
      return;
    }
    setShowQR(true)
  }

  const handleRegister = async () => {
    if (!formData.name || !formData.residentName) {
      toast({ variant: "destructive", title: "Datos Incompletos", description: "Ingrese los nombres requeridos." });
      return;
    }
    if (!db) return

    setIsSubmitting(true)
    
    const dataToSave = {
      residentName: formData.residentName,
      apartamento: formData.apartamento,
      torre: formData.torre,
      visitorName: formData.name,
      time: formData.time,
      date: formData.date,
      createdAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, "scheduled_visits"), dataToSave);
      toast({
        title: "Registro Exitoso",
        description: "La visita ha sido registrada en la agenda de seguridad.",
      })
      setFormData(prev => ({ ...prev, name: "", company: "" }))
    } catch (error) {
      console.error("Error agendando:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudo registrar la visita." });
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
        
        <div className="px-1 pt-2">
          <h2 className="text-2xl font-black tracking-tight text-indigo-950">Pre-Registro</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">GRUPO PACSA S.A</p>
        </div>

        <Card className="border-none shadow-xl shadow-indigo-500/5 overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="residentName" className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                  <ShieldCheck className="h-3 w-3 text-indigo-600" />
                  Nombre del Residente
                </Label>
                <Input 
                  id="residentName" 
                  value={formData.residentName}
                  onChange={handleInputChange}
                  placeholder="NOMBRE DEL RESIDENTE" 
                  className="bg-muted/30 border-none h-12 rounded-xl font-bold uppercase text-xs" 
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                  <User className="h-3 w-3 text-indigo-600" />
                  Nombre del Invitado
                </Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ESCRIBA EL NOMBRE DEL INVITADO" 
                  className="bg-muted/30 border-none h-12 rounded-xl font-bold uppercase text-xs" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                    <Building2 className="h-3 w-3 text-indigo-600" />
                    Torre
                  </Label>
                  <Input 
                    id="torre" 
                    value={formData.torre}
                    onChange={handleInputChange}
                    placeholder="T1"
                    className="bg-muted/30 border-none h-12 rounded-xl font-bold uppercase text-xs" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                    <Home className="h-3 w-3 text-indigo-600" />
                    Apartamento
                  </Label>
                  <Input 
                    id="apartamento" 
                    value={formData.apartamento}
                    onChange={handleInputChange}
                    placeholder="APT"
                    className="bg-muted/30 border-none h-12 rounded-xl font-bold uppercase text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                    <Tag className="h-3 w-3 text-indigo-600" />
                    Categoría
                  </Label>
                  <Select value={formData.visitType} onValueChange={(v) => handleSelectChange('visitType', v)}>
                    <SelectTrigger className="border-none bg-muted/30 h-12 rounded-xl font-bold text-xs uppercase text-left">
                      <SelectValue placeholder="TIPO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VISITAS">VISITAS</SelectItem>
                      <SelectItem value="MUDANZA">MUDANZA</SelectItem>
                      <SelectItem value="DELIVERY">DELIVERY</SelectItem>
                      <SelectItem value="MANTENIMIENTO">TÉCNICO</SelectItem>
                      <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                    <Briefcase className="h-3 w-3 text-indigo-600" />
                    Empresa
                  </Label>
                  <Input 
                    id="company" 
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="EMPRESA" 
                    className="bg-muted/30 border-none h-12 rounded-xl font-bold uppercase text-xs" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                    <Calendar className="h-3 w-3 text-indigo-600" />
                    Fecha
                  </Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="bg-muted/30 border-none h-12 rounded-xl font-bold uppercase text-xs" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-2 ml-1">
                    <Clock className="h-3 w-3 text-indigo-600" />
                    Hora Estimada
                  </Label>
                  <Select value={formData.time} onValueChange={(v) => handleSelectChange('time', v)}>
                    <SelectTrigger className="border-none bg-muted/30 h-12 rounded-xl font-bold text-xs">
                      <SelectValue placeholder="HORA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                      <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                      <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                      <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                      <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                      <SelectItem value="08:00 PM">08:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                type="button" 
                onClick={handleGenerateQR}
                className="w-full h-14 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <QrCode className="h-5 w-5" /> GENERAR CÓDIGO QR
              </Button>
              
              <Button 
                type="button" 
                onClick={handleRegister}
                disabled={isSubmitting}
                variant="outline"
                className="w-full h-14 border-2 border-indigo-200 text-indigo-900 font-black text-xs uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                {isSubmitting ? "REGISTRANDO..." : <><Save className="h-5 w-5" /> REGISTRAR</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showQR} onOpenChange={setShowQR}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-3xl border-none">
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
              <div className="mx-auto w-64 h-64 bg-white p-4 rounded-3xl shadow-2xl flex items-center justify-center border-4 border-indigo-50">
                <QrCode className="w-full h-full text-indigo-900" />
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-2 border border-slate-100">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Invitado</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.name}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Torre/Apt</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.torre} - {formData.apartamento}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Categoría</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.visitType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[8px] font-black text-muted-foreground uppercase">Hora Estimada</span>
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">{formData.time}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl gap-2 transition-transform active:scale-95"
                  onClick={handleShareWhatsApp}
                >
                  <MessageSquareText className="h-5 w-5" /> COMPARTIR POR WHATSAPP
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 border-indigo-200 text-indigo-900 font-black text-[10px] uppercase tracking-widest rounded-xl gap-2"
                  onClick={handleShareGeneric}
                >
                  <Share2 className="h-4 w-4" /> OTRAS OPCIONES
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
