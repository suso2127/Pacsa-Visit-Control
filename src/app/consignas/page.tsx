
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Plus, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  MessageSquareText, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  User
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ConsignasPage() {
  const db = useFirestore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    priority: "Normal",
    supervisor: "ADMINISTRACIÓN PACSA",
  })

  const consignasQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "consignas"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: consignas, loading } = useCollection(consignasQuery)

  React.useEffect(() => {
    const saved = localStorage.getItem('pacsa_guard_session')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData(prev => ({ ...prev, supervisor: `SUP. ${parsed.name}`.toUpperCase() }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return

    setIsSubmitting(true)
    const dataToSave = {
      ...formData,
      date: format(new Date(), "dd/MM/yyyy"),
      time: format(new Date(), "hh:mm aa"),
      status: "Activa",
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "consignas"), dataToSave)
      .then(() => {
        toast({
          title: "Consigna Registrada",
          description: "La orden ha sido publicada para el personal de turno.",
        })
        setFormData(prev => ({ ...prev, title: "", description: "" }))
        setIsSubmitting(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'consignas',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false)
      });
  }

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, "consignas", id))
      .then(() => {
        toast({
          title: "Consigna Eliminada",
          description: "El registro ha sido removido del sistema.",
        })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `consignas/${id}`,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleShareWhatsApp = (c: any) => {
    const text = `*📋 CONSIGNAS DIARIAS – GRUPO PACSA S.A.*\n\n⚠️ *TÍTULO:* ${c.title}\n📅 *FECHA:* ${c.date}\n⏰ *HORA:* ${c.time}\n👤 *SUPERVISOR:* ${c.supervisor}\n🚨 *PRIORIDAD:* ${c.priority}\n\n📝 *INSTRUCCIONES:*\n${c.description}\n\n*ESTA ES UNA ORDEN OPERATIVA DE CUMPLIMIENTO OBLIGATORIO.*`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin-dashboard">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-indigo-50">
                <ArrowLeft className="h-6 w-6 text-indigo-900" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-indigo-950">Consignas</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">ÓRDENES DEL DÍA PACSA</p>
            </div>
          </div>
          <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
        </div>

        <Card className="border-none shadow-xl shadow-indigo-500/5 bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b bg-indigo-50/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-600" />
              Nueva Instrucción
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Supervisor / Emisor (Manual)</Label>
                <div className="relative">
                  <Input 
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleInputChange}
                    placeholder="NOMBRE DEL SUPERVISOR"
                    className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase pr-10"
                    required
                  />
                  <User className="absolute right-3 top-3.5 h-4 w-4 text-indigo-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Título de la Consigna</Label>
                <Input 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="EJ: CONTROL DE ACCESO"
                  className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Instrucciones Detalladas</Label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="DESCRIBA LA ORDEN PARA EL PERSONAL..."
                  className="bg-muted/30 border-none rounded-xl font-medium text-xs min-h-[100px] uppercase resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "PUBLICAR CONSIGNA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest px-1 flex items-center justify-between">
            Órdenes Activas
            <span className="text-[8px] font-medium text-muted-foreground">VIGENCIA DIARIA</span>
          </h3>

          {loading ? (
            <div className="text-center py-10 text-[9px] font-black uppercase text-muted-foreground">Sincronizando órdenes...</div>
          ) : !consignas || consignas.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-indigo-100 text-[9px] font-black uppercase text-muted-foreground">No hay consignas registradas hoy.</div>
          ) : (
            consignas.map((c) => (
              <Card key={c.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-3xl overflow-hidden border-l-4 border-indigo-900">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-indigo-950 uppercase leading-tight mb-1">{c.title}</h4>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-2.5 w-2.5 text-muted-foreground" />
                          <p className="text-[8px] font-bold text-muted-foreground uppercase">{c.date} • {c.time}</p>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive/40 hover:text-destructive rounded-full" 
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-indigo-900 uppercase leading-relaxed">{c.description}</p>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                      <p className="text-[9px] font-black text-indigo-950 uppercase">{c.supervisor}</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleShareWhatsApp(c)}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest gap-1.5 rounded-lg px-3"
                    >
                      <MessageSquareText className="h-3 w-3" /> DIFUNDIR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="p-5 bg-indigo-900 text-white rounded-[2rem] shadow-2xl space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h3 className="text-[11px] font-black uppercase tracking-widest">Compromiso PACSA</h3>
          </div>
          <p className="text-[9px] font-medium text-indigo-200 uppercase leading-relaxed tracking-wider">
            LAS CONSIGNAS DEBEN SER LEÍDAS Y ACATADAS POR TODO EL PERSONAL DE SEGURIDAD AL INICIO DE CADA RELEVO.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
