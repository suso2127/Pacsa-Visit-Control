
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight, Lock, Building2, Users, UserCog, Settings2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function SelectionPage() {
  const logo = PlaceHolderImages.find(img => img.id === 'pacsa-logo')

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center">
      <div className="w-full max-w-md min-h-screen bg-[#F0F5FF] shadow-2xl flex flex-col items-center justify-center p-6 space-y-8">
        
        <div className="text-center space-y-6 w-full">
          <div className="mx-auto flex h-32 w-full max-w-[240px] items-center justify-center overflow-hidden">
            {logo && (
              <Image 
                src={logo.imageUrl} 
                alt="PACSA Visit Control Logo" 
                width={400} 
                height={250} 
                className="object-contain"
                data-ai-hint={logo.imageHint}
              />
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-indigo-950">Pacsa-Visit</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">Gestión Residencial Inteligente</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 w-full">
          {/* SECCION RESIDENTES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <Users className="h-4 w-4 text-indigo-600" />
               <h2 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">RESIDENTES</h2>
            </div>
            
            <Link href="/settings" className="group">
              <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden transition-all active:scale-[0.98] hover:ring-2 hover:ring-indigo-500/20 rounded-[2rem]">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <UserCog className="h-7 w-7 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black text-indigo-950 uppercase tracking-tight">GESTIÓN DE RESIDENTES</h2>
                    <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">GRUPO PACSA S.A.</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-indigo-200 group-hover:text-indigo-500 transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* SECCION SEGURIDAD */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <Lock className="h-4 w-4 text-indigo-900" />
               <h2 className="text-[12px] font-black uppercase text-indigo-900 tracking-widest">SEGURIDAD</h2>
            </div>
            
            <Link href="/guard" className="group">
              <Card className="border-none shadow-xl shadow-indigo-500/5 bg-indigo-900 text-white overflow-hidden transition-all active:scale-[0.98] hover:ring-2 hover:ring-indigo-400/20 rounded-[2rem]">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <Lock className="h-7 w-7 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black uppercase tracking-tight truncate">Gestión Operativa</h2>
                    <p className="text-[9px] text-indigo-300 font-medium uppercase tracking-tighter mt-0.5">CONTROL DE ACCESO PH</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-indigo-700 group-hover:text-white transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* SECCION ADMINISTRACIÓN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
               <Settings2 className="h-4 w-4 text-indigo-950" />
               <h2 className="text-[12px] font-black uppercase text-indigo-950 tracking-widest">ADMINISTRACIÓN</h2>
            </div>
            
            <Link href="/admin-dashboard" className="group">
              <Card className="border-none shadow-xl shadow-indigo-500/5 bg-white overflow-hidden transition-all active:scale-[0.98] hover:ring-2 hover:ring-indigo-500/10 rounded-[2rem]">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Settings2 className="h-7 w-7 text-indigo-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black uppercase tracking-tight truncate">Gestión Administrativa</h2>
                    <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">GRUPO PACSA S.A.</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-indigo-200 group-hover:text-indigo-900 transition-colors shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-indigo-900/40 pt-4">
          <Building2 className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">GRUPO PACSA S.A • v2.0</span>
        </div>
      </div>
    </div>
  )
}
