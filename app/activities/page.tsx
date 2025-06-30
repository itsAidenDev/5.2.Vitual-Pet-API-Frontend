"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Fish, BugIcon, MapPin } from "lucide-react"
import Link from "next/link"

interface Villager {
  villagerId: number
  villagerName: string
  animalType: string
  energy: number
}

interface BugType {
  bugId: number
  bugName: string
  bugDescription: string
  bugRarity: string
  bugValue: number
  bugHabitat: string
  catchDifficulty: number
}

interface FishType {
  fishId: number
  fishName: string
  fishDescription: string
  fishRarity: string
  fishValue: number
  habitat: string
  catchDifficulty: number
}

interface ActivityResult {
  success: boolean
  message: string
  caughtItem?: any
  experienceGained: number
  friendshipGained?: number
}

const habitats = [
  { value: "FOREST", label: "🌲 Forest", description: "A place full of trees and wildlife" },
  { value: "GRASSLAND", label: "🌾 Grassland", description: "Open fields with grass and flowers" },
  { value: "DESERT", label: "🏜️ Desert", description: "Arid lands with unique creatures" },
  { value: "RIVER", label: "🏞️ River", description: "Fresh waters with river fish" },
  { value: "OCEAN", label: "🌊 Ocean", description: "Deep waters with marine fish" },
  { value: "POND", label: "🏞️ Pond", description: "Small bodies of calm water" },
]

export default function Activities() {
  const [villagers, setVillagers] = useState<Villager[]>([])
  const [bugs, setBugs] = useState<BugType[]>([])
  const [fish, setFish] = useState<FishType[]>([])
  const [selectedVillager, setSelectedVillager] = useState<string>("")
  const [selectedHabitat, setSelectedHabitat] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch villagers
      const villagersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Fetch bugs
      const bugsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/activities/bugs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Fetch fish
      const fishResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/activities/fish`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (villagersResponse.ok && bugsResponse.ok && fishResponse.ok) {
        setVillagers(await villagersResponse.json())
        setBugs(await bugsResponse.json())
        setFish(await fishResponse.json())
      } else {
        toast({
          title: "Error",
          description: "Could not load data",
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

  const performActivity = async (activityType: "bug" | "fish") => {
    if (!selectedVillager || !selectedHabitat) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a villager and a habitat",
        variant: "destructive",
      })
      return
    }

    const villager = villagers.find((v) => v.villagerId.toString() === selectedVillager)
    if (villager && villager.energy < (activityType === "fish" ? 15 : 10)) {
      toast({
        title: "Insufficient Energy",
        description: `${villager.villagerName} needs to rest before doing this activity`,
        variant: "destructive",
      })
      return
    }

    setActivityLoading(activityType)
    try {
      const token = localStorage.getItem("token")
      const endpoint = activityType === "bug" ? "catch-bug" : "catch-fish"

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/activities/villagers/${selectedVillager}/${endpoint}?habitat=${selectedHabitat}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      if (response.ok) {
        const result: ActivityResult = await response.json()

        if (result.success && result.caughtItem) {
          const itemName = activityType === "bug" ? result.caughtItem.bugName : result.caughtItem.fishName
          toast({
            title: "Successful Catch! 🎉",
            description: `You caught a ${itemName}! +${result.experienceGained} points`,
          })
        } else {
          toast({
            title: result.success ? "Activity Completed" : "No luck this time",
            description: result.message,
            variant: result.success ? "default" : "destructive",
          })
        }

        // Refresh villagers data
        fetchData()
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
        description: "Could not perform activity",
        variant: "destructive",
      })
    } finally {
      setActivityLoading(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-100 text-gray-800"
      case "uncommon":
        return "bg-green-100 text-green-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "legendary":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyStars = (difficulty: number) => {
    const stars = Math.ceil(difficulty * 5)
    return "★".repeat(stars) + "☆".repeat(5 - stars)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  const selectedHabitatInfo = habitats.find((h) => h.value === selectedHabitat)
  const availableBugs = bugs.filter((bug) => bug.bugHabitat === selectedHabitat)
  const availableFish = fish.filter((f) => f.habitat === selectedHabitat)

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: "url('/images/waterfall-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="bg-white/80">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="bg-white/90 rounded-lg px-4 py-3">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Activity Center</h1>
              <p className="text-gray-700">Explore and catch creatures with your villagers!</p>
            </div>
          </div>

          {/* Selection Controls */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Prepare Expedition
              </CardTitle>
              <CardDescription>Select a villager and a habitat to start the adventure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Villager</label>
                  <Select value={selectedVillager} onValueChange={setSelectedVillager}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a villager" />
                    </SelectTrigger>
                    <SelectContent>
                      {villagers.map((villager) => (
                        <SelectItem key={villager.villagerId} value={villager.villagerId.toString()}>
                          <div className="flex items-center justify-between w-full">
                            <span>{villager.villagerName}</span>
                            <Badge variant={villager.energy < 20 ? "destructive" : "secondary"} className="ml-2">
                              ⚡ {villager.energy}%
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Habitat</label>
                  <Select value={selectedHabitat} onValueChange={setSelectedHabitat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a habitat" />
                    </SelectTrigger>
                    <SelectContent>
                      {habitats.map((habitat) => (
                        <SelectItem key={habitat.value} value={habitat.value}>
                          {habitat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedHabitatInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedHabitatInfo.label.split(" ")[0]}</span>
                    <h3 className="font-semibold">{selectedHabitatInfo.label.split(" ")[1]}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{selectedHabitatInfo.description}</p>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button
                  onClick={() => performActivity("bug")}
                  disabled={!selectedVillager || !selectedHabitat || activityLoading === "bug"}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <BugIcon className="w-4 h-4 mr-2" />
                  {activityLoading === "bug" ? "Hunting..." : "Hunt Bugs"}
                </Button>

                <Button
                  onClick={() => performActivity("fish")}
                  disabled={!selectedVillager || !selectedHabitat || activityLoading === "fish"}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Fish className="w-4 h-4 mr-2" />
                  {activityLoading === "fish" ? "Fishing..." : "Fish"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Creatures */}
          {selectedHabitat && (
            <Tabs defaultValue="bugs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bugs" className="flex items-center gap-2">
                  <BugIcon className="w-4 h-4" />
                  Bugs ({availableBugs.length})
                </TabsTrigger>
                <TabsTrigger value="fish" className="flex items-center gap-2">
                  <Fish className="w-4 h-4" />
                  Fish ({availableFish.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bugs" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBugs.map((bug) => (
                    <Card key={bug.bugId} className="bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{bug.bugName}</CardTitle>
                          <Badge className={getRarityColor(bug.bugRarity)}>{bug.bugRarity}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{bug.bugDescription}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Value:</span>
                            <span className="font-medium">{bug.bugValue} points</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Difficulty:</span>
                            <span className="font-medium">{getDifficultyStars(bug.catchDifficulty)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="fish" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableFish.map((fishItem) => (
                    <Card key={fishItem.fishId} className="bg-white/80 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{fishItem.fishName}</CardTitle>
                          <Badge className={getRarityColor(fishItem.fishRarity)}>{fishItem.fishRarity}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{fishItem.fishDescription}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Value:</span>
                            <span className="font-medium">{fishItem.fishValue} points</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Difficulty:</span>
                            <span className="font-medium">{getDifficultyStars(fishItem.catchDifficulty)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
