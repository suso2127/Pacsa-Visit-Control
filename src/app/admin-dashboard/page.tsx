"use client"

import * as React from "react"
import { Suspense } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  ChevronRight,
  ShieldAlert,
  FileText,
  ArrowLeft,
  Settings2,
  History,
  Database,
  ShieldCheck,
  UserPlus,
  Loader2,
  AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { useAuth, useFirestore } from "@/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { toast } from "@/hooks/use-toast"

function AdminDashboardContent() {
  const auth = useAuth()
  const db = useFirestore()
  const [isSeeding, setIsSeeding] = React.useState(false)

  const testUsers = [
    { email: 'residente@pacsa.com', password: 'Residente123', role: 'residente', name: 'DEMO RESIDENTE' },
    { email: 'residentes@pacsa.com', password: 'Residentes1234', role: 'residente', name: 'TEST RESIDENTE' },
    { email: 'guardia@pacsa.com', password: 'Guardia123', role: 'guardia', name: 'DEMO GUARDIA', guardNumber: 'GP-999', turno: 'Diurno' },
    { email: 'admin@pacsa.com', password: 'Admin123', role: 'admin', name: 'DEMO ADMINISTRADOR' },
    { email: 'superadmin@pacsa.com', password: 'SuperAdmin123', role: 'superadmin', name: 'DEMO SUPER ADMIN' },
  ]

  const handleSeedUsers = async () => {
    if (!auth || !db) return
    setIsSeeding(true)
    
    let createdCount = 0
    let errorsCount = 0

    for (const u of testUsers) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, u.email, u.password)
        const user = userCredential.user
        
        const userData = {
          name: u.name,
          email: u.email,
          role: u.role,
          status: 'active',
          createdAt: serverTimestamp(),
          ...(u.guardNumber && { guardNumber: u.guardNumber, turno: u.turno })
        }

        await setDoc(doc(db, "usuarios", user.uid), userData)
        createdCount++
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Usuario ${u.email} ya existe en Auth.`);
        } else {
          console.error(`Error creando ${u.email}:`, error)
          errorsCount++
        }
      }
    }

    setIsSeeding(false)
    
    if (createdCount > 0) {
      toast({
        title: "Cuentas Inicializadas",
        description: `Se han configurado ${createdCount} usuarios de prueba correctamente.`,
      })
    } else if (errorsCount === 0) {
      toast({
        title: "Usuarios ya existentes",
        description: "Las cuentas de prueba ya están registradas en el sistema.",
      })
    } else {
      toast({
        variant: "destructive",
        title: "Error en inicialización",
        description: "Hubo errores al crear algunas cuentas.",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/selection">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 bg-white shadow-sm"
              >
                <ArrowLeft className="h-5 w-5 text-indigo-900" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-indigo-950 leading-none">
                Gestión Administrativa
              </h2>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">GRUPO PACSA S.A.</p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-900 text-white shadow-lg">
            <Settings2 className="h-6 w-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 pt-2">
          <Link href="/resident-database">
            <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/10 rounded-3xl">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Database className="h-7 w-7 text-indigo-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Base de Datos</h3>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Registros de Residentes</p>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/guard-management">
            <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/10 rounded-3xl">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-7 w-7 text-indigo-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Gestión de Guardias</h3>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Control de Personal</p>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/blacklist">
            <Card className="border-none shadow-xl shadow-red-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-red-500/10 rounded-3xl">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-7 w-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Lista Negra PH</h3>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Sujetos Restringidos</p>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/consignas">
            <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/10 rounded-3xl">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText className="h-7 w-7 text-indigo-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Consignas Diarias</h3>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Órdenes Operativas</p>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/history?context=admin">
            <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/10 rounded-3xl">
              <CardContent className="p-6 flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <History className="h-7 w-7 text-indigo-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-indigo-950 uppercase tracking-tight">Historial</h3>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Control de Auditoría</p>
                </div>
                <ChevronRight className="h-5 w-5 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="pt-4">
          <Card className="border-none shadow-2xl bg-[#0D2266] text-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Configuración del Sistema</h3>
                  <p className="text-[8px] text-indigo-200 uppercase font-bold tracking-tighter">Entorno de Pruebas</p>
                </div>
              </div>
              
              <div className="bg-white/5 p-4 rounded-2xl space-y-3">
                <p className="text-[9px] font-medium text-indigo-100 leading-relaxed uppercase tracking-wider">
                  Inicializa los usuarios de prueba (Residente, Guardia, Admin, Super Admin) incluyendo la cuenta residentes@pacsa.com.
                </p>
                <Button 
                  onClick={handleSeedUsers}
                  disabled={isSeeding}
                  className="w-full h-12 bg-white text-[#0D2266] font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  INICIALIZAR USUARIOS DE PRUEBA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-5 bg-indigo-900 text-white rounded-[2rem] shadow-2xl space-y-3 mt-4">
          <div className="flex items-center gap-3">
            <Settings2 className="h-5 w-5 text-indigo-300" />
            <h3 className="text-[11px] font-black uppercase tracking-widest">Control Administrativo</h3>
          </div>
          <p className="text-[9px] font-medium text-indigo-200 uppercase leading-relaxed tracking-wider">
            GRUPO PACSA S.A. - SISTEMA DE GESTIÓN CENTRALIZADA.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-indigo-900" /></div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
