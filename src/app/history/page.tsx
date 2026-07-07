
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  ShieldCheck,
  Building2,
  ArrowLeft,
  User,
  Search,
  History,
  Briefcase,
  Car,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Download
} from "lucide-react"
import Link from "next/link"
import { collection, orderBy, query } from "firebase/firestore"
import { useFirestore, useCollection } from "@/firebase"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const visitorsQuery = React.useMemo(() => {
    if (!db) return null
    return query(collection(db, "visitas"), orderBy("checkInTime", "desc"))
  }, [db])

  const { data: visitors, loading } = useCollection(visitorsQuery)

  const filteredHistory = React.useMemo(() => {
    if (!searchTerm) return visitors || []
    return (visitors || []).filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.torre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.apartamento?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [visitors, searchTerm])

  const handleExport = (type: 'PDF' | 'EMAIL') => {
    toast({
      title: type === 'PDF' ? "Generando PDF" : "Preparando Envío",
      description: `Procesando el reporte de ${filteredHistory.length} registros para exportación...`,
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center gap-4 px-1">
          <Link href="/guard">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-indigo-50">
              <ArrowLeft className="h-6 w-6 text-indigo-900" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950">Historial</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">PACSA VISIT CONTROL</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <Input 
              placeholder="BUSCAR EN EL HISTORIAL..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="h-14 bg-white border-none rounded-2xl shadow-xl pl-12 text-[10px] font-black placeholder:text-muted-foreground/50 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/20"
            />
            <Search className="absolute left-4 top-4.5 h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">Registros de Acceso</h3>
            <Badge variant="outline" className="text-[8px] font-black border-indigo-200 text-indigo-600">
              {visitors?.length || 0} TOTAL
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sincronizando base de datos...</div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex items-center justify-center">
              <p className="text-[11px] font-black uppercase text-indigo-900/40 tracking-widest">
                NO SE ENCONTRARON REGISTROS.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((visitor) => (
                <Card key={visitor.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-[2rem] overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center",
                          visitor.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                        )}>
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{visitor.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID: {visitor.documentId}</p>
                        </div>
                      </div>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 border-none",
                        visitor.status === 'active' ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                      )}>
                        {visitor.status === 'active' ? 'EN PH' : 'SALIDA'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <Building2 className="h-2.5 w-2.5" /> Ubicación
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase">T{visitor.torre} - Apt {visitor.apartamento}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> Guardia
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{visitor.guardName}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                          <Briefcase className="h-2.5 w-2.5" /> Empresa
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{visitor.company || 'PARTICULAR'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                          <Car className="h-2.5 w-2.5" /> Placa
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase">{visitor.plate || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-dashed border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <p className="text-[9px] font-black text-muted-foreground uppercase">Entrada:</p>
                        </div>
                        <p className="text-[10px] font-black text-indigo-950">
                          {visitor.checkInTime ? format(new Date(visitor.checkInTime), "dd/MM/yy HH:mm", { locale: es }) : '---'}
                        </p>
                      </div>
                      {visitor.status === 'checked-out' && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3.5 w-3.5 text-red-500" />
                            <p className="text-[9px] font-black text-muted-foreground uppercase">Salida:</p>
                          </div>
                          <p className="text-[10px] font-black text-indigo-950">
                            {visitor.checkOutTime ? format(new Date(visitor.checkOutTime), "dd/MM/yy HH:mm", { locale: es }) : '---'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="border-none bg-[#1e1b4b] text-white shadow-2xl shadow-indigo-500/30 overflow-hidden rounded-[2rem] mt-8">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Reporte de Auditoría PACSA
                </h3>
                <p className="text-[8px] font-medium text-indigo-200/50 uppercase tracking-widest">GESTIÓN HISTÓRICA DE ACCESOS</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleExport('PDF')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest border-none rounded-xl h-12 gap-2 shadow-lg"
                >
                  <Download className="h-4 w-4" /> DESCARGAR PDF
                </Button>
                <Button 
                  onClick={() => handleExport('EMAIL')}
                  variant="outline" 
                  className="w-full border-none bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black text-[9px] uppercase tracking-widest rounded-xl h-12 gap-2"
                >
                  <Mail className="h-4 w-4" /> ENVIAR REPORTE
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
