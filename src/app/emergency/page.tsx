
"use client"

import * as React from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, ShieldAlert, Flame, Ambulance, Siren, ExternalLink } from "lucide-react"

export default function EmergencyPage() {
  const emergencyNumbers = [
    { name: "SISTEMA ÚNICO DE EMERGENCIAS", number: "911", icon: Siren, color: "bg-red-600" },
    { name: "CUERPO DE BOMBEROS", number: "103", icon: Flame, color: "bg-orange-600" },
    { name: "POLICÍA NACIONAL", number: "104", icon: ShieldAlert, color: "bg-blue-800" },
    { name: "CRUZ ROJA", number: "455", icon: Ambulance, color: "bg-red-500" },
  ]

  const phContacts = [
    { name: "ADMINISTRACIÓN PH", number: "+507 0000-0000", detail: "Atención Lunes a Viernes" },
    { name: "CENTRO DE CONTROL PACSA", number: "+507 1111-1111", detail: "Monitoreo 24/7" },
    { name: "SUPERVISOR DE TURNO", number: "+507 2222-2222", detail: "Emergencias Operativas" },
  ]

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-md mx-auto pb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-indigo-950">Emergencias</h2>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">DIRECTORIO NACIONAL Y PH</p>
          </div>
          <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
            <Phone className="h-6 w-6 text-red-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {emergencyNumbers.map((item) => (
            <Card 
              key={item.number} 
              className="border-none shadow-xl shadow-red-500/5 bg-white overflow-hidden active:scale-95 transition-transform cursor-pointer"
              onClick={() => handleCall(item.number)}
            >
              <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-indigo-950 uppercase leading-tight line-clamp-1">{item.name}</p>
                  <p className="text-lg font-black text-red-600">{item.number}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-[11px] font-black uppercase text-indigo-950 tracking-widest px-1">Contactos del PH</h3>
          {phContacts.map((contact) => (
            <Card key={contact.name} className="border-none shadow-lg bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase">{contact.name}</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{contact.detail}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleCall(contact.number)}
                  variant="ghost" 
                  className="text-indigo-600 font-black text-xs hover:bg-indigo-50 rounded-xl"
                >
                  LLAMAR
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none bg-indigo-900 text-white shadow-2xl overflow-hidden rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Recomendación PACSA</h3>
              <p className="text-[9px] font-medium text-indigo-100 leading-relaxed uppercase tracking-wider">
                EN CASO DE UNA EMERGENCIA REAL, MANTENGA LA CALMA Y COMUNÍQUESE PRIMERO CON EL 911 O GARRITA PRINCIPAL.
              </p>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest border-none rounded-xl h-12 gap-2">
              <ExternalLink className="h-4 w-4" /> REGLAMENTO DE SEGURIDAD
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ")
}
