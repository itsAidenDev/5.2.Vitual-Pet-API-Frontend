"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Sparkles, Heart, Zap, Smile, Palette, UserPlus, Loader2, PlusCircle } from "lucide-react"
import Link from "next/link"

interface CreateVillagerRequest {
  villagerName: string
  animalType: string
  personality: string
}

const animalTypes = [
  { value: "WOLF", label: "Wolf", emoji: "🐺", color: "from-gray-600 to-gray-800" },
  { value: "CAT", label: "Cat", emoji: "🐱", color: "from-amber-500 to-amber-700" },
  { value: "DOG", label: "Dog", emoji: "🐶", color: "from-yellow-600 to-amber-800" },
  { value: "EAGLE", label: "Eagle", emoji: "🦅", color: "from-blue-600 to-blue-900" },
  { value: "TIGER", label: "Tiger", emoji: "🐯", color: "from-orange-500 to-amber-700" },
  { value: "MOUSE", label: "Mouse", emoji: "🐭", color: "from-gray-400 to-gray-600" },
]

const personalities = [
  { value: "LAZY", label: "😴 Lazy", description: "Relaxed and calm", color: "bg-blue-100 text-blue-800" },
  { value: "NORMAL", label: "😊 Normal", description: "Balanced and friendly", color: "bg-green-100 text-green-800" },
  { value: "PEPPY", label: "🌟 Peppy", description: "Full of life and enthusiasm", color: "bg-pink-100 text-pink-800" },
  { value: "JOCK", label: "💪 Jock", description: "Active and competitive", color: "bg-red-100 text-red-800" },
  { value: "CRANKY", label: "😤 Cranky", description: "A bit grumpy but loyal", color: "bg-yellow-100 text-yellow-800" },
  { value: "SNOOTY", label: "💅 Snooty", description: "Elegant and sophisticated", color: "bg-purple-100 text-purple-800" },
  { value: "SMUG", label: "😏 Smug", description: "Confident and charismatic", color: "bg-indigo-100 text-indigo-800" },
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
          description: `${villager.villagerName} has joined your village!`,
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
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4"
        style={{
          backgroundImage: "url('/images/villager-interaction-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="w-full max-w-2xl">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-white shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-1">
              <CardHeader className="bg-white p-6 pb-2">
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
                    <Link href="/dashboard">
                      <ArrowLeft className="h-5 w-5" />
                    </Link>
                  </Button>
                  <div className="ml-4">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Create New Villager
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      Customize your new villager for your village
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <Label htmlFor="villagerName">Villager Name</Label>
                    <Input
                      id="villagerName"
                      placeholder="Enter villager name"
                      value={form.villagerName}
                      onChange={(e) => setForm({ ...form, villagerName: e.target.value })}
                      className="text-lg p-4"
                    />
                  </div>

                  {/* Animal Type Selection */}
                  <div className="space-y-3">
                    <Label>Animal Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {animalTypes.map((animal) => (
                        <Button
                          key={animal.value}
                          type="button"
                          variant={form.animalType === animal.value ? "default" : "outline"}
                          className={`h-auto py-3 flex flex-col items-center justify-center gap-2 ${
                            form.animalType === animal.value ? "border-2 border-blue-500" : ""
                          }`}
                          onClick={() => setForm({ ...form, animalType: animal.value })}
                        >
                          <span className="text-2xl">{animal.emoji}</span>
                          <span>{animal.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Personality Selection */}
                  <div className="space-y-3">
                    <Label>Personality</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {personalities.map((personality) => (
                        <Button
                          key={personality.value}
                          type="button"
                          variant={form.personality === personality.value ? "default" : "outline"}
                          className={`h-auto py-2 text-left justify-start gap-2 ${
                            form.personality === personality.value ? "border-2 border-blue-500" : ""
                          }`}
                          onClick={() => setForm({ ...form, personality: personality.value })}
                        >
                          <span className="text-base">{personality.label}</span>
                          <p className="text-xs text-muted-foreground">
                            {personality.description}
                          </p>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full py-6 text-lg font-medium bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-[1.02]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <PlusCircle className="mr-2 h-5 w-5" />
                  )}
                  Create Villager
                </Button>

                {/* Preview Card - Moved to Bottom */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 mt-8">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-3 ${
                      selectedAnimal ? `bg-gradient-to-br ${selectedAnimal.color} text-white` : 'bg-gray-200 text-gray-400'
                    }`}>
                      {selectedAnimal ? selectedAnimal.emoji : '?'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {form.villagerName || 'New Villager'}
                    </h3>
                    {selectedPersonality && (
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                        {selectedPersonality.label}
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
