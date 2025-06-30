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
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="bg-white/80">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Create New Villager</h1>
              <p className="text-gray-600">Bring your new companion to life!</p>
            </div>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedAnimal && <span className="text-2xl">{selectedAnimal.emoji}</span>}
                Customize your villager
              </CardTitle>
              <CardDescription>Choose the characteristics that will define your new friend</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Villager Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="What will your villager be called?"
                    value={form.villagerName}
                    onChange={(e) => setForm({ ...form, villagerName: e.target.value })}
                    required
                  />
                </div>

                {/* Animal Type */}
                <div className="space-y-2">
                  <Label>Animal Type</Label>
                  <Select value={form.animalType} onValueChange={(value) => setForm({ ...form, animalType: value })}>
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

                {/* Personality */}
                <div className="space-y-2">
                  <Label>Personality</Label>
                  <Select value={form.personality} onValueChange={(value) => setForm({ ...form, personality: value })}>
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
                  {selectedPersonality && (
                    <p className="text-sm text-gray-600 mt-1">{selectedPersonality.description}</p>
                  )}
                </div>

                {/* Preview */}
                {form.villagerName && form.animalType && form.personality && (
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-4xl mb-2">{selectedAnimal?.emoji}</div>
                        <h3 className="text-lg font-semibold">{form.villagerName}</h3>
                        <p className="text-sm text-gray-600">
                          {selectedAnimal?.label.split(" ")[1]} • {selectedPersonality?.label.split(" ")[1]}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  disabled={isLoading || !form.villagerName || !form.animalType || !form.personality}
                >
                  {isLoading ? "Creating villager..." : "Create Villager!"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

