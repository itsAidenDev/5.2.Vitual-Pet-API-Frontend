"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ShoppingCart, Coins, Package, Fish, Bug, Search } from "lucide-react"
import Link from "next/link"

interface FurnitureItem {
  id: number
  name: string
  description: string
  price: number
  category: string
  size: string
  imageUrl?: string
}

interface InventoryItem {
  id: string
  itemId: number
  itemName: string
  itemType: "BUG" | "FISH"
  rarity: string
  value: number
  quantity: number
}

export default function Shop() {
    const DEFAULT_FURNITURE: FurnitureItem[] = [
      {
        id: 1,
        name: "Wooden chair",
        description: "A cozy wooden chair for relaxation",
        price: 350,
        category: "Living Room",
        size: "1x1",
        imageUrl: "/images/furniture/wooden-chair.png"
      },
      {
        id: 2,
        name: "Coffee Table",
        description: "Fancy coffee table for your home",
        price: 500,
        category: "Living Room",
        size: "2x2",
        imageUrl: "/images/furniture/coffee-table.jpg"
      },
      {
        id: 3,
        name: "Simple Bed",
        description: "Comfortable bed for a relaxing night",
        price: 800,
        category: "Bedroom",
        size: "2x3",
        imageUrl: "/images/furniture/simple-bed.jpg"
      },
    ];

const [furniture, setFurniture] = useState<FurnitureItem[]>(DEFAULT_FURNITURE);
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedTab, setSelectedTab] = useState("buy")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSelling, setIsSelling] = useState(false)
  const [isBuying, setIsBuying] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
      return
    }
    fetchShopData()
    fetchInventory()
    fetchUserBalance()
  }, [])

  const fetchShopData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/shop/furniture`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Combina los muebles por defecto con los del servidor
        setFurniture([...DEFAULT_FURNITURE, ...data]);
      } else {
        // Si hay un error, usa los muebles por defecto
        console.warn("Using default furniture due to error:", await response.text());
      }
    } catch (error) {
      console.error("Connection error. Using default furniture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        const processedItems = (data.items || []).map((item: any) => ({
          id: item.id,
          itemId: item.itemId,
          itemName: item.itemName,
          itemType: item.itemType,
          rarity: item.rarity,
          value: item.value,
          quantity: item.quantity
        }))
        setInventory(processedItems)
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: "Error",
        description: "Could not load inventory",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserBalance(data.points || 0);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching user data:", errorData);
        toast({
          title: "Error",
          description: errorData.message || "No se pudo cargar el saldo de bayas",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching user balance:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar al servidor",
        variant: "destructive",
      });
    }
  };

  const handlePurchase = async (furnitureId: number) => {
    if (isBuying) return

    setIsBuying(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/shop/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          furnitureId,
          villagerId: 1, // TODO: Obtener el ID del aldeano seleccionado
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item purchased successfully!",
        })
        fetchInventory()
        fetchUserBalance()
      } else {
        const error = await response.text()
        toast({
          title: "Error",
          description: error || "Failed to purchase item",
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
      setIsBuying(false)
    }
  }

  const handleSell = async (itemId: string) => {
      if (isSelling) return

      setIsSelling(true)
      try {
        const token = localStorage.getItem("token")
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/inventory/item/${itemId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (response.ok) {
          const message = await response.text()
          toast({
            title: "Success",
            description: message || "Item sold successfully!",
          })
          fetchInventory()
          fetchUserBalance()
        } else {
          const error = await response.text()
          toast({
            title: "Error",
            description: error || "Failed to sell item",
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

  const filteredFurniture = furniture.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInventory = inventory.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/background-morning.jpg')" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shop...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/tienda-virtual-pet.jpg')" }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">Nook's Cranny</h1>
            </div>
            <p className="text-gray-600 ml-12">Buy and sell items here!</p>
          </div>
          <div className="flex items-center gap-4 bg-white/80 px-4 py-2 rounded-lg shadow">
            <Coins className="h-6 w-6 text-yellow-500" />
            <span className="text-lg font-semibold">{userBalance} Bells</span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="buy" className="w-full" onValueChange={setSelectedTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="buy">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buy
              </TabsTrigger>
              <TabsTrigger value="sell">
                <Package className="h-4 w-4 mr-2" />
                Sell
              </TabsTrigger>
            </TabsList>

            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder={selectedTab === "buy" ? "Search furniture..." : "Search your items..."}
                className="pl-10 bg-white/80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="buy" className="mt-6">
            {filteredFurniture.length === 0 ? (
              <div className="text-center py-12 bg-white/80 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No furniture found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or check back later for new items!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFurniture.map((item) => (
                  <Card key={item.id} className="overflow-hidden bg-white/90 hover:shadow-lg transition-shadow">
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {item.price} Bells
                        </Badge>
                      </div>
                      <CardDescription>{item.description}</CardDescription>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">{item.size}</Badge>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(item.id)}
                        disabled={isBuying || userBalance < item.price}
                      >
                        {isBuying ? "Processing..." : "Buy Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sell" className="mt-6">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 bg-white/80 rounded-lg">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No items to sell</h3>
                <p className="mt-1 text-gray-500">Go catch some bugs or fish first!</p>
                <Button className="mt-4" onClick={() => router.push('/activities')}>
                  Go to Activities
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredInventory.map((item) => (
                  <Card key={item.id} className="overflow-hidden bg-white/90 hover:shadow-lg transition-shadow">
                    <div className="h-32 bg-gray-100 flex items-center justify-center">
                      {item.itemType === 'FISH' ? (
                        <Fish className="h-12 w-12 text-blue-500" />
                      ) : (
                        <Bug className="h-12 w-12 text-green-600" />
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{item.itemName}</CardTitle>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          {item.value} Bells
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="outline" className="capitalize">
                          {item.rarity.toLowerCase()}
                        </Badge>
                        <Badge variant="secondary">
                          Qty: {item.quantity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full bg-green-50 hover:bg-green-100 text-green-700"
                        onClick={() => handleSell(item.id)}
                        disabled={isSelling}
                      >
                        {isSelling ? "Selling..." : `Sell for ${item.value} Bells`}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
