"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Fish, Bug, Search, Package, Calendar, Coins, User, Filter, ListFilter, LayoutGrid, Ruler, Droplets, Trees, Mountain,
    Waves, Leaf, Sparkles, Star, Zap, Award, Gem, Heart, ShoppingBag, Loader2, RefreshCw,
    Home, Box, LeafyGreen, Shell, ShellIcon, ShellIconProps, Shell as ShellIcon2 } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: string
  itemId: number
  itemName: string
  itemDescription: string
  itemType: "BUG" | "FISH" | "FURNITURE"
  rarity: string
  value: number
  habitat: string
  caughtBy: string
  location: string
  quantity: number
  imageUrl?: string
  category?: string
  caughtAt?: string
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
  const [userBalance, setUserBalance] = useState(0)
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    uniqueSpecies: 0,
    rareItems: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [rarityFilter, setRarityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [isLoading, setIsLoading] = useState(true)
  const [isSelling, setIsSelling] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInventory()
    fetchUserBalance()
  }, [])

  useEffect(() => {
    filterAndSortInventory()
  }, [inventory, searchTerm, typeFilter, rarityFilter, sortBy])

  const fetchInventory = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const [itemsResponse, furnitureResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory/furniture`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const inventoryItems = itemsResponse.ok ? await itemsResponse.json() : { items: [] }
      const furnitureItems = furnitureResponse.ok ? await furnitureResponse.json() : []

      const processedItems = (inventoryItems.items || []).map((item: any) => ({
        id: item.id,
        itemId: item.itemId,
        itemName: item.itemName,
        itemType: item.itemType,
        rarity: item.rarity,
        value: item.value,
        quantity: item.quantity,
        imageUrl: item.itemType === 'FISH'
          ? '/images/fish-icon.png'
          : '/images/bug-icon.png',
        habitat: item.habitat || '',
        location: item.location || '',
        caughtBy: item.caughtBy || '',
        itemDescription: item.itemDescription || '',
        caughtAt: item.caughtAt || new Date().toISOString()
      }))

      const processedFurniture = furnitureItems.map((item: any) => ({
        id: `furniture-${item.id}`,
        itemId: item.furniture.id,
        itemName: item.furniture.name,
        itemType: "FURNITURE" as const,
        rarity: item.furniture.rarity || "common",
        value: Math.floor(item.furniture.price * 0.7),
        quantity: 1,
        imageUrl: item.furniture.imageUrl || '/images/furniture/default-furniture.jpg',
        category: item.furniture.category,
        habitat: '',
        location: '',
        caughtBy: '',
        itemDescription: item.furniture.description || '',
        caughtAt: new Date().toISOString()
      }))

      setInventory([...processedItems, ...processedFurniture])
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el inventario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUserBalance(data.points || 0)
      } else {
        console.error("Error fetching user data:", await response.text())
      }
    } catch (error) {
      console.error("Error fetching user balance:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el saldo del usuario",
        variant: "destructive",
      })
    }
  }

  const filterAndSortInventory = () => {
    let filtered = [...inventory]

    // Apply filters
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (typeFilter === "bugs") return item.itemType === "BUG"
        if (typeFilter === "fish") return item.itemType === "FISH"
        if (typeFilter === "furniture") return item.itemType === "FURNITURE"
        return true
      })
    }

    if (rarityFilter !== "all") {
      filtered = filtered.filter((item) => item.rarity === rarityFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.itemName.localeCompare(b.itemName)
        case "name-desc":
          return b.itemName.localeCompare(a.itemName)
        case "value":
          return a.value - b.value
        case "value-desc":
          return b.value - a.value
        case "recent":
          return new Date(b.caughtAt || 0).getTime() - new Date(a.caughtAt || 0).getTime()
        case "oldest":
          return new Date(a.caughtAt || 0).getTime() - new Date(b.caughtAt || 0).getTime()
        default:
          return 0
      }
    })

    // Update stats
    const totalItems = filtered.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = filtered.reduce((sum, item) => sum + item.value * item.quantity, 0)
    const uniqueSpecies = new Set(filtered.map((item) => item.itemId)).size
    const rareItems = filtered.filter((item) => item.rarity === "rare").length

    setStats({
      totalItems,
      totalValue,
      uniqueSpecies,
      rareItems,
    })

    setFilteredInventory(filtered)
  }

  const handleSell = async (itemId: string, itemType: string) => {
    if (isSelling) return

    setIsSelling(true)
    try {
      const token = localStorage.getItem("token")
      const item = inventory.find((i) => i.id === itemId)
      if (!item) return

      let response

      if (itemType === 'FURNITURE') {
        const furnitureId = itemId.replace('furniture-', '')
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory/furniture/${furnitureId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      } else {
        response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory/item/${itemId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      }

      if (response.ok) {
        const message = await response.text()
        toast({
          title: "Sold!",
          description: `You've sold ${item.itemName} for ${item.value} Bells`,
        })
        fetchInventory()
        fetchUserBalance()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "The item could not be sold",
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
      setIsSelling(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      BUG: "text-green-600",
      FISH: "text-blue-600",
      FURNITURE: "text-amber-600",
    }
    return colors[type] || "text-gray-600"
  }

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      BUG: <Bug className="w-4 h-4" />,
      FISH: <Fish className="w-4 h-4" />,
      FURNITURE: <Package className="w-4 h-4" />,
    }
    return icons[type] || <Package className="w-4 h-4" />
  }

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: "bg-gray-100 text-gray-800",
      uncommon: "bg-blue-100 text-blue-800",
      rare: "bg-purple-100 text-purple-800",
      legendary: "bg-yellow-100 text-yellow-800",
    }
    return colors[rarity.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const getHabitatEmoji = (habitat: string) => {
    const emojis: { [key: string]: string } = {
      river: "🌊",
      sea: "🌊",
      pond: "💧",
      river_pond: "🌊💧",
      river_clifftop: "⛰️🌊",
      pier: "⛵",
      ocean: "🌊",
      flying: "🦋",
      trees: "🌳",
      underground: "🕳️",
      trash: "🗑️",
      beach: "🏖️",
    }
    return emojis[habitat] || "🌍"
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/inventory-wallpaper.png')" }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hover:bg-green-100">
                  <ArrowLeft className="h-5 w-5 text-green-700" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <Package className="h-8 w-8 text-green-600" />
                My Collection
              </h1>
            </div>
            <p className="text-gray-600 ml-12 flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <User className="h-4 w-4" /> {userBalance} Bells
              </span>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-blue-50 px-6 py-3 rounded-full shadow-inner mt-4 md:mt-0">
            <Coins className="h-8 w-8 text-yellow-500" />
            <div className="text-right">
              <p className="text-sm text-gray-500">Your Balance</p>
              <p className="text-2xl font-bold text-yellow-600">{userBalance} Bells</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card className="bg-white/90 hover:shadow-xl transition-all duration-300 border-l-4 border-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Package className="h-5 w-5" />
                <CardDescription>Total Items</CardDescription>
              </div>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.totalItems}
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Coins className="h-5 w-5 text-yellow-500" />
                <CardDescription>Total Value</CardDescription>
              </div>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.totalValue}
                <span className="text-yellow-600 flex items-center">
                  <Coins className="h-5 w-5 mr-1" /> Bells
                </span>
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <CardDescription>Unique Species</CardDescription>
              </div>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.uniqueSpecies}
                <Leaf className="h-6 w-6 text-green-500" />
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-white/90 hover:shadow-xl transition-all duration-300 border-l-4 border-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-gray-500">
                <Award className="h-5 w-5 text-purple-500" />
                <CardDescription>Rare Items</CardDescription>
              </div>
              <CardTitle className="text-3xl flex items-center gap-2">
                {stats.rareItems}
                <Gem className="h-6 w-6 text-purple-600" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Package className="h-6 w-6 text-green-600" />
                  Your Collection
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className="flex items-center">
                    <Search className="h-4 w-4 mr-1" /> {filteredInventory.length} {filteredInventory.length === 1 ? 'item' : 'items'} found
                  </span>
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <ListFilter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name" className="flex items-center gap-2">
                      <span>Name (A-Z)</span>
                    </SelectItem>
                    <SelectItem value="name-desc" className="flex items-center gap-2">
                      <span>Name (Z-A)</span>
                    </SelectItem>
                    <SelectItem value="value" className="flex items-center gap-2">
                      <Coins className="h-4 w-4" /> <span>Value (Low to High)</span>
                    </SelectItem>
                    <SelectItem value="value-desc" className="flex items-center gap-2">
                      <Coins className="h-4 w-4" /> <span>Value (High to Low)</span>
                    </SelectItem>
                    <SelectItem value="recent" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> <span>Most Recent</span>
                    </SelectItem>
                    <SelectItem value="oldest" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> <span>Oldest</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="flex items-center gap-2">
                      <span>All Types</span>
                    </SelectItem>
                    <SelectItem value="fish" className="flex items-center gap-2">
                      <Fish className="h-4 w-4" /> <span>Fish</span>
                    </SelectItem>
                    <SelectItem value="bugs" className="flex items-center gap-2">
                      <Bug className="h-4 w-4" /> <span>Bugs</span>
                    </SelectItem>
                    <SelectItem value="furniture" className="flex items-center gap-2">
                      <Package className="h-4 w-4" /> <span>Furniture</span>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="common" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>Common</span>
                    </SelectItem>
                    <SelectItem value="uncommon" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>Uncommon</span>
                    </SelectItem>
                    <SelectItem value="rare" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>Rare</span>
                    </SelectItem>
                    <SelectItem value="legendary" className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      <span>Legendary</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
                <p className="text-gray-600">Loading your collection...</p>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-700">No items found</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  {searchTerm || typeFilter !== "all" || rarityFilter !== "all"
                    ? "Try adjusting your filters or search term"
                    : "Your collection is empty. Go catch some bugs or fish!"}
                </p>
                <Button
                  className="mt-6 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setTypeFilter("all")
                    setRarityFilter("all")
                    setSearchTerm("")
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredInventory.map((item) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.itemName}
                          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            item.itemType === 'FURNITURE' ? 'object-contain' : ''
                          }`}
                        />
                      ) : item.itemType === 'FISH' ? (
                        <Fish className="h-20 w-20 text-blue-400 opacity-75" />
                      ) : item.itemType === 'BUG' ? (
                        <Bug className="h-20 w-20 text-green-400 opacity-75" />
                      ) : (
                        <Package className="h-20 w-20 text-gray-300" />
                      )}

                      {item.quantity > 1 && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-sm font-medium px-2.5 py-1 rounded-full shadow-sm border border-gray-200 flex items-center">
                          <span className="text-gray-700">×{item.quantity}</span>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "backdrop-blur-sm border-2",
                            getRarityColor(item.rarity)
                          )}
                        >
                          <span className="capitalize">{item.rarity.toLowerCase()}</span>
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
                          {item.itemName}
                        </CardTitle>
                        <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-full">
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-700">
                            {item.value}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        {item.itemType === 'FURNITURE' ? (
                          <>
                            <Box className="h-4 w-4 text-gray-400" />
                            <span>{item.category || 'Furniture'}</span>
                          </>
                        ) : (
                          <>
                            {getTypeIcon(item.itemType)}
                            <span className="capitalize">
                              {item.itemType.toLowerCase()}
                              {item.habitat && ` • ${item.habitat}`}
                            </span>
                          </>
                        )}
                      </div>

                      {item.caughtAt && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Caught on {formatDate(item.caughtAt)}</span>
                        </div>
                      )}
                    </CardHeader>

                    <CardFooter className="pt-0">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
                        onClick={() => handleSell(item.id, item.itemType)}
                        disabled={isSelling}
                      >
                        {isSelling ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Selling...
                          </>
                        ) : (
                          <>
                            <Coins className="h-4 w-4 mr-2" />
                            Sell for {item.value} Bells
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  )
}
