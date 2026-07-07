
"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { 
  LayoutDashboard, 
  Lock, 
  History,
  Bell, 
  Shield,
  ClipboardList,
  Search,
  X,
  ArrowLeft,
  Users,
  Phone,
  Calendar,
  Info,
  Database,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import LinkNext from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const context = searchParams.get('context')

  const mainNavigation = [
    { name: 'Inicio', href: '/selection', icon: LayoutDashboard },
    { name: 'Pre Visitas Programadas', href: '/scheduled-visits', icon: Calendar },
    { name: 'Base de Datos', href: '/resident-database?context=security', icon: Database },
    { name: 'Seguridad', href: '/guard', icon: Lock },
    { name: 'Visitantes del PH', href: '/security', icon: Users },
    { name: 'Historial', href: '/history?context=security', icon: History },
    { name: 'Novedades', href: '/novedades', icon: ClipboardList },
    { name: 'Emergencia', href: '/emergency', icon: Phone },
    { name: 'Información', href: '/info', icon: Info },
  ]

  const isResidentPage = pathname === '/pre-registro' || pathname === '/settings' || pathname === '/resident-registration' || pathname === '/scheduled-visits' || pathname === '/consignas'
  const isPreRegisterOnly = pathname === '/pre-registro'
  const isSettingsPage = pathname === '/settings' || pathname === '/consignas'
  
  // Identificar si estamos en cualquier sección de Gestión Administrativa
  const isAdminSection = (pathname === '/admin-dashboard' || pathname === '/blacklist' || pathname === '/consignas' || pathname === '/guard-management' || (pathname === '/resident-database' && context !== 'security') || (pathname === '/history' && context === 'admin'))
  
  // Identificar si estamos en cualquier sección de Gestión Operativa (Seguridad)
  const isSecuritySection = (pathname === '/guard' || pathname === '/scheduled-visits' || pathname === '/security' || pathname === '/novedades' || pathname === '/emergency' || pathname === '/info' || (pathname === '/history' && context === 'security') || (pathname === '/resident-database' && context === 'security'))

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-[#F0F5FF] min-h-screen shadow-2xl relative flex flex-col">
        
        <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
          <div className="flex h-14 items-center justify-between px-6 border-b border-slate-50">
            <LinkNext href="/selection" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 shadow-md">
                <Shield className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-headline text-base font-black tracking-tight text-indigo-950 uppercase">Pacsa-Visit</span>
            </LinkNext>
            
            <div className="flex items-center gap-2">
              {isPreRegisterOnly && (
                <LinkNext href="/selection">
                  <Button variant="ghost" className="h-9 px-3 text-[10px] font-black uppercase text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5 rounded-xl border border-red-100">
                    <X className="h-3.5 w-3.5" />
                    Cerrar
                  </Button>
                </LinkNext>
              )}
              
              {/* Lógica de Regresar para Gestión Administrativa */}
              {isAdminSection && (
                <LinkNext href={pathname === '/admin-dashboard' ? "/selection" : "/admin-dashboard"}>
                  <Button variant="ghost" className="h-9 px-3 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 rounded-xl border border-indigo-100">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Regresar
                  </Button>
                </LinkNext>
              )}

              {/* Lógica de Regresar para Gestión Operativa (Seguridad) */}
              {isSecuritySection && !isAdminSection && (
                <LinkNext href={pathname === '/guard' ? "/selection" : "/guard"}>
                  <Button variant="ghost" className="h-9 px-3 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 rounded-xl border border-indigo-100">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Regresar
                  </Button>
                </LinkNext>
              )}

              {isSettingsPage && !isAdminSection && !isSecuritySection && (
                <LinkNext href="/selection">
                  <Button variant="ghost" className="h-9 px-3 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-1.5 rounded-xl border border-indigo-100">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Regresar
                  </Button>
                </LinkNext>
              )}

              {!isResidentPage && !isAdminSection && !isSecuritySection && (
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full border-none hover:bg-slate-100">
                  <Bell className="h-5 w-5 text-indigo-900" />
                  <span className="absolute right-2.5 top-2.5 flex h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                </Button>
              )}
            </div>
          </div>

          {/* Ocultar menú Buscar si es sección administrativa */}
          {!isResidentPage && !isAdminSection && (
            <div className="bg-white/80">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="buscar-menu" className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline transition-all">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-indigo-600 rounded-full" />
                      <h2 className="text-[11px] font-black text-indigo-900 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Search className="h-3 w-3" /> Buscar
                      </h2>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-1">
                      {mainNavigation.map((item) => {
                        const isActive = pathname === item.href

                        return (
                          <LinkNext 
                            key={item.name} 
                            href={item.href}
                            className={cn(
                              "flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 w-full",
                              isActive 
                                ? "bg-indigo-900 text-white shadow-lg" 
                                : "text-indigo-900/60 hover:bg-indigo-50 hover:text-indigo-900"
                            )}
                          >
                            <item.icon className={cn(
                              "h-5 w-5", 
                              isActive ? "text-white" : "text-indigo-900/60"
                            )} />
                            <div className="flex flex-col">
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap leading-none",
                                isActive ? "text-white" : "text-indigo-900/80"
                              )}>
                                {item.name}
                              </span>
                            </div>
                          </LinkNext>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </header>

        <main className="flex-1 p-4 animate-in fade-in duration-500 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
