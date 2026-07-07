
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Building2, 
  Home, 
  Phone,
  Tag,
  Search,
  ArrowLeft,
  Database
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ResidentDatabasePage() {
  const db = useFirestore()
  const [searchTerm, setSearchTerm] = React.useState("")

  const residentsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "residentes"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: residents, loading } = useCollection(residentsQuery)

  const filteredResidents = React.useMemo(() => {
    if (!searchTerm) return residents || []
    return (residents || []).filter(r => 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.torre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.apartamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [residents, searchTerm])

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950 uppercase">GESTIÓN ADMINISTRATIVA</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">BASE DE DATOS</p>
          </div>
          <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="relative group">
          <Input 
            placeholder="BUSCAR RESIDENTE..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="h-14 bg-white border-none rounded-2xl shadow-xl pl-12 text-[10px] font-black placeholder:text-muted-foreground/50 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500/20"
          />
          <Search className="absolute left-4 top-4.5 h-5 w-5 text-indigo-400" />
          <Badge className="absolute right-3 top-4 bg-indigo-900 text-white border-none font-black text-[9px] px-3 h-6 flex items-center shadow-lg">
            {residents?.length || 0} TOTAL
          </Badge>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-[10px] font-black uppercase text-muted-foreground tracking-widest animate-pulse">Sincronizando base de datos...</div>
          ) : filteredResidents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-100 flex items-center justify-center">
              <p className="text-[11px] font-black uppercase text-indigo-900/40 tracking-widest">
                NO SE ENCONTRARON REGISTROS.
              </p>
            </div>
          ) : (
            filteredResidents.map((r) => (
              <Card key={r.id} className="border-none shadow-xl shadow-indigo-500/5 bg-white rounded-[2rem] overflow-hidden group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{r.name}</h4>
                        <div className="flex items-center gap-2">
                           <Phone className="h-3 w-3 text-indigo-600" />
                           <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider">{r.phone}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className="text-[8px] font-black bg-indigo-900 text-white border-none uppercase px-2 py-0.5">
                      {r.residentType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" /> Torre
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase">{r.torre}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-1">
                        <Home className="h-2.5 w-2.5" /> Apartamento
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase">{r.apartamento}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1 pt-1 border-t border-dashed border-slate-100 mt-2">
                    <p className="text-[8px] font-black text-muted-foreground uppercase">Grupo PACSA S.A.</p>
                    <p className="text-[8px] font-black text-indigo-600 uppercase">Perfil Verificado</p>
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
