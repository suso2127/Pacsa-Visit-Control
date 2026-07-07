
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  User, 
  Building2, 
  Home, 
  Calendar, 
  Clock, 
  Tag, 
  CreditCard, 
  ShieldCheck,
  ArrowLeft,
  AlertCircle
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { format, isAfter } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function ScheduledVisitsPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [now, setNow] = React.useState(new Date())

  // Actualizar la hora cada minuto para el chequeo de expiración
  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const scheduledQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "previsitas"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: visits, loading } = useCollection(scheduledQuery)

  const filteredVisits = React.useMemo(() => {
    if (!searchTerm) return visits || []
    return (visits || []).filter(v => 
      v.visitorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.residentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.torre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.apartamento?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [visits, searchTerm])

  const formatScheduledDate = (dateStr: string) => {
    if (!dateStr) return "S/F";
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      return format(new Date(year, month - 1, day), "dd/MM/yyyy", { locale: es });
    } catch (e) {
      return dateStr;
    }
  }

  const checkIfExpired = (expirationTime: string | null) => {
    if (!expirationTime) return false;
    return isAfter(now, new Date(expirationTime));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between px-1">
          <Link href="/guard">
            <Button variant="ghost" className="h-10 px-3 rounded-xl hover:bg-indigo-50 gap-2 text-indigo-900 font-black text-xs uppercase">
              <ArrowLeft className="h-5 w-5" />
              REGRESAR
            </Button>
          </Link>
          <div className="text-right">
            <h2 className="text-xl font-black tracking-tight text-indigo-950 uppercase leading-none">Pre Visitas</h2>
            <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">PROGRAMADAS</p>
          </div>
        </div>

        <div className="relative group">
          <Input 
            placeholder="BASE DE VISITS PROGRAMADAS" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="h-14 bg-white border-none rounded-2xl shadow-xl pl-12 text-[10px] font-black placeholder:text-muted-foreground/50 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sincronizando base de datos...</div>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex items-center justify-center">
              <p className="text-[11px] font-black uppercase text-indigo-900/40 tracking-widest">
                NO HAY REGISTROS EN LA BASE.
              </p>
            </div>
          ) : (
            filteredVisits.map((visit) => {
              const isExpired = checkIfExpired(visit.fechaExpiracion);
              return (
                <Card key={visit.id} className={`border-none shadow-xl shadow-indigo-500/5 bg-white rounded-[2rem] overflow-hidden ${isExpired ? 'opacity-75 grayscale-[0.2]' : ''}`}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Residente</p>
                          <p className="text-xs font-black text-indigo-900 uppercase">{visit.residentName}</p>
                        </div>
                      </div>
                      {isExpired && (
                        <Badge className="bg-red-600 text-white font-black text-[9px] uppercase px-3 flex items-center gap-1">
                          <AlertCircle className="h-2.5 w-2.5" /> EXPIRADO
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
                          <Building2 className="h-3 w-3 text-indigo-400" /> Torre
                        </p>
                        <p className="text-[10px] font-black text-indigo-950 uppercase">{visit.torre || 'S/T'}</p>
                      </div>
                      <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1.5 mb-1">
                          <Home className="h-3 w-3 text-indigo-400" /> Apartamento
                        </p>
                        <p className="text-[10px] font-black text-indigo-950 uppercase">{visit.apartamento || 'S/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-indigo-900 text-white rounded-2xl flex items-center justify-center">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Visita Autorizada</p>
                          <h4 className="font-black text-sm text-indigo-950 uppercase truncate leading-none">{visit.visitorName}</h4>
                          <div className="flex items-center gap-2 mt-2">
                             <CreditCard className="h-3 w-3 text-slate-400" />
                             <span className="text-[9px] font-black text-indigo-900/60 uppercase">ID: {visit.visitorId || visit.documentId || 'S/ID'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 bg-indigo-50/30 p-4 rounded-2xl border border-indigo-100/50">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                          <div>
                            <p className="text-[7px] font-black text-muted-foreground uppercase">Fecha</p>
                            <p className="text-[10px] font-black text-indigo-950 uppercase">{formatScheduledDate(visit.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-indigo-600" />
                          <div>
                            <p className="text-[7px] font-black text-muted-foreground uppercase">Hora</p>
                            <p className="text-[10px] font-black text-indigo-950 uppercase">{visit.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-indigo-600" />
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Motivo:</span>
                      <span className="text-[10px] font-black text-indigo-900 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        {visit.visitType}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
