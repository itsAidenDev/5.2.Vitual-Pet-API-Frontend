"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Fish, Bug, Calendar } from "lucide-react"
import Link from "next/link"

interface Villager {
  villagerId: number
  villagerName: string
  animalType: string
}

interface CaughtBug {
  bugId: number
  bugName: string
  bugDescription: string
  bugRarity: string
  bugValue: number
  bugHabitat: string
  caughtAt: string
  location: string
}

interface CaughtFish {
  fishId: number
  fishName: string
  fishDescription: string
  fishRarity: string
  fishValue: number
  habitat: string
  caughtAt: string
  location: string
}

export default function Collections() {
  const [villagers, setVillagers] = useState<Villager[]>([])
  const [selectedVillager, setSelectedVillager] = useState<string>("")
  const [caughtBugs, setCaughtBugs] = useState<CaughtBug[]>([])
  const [caughtFish, setCaughtFish] = useState<CaughtFish[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  useEffect(() => {
    if (selectedVillager) {
      fetchCollections()
    }
  }, [selectedVillager])

  const fetchVillagers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/villagers`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setVillagers(data)
        if (data.length > 0) {
          setSelectedVillager(data[0].villagerId.toString())
        }
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

  const fetchCollections = async () => {
    if (!selectedVillager) return

    try {
      const token = localStorage.getItem("token")

      const [bugsResponse, fishResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/activities/villagers/${selectedVillager}/caught-bugs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/activities/villagers/${selectedVillager}/caught-fish`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ])

      if (bugsResponse.ok && fishResponse.ok) {
        setCaughtBugs(await bugsResponse.json())
        setCaughtFish(await fishResponse.json())
      } else {
        toast({
          title: "Error",
          description: "Could not load collections",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server",
        variant: "destructive",
      })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getHabitatEmoji = (habitat: string) => {
    const emojis: { [key: string]: string } = {
      FOREST: "🌲",
      GRASSLAND: "🌾",
      DESERT: "🏜️",
      RIVER: "🏞️",
      OCEAN: "🌊",
      POND: "🏞️",
    }
    return emojis[habitat] || "🌍"
  }

  const totalValue =
    caughtBugs.reduce((sum, bug) => sum + bug.bugValue, 0) + caughtFish.reduce((sum, fish) => sum + fish.fishValue, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    )
  }

  const selectedVillagerData = villagers.find((v) => v.villagerId.toString() === selectedVillager)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="bg-white/80">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Collection Museum</h1>
              <p className="text-gray-600">Explore all the creatures you have caught</p>
            </div>
          </div>

          {/* Villager Selection */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Select Villager</CardTitle>
              <CardDescription>Choose a villager to view their personal collection</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedVillager} onValueChange={setSelectedVillager}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select a villager" />
                </SelectTrigger>
                <SelectContent>
                  {villagers.map((villager) => (
                    <SelectItem key={villager.villagerId} value={villager.villagerId.toString()}>
                      {villager.villagerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedVillagerData && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedVillagerData.villagerName}</h3>
                      <p className="text-sm text-gray-600">
                        {caughtBugs.length} bugs • {caughtFish.length} fish
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{totalValue}</p>
                      <p className="text-xs text-gray-500">total points</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Collections */}
          {selectedVillager && (
            <Tabs defaultValue="bugs" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bugs" className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Bugs ({caughtBugs.length})
                </TabsTrigger>
                <TabsTrigger value="fish" className="flex items-center gap-2">
                  <Fish className="w-4 h-4" />
                  Fish ({caughtFish.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bugs" className="mt-6">
                {caughtBugs.length === 0 ? (
                  <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
                    <CardContent>
                      <Bug className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold mb-2">No bugs caught</h3>
                      <p className="text-gray-600 mb-4">
                        {selectedVillagerData?.villagerName} hasn't caught any bugs yet
                      </p>
                      <Link href="/activities">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                          Go to Activities
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caughtBugs.map((bug, index) => (
                      <Card key={`${bug.bugId}-${index}`} className="bg-white/80 backdrop-blur-sm">
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
                            <div className="flex items-center justify-between text-sm">
                              <span>Habitat:</span>
                              <div className="flex items-center gap-1">
                                <span>{getHabitatEmoji(bug.bugHabitat)}</span>
                                <span className="font-medium">{bug.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Caught:</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">{formatDate(bug.caughtAt)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fish" className="mt-6">
                {caughtFish.length === 0 ? (
                  <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
                    <CardContent>
                      <Fish className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-semibold mb-2">No fish caught</h3>
                      <p className="text-gray-600 mb-4">
                        {selectedVillagerData?.villagerName} hasn't caught any fish yet
                      </p>
                      <Link href="/activities">
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                          Go to Activities
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caughtFish.map((fish, index) => (
                      <Card key={`${fish.fishId}-${index}`} className="bg-white/80 backdrop-blur-sm">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{fish.fishName}</CardTitle>
                            <Badge className={getRarityColor(fish.fishRarity)}>{fish.fishRarity}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{fish.fishDescription}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Value:</span>
                              <span className="font-medium">{fish.fishValue} points</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Habitat:</span>
                              <div className="flex items-center gap-1">
                                <span>{getHabitatEmoji(fish.habitat)}</span>
                                <span className="font-medium">{fish.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Caught:</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">{formatDate(fish.caughtAt)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
