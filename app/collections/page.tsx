"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Fish, Bug, Calendar, Trophy, Shell, Leaf, Droplets, Mountain, Waves, Home, Sparkles, Zap,
    Award, Star, Gem, Heart, Ruler, MapPin, Gauge, Info, User, Package} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"


interface Villager {
  villagerId: number
  villagerName: string
  animalType: string
}

interface CollectionBug {
  bugId: number
  bugName: string
  bugDescription: string
  bugRarity: string
  bugValue: number
  bugHabitat: string
  caughtAt: string
  location: string
  timesCaught: number
}

interface CollectionFish {
  fishId: number
  fishName: string
  fishDescription: string
  fishRarity: string
  fishValue: number
  habitat: string
  caughtAt: string
  location: string
  timesCaught: number
}

export default function Collections() {
  const [villagers, setVillagers] = useState<Villager[]>([])
  const [selectedVillager, setSelectedVillager] = useState<string>("")
  const [collectionBugs, setCollectionBugs] = useState<CollectionBug[]>([])
  const [collectionFish, setCollectionFish] = useState<CollectionFish[]>([])
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
    if (!selectedVillager) return;

    try {
      const token = localStorage.getItem("token");

      const [bugsResponse, fishResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/museum/villagers/${selectedVillager}/bugs`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/museum/villagers/${selectedVillager}/fish`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      if (bugsResponse.ok && fishResponse.ok) {
        const bugs = await bugsResponse.json();
        const fish = await fishResponse.json();

        setCollectionBugs(bugs);
        setCollectionFish(fish);
      } else {
        const errorText = await Promise.all([bugsResponse.text(), fishResponse.text()]);
        console.error('Error responses:', errorText);
        throw new Error('Failed to load museum collections');
      }
    } catch (error) {
      console.error('Error fetching museum collections:', error);
      toast({
        title: "Error",
        description: "Could not load museum collections. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-100 text-gray-800 border border-gray-200"
      case "uncommon":
        return "bg-green-50 text-green-800 border border-green-200"
      case "rare":
        return "bg-blue-50 text-blue-800 border border-blue-200"
      case "epic":
        return "bg-purple-50 text-purple-800 border border-purple-200"
      case "legendary":
        return "bg-amber-50 text-amber-800 border border-amber-200"
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return "Unknown";
      }
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown";
    }
  };

  const getHabitatEmoji = (habitat: string) => {
    const emojis: { [key: string]: string } = {
      FOREST: "🌲",
      GRASSLAND: "🌾",
      DESERT: "🏜️",
      RIVER: "🏞️",
      OCEAN: "🌊",
      POND: "🏞️",
      MOUNTAIN: "⛰️",
      BEACH: "🏖️",
      CAVE: "🕳️",
    }
    return emojis[habitat] || "🌍"
  }

  const totalCollection = collectionBugs.length + collectionFish.length
  const totalCaught =
    (collectionBugs.reduce((sum, bug) => sum + (bug.timesCaught || 0), 0) || 0) +
    (collectionFish.reduce((sum, fish) => sum + (fish.timesCaught || 0), 0) || 0)

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
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/collections-background.jpg)' }}
    >
      <div className="bg-black/30 min-h-screen">
        <div className="container mx-auto px-4 py-8">
           {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-white/80 hover:bg-white hover:shadow-md transition-all duration-200 border-2 border-blue-200"
                      >
                        <ArrowLeft className="w-5 h-5 text-blue-600" />
                      </Button>
                    </Link>
                    <div>
                      <h1 className="text-4xl font-bold text-white drop-shadow-md">
                        Museum Collection
                      </h1>
                      <p className="text-gray-200 mt-1 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        A record of all unique creatures you've discovered
                      </p>
                    </div>
                  </div>

          {/* Villager Selection */}
           <Card className="mb-8 bg-white/90 backdrop-blur-sm border-2 border-white/20 shadow-lg">
             <CardHeader>
               <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
                 <User className="w-5 h-5 text-blue-600" />
                 Select Villager
               </CardTitle>
               <CardDescription className="text-gray-600">Choose a villager to view their collection</CardDescription>
             </CardHeader>
             <CardContent>
               <Select value={selectedVillager} onValueChange={setSelectedVillager}>
                 <SelectTrigger className="w-full border-2 border-gray-200 bg-white/80 hover:bg-white transition-colors">
                   <SelectValue placeholder="Select a villager" />
                 </SelectTrigger>
                 <SelectContent>
                   {villagers.map((villager) => (
                     <SelectItem
                       key={villager.villagerId}
                       value={villager.villagerId.toString()}
                     >
                       {villager.villagerName}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>

               {selectedVillagerData && (
                 <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border-2 border-blue-100 shadow-inner">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                           <Package className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-sm text-gray-500">Total Collection</p>
                           <p className="text-xl font-bold text-gray-800">{totalCollection}</p>
                         </div>
                       </div>
                     </div>

                     <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-green-100 rounded-lg text-green-600">
                           <Bug className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-sm text-gray-500">Bugs</p>
                           <p className="text-xl font-bold text-gray-800">{collectionBugs.length}</p>
                         </div>
                       </div>
                     </div>

                     <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                         <div className="p-2 bg-cyan-100 rounded-lg text-cyan-600">
                           <Fish className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-sm text-gray-500">Fish</p>
                           <p className="text-xl font-bold text-gray-800">{collectionFish.length}</p>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className="pt-3 border-t border-blue-100">
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-amber-600">
                         <Trophy className="w-5 h-5" />
                         <span className="font-medium">Total Caught</span>
                       </div>
                       <span className="text-xl font-bold text-gray-800">{totalCaught}</span>
                     </div>
                   </div>
                 </div>
               )}
             </CardContent>
           </Card>

          {/* Collections */}
          <Tabs defaultValue="bugs" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/90 backdrop-blur-sm border-2 border-white/20 p-1 rounded-xl h-auto">
              <TabsTrigger
                value="bugs"
                className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white transition-all"
              >
                <Bug className="w-5 h-5" />
                <span>Bugs</span>
                <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-100">
                  {collectionBugs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="fish"
                className="flex items-center justify-center gap-2 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white transition-all"
              >
                <Fish className="w-5 h-5" />
                <span>Fish</span>
                <Badge className="ml-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                  {collectionFish.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

              <TabsContent value="bugs" className="mt-6">
                {collectionBugs.length === 0 ? (
                  <Card className="text-center py-12 bg-white/90 backdrop-blur-sm border-0 shadow">
                    <CardContent>
                      <Bug className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">No bugs in collection</h3>
                      <p className="text-gray-600 mb-4">
                        {selectedVillagerData?.villagerName} hasn't discovered any bugs yet
                      </p>
                      <Link href="/activities">
                        <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                          Go Bug Catching
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collectionBugs.map((bug) => (
                      <Card key={bug.bugId} className="bg-white/90 backdrop-blur-sm border-0 shadow hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{bug.bugName}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getRarityColor(bug.bugRarity)}>{bug.bugRarity}</Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                ×{bug.timesCaught}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{bug.bugDescription}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Value:</span>
                              <span className="font-medium">{bug.bugValue} pts</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Habitat:</span>
                              <div className="flex items-center gap-1">
                                <span>{getHabitatEmoji(bug.bugHabitat)}</span>
                                <span className="font-medium">{bug.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">First caught:</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-500" />
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
                {collectionFish.length === 0 ? (
                  <Card className="text-center py-12 bg-white/90 backdrop-blur-sm border-0 shadow">
                    <CardContent>
                      <Fish className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold mb-2">No fish in collection</h3>
                      <p className="text-gray-600 mb-4">
                        {selectedVillagerData?.villagerName} hasn't discovered any fish yet
                      </p>
                      <Link href="/activities">
                        <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                          Go Fishing
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collectionFish.map((fish) => (
                      <Card key={fish.fishId} className="bg-white/90 backdrop-blur-sm border-0 shadow hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{fish.fishName}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={getRarityColor(fish.fishRarity)}>{fish.fishRarity}</Badge>
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                ×{fish.timesCaught}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{fish.fishDescription}</p>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Value:</span>
                              <span className="font-medium">{fish.fishValue} pts</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Habitat:</span>
                              <div className="flex items-center gap-1">
                                <span>{getHabitatEmoji(fish.habitat)}</span>
                                <span className="font-medium">{fish.location}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">First caught:</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-500" />
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
