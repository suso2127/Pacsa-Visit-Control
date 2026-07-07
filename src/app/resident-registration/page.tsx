
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Building2, Home, ArrowRight, Loader2, ShieldCheck, ArrowLeft, Tag, Phone, CheckCircle2 } from "lucide-react"
import { useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ResidentRegistrationPage() {
  const router = useRouter()
  const db = useFirestore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    torre: "T1",
    apartamento: "",
    residentType: "PROPIETARIO"
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return;

    setIsSubmitting(true)
    
    const dataToSave = {
      name: formData.name,
      phone: formData.phone,
      torre: formData.torre,
      apartamento: formData.apartamento,
      residentType: formData.residentType,
      createdAt: serverTimestamp()
    }

    // Registro ultra-rápido en Firestore (Optimistic Update)
    // No usamos await para que la interfaz responda de inmediato
    addDoc(collection(db, "residentes"), dataToSave)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'residentes',
          operation: 'create',
          requestResourceData: dataToSave,
        });
        errorEmitter.emit('permission-error', permissionError);
      })

    // Persistencia local inmediata para que el sistema reconozca al residente
    localStorage.setItem('pacsa_residente_settings', JSON.stringify({
      residentName: formData.name,
      phone: formData.phone,
      torre: formData.torre,
      apartamento: formData.apartamento
    }))

    // Mensaje de éxito instantáneo
    toast({
      title: "¡REGISTRO EXITOSO!",
      description: "Su cuenta ha sido creada y activada correctamente.",
    })
    
    // Redirección inmediata a la gestión
    router.push('/settings')
  }

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex justify-center items-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-900 text-white shadow-xl">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-black text-indigo-950 uppercase tracking-widest">Registro de Residente</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.3em]">ACTIVACIÓN DE PERFIL INMEDIATA</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl shadow-indigo-500/10 overflow-hidden rounded-[2.5rem] bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                  <User className="h-3 w-3 text-indigo-600" /> NOMBRE COMPLETO
                </Label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="NOMBRE Y APELLIDO"
                  className="bg-muted/30 border-none h-14 rounded-2xl font-black text-sm uppercase px-5 focus-visible:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                  <Phone className="h-3 w-3 text-indigo-600" /> TELÉFONO CELULAR
                </Label>
                <Input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="NÚMERO PARA WHATSAPP"
                  className="bg-muted/30 border-none h-14 rounded-2xl font-black text-sm uppercase px-5 focus-visible:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                    <Building2 className="h-3 w-3 text-indigo-600" /> TORRE
                  </Label>
                  <Select value={formData.torre} onValueChange={(v) => handleSelectChange('torre', v)}>
                    <SelectTrigger className="bg-muted/30 border-none h-14 rounded-2xl font-black text-sm uppercase px-5">
                      <SelectValue placeholder="TORRE" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="T1">T1</SelectItem>
                      <SelectItem value="T2">T2</SelectItem>
                      <SelectItem value="T3">T3</SelectItem>
                      <SelectItem value="T4">T4</SelectItem>
                      <SelectItem value="T5">T5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                    <Home className="h-3 w-3 text-indigo-600" /> APARTAMENTO
                  </Label>
                  <Input 
                    name="apartamento"
                    value={formData.apartamento}
                    onChange={handleInputChange}
                    placeholder="APT"
                    className="bg-muted/30 border-none h-14 rounded-2xl font-black text-sm uppercase px-5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-indigo-900/40 uppercase flex items-center gap-2 ml-1">
                  <Tag className="h-3 w-3 text-indigo-600" /> CONDICIÓN
                </Label>
                <Select value={formData.residentType} onValueChange={(v) => handleSelectChange('residentType', v)}>
                  <SelectTrigger className="bg-muted/30 border-none h-14 rounded-2xl font-black text-sm uppercase px-5">
                    <SelectValue placeholder="TIPO" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="PROPIETARIO">PROPIETARIO</SelectItem>
                    <SelectItem value="INQUILINO">INQUILINO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-indigo-900 hover:bg-indigo-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      COMPLETAR REGISTRO <CheckCircle2 className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/selection">
            <Button variant="ghost" className="text-[10px] font-black text-muted-foreground hover:text-indigo-600 uppercase tracking-widest gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Cancelar y Volver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
