"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface CreateVillagerRequest {
  villagerName: string
  animalType: string
  personality: string
}

const animalTypes = [
  { value: "WOLF", label: "🐺 Wolf", emoji: "🐺" },
  { value: "CAT", label: "🐱 Cat", emoji: "🐱" },
  { value: "DOG", label: "🐶 Dog", emoji: "🐶" },
  { value: "EAGLE", label: "🦅 Eagle", emoji: "🦅" },
  { value: "TIGER", label: "🐯 Tiger", emoji: "🐯" },
  { value: "MOUSE", label: "🐭 Mouse", emoji: "🐭" },
]

const personalities = [
  { value: "LAZY", label: "😴 Lazy", description: "Relaxed and calm" },
  { value: "NORMAL", label: "😊 Normal", description: "Balanced and friendly" },
  { value: "PEPPY", label: "🌟 Peppy", description: "Full of life and enthusiasm" },
  { value: "JOCK", label: "💪 Jock", description: "Active and competitive" },
  { value: "CRANKY", label: "😤 Cranky", description: "A bit grumpy but loyal" },
  { value: "SNOOTY", label: "💅 Snooty", description: "Elegant and sophisticated" },
  { value: "SMUG", label: "😏 Smug", description: "Confident and charismatic" },
]

export default function CreateVillager() {
  const [form, setForm] = useState<CreateVillagerRequest>({
    villagerName: "",
    animalType: "",
    personality: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        },
      )

      if (response.ok) {
        const villager = await response.json()
        toast({
          title: "Villager Created!",
          description: `${villager.villagerName} has joined your village`,
        })
        router.push("/dashboard")
      } else {
        const errorText = await response.text()
        toast({
          title: "Error",
          description: errorText,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAnimal = animalTypes.find((animal) => animal.value === form.animalType)
  const selectedPersonality = personalities.find((p) => p.value === form.personality)

 return (
   <div
     className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
     style={{
       backgroundImage: "url('/images/villager-interaction-background.jpg')",
       backgroundSize: "cover",
       backgroundPosition: "center"
     }}
   >
     <div className="w-full max-w-md">
       <Card className="bg-white/90 backdrop-blur-sm">
         <CardHeader>
           <div className="flex items-center mb-4">
             <Button variant="ghost" size="icon" asChild>
               <Link href="/dashboard">
                 <ArrowLeft className="h-4 w-4" />
               </Link>
             </Button>
             <CardTitle className="ml-2">Create New Villager</CardTitle>
           </div>
           <CardDescription>
             Fill in the details to create a new villager
           </CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-4">
               <div>
                 <Label htmlFor="villagerName">Villager Name</Label>
                 <Input
                   id="villagerName"
                   value={form.villagerName}
                   onChange={(e) => setForm({...form, villagerName: e.target.value})}
                   placeholder="Enter a name"
                   required
                 />
               </div>

               <div>
                 <Label>Animal Type</Label>
                 <Select
                   value={form.animalType}
                   onValueChange={(value) => setForm({...form, animalType: value})}
                   required
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select an animal type" />
                   </SelectTrigger>
                   <SelectContent>
                     {animalTypes.map((animal) => (
                       <SelectItem key={animal.value} value={animal.value}>
                         {animal.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <div>
                 <Label>Personality</Label>
                 <Select
                   value={form.personality}
                   onValueChange={(value) => setForm({...form, personality: value})}
                   required
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select a personality" />
                   </SelectTrigger>
                   <SelectContent>
                     {personalities.map((personality) => (
                       <SelectItem key={personality.value} value={personality.value}>
                         <div className="flex flex-col">
                           <span>{personality.label}</span>
                           <span className="text-xs text-gray-500">{personality.description}</span>
                         </div>
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
             </div>

             <Button type="submit" className="w-full" disabled={isLoading}>
               {isLoading ? 'Creating...' : 'Create Villager'}
             </Button>
           </form>
         </CardContent>
       </Card>
     </div>
   </div>
 );
}

