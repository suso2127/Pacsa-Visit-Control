
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  UserPlus, 
  Users, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Trash2, 
  Search, 
  Key, 
  UserMinus, 
  Loader2,
  Tag,
  Clock,
  ArrowLeft
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Link from "next/link"

export default function GuardManagementPage() {
  const db = useFirestore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    guardNumber: "",
    turno: "Diurno"
  })

  const guardsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "usuarios"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: users, loading } = useCollection(guardsQuery)

  const guards = React.useMemo(() => {
    return users?.filter(u => u.role === 'guardia') || []
  }, [users])

  const filteredGuards = React.useMemo(() => {
    return guards.filter(g => 
      g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.guardNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [guards, searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, turno: value }))
  }

  const handleCreateGuard = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return
    
    setIsSubmitting(true)
    const dataToSave = {
      name: formData.name,
      email: formData.email.toLowerCase(),
      guardNumber: formData.guardNumber,
      turno: formData.turno,
      status: 'active',
      role: 'guardia',
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "usuarios"), dataToSave)
      .then(() => {
        toast({
          title: "Cuenta Creada",
          description: `El oficial ${formData.name} ha sido registrado correctamente.`,
        })
        setFormData({ name: "", email: "", password: "", guardNumber: "", turno: "Diurno" })
        setIsSubmitting(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'usuarios',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false)
      });
  }

  const handleToggleStatus = (guardId: string, currentStatus: string) => {
    if (!db) return
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const docRef = doc(db, "usuarios", guardId)
    
    updateDoc(docRef, { status: newStatus })
      .then(() => {
        toast({
          title: newStatus === 'active' ? "Cuenta Activada" : "Cuenta Desactivada",
          description: "El estado del oficial ha sido actualizado.",
        })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: { status: newStatus }
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleDeleteGuard = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, "usuarios", id))
      .then(() => {
        toast({
          title: "Oficial Eliminado",
          description: "La cuenta ha sido borrada permanentemente.",
        })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `usuarios/${id}`,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const handleResetPassword = () => {
    toast({
      title: "Función Administrativa",
      description: "Solicitud de cambio de contraseña enviada al sistema central.",
    })
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
              <h2 className="text-2xl font-black tracking-tight text-indigo-950 uppercase">Gestión de Guardias</h2>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">SISTEMA CENTRAL PACSA</p>
            </div>
          </div>
          <div className="h-10 w-10 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Crear Cuenta */}
        <Card className="border-none shadow-xl shadow-indigo-500/5 bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b bg-indigo-50/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              Nuevo Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleCreateGuard} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Nombre Completo</Label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="NOMBRE DEL OFICIAL"
                  className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Correo Electrónico</Label>
                <div className="relative">
                  <Input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="EMAIL@PACSA.COM"
                    className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs pr-10"
                    required
                  />
                  <Mail className="absolute right-3 top-3.5 h-4 w-4 text-indigo-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Contraseña</Label>
                  <div className="relative">
                    <Input 
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs pr-10"
                      required
                    />
                    <Lock className="absolute right-3 top-3.5 h-4 w-4 text-indigo-400" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">N° de Guardia</Label>
                  <Input 
                    name="guardNumber"
                    value={formData.guardNumber}
                    onChange={handleInputChange}
                    placeholder="GP-000"
                    className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Turno Asignado</Label>
                <Select value={formData.turno} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-muted/30 border-none h-11 rounded-xl font-bold text-xs uppercase">
                    <SelectValue placeholder="Seleccione Turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Diurno">DIURNO</SelectItem>
                    <SelectItem value="Nocturno">NOCTURNO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "CREAR CUENTA GUARDIA"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Buscador */}
        <div className="relative">
          <Input 
            placeholder="BUSCAR OFICIAL..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="h-12 bg-white border-none rounded-2xl shadow-lg pl-12 text-xs font-black"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-indigo-400" />
        </div>

        {/* Lista de Guardias */}
        <div className="space-y-4">
          <h3 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest px-1">Personal Activo</h3>
          
          {loading ? (
            <div className="text-center py-10 text-xs font-black uppercase text-muted-foreground tracking-widest">Sincronizando personal...</div>
          ) : filteredGuards.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-indigo-100 text-[10px] font-black uppercase text-muted-foreground">No hay guardias registrados.</div>
          ) : (
            filteredGuards.map((g) => (
              <Card key={g.id} className={`border-none shadow-xl shadow-indigo-500/5 bg-white rounded-3xl overflow-hidden ${g.status === 'inactive' ? 'opacity-60 grayscale' : ''}`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-indigo-950 uppercase leading-none mb-1">{g.name}</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{g.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-400 hover:text-indigo-600 rounded-full" onClick={handleResetPassword}>
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive rounded-full" onClick={() => handleDeleteGuard(g.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" /> Número
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase">{g.guardNumber}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> Turno
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase">{g.turno}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${g.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <p className="text-[9px] font-black text-muted-foreground uppercase">{g.status === 'active' ? 'EN SERVICIO' : 'INACTIVO'}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleStatus(g.id, g.status)}
                      className={`h-8 font-black text-[9px] uppercase tracking-widest rounded-lg px-4 ${g.status === 'active' ? 'border-red-100 text-red-600 hover:bg-red-50' : 'border-emerald-100 text-emerald-600 hover:bg-emerald-50'}`}
                    >
                      {g.status === 'active' ? (
                        <>
                          <UserMinus className="h-3 w-3 mr-1.5" /> DESACTIVAR
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-3 w-3 mr-1.5" /> ACTIVAR
                        </>
                      )}
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
