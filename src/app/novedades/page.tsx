
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ClipboardList, 
  Plus, 
  AlertTriangle, 
  FileText, 
  Mail, 
  MessageSquareText, 
  Trash2,
  ShieldCheck,
  MapPin,
  ShieldAlert,
  Hammer,
  Bell,
  Camera,
  Loader2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function NovedadesPage() {
  const db = useFirestore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [formData, setFormData] = React.useState({
    guardName: "",
    turno: "Diurno",
    title: "",
    otherTitle: "",
    torre: "",
    apartamento: "",
    areaComun: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    description: "",
    priority: "Media",
    actionTaken: "",
    notifyAdmin: false,
    notifySupervisor: false,
    notifyResident: false
  })

  const novedadesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "novedades"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: novedades, loading } = useCollection(novedadesQuery)

  // Cargar sesión del guardia desde Gestión Operativa
  React.useEffect(() => {
    const saved = localStorage.getItem('pacsa_guard_session')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData(prev => ({
        ...prev,
        guardName: parsed.name
      }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    setIsSubmitting(true)
    const finalTitle = formData.title === "OTRO" ? formData.otherTitle : formData.title
    const dataToSave = {
      ...formData,
      title: finalTitle,
      status: "Pendiente",
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "novedades"), dataToSave)
      .then(() => {
        toast({
          title: "Reporte Guardado",
          description: "La novedad ha sido registrada bajo el formato PACSA.",
        })
        setFormData(prev => ({ ...prev, title: "", description: "", actionTaken: "", otherTitle: "" }))
        setIsSubmitting(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'novedades',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false)
      });
  }

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, "novedades", id))
      .then(() => {
        toast({
          title: "Reporte Eliminado",
          description: "La novedad ha sido borrada del historial.",
        })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `novedades/${id}`,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const generateReportText = (n: any) => {
    const notifyList = [];
    if (n.notifyAdmin) notifyList.push("Administrador");
    if (n.notifySupervisor) notifyList.push("Supervisor");
    if (n.notifyResident) notifyList.push("Residente");

    return `📝 *REPORTE DE NOVEDAD – PACSA*

👮‍♂️ *DATOS DEL GUARDIA*
Nombre del Guardia: ${n.guardName}
Turno: ${n.turno === 'Diurno' ? '☒ Diurno ☐ Nocturno' : '☐ Diurno ☒ Nocturno'}

⚠️ *DETALLE DE LA NOVEDAD*
Tipo de Novedad: ${n.title}

📍 *UBICACIÓN*
Torre / Edificio: ${n.torre || 'N/A'}
Apartamento: ${n.apartamento || 'N/A'}
Área común: ${n.areaComun || 'N/A'}

📅 *FECHA Y HORA*
Fecha: ${n.date}
Hora: ${n.time}

🧾 *DESCRIPCIÓN DETALLADA*
${n.description}

🚨 *NIVEL DE PRIORIDAD:* ${n.priority}

🛠️ *ACCIÓN TOMADA:* ${n.actionTaken || 'NINGUNA'}

🔔 *NOTIFICAR A:* ${notifyList.join(", ") || 'NINGUNO'}`;
  }

  const handleShareWhatsApp = (n: any) => {
    const text = generateReportText(n);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950">Novedades</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">REPORTE ESTRUCTURADO PACSA</p>
          </div>
          <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ClipboardList className="h-6 w-6 text-white" />
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-indigo-500/5 bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b bg-indigo-50/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              Nuevo Reporte PACSA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DATOS DEL GUARDIA */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2">
                  <ShieldCheck className="h-3 w-3" /> Datos del Guardia
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Nombre del Guardia</Label>
                    <Input 
                      name="guardName"
                      value={formData.guardName}
                      readOnly
                      className="bg-muted/50 border-none h-11 rounded-xl uppercase font-black text-xs text-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Turno</Label>
                    <RadioGroup 
                      value={formData.turno} 
                      onValueChange={(v) => handleSelectChange('turno', v)}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Diurno" id="diurno" />
                        <Label htmlFor="diurno" className="text-xs font-bold uppercase cursor-pointer">☐ Diurno</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Nocturno" id="nocturno" />
                        <Label htmlFor="nocturno" className="text-xs font-bold uppercase cursor-pointer">☐ Nocturno</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* DETALLE DE LA NOVEDAD */}
              <div className="space-y-4 pt-4 border-t border-dashed">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3" /> Detalle de la Novedad
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Tipo de Novedad</Label>
                    <Select value={formData.title} onValueChange={(v) => handleSelectChange('title', v)} required>
                      <SelectTrigger className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase">
                        <SelectValue placeholder="SELECCIONE TIPO" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="LUMINARIA FUNDIDA">LUMINARIA FUNDIDA</SelectItem>
                        <SelectItem value="VEHÍCULO SOSPECHOSO">VEHÍCULO SOSPECHOSO</SelectItem>
                        <SelectItem value="VISITANTE SIN REGISTRO">VISITANTE SIN REGISTRO</SelectItem>
                        <SelectItem value="DAÑO EN INFRAESTRUCTURA">DAÑO EN INFRAESTRUCTURA</SelectItem>
                        <SelectItem value="RUIDO EXCESIVO">RUIDO EXCESIVO</SelectItem>
                        <SelectItem value="EMERGENCIA">EMERGENCIA</SelectItem>
                        <SelectItem value="FUGA DE AGUA">FUGA DE AGUA</SelectItem>
                        <SelectItem value="FALLO ELÉCTRICO">FALLO ELÉCTRICO</SelectItem>
                        <SelectItem value="PORTÓN DAÑADO">PORTÓN DAÑADO</SelectItem>
                        <SelectItem value="OTRO">OTRO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.title === "OTRO" && (
                    <div className="space-y-1.5 animate-in slide-in-from-top-2">
                      <Input 
                        name="otherTitle"
                        placeholder="ESPECIFIQUE EL TIPO"
                        value={formData.otherTitle}
                        onChange={handleInputChange}
                        className="bg-muted/30 border-none h-11 rounded-xl uppercase font-bold text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* UBICACIÓN */}
              <div className="space-y-4 pt-4 border-t border-dashed">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Ubicación
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Torre / Edificio</Label>
                    <Input 
                      name="torre"
                      value={formData.torre}
                      onChange={handleInputChange}
                      placeholder="T1"
                      className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Apartamento</Label>
                    <Input 
                      name="apartamento"
                      value={formData.apartamento}
                      onChange={handleInputChange}
                      placeholder="APT"
                      className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Área Común</Label>
                  <Input 
                    name="areaComun"
                    value={formData.areaComun}
                    onChange={handleInputChange}
                    placeholder="ESTACIONAMIENTOS, LOBBY, ETC."
                    className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase"
                  />
                </div>
              </div>

              {/* FECHA Y HORA */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-dashed">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Fecha</Label>
                  <Input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Hora</Label>
                  <Input 
                    type="time" 
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs"
                    required
                  />
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="space-y-1.5 pt-4 border-t border-dashed">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Descripción Detallada</Label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="ESCRIBA EL DETALLE DE LO SUCEDIDO..." 
                  className="bg-muted/30 border-none rounded-xl font-medium text-xs min-h-[100px] uppercase resize-none" 
                  required 
                />
              </div>

              {/* EVIDENCIA */}
              <div className="space-y-3 pt-4 border-t border-dashed">
                <h3 className="text-[10px] font-black text-indigo-600 uppercase flex items-center gap-2">
                  <Camera className="h-3 w-3" /> Evidencia
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className="h-11 border-dashed border-2 border-indigo-200 text-indigo-600 font-black text-[9px] uppercase tracking-widest rounded-xl">
                    <Camera className="h-4 w-4 mr-2" /> Tomar Foto
                  </Button>
                  <Button type="button" variant="outline" className="h-11 border-dashed border-2 border-indigo-200 text-indigo-600 font-black text-[9px] uppercase tracking-widest rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Adjuntar Foto
                  </Button>
                </div>
              </div>

              {/* PRIORIDAD Y ACCIÓN */}
              <div className="space-y-4 pt-4 border-t border-dashed">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-indigo-600" /> Nivel de Prioridad
                  </Label>
                  <RadioGroup 
                    value={formData.priority} 
                    onValueChange={(v) => handleSelectChange('priority', v)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="Baja" id="p-baja" />
                      <Label htmlFor="p-baja" className="text-[10px] font-black uppercase cursor-pointer">☐ Baja</Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="Media" id="p-media" />
                      <Label htmlFor="p-media" className="text-[10px] font-black uppercase cursor-pointer text-amber-600">☐ Media</Label>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RadioGroupItem value="Alta" id="p-alta" />
                      <Label htmlFor="p-alta" className="text-[10px] font-black uppercase cursor-pointer text-red-600">☐ Alta</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1 flex items-center gap-1">
                    <Hammer className="h-3 w-3" /> Acción Tomada
                  </Label>
                  <Textarea 
                    name="actionTaken"
                    value={formData.actionTaken}
                    onChange={handleInputChange}
                    placeholder="DETALLE QUÉ MEDIDAS SE TOMARON..."
                    className="bg-muted/30 border-none rounded-xl font-medium text-xs min-h-[80px] uppercase resize-none" 
                  />
                </div>
              </div>

              {/* NOTIFICAR A */}
              <div className="space-y-3 pt-4 border-t border-dashed">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1 flex items-center gap-1">
                  <Bell className="h-3 w-3" /> Notificar a
                </Label>
                <div className="flex flex-wrap gap-5">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="admin" checked={formData.notifyAdmin} onCheckedChange={(v) => handleCheckboxChange('notifyAdmin', !!v)} />
                    <Label htmlFor="admin" className="text-[10px] font-black uppercase cursor-pointer">☐ Administrador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="supervisor" checked={formData.notifySupervisor} onCheckedChange={(v) => handleCheckboxChange('notifySupervisor', !!v)} />
                    <Label htmlFor="supervisor" className="text-[10px] font-black uppercase cursor-pointer">☐ Supervisor</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="residente" checked={formData.notifyResident} onCheckedChange={(v) => handleCheckboxChange('notifyResident', !!v)} />
                    <Label htmlFor="residente" className="text-[10px] font-black uppercase cursor-pointer">☐ Residente</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-6">
                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "GUARDAR REPORTE"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* HISTORIAL */}
        <div className="space-y-4">
          <h3 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest px-1 flex items-center justify-between">
            HISTORIAL PACSA
            <span className="text-[8px] font-medium text-muted-foreground">ÚLTIMOS REPORTES</span>
          </h3>
          {loading ? (
             <div className="text-center py-10 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cargando novedades...</div>
          ) : !novedades || novedades.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-indigo-100 text-[10px] font-black uppercase text-muted-foreground">No hay novedades registradas.</div>
          ) : (
            novedades.map((n) => (
              <Card key={n.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-3xl overflow-hidden group">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                        n.priority === "Alta" ? "bg-red-50 text-red-600" : n.priority === "Media" ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{n.title}</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{n.date} • {n.time}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive/40 hover:text-destructive hover:bg-destructive/5 rounded-full" onClick={() => handleDelete(n.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Oficial</p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase">{n.guardName}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Prioridad</p>
                      <p className={cn("text-[10px] font-black uppercase", 
                        n.priority === "Alta" ? "text-red-600" : n.priority === "Media" ? "text-amber-600" : "text-indigo-600"
                      )}>{n.priority}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl shadow-lg shadow-emerald-500/20"
                      onClick={() => handleShareWhatsApp(n)}
                    >
                      <MessageSquareText className="h-4 w-4" /> WHATSAPP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
