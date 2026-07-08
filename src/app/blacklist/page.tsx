"use client"

import { Suspense } from "react"
import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  ShieldAlert, 
  UserMinus, 
  Search, 
  Trash2, 
  User, 
  AlertOctagon,
  Loader2,
  Building2,
  Save,
  CreditCard,
  Briefcase,
  Tag
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

function BlacklistContent() {
  const db = useFirestore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const [formData, setFormData] = React.useState({
    name: "",
    documentId: "",
    torre: "",
    apartamento: "",
    personType: "PROPIETARIO",
    company: "",
    reason: "",
    guardName: "OFICIAL PACSA",
    residentName: "",
  })

  // Cargar sesión del guardia si existe
  React.useEffect(() => {
    const saved = localStorage.getItem('pacsa_guard_session')
    if (saved) {
      const parsed = JSON.parse(saved)
      setFormData(prev => ({ ...prev, guardName: parsed.name }))
    }
  }, [])

  // Consulta exclusiva a la colección 'listanegra'
  const blacklistQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "listanegra"), orderBy("createdAt", "desc"))
  }, [db])

  const { data: blacklist, loading } = useCollection(blacklistQuery)

  const filteredList = React.useMemo(() => {
    return blacklist?.filter(item => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  }, [blacklist, searchTerm])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, personType: value }))
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return
    
    setIsSubmitting(true)
    const dataToSave = {
      ...formData,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "listanegra"), dataToSave)
      .then(() => {
        toast({
          title: "Registro Agregado",
          description: "Acceso denegado registrado correctamente en Lista Negra.",
        })
        setFormData(prev => ({ 
          ...prev, 
          name: "", 
          documentId: "", 
          torre: "", 
          apartamento: "", 
          company: "",
          reason: "", 
          residentName: "" 
        }))
        setIsSubmitting(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'listanegra',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
        setIsSubmitting(false)
      });
  }

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, "listanegra", id))
      .then(() => {
        toast({
          title: "Registro Eliminado",
          description: "La persona ha sido removida de la lista negra.",
        })
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: `listanegra/${id}`,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950">Lista Negra</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">ACCESOS DENEGADOS PH</p>
          </div>
          <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
        </div>

        {/* Formulario para agregar */}
        <Card className="border-none shadow-xl shadow-red-500/5 bg-card overflow-hidden">
          <CardHeader className="pb-3 border-b bg-red-50/30">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-red-900 flex items-center gap-2">
              <UserMinus className="h-4 w-4 text-red-600" />
              Nuevo Bloqueo PACSA
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleAdd} className="space-y-4">
              
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-red-700 uppercase tracking-widest border-b pb-1">Datos del Sujeto</h3>
                
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Nombre Completo</Label>
                  <div className="relative">
                    <Input 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="NOMBRE DEL SUJETO"
                      className="bg-muted/30 border-none h-11 rounded-xl px-4 uppercase font-bold text-xs"
                      required
                    />
                    <User className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Cédula / Pasaporte</Label>
                  <div className="relative">
                    <Input 
                      name="documentId"
                      value={formData.documentId}
                      onChange={handleInputChange}
                      placeholder="N° DE IDENTIFICACIÓN"
                      className="bg-muted/30 border-none h-11 rounded-xl px-4 uppercase font-bold text-xs"
                      required
                    />
                    <CreditCard className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Torre</Label>
                    <Input 
                      name="torre"
                      value={formData.torre}
                      onChange={handleInputChange}
                      placeholder="T1"
                      className="bg-muted/30 border-none h-11 rounded-xl px-4 uppercase font-bold text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Apartamento</Label>
                    <Input 
                      name="apartamento"
                      value={formData.apartamento}
                      onChange={handleInputChange}
                      placeholder="APT"
                      className="bg-muted/30 border-none h-11 rounded-xl px-4 uppercase font-bold text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Tipo de Persona</Label>
                    <Select value={formData.personType} onValueChange={handleSelectChange}>
                      <SelectTrigger className="bg-muted/30 border-none h-11 rounded-xl font-bold uppercase text-[10px]">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PROPIETARIO">PROPIETARIO</SelectItem>
                        <SelectItem value="RESIDENTE">RESIDENTE</SelectItem>
                        <SelectItem value="INQUILINO">INQUILINO</SelectItem>
                        <SelectItem value="PROVEEDOR">PROVEEDOR</SelectItem>
                        <SelectItem value="AMA DE LLAVES">AMA DE LLAVES</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Empresa</Label>
                    <div className="relative">
                      <Input 
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="EMPRESA"
                        className="bg-muted/30 border-none h-11 rounded-xl px-4 uppercase font-bold text-xs"
                      />
                      <Briefcase className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Motivo de Bloqueo</Label>
                <Textarea 
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="DESCRIBA LA RAZÓN DEL VETO..."
                  className="bg-muted/30 border-none rounded-xl font-medium text-xs min-h-[80px] uppercase resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <>
                    <Save className="h-4 w-4" />
                    GUARDAR BLOQUEO
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Buscador */}
        <div className="relative">
          <Input 
            placeholder="BUSCAR EN LISTA NEGRA..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            className="h-12 bg-white border-none rounded-2xl shadow-lg pl-12 text-xs font-black"
          />
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-indigo-400" />
        </div>

        {/* Lista de vetados */}
        <div className="space-y-4">
          <h3 className="text-[12px] font-black uppercase text-red-950 tracking-widest px-1 flex items-center justify-between">
            Sujetos Vetados
            <span className="text-[8px] font-medium text-muted-foreground">ALERTAS ACTIVAS</span>
          </h3>
          
          {loading ? (
            <div className="text-center py-10 text-xs font-black uppercase text-muted-foreground">Sincronizando seguridad...</div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-red-100 text-[10px] font-black uppercase text-muted-foreground">No hay registros de bloqueo activos.</div>
          ) : (
            filteredList.map((item) => (
              <Card key={item.id} className="border-none shadow-xl shadow-red-500/5 bg-white rounded-3xl overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                        <AlertOctagon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-red-950 uppercase leading-none mb-1">{item.name}</h4>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">ID: {item.documentId}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive/40 hover:text-destructive rounded-full" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" /> Tipo
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{item.personType}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" /> Ubicación
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase">T{item.torre} - Apt {item.apartamento}</p>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Briefcase className="h-2.5 w-2.5" /> Empresa
                      </p>
                      <p className="text-[10px] font-black text-indigo-900 uppercase truncate">{item.company || 'PARTICULAR'}</p>
                    </div>
                  </div>

                  <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[8px] font-black text-red-700 uppercase tracking-widest mb-1">Motivo del Veto:</p>
                    <p className="text-[10px] font-black text-red-900 uppercase leading-relaxed">{item.reason}</p>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <div className="space-y-0.5">
                      <p className="text-[7px] font-black text-muted-foreground uppercase">Registrado por:</p>
                      <p className="text-[9px] font-black text-indigo-900 uppercase">{item.guardName}</p>
                    </div>
                    <p className="text-[8px] font-bold text-muted-foreground">
                      {item.createdAt ? format(item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt), "dd/MM/yyyy", { locale: es }) : "S/F"}
                    </p>
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

export default function BlackListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F5FF] flex flex-col justify-center items-center p-4">
        <div className="space-y-4 text-center animate-pulse">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-900 text-white shadow-lg">
            <div className="h-6 w-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
          </div>
          <p className="text-[10px] text-indigo-900/60 font-black uppercase tracking-[0.3em]">
            Cargando Lista Negra...
          </p>
        </div>
      </div>
    }>
      <BlacklistContent />
    </Suspense>
  )
}
