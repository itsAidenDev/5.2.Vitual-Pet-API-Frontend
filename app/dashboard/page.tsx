"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Plus, Heart, Zap, Utensils, Shield, LogOut, Fish, Package, Pencil, ShoppingCart } from "lucide-react"
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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/background-morning.jpg')" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white/90 rounded-lg px-4 py-3">
            <h1 className="text-4xl font-bold text-gray-800 mb-1">My Village</h1>
            <p className="text-gray-700">Take care and play with your villagers!</p>
          </div>
          <div className="flex gap-4">
            <Link href="/activities">
              <Button variant="outline" className="bg-white/80">
                <Fish className="w-4 h-4 mr-2" />
                Activities
              </Button>
            </Link>
            <Link href="/collections">
              <Button variant="outline" className="bg-white/80">
                <Shield className="w-4 h-4 mr-2" />
                Museum
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="bg-white/80">
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline" className="bg-white/80">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shop
              </Button>
            </Link>
            <Link href="/villagers/create">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Villager
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout} className="bg-white/80">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Villagers Grid */}
        {villagers.length === 0 ? (
          <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
            <CardContent>
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-2">Your village is empty!</h3>
              <p className="text-gray-600 mb-4">Create your first villager to start the adventure</p>
              <Link href="/villagers/create">
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Villager
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {villagers.map((villager) => (
              <Card
                key={villager.villagerId}
                className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{getAnimalEmoji(villager.animalType)}</span>
                      {villager.villagerName}
                      <button
                        onClick={() => {
                          setEditingVillager({ id: villager.villagerId, name: villager.villagerName })
                          setNewName(villager.villagerName)
                        }}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                        title="Rename villager"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">{getPersonalityEmoji(villager.personality)}</span>
                      <Badge variant="secondary" className="text-xs">
                        {villager.personality.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>
                    {villager.animalType.toLowerCase()} • Friendship level: {villager.friendshipLevel}
                    {villager.ownerUsername && (
                      <span className="block text-xs text-gray-500 mt-1">
                        Owner: {villager.ownerUsername}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Happiness</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(villager.happiness)}`}>
                        {villager.happiness}%
                      </span>
                    </div>
                    <Progress value={villager.happiness} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Energy</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(villager.energy)}`}>
                        {villager.energy}%
                      </span>
                    </div>
                    <Progress value={villager.energy} className="h-2" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        <span className="text-sm">Hunger</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(100 - villager.hunger)}`}>
                        {villager.hunger > 70 ? "Hungry" : villager.hunger > 30 ? "Satisfied" : "Full"}
                      </span>
                    </div>
                    <Progress value={Math.max(0, 100 - villager.hunger)} className="h-2" />


                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Health</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(villager.healthLevel)}`}>
                        {villager.healthLevel}%
                      </span>
                    </div>
                    <Progress value={villager.healthLevel} className="h-2" />
                  </div>

                  <Link href={`/villagers/${villager.villagerId}`}>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 mt-6">
                      Interact
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Diálogo para renombrar aldeano */}
      <Dialog open={!!editingVillager} onOpenChange={(open) => !open && setEditingVillager(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white">
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
              type="button"
              variant="outline"
              onClick={() => setEditingVillager(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRenameVillager}
              disabled={!newName.trim() || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
