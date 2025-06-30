// DTOs de autenticación
export interface LoginRequest {
  username: string
  password: string
}

export interface UserDTO {
  username: string
  role: string
}

export interface LoginResponseDTO {
  token: string
  user: UserDTO
}

// DTOs de aldeanos
export type AnimalType = "WOLF" | "CAT" | "DOG" | "EAGLE" | "TIGER" | "MOUSE"
export type Personality = "LAZY" | "NORMAL" | "SMUG" | "PEPPY" | "JOCK" | "CRANKY" | "SNOOTY"
export type VillagerStatus = "HAPPY" | "NEUTRAL" | "SAD" | "SICK" | "ASLEEP"

interface Villager {
  villagerId: number;
  villagerName: string;
  animalType: string;
  personality: string;
  friendshipLevel: number;
  happiness: number;
  hunger: number;
  energy: number;
  healthLevel: number;
  lastSleep: string;
  username: string; // Add this line
}

export interface VillagerDTO {
  villagerId: number
  villagerName: string
  animalType: AnimalType
  personality: Personality
  friendshipLevel: number
  happiness: number
  hunger: number
  energy: number
  healthLevel: number
  stacks: string[]
  lastSleep: string // LocalDateTime en Java, usaremos string para ISO date
}

export interface ActionResultDTO {
  message: string
  newEnergy: number
  newFriendship: number
}

export interface TalkResponseDTO {
  message: string
  friendshipChange: number
  currentFriendship: number
}

// DTOs de actividades
export type Habitat = "RIVER" | "OCEAN" | "POND" | "FOREST" | "GRASSLAND" | "DESERT"

export interface BugDTO {
  bugId: number
  bugName: string
  bugDescription: string
  bugRarity: string
  bugValue: number
  bugHabitat: Habitat
  catchDifficulty: number
  caughtAt?: string // Opcional, solo para bichos capturados
  location?: string // Opcional, solo para bichos capturados
}

export interface FishDTO {
  fishId: number
  fishName: string
  fishDescription: string
  fishRarity: string
  fishValue: number
  habitat: Habitat
  catchDifficulty: number
  caughtAt?: string // Opcional, solo para peces capturados
  location?: string // Opcional, solo para peces capturados
}

export interface ActivityResultDTO {
  success: boolean
  message: string
  caughtItem?: BugDTO | FishDTO
  experienceGained: number
  friendshipGained: number
}

// DTOs de inventario
export interface InventoryItemDTO {
  id: string // e.g., "BUG_123" or "FISH_456"
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

export interface InventoryStatsDTO {
  totalItems: number
  totalValue: number
  uniqueSpecies: number
  rareItems: number
}

export interface InventoryResponseDTO {
  items: InventoryItemDTO[]
  stats: InventoryStatsDTO
}
