"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Fish, Bug, Search, Package, Calendar, User } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: string
  itemId: number
  itemName: string
  itemDescription: string
  itemType: "BUG" | "FISH"
  rarity: string
  value: number
  habitat: string
  caughtAt: string
  caughtBy: string
  location: string
  quantity: number
}

interface InventoryStats {
  totalItems: number
  totalValue: number
  uniqueSpecies: number
  rareItems: number
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    uniqueSpecies: 0,
    rareItems: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rarityFilter, setRarityFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    fetchInventory()
  }, [])

  useEffect(() => {
    filterAndSortInventory()
  }, [inventory, searchTerm, rarityFilter, typeFilter, sortBy])

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setInventory(data.items || [])
        setStats(
          data.stats || {
            totalItems: 0,
            totalValue: 0,
            uniqueSpecies: 0,
            rareItems: 0,
          },
        )
      } else {
        toast({
          title: "Error",
          description: "Could not load inventory",
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

  const filterAndSortInventory = () => {
    let filtered = [...inventory]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply rarity filter
    if (rarityFilter !== "all") {
      filtered = filtered.filter((item) => item.rarity.toLowerCase() === rarityFilter)
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.itemType === typeFilter.toUpperCase())
    }

    // Apply sorting
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.caughtAt).getTime() - new Date(a.caughtAt).getTime())
        break
      case "name":
        filtered.sort((a, b) => a.itemName.localeCompare(b.itemName))
        break
      case "value":
        filtered.sort((a, b) => b.value - a.value)
        break
      case "rarity":
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, legendary: 4 }
        filtered.sort(
          (a, b) =>
            (rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] || 0) -
            (rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] || 0),
        )
        break
    }

    setFilteredInventory(filtered)
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

  const getTypeIcon = (type: string) => {
    return type === "BUG" ? <Bug className="w-4 h-4" /> : <Fish className="w-4 h-4" />
  }

  const getTypeColor = (type: string) => {
    return type === "BUG" ? "text-green-600" : "text-blue-600"
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    )
  }

  const bugs = filteredInventory.filter((item) => item.itemType === "BUG")
  const fish = filteredInventory.filter((item) => item.itemType === "FISH")

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="bg-white/80">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
              <p className="text-gray-600">Manage all your caught creatures and items</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalItems}</p>
                    <p className="text-sm text-gray-600">Total Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">$</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalValue}</p>
                    <p className="text-sm text-gray-600">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold">#</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.uniqueSpecies}</p>
                    <p className="text-sm text-gray-600">Unique Species</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold">★</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.rareItems}</p>
                    <p className="text-sm text-gray-600">Rare Items</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Filter & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="bug">🐛 Bugs</SelectItem>
                      <SelectItem value="fish">🐟 Fish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rarity</label>
                  <Select value={rarityFilter} onValueChange={setRarityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="uncommon">Uncommon</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="value">Highest Value</SelectItem>
                      <SelectItem value="rarity">Rarity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setRarityFilter("all")
                      setTypeFilter("all")
                      setSortBy("recent")
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Items */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                All Items ({filteredInventory.length})
              </TabsTrigger>
              <TabsTrigger value="bugs" className="flex items-center gap-2">
                <Bug className="w-4 h-4" />
                Bugs ({bugs.length})
              </TabsTrigger>
              <TabsTrigger value="fish" className="flex items-center gap-2">
                <Fish className="w-4 h-4" />
                Fish ({fish.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {filteredInventory.length === 0 ? (
                <Card className="text-center py-12 bg-white/80 backdrop-blur-sm">
                  <CardContent>
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No items found</h3>
                    <p className="text-gray-600 mb-4">
                      {inventory.length === 0
                        ? "Your inventory is empty. Go catch some creatures!"
                        : "No items match your current filters."}
                    </p>
                    <Link href="/activities">
                      <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                        Go to Activities
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredInventory.map((item) => (
                    <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <span className={getTypeColor(item.itemType)}>{getTypeIcon(item.itemType)}</span>
                            {item.itemName}
                          </CardTitle>
                          <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                        </div>
                        {item.quantity > 1 && (
                          <Badge variant="secondary" className="w-fit">
                            x{item.quantity}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">{item.itemDescription}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Value:</span>
                            <span className="font-medium">{item.value} points</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Habitat:</span>
                            <div className="flex items-center gap-1">
                              <span>{getHabitatEmoji(item.habitat)}</span>
                              <span className="font-medium">{item.location}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Caught by:</span>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span className="font-medium">{item.caughtBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Date:</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span className="font-medium">{formatDate(item.caughtAt)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bugs" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {bugs.map((item) => (
                  <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Bug className="w-4 h-4 text-green-600" />
                          {item.itemName}
                        </CardTitle>
                        <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                      </div>
                      {item.quantity > 1 && (
                        <Badge variant="secondary" className="w-fit">
                          x{item.quantity}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{item.itemDescription}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Value:</span>
                          <span className="font-medium">{item.value} points</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Habitat:</span>
                          <div className="flex items-center gap-1">
                            <span>{getHabitatEmoji(item.habitat)}</span>
                            <span className="font-medium">{item.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Caught by:</span>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{item.caughtBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Date:</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">{formatDate(item.caughtAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="fish" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fish.map((item) => (
                  <Card key={item.id} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Fish className="w-4 h-4 text-blue-600" />
                          {item.itemName}
                        </CardTitle>
                        <Badge className={getRarityColor(item.rarity)}>{item.rarity}</Badge>
                      </div>
                      {item.quantity > 1 && (
                        <Badge variant="secondary" className="w-fit">
                          x{item.quantity}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{item.itemDescription}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Value:</span>
                          <span className="font-medium">{item.value} points</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Habitat:</span>
                          <div className="flex items-center gap-1">
                            <span>{getHabitatEmoji(item.habitat)}</span>
                            <span className="font-medium">{item.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Caught by:</span>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{item.caughtBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Date:</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">{formatDate(item.caughtAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
