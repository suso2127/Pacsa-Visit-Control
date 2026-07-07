
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  UserCog, 
  ArrowLeft,
  UserPlus,
  Calendar,
  ChevronRight,
  Info
} from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 bg-white shadow-sm"
              >
                <ArrowLeft className="h-5 w-5 text-indigo-900" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-indigo-950 leading-none uppercase">
                REGISTRO Y PROGRAMACIÓN
              </h2>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">BASE DE DATOS</p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-indigo-900 text-white shadow-lg">
            <UserCog className="h-6 w-6" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link href="/resident-registration">
            <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/10 rounded-3xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <UserPlus className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-tight">Registro Residencial</h3>
                  <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Nuevos Residentes</p>
                </div>
                <ChevronRight className="h-4 w-4 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/pre-registro">
            <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden active:scale-[0.98] transition-all cursor-pointer hover:ring-2 hover:ring-indigo-500/10 rounded-3xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-black text-indigo-950 uppercase tracking-tight">Programar Visitas</h3>
                  <p className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Pre-Registro Invitados</p>
                </div>
                <ChevronRight className="h-4 w-4 text-indigo-200" />
              </CardContent>
            </Card>
          </Link>

          <div className="mt-2 p-5 bg-red-50/50 rounded-3xl border border-dashed border-red-200 flex items-start gap-4">
            <div className="h-8 w-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-1">
              <Info className="h-4 w-4 text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-red-700 uppercase tracking-[0.2em]">MENSAJE</h3>
              <p className="text-[10px] font-bold text-red-600 uppercase leading-relaxed tracking-wider">
                Al ingresar sus datos en Registro Residencial, lo hace una sola vez; después solo programa sus visitas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
