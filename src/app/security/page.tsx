
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  LogOut, 
  Clock, 
  ShieldCheck,
  Home,
  ArrowLeft,
  User,
  CreditCard,
  Building2,
  Briefcase,
  Car,
  Search,
  History
} from "lucide-react"
import Link from "next/link"
import { collection, doc, updateDoc, orderBy, query } from "firebase/firestore"
import { useFirestore, useCollection } from "@/firebase"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function SecurityPage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const visitorsQuery = React.useMemo(() => {
    if (!db) return null
    return query(collection(db, "visitas"), orderBy("checkInTime", "desc"))
  }, [db])

  const { data: visitors, loading } = useCollection(visitorsQuery)

  const activeVisitors = React.useMemo(() => {
    return visitors?.filter(v => v.status === 'active') || []
  }, [visitors])

  const filteredVisitors = React.useMemo(() => {
    if (!searchTerm) return activeVisitors
    return activeVisitors.filter(v => 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.documentId?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [activeVisitors, searchTerm])
  
  const handleSignOut = async (visitorId: string) => {
    if (!db) return
    try {
      await updateDoc(doc(db, "visitas", visitorId), {
        status: "checked-out",
        checkOutTime: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error signing out:", error)
    }
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
            <h2 className="text-2xl font-black tracking-tight text-indigo-950">Visitantes del PH</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">CONTROL DE ACCESO PACSA</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="px-1">
            <h3 className="text-[14px] font-black uppercase text-indigo-950">VISITANTES EN EL PH</h3>
          </div>

          <div className="relative group">
            <Input 
              placeholder="BUSCAR VISITANTE EN PH..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="h-14 bg-white border-none rounded-2xl shadow-xl pl-12 text-[10px] font-black placeholder:text-muted-foreground/50 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/20"
            />
            <Search className="absolute left-4 top-4.5 h-5 w-5 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
            <Badge className="absolute right-3 top-4 bg-emerald-500 text-white border-none font-black text-[9px] px-3 h-6 flex items-center shadow-lg shadow-emerald-500/20">
              {activeVisitors.length} ACTIVOS
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sincronizando seguridad...</div>
          ) : filteredVisitors.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex items-center justify-center">
              <p className="text-[11px] font-black uppercase text-indigo-900/40 tracking-widest">
                {searchTerm ? "No se encontraron resultados." : "NO HAY VISITANTES ACTIVOS."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVisitors.map((visitor) => (
                <Card key={visitor.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-[2rem] overflow-hidden group">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                          <User className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{visitor.name}</h4>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ID: {visitor.documentId}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[8px] font-black border-indigo-100 text-indigo-600 uppercase px-2 py-0.5">
                        {visitor.category}
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
                      <div className="space-y-1">
                        <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> Guardia
                        </p>
                        <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{visitor.guardName}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-100">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <p className="text-[10px] font-black text-emerald-600 uppercase">
                          Entrada: {format(new Date(visitor.checkInTime), "hh:mm aa", { locale: es })}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleSignOut(visitor.id)}
                        variant="outline" 
                        size="sm" 
                        className="h-10 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 font-black text-[9px] uppercase tracking-widest rounded-xl px-4 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        SALIDA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
