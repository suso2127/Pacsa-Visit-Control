
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Info, 
  ShieldAlert, 
  User, 
  Building2, 
  Calendar, 
  Clock,
  Search,
  AlertOctagon,
  FileText,
  AlertCircle,
  ShieldCheck
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InfoPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = React.useState("")

  // Consulta automática a la colección listanegra
  const blacklistQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "listanegra"), orderBy("createdAt", "desc"))
  }, [db])

  // Consulta automática a la colección consignas
  const consignasQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "consignas"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: blacklist, loading: loadingBlacklist } = useCollection(blacklistQuery)
  const { data: consignas, loading: loadingConsignas } = useCollection(consignasQuery)

  const filteredBlacklist = React.useMemo(() => {
    return blacklist?.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [blacklist, searchTerm])

  const filteredConsignas = React.useMemo(() => {
    return consignas?.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supervisor?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [consignas, searchTerm])

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950 uppercase">Información</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">BASE DE DATOS OPERATIVA</p>
          </div>
          <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Info className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        <div className="relative group">
          <Input 
            placeholder="BUSCAR EN REGISTROS DE SEGURIDAD..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="h-14 bg-white border-none rounded-2xl shadow-xl pl-12 text-[10px] font-black placeholder:text-muted-foreground/50 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-indigo-400" />
        </div>

        <Tabs defaultValue="consignas" className="w-full">
          <TabsList className="grid grid-cols-2 h-12 bg-white rounded-2xl p-1 shadow-sm border border-indigo-50">
            <TabsTrigger value="consignas" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-900 data-[state=active]:text-white">
              Órdenes
            </TabsTrigger>
            <TabsTrigger value="blacklist" className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Lista Negra
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consignas" className="space-y-4 pt-4 animate-in fade-in duration-300">
            <h3 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest px-1 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Órdenes Operativas
            </h3>
            
            {loadingConsignas ? (
              <div className="text-center py-20 text-[10px] font-black uppercase text-muted-foreground tracking-widest animate-pulse">Sincronizando órdenes...</div>
            ) : filteredConsignas.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex items-center justify-center">
                <p className="text-[11px] font-black uppercase text-indigo-900/40 tracking-widest">
                  NO HAY ÓRDENES ACTIVAS.
                </p>
              </div>
            ) : (
              filteredConsignas.map((item) => (
                <Card key={item.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-[2rem] overflow-hidden group border-l-4 border-indigo-900">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{item.title}</h4>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.date} • {item.time}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black border-indigo-100 text-indigo-600 uppercase">
                        VIGENTE
                      </Badge>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-indigo-900 uppercase leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex justify-between items-center px-1 pt-1 border-t border-dashed border-slate-100 mt-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <p className="text-[9px] font-black text-indigo-950 uppercase">{item.supervisor}</p>
                      </div>
                      <p className="text-[8px] font-black text-emerald-600 uppercase">CUMPLIMIENTO OBLIGATORIO</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="blacklist" className="space-y-4 pt-4 animate-in fade-in duration-300">
            <h3 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest px-1 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-red-600" /> Sujetos Vetados
            </h3>
            
            {loadingBlacklist ? (
              <div className="text-center py-20 text-[10px] font-black uppercase text-muted-foreground tracking-widest animate-pulse">Sincronizando vetos...</div>
            ) : filteredBlacklist.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-red-100 flex items-center justify-center">
                <p className="text-[11px] font-black uppercase text-red-900/40 tracking-widest">
                  NO HAY SUJETOS RESTRINGIDOS.
                </p>
              </div>
            ) : (
              filteredBlacklist.map((item) => (
                <Card key={item.id} className="border-none shadow-xl shadow-red-500/5 bg-white rounded-[2rem] overflow-hidden group border-l-4 border-red-500">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                          <AlertOctagon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-red-950 uppercase leading-none mb-1">{item.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID: {item.documentId}</p>
                        </div>
                      </div>
                      <Badge className="text-[8px] font-black bg-red-600 text-white border-none uppercase">
                        RESTRINGIDO
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                          <Building2 className="h-2.5 w-2.5" /> Ubicación
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase">T{item.torre} - Apt {item.apartamento}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                          <User className="h-2.5 w-2.5" /> Guardia
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{item.guardName}</p>
                      </div>
                    </div>

                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                      <p className="text-[8px] font-black text-red-700 uppercase tracking-widest mb-1">Motivo:</p>
                      <p className="text-[10px] font-black text-red-900 uppercase leading-relaxed">{item.reason}</p>
                    </div>

                    <div className="flex justify-between items-center px-1 pt-1 border-t border-dashed border-slate-100 mt-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-[9px] font-black text-slate-500 uppercase">
                          {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), "dd/MM/yyyy", { locale: es }) : "S/F"}
                        </p>
                      </div>
                      <p className="text-[9px] font-black text-red-600 uppercase">BLOQUEO ACTIVO</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
