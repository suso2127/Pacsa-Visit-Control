
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  UserPlus, 
  Calendar, 
  Clock, 
  Search, 
  Building2,
  ChevronRight,
  ShieldCheck
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"

export default function ShiftRegistrationPage() {
  const [currentTime, setCurrentTime] = React.useState(new Date())
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Actualizar el reloj cada minuto
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      toast({
        title: "Entrada Registrada",
        description: "Su turno ha comenzado correctamente.",
      })
    }, 1500)
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="flex items-center gap-2 text-primary">
          <UserPlus className="h-6 w-6" />
          <h2 className="text-xl font-bold font-headline tracking-tight">Nuevo Registro de Turno</h2>
        </div>

        {/* Date & Time Status Card */}
        <Card className="bg-[#1e1b4b] border-indigo-500/20 shadow-2xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest">Fecha de Operación</p>
                <p className="text-sm font-bold text-white capitalize">
                  {format(currentTime, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-indigo-300/60 uppercase tracking-widest">Hora de Entrada</p>
              <p className="text-2xl font-black text-indigo-400">
                {format(currentTime, "hh:mm aa")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Fields */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground/80">Nombre Completo del Guardia</Label>
            <Input 
              placeholder="Ingrese el nombre del elemento" 
              className="bg-card border-indigo-500/10 h-12 rounded-xl focus-visible:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground/80">Código del Proyecto / Cliente</Label>
            <div className="relative">
              <Input 
                placeholder="INGRESE EL CÓDIGO (EJ. EP01)" 
                className="bg-card border-indigo-500/10 h-12 rounded-xl pr-10 uppercase focus-visible:ring-primary/30"
              />
              <Search className="absolute right-3 top-3.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {/* Client Detection Card */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-dashed border-indigo-500/20 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cliente Detectado</p>
              <p className="text-sm font-medium text-muted-foreground italic">Esperando código válido...</p>
            </div>
          </div>

          {/* Grid Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/80">Duración Turno (Hrs)</Label>
              <Select defaultValue="8h">
                <SelectTrigger className="bg-card border-indigo-500/10 h-12 rounded-xl focus:ring-primary/30">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="8h">8h</SelectItem>
                  <SelectItem value="12h">12h</SelectItem>
                  <SelectItem value="24h">24h</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground/80">Tipo de Turno</Label>
              <Select defaultValue="diurno">
                <SelectTrigger className="bg-card border-indigo-500/10 h-12 rounded-xl focus:ring-primary/30">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="diurno">Diurno</SelectItem>
                  <SelectItem value="nocturno">Nocturno</SelectItem>
                  <SelectItem value="mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 bg-[#312e81] hover:bg-[#3730a3] text-white font-black text-base uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-500/10 border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 transition-all"
          >
            {isSubmitting ? "Procesando..." : "REGISTRAR ENTRADA"}
          </Button>
        </form>

        {/* Quick History Preview */}
        <div className="pt-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Últimos Registros</h3>
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-card rounded-xl border border-indigo-500/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-xs font-bold">Proyecto Alpha PH</p>
                    <p className="text-[10px] text-muted-foreground">Ayer • Entrada 07:00 AM</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
