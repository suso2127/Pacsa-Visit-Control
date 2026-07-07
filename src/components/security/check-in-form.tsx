"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Sparkles, Loader2, ShieldCheck, User, CreditCard, Home, MessageSquare, Building2, Briefcase, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { summarizeVisitorIntent } from "@/ai/flows/summarize-visitor-intent-flow"
import { toast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const checkInSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  documentId: z.string().min(5, "ID de documento requerido"),
  torre: z.string().min(1, "Torre requerida"),
  apartamento: z.string().min(1, "Apartamento requerido"),
  company: z.string().optional(),
  plate: z.string().optional(),
  purpose: z.string().min(5, "Declare el propósito de la visita"),
  category: z.string().optional(),
  summary: z.string().optional(),
})

export function CheckInForm({ onSuccess }: { onSuccess: () => void }) {
  const [isSummarizing, setIsSummarizing] = React.useState(false)
  
  const form = useForm<z.infer<typeof checkInSchema>>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      name: "",
      documentId: "",
      torre: "",
      apartamento: "",
      company: "",
      plate: "",
      purpose: "",
      category: "Social Visit",
      summary: "",
    },
  })

  async function onSummarize() {
    const purpose = form.getValues("purpose")
    if (!purpose || purpose.length < 5) {
      toast({
        title: "Propósito insuficiente",
        description: "Por favor escriba un propósito más detallado antes de usar la IA.",
        variant: "destructive",
      })
      return
    }

    setIsSummarizing(true)
    try {
      const result = await summarizeVisitorIntent({ purpose })
      form.setValue("category", result.category)
      form.setValue("summary", result.summary)
      toast({
        title: "Análisis completado",
        description: `Visita categorizada como: ${result.category}`,
      })
    } catch (error) {
      toast({
        title: "Error de IA",
        description: "No se pudo procesar el propósito con el asistente.",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  function onSubmit(values: z.infer<typeof checkInSchema>) {
    console.log("Check-in values:", values)
    toast({
      title: "Check-in Exitoso",
      description: `Ingreso registrado para ${values.name} hacia Torre ${values.torre} - Apt ${values.apartamento}`,
    })
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <User className="h-3 w-3 text-primary" />
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input placeholder="NOMBRE DEL VISITANTE" className="uppercase font-bold h-11 bg-muted/30 border-none rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <CreditCard className="h-3 w-3 text-primary" />
                  Documento ID
                </FormLabel>
                <FormControl>
                  <Input placeholder="CÉDULA O PASAPORTE" className="uppercase font-bold h-11 bg-muted/30 border-none rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="torre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <Building2 className="h-3 w-3 text-primary" />
                  Torre
                </FormLabel>
                <FormControl>
                  <Input placeholder="EJ: T1" className="uppercase font-bold h-11 bg-muted/30 border-none rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="apartamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <Home className="h-3 w-3 text-primary" />
                  Apartamento
                </FormLabel>
                <FormControl>
                  <Input placeholder="EJ: 101" className="uppercase font-bold h-11 bg-muted/30 border-none rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  Categoría
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-muted/30 border-none h-11 rounded-xl font-bold uppercase text-[10px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Social Visit">Social</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                    <SelectItem value="Proveedor">Proveedor</SelectItem>
                    <SelectItem value="Maintenance">Técnico</SelectItem>
                    <SelectItem value="Other">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                  <Briefcase className="h-3 w-3 text-primary" />
                  Empresa
                </FormLabel>
                <FormControl>
                  <Input placeholder="EJ: CLARO" className="uppercase font-bold h-11 bg-muted/30 border-none rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="plate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <Car className="h-3 w-3 text-primary" />
                Placa / Registro
              </FormLabel>
              <FormControl>
                <Input placeholder="INGRESE PLACA VEHICULAR" className="uppercase font-bold h-11 bg-muted/30 border-none rounded-xl" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                <MessageSquare className="h-3 w-3 text-primary" />
                Propósito Declarado
              </FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <Textarea 
                    placeholder="Describa brevemente el motivo de la visita..." 
                    className="min-h-[80px] bg-muted/20 border-primary/10 rounded-xl resize-none font-medium"
                    {...field} 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 font-black text-[10px] uppercase tracking-widest transition-all rounded-xl h-10"
                    onClick={onSummarize}
                    disabled={isSummarizing}
                  >
                    {isSummarizing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Analizar con Asistente IA
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {(form.watch("summary") || form.watch("category")) && (
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-2 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Resumen IA</span>
              <Badge className="bg-indigo-500/10 text-indigo-700 border-none text-[9px] font-black uppercase">
                {form.watch("category")}
              </Badge>
            </div>
            <p className="text-xs italic text-indigo-900/70 line-clamp-2 leading-relaxed">
              "{form.watch("summary")}"
            </p>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-xs font-black uppercase tracking-[0.2em] bg-indigo-900 hover:bg-indigo-950 shadow-lg shadow-indigo-500/20 gap-2 rounded-xl">
          <ShieldCheck className="h-4 w-4" />
          REGISTRO
        </Button>
      </form>
    </Form>
  )
}
