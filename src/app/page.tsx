
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

/**
 * Página raíz del sistema.
 * Se ha eliminado el formulario de login para permitir acceso directo
 * a la gestión residencial y operativa.
 */
export default function RootPage() {
  const router = useRouter()

  React.useEffect(() => {
    // Redirección inmediata al panel de selección principal
    router.push("/selection")
  }, [router])

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex flex-col justify-center items-center p-4">
      <div className="space-y-4 text-center animate-pulse">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-900 text-white shadow-lg">
          <div className="h-6 w-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
        </div>
        <p className="text-[10px] text-indigo-900/60 font-black uppercase tracking-[0.3em]">
          Cargando Pacsa-Visit...
        </p>
      </div>
    </div>
  )
}
