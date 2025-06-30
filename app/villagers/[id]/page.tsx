"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Heart, Zap, Utensils, Shield, MessageCircle, Gift, Play, Bed, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

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

interface ActionResult {
  message: string
  newEnergy: number
  newFriendship: number
}

interface TalkResponse {
  message: string
  friendshipChange: number
  currentFriendship: number
}

export default function VillagerDetail() {
  const [villager, setVillager] = useState<Villager | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const villagerId = params.id as string

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    fetchVillager()
  }, [villagerId])

  const fetchVillager = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers/${villagerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setVillager(data)
      } else {
        toast({
          title: "Error",
          description: "Could not load villager",
          variant: "destructive",
        })
        router.push("/dashboard")
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

  const handleDeleteVillager = async () => {
    if (!villager) return

    setDeleteLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers/${villagerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        const message = await response.text()
        toast({
          title: "Villager Released",
          description: message,
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
        description: "Could not delete villager",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const performAction = async (action: string) => {
    if (!villager) return

    setActionLoading(action)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers/${villagerId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        if (action === "talk") {
          const data: TalkResponse = await response.json()
          toast({
            title: villager.villagerName + " says:",
            description: data.message,
          })
          // Update friendship level
          setVillager((prev) => (prev ? { ...prev, friendshipLevel: data.currentFriendship } : null))
        } else {
          const data: ActionResult = await response.json()
          toast({
            title: "Action Completed!",
            description: data.message,
          })
          // Update villager stats
          setVillager((prev) =>
            prev
              ? {
                  ...prev,
                  energy: data.newEnergy || prev.energy,
                  friendshipLevel: data.newFriendship || prev.friendshipLevel,
                }
              : null,
          )
        }
        // Refresh villager data
        setTimeout(fetchVillager, 1000)
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
        description: "Could not perform action",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusColor = (value: number) => {
    if (value >= 70) return "text-green-600"
    if (value >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const getHealthStatus = (health: number) => {
    if (health >= 80) return { text: "Excellent", color: "text-green-600" }
    if (health >= 60) return { text: "Good", color: "text-green-500" }
    if (health >= 40) return { text: "Fair", color: "text-yellow-600" }
    if (health >= 20) return { text: "Poor", color: "text-orange-600" }
    return { text: "Critical", color: "text-red-600" }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading villager...</p>
        </div>
      </div>
    )
  }

  if (!villager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Villager not found</h2>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const healthStatus = getHealthStatus(villager.healthLevel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="bg-white/80">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{getAnimalEmoji(villager.animalType)}</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{villager.villagerName}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPersonalityEmoji(villager.personality)}</span>
                    <Badge variant="secondary">{villager.personality.toLowerCase()}</Badge>
                    <Badge variant="outline">{villager.animalType.toLowerCase()}</Badge>
                    {villager.healthLevel < 30 && (
                      <Badge variant="destructive" className="animate-pulse">
                        🏥 Sick
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-500 hover:bg-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Release
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <span className="text-2xl">{getAnimalEmoji(villager.animalType)}</span>
                    Release {villager.villagerName}?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left space-y-2">
                    <p>
                      Are you sure you want to release <strong>{villager.villagerName}</strong>?
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                      <p className="text-sm text-yellow-800 font-medium">⚠️ This action cannot be undone!</p>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• {villager.villagerName} will be permanently removed</li>
                        <li>• All their caught bugs and fish will be deleted</li>
                        <li>• Their items will be removed from your inventory</li>
                        <li>• Friendship level {villager.friendshipLevel} will be lost</li>
                      </ul>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteVillager}
                    disabled={deleteLoading}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleteLoading ? "Releasing..." : "Yes, Release"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Stats Card */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Villager Status
                </CardTitle>
                <CardDescription>Friendship level: {villager.friendshipLevel}/100</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium">Happiness</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(villager.happiness)}`}>
                        {villager.happiness}%
                      </span>
                    </div>
                    <Progress value={villager.happiness} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">Energy</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(villager.energy)}`}>
                        {villager.energy}%
                      </span>
                    </div>
                    <Progress value={villager.energy} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Hunger</span>
                      </div>
                      <span className={`text-sm font-medium ${getStatusColor(100 - villager.hunger)}`}>
                        {villager.hunger > 70 ? "Hungry" : villager.hunger > 30 ? "Satisfied" : "Full"}
                      </span>
                    </div>
                    <Progress value={Math.max(0, 100 - villager.hunger)} className="h-3" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Health</span>
                      </div>
                      <span className={`text-sm font-medium ${healthStatus.color}`}>
                        {healthStatus.text} ({villager.healthLevel}%)
                      </span>
                    </div>
                    <Progress value={villager.healthLevel} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Interactions</CardTitle>
                <CardDescription>Interact with {villager.villagerName} to improve your friendship!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => performAction("talk")}
                    disabled={actionLoading === "talk"}
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <span className="text-sm">{actionLoading === "talk" ? "Talking..." : "Talk"}</span>
                  </Button>

                  <Button
                    onClick={() => performAction("give-gift")}
                    disabled={actionLoading === "give-gift"}
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                  >
                    <Gift className="w-6 h-6" />
                    <span className="text-sm">{actionLoading === "give-gift" ? "Giving..." : "Give Gift"}</span>
                  </Button>

                  <Button
                    onClick={() => performAction("play")}
                    disabled={actionLoading === "play" || villager.healthLevel < 20}
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:opacity-50"
                  >
                    <Play className="w-6 h-6" />
                    <span className="text-sm">
                      {actionLoading === "play" ? "Playing..." : villager.healthLevel < 20 ? "Too sick" : "Play"}
                    </span>
                  </Button>

                  <Button
                    onClick={() => performAction("feed")}
                    disabled={actionLoading === "feed"}
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                  >
                    <Utensils className="w-6 h-6" />
                    <span className="text-sm">{actionLoading === "feed" ? "Feeding..." : "Feed"}</span>
                  </Button>

                  <Button
                    onClick={() => performAction("heal")}
                    disabled={actionLoading === "heal" || villager.healthLevel >= 90}
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:opacity-50"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">
                      {actionLoading === "heal" ? "Healing..." : villager.healthLevel >= 90 ? "Very healthy" : "Heal"}
                    </span>
                  </Button>

                  <Button
                    onClick={() => performAction("sleep")}
                    disabled={actionLoading === "sleep"}
                    className="h-20 flex flex-col gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    <Bed className="w-6 h-6" />
                    <span className="text-sm">{actionLoading === "sleep" ? "Sleeping..." : "Sleep"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
