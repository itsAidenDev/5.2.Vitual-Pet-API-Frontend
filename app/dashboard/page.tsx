"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Plus, Heart, Zap, Utensils, Shield, LogOut, Fish, Package, Pencil, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Villager {
  villagerId: number
  villagerName: string
  animalType: string
  personality: string
  friendshipLevel: number
  happiness: number
  hunger: number
  energy: number
  healthLevel: number
  lastSleep: string
  ownerUsername: string
}

export default function Dashboard() {
  const [villagers, setVillagers] = useState<Villager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingVillager, setEditingVillager] = useState<{id: number, name: string} | null>(null)
  const [newName, setNewName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    fetchVillagers()
  }, [])

  const fetchVillagers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVillagers(data)
      } else {
        toast({
          title: "Error",
          description: "Could not load villagers",
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

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const getStatusColor = (value: number) => {
    if (value >= 70) return "text-green-600"
    if (value >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getPersonalityEmoji = (personality: string) => {
    const emojis: { [key: string]: string } = {
      LAZY: "😴",
      NORMAL: "😊",
      PEPPY: "🌟",
      JOCK: "💪",
      CRANKY: "😤",
      SNOOTY: "💅",
      SMUG: "😏",
    }
    return emojis[personality] || "😊"
  }

  const getAnimalEmoji = (animalType: string) => {
    const emojis: { [key: string]: string } = {
      WOLF: "🐺",
      CAT: "🐱",
      DOG: "🐶",
      EAGLE: "🦅",
      TIGER: "🐯",
      MOUSE: "🐭",
    }
    return emojis[animalType] || "🐾"
  }

  const handleRenameVillager = async () => {
    if (!editingVillager || !newName.trim()) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers/${editingVillager.id}/name`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      )

      if (response.ok) {
        // Actualizar la lista de aldeanos
        setVillagers(villagers.map(v =>
          v.villagerId === editingVillager.id
            ? { ...v, villagerName: newName }
            : v
        ))
        toast({
          title: "Success",
          description: "Villager renamed successfully!",
        })
        setEditingVillager(null)
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to rename villager",
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
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/background-morning.jpg')" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your villagers...</p>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
           style={{
             backgroundImage: "url('/images/background-morning.jpg')",
             backgroundSize: "cover",
             backgroundPosition: "center",
             backgroundRepeat: "no-repeat",
             backgroundAttachment: "fixed"
           }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 p-6 bg-white/90 backdrop-blur-sm rounded-xl border-2 border-white shadow-lg">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Village
                </h1>
                <p className="text-gray-600 mt-1">
                  Take care and play with your villagers!
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
               <Link href="/villagers/create">
                 <Button
                     variant="outline"
                      className="hover:shadow-md transition-all duration-200 border-2 border-gray-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                           Create Villager
                 </Button>
               </Link>
                 <Button
                   onClick={handleLogout}
                   variant="outline"
                   className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                 >
                   <LogOut className="w-4 h-4 mr-2" />
                     Logout
                 </Button>
               </div>
            </div>

            {/* Contenido principal */}
            <div className="space-y-6">
              {villagers.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700">No villagers yet</h3>
                    <p className="mt-2 text-gray-500">Create your first villager to get started!</p>
                    <Link href="/villagers/create" className="inline-block mt-6">
                      <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Villager
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Villagers</p>
                            <p className="text-2xl font-bold text-gray-800">{villagers.length}</p>
                          </div>
                          <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <Users className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Average Happiness</p>
                            <p className="text-2xl font-bold text-gray-800">
                              {Math.round(villagers.reduce((acc, v) => acc + v.happiness, 0) / villagers.length)}%
                            </p>
                          </div>
                          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                            <Heart className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Active Today</p>
                            <p className="text-2xl font-bold text-gray-800">
                              {villagers.filter(v => v.energy > 30).length}/{villagers.length}
                            </p>
                          </div>
                          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                            <Zap className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Hungry Villagers</p>
                            <p className="text-2xl font-bold text-gray-800">
                              {villagers.filter(v => v.hunger < 30).length}
                            </p>
                          </div>
                          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                            <Utensils className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Villagers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {villagers.map((villager) => (
                      <Card key={villager.villagerId} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                        <div className="relative">
                          <div className="h-40 bg-gradient-to-r from-blue-50 to-green-50 flex items-center justify-center">
                            <span className="text-8xl">{getAnimalEmoji(villager.animalType)}</span>
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {getPersonalityEmoji(villager.personality)}
                                <span className="capitalize">{villager.personality.toLowerCase()}</span>
                              </Badge>
                            </div>
                          </div>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-2xl font-bold">{villager.villagerName}</CardTitle>
                                <CardDescription className="capitalize">
                                    {villager.animalType.toLowerCase()} • Owner: {villager.ownerUsername}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingVillager({ id: villager.villagerId, name: villager.villagerName })
                                  setNewName(villager.villagerName)
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Happiness</span>
                                <span className={`font-medium ${getStatusColor(villager.happiness)}`}>
                                  {villager.happiness}%
                                </span>
                              </div>
                              <Progress value={villager.happiness} className="h-2" />
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Hunger</span>
                                <span className={`font-medium ${getStatusColor(villager.hunger)}`}>
                                  {villager.hunger}%
                                </span>
                              </div>
                              <Progress value={villager.hunger} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Energy</span>
                                <span className={`font-medium ${getStatusColor(villager.energy)}`}>
                                  {villager.energy}%
                                </span>
                              </div>
                              <Progress value={villager.energy} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Health</span>
                                <span className={`font-medium ${getStatusColor(villager.healthLevel)}`}>
                                  {villager.healthLevel}%
                                </span>
                              </div>
                              <Progress
                                value={villager.healthLevel}
                                className="h-2"
                              />
                            </div>
                            <div className="pt-2">
                               <Link href={`/villagers/${villager.villagerId}`}>
                                  <Button
                                      variant="default"
                                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                  >
                                    <Heart className="w-4 h-4 mr-2" />
                                        Interact
                                  </Button>
                               </Link>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {/* Quick Actions */}
                   <div className="mt-8">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Link href="/activities">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                          <Zap className="h-6 w-6 text-yellow-500" />
                          <span>Activities</span>
                        </Button>
                      </Link>
                      <Link href="/collections">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                          <Package className="h-6 w-6 text-blue-500" />
                          <span>Museum</span>
                        </Button>
                      </Link>
                      <Link href="/inventory">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                          <Package className="h-6 w-6 text-purple-500" />
                          <span>Inventory</span>
                        </Button>
                      </Link>
                      <Link href="/shop">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                          <ShoppingCart className="h-6 w-6 text-green-500" />
                          <span>Shop</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Diálogo para renombrar aldeano */}
        <Dialog open={!!editingVillager} onOpenChange={(open) => !open && setEditingVillager(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename Villager</DialogTitle>
              <DialogDescription>
                Enter a new name for your villager.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-3"
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameVillager()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={handleRenameVillager}
                disabled={isSaving || !newName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }