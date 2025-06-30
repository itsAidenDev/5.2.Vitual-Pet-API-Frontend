"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star } from "lucide-react"

interface LoginRequest {
  username: string
  password: string
}

interface User {
  username: string
  role: string
}

interface LoginResponse {
  token: string
  user: User
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loginForm, setLoginForm] = useState<LoginRequest>({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState<LoginRequest>({ username: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      })

      if (response.ok) {
        const data: LoginResponse = await response.json()
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsAuthenticated(true)
        setUser(data.user)
        toast({
          title: "Welcome!",
          description: `Hello ${data.user.username}, great to see you again!`,
        })
        router.push("/dashboard")
      } else {
        const errorText = await response.text()
        toast({
          title: "Login Error",
          description: errorText,
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerForm),
        },
      )

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "You can now log in with your account",
        })
        setRegisterForm({ username: "", password: "" })
      } else {
        const errorText = await response.text()
        toast({
          title: "Registration Error",
          description: errorText,
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

  if (isAuthenticated) {
    router.push("/dashboard")
    return null
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/beach-wallpaper.gif')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]"></div>

      {/* Floating magical elements */}
      <div className="absolute top-16 left-16 animate-pulse">
        <div className="w-2 h-2 bg-yellow-300 rounded-full shadow-lg shadow-yellow-300/50"></div>
      </div>
      <div className="absolute top-32 right-24 animate-bounce delay-300">
        <Star className="w-4 h-4 text-blue-300 opacity-80" />
      </div>
      <div className="absolute top-24 right-16 animate-pulse delay-700">
        <div className="w-1.5 h-1.5 bg-purple-300 rounded-full shadow-lg shadow-purple-300/50"></div>
      </div>
      <div className="absolute bottom-32 left-24 animate-bounce delay-1000">
        <div className="w-2 h-2 bg-cyan-300 rounded-full shadow-lg shadow-cyan-300/50"></div>
      </div>
      <div className="absolute bottom-40 right-32 animate-pulse delay-500">
        <Star className="w-3 h-3 text-yellow-300 opacity-70" />
      </div>
      <div className="absolute top-1/3 left-8 animate-bounce delay-1500">
        <div className="w-1 h-1 bg-pink-300 rounded-full shadow-lg shadow-pink-300/50"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-2">
          {/* Custom Logo */}
          <div className="flex justify-center mb-4">
            <img
              src="/images/animal-crossing-virtual-pets-logo.png"
              alt="Animal Crossing Virtual Pets"
              className="w-90 md:w-[500px] lg:w-[600px] h-auto drop-shadow-2xl"
            />
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/96 backdrop-blur-lg border border-white/20">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-bold">
              Join the Adventure!
            </CardTitle>
            <CardDescription className="text-white font-medium">
              Create and care for your virtual villagers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 border border-white/30">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-lg font-medium"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-lg font-medium"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-username" className="text-white font-semibold">
                      Username
                    </Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder="Enter your username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                      required
                      className="border-2 border-gray-200 focus:border-blue-400 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white font-semibold">
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      className="border-2 border-gray-200 focus:border-blue-400 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-600 hover:from-blue-600 hover:via-purple-700 hover:to-cyan-700 text-white font-bold py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-white/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-6">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-white font-semibold">
                      Username
                    </Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="Choose a username"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                      className="border-2 border-gray-200 focus:border-purple-400 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white font-semibold">
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      className="border-2 border-gray-200 focus:border-purple-400 transition-all duration-200 bg-white/90 backdrop-blur-sm"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-600 to-rose-600 hover:from-purple-600 hover:via-pink-700 hover:to-rose-700 text-white font-bold py-3 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-white/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="mt-8 text-center">
          <p className="text-white/90 text-sm drop-shadow-lg font-medium">
            ✨ Welcome to Tom Nook's magical village! ✨
          </p>
        </div>
      </div>
    </div>
  )
}

