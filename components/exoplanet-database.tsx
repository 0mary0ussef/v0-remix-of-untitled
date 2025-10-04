"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Globe, Star, Orbit, Calendar, Ruler, AlertCircle } from "lucide-react"

interface Exoplanet {
  name: string
  hostStar: string
  distance: number | null
  orbitalPeriod: number | null
  radius: number | null
  mass: number | null
  discoveryMethod: string
  discoveryYear: number | null
  equilibriumTemp: number | null
  stellarTemp: number | null
  stellarRadius: number | null
  stellarMass: number | null
}

interface ExoplanetResponse {
  exoplanets: Exoplanet[]
  total: number
  query: string
}

export function ExoplanetDatabase() {
  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [discoveryMethod, setDiscoveryMethod] = useState("All methods")
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)

  const discoveryMethods = [
    "Transit",
    "Radial Velocity",
    "Microlensing",
    "Direct Imaging",
    "Astrometry",
    "Transit Timing Variations",
    "Orbital Brightness Modulation",
  ]

  const fetchExoplanets = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        limit: "100",
        ...(searchTerm && { search: searchTerm }),
        ...(discoveryMethod !== "All methods" && { method: discoveryMethod }),
      })

      const response = await fetch(`/api/nasa-exoplanets?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch exoplanet data")
      }

      const data: ExoplanetResponse = await response.json()
      setExoplanets(data.exoplanets)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExoplanets()
  }, [])

  const handleSearch = () => {
    fetchExoplanets()
  }

  const formatDistance = (distance: number | null) => {
    if (!distance) return "Unknown"
    if (distance < 1) return `${(distance * 1000).toFixed(1)} pc`
    return `${distance.toFixed(1)} ly`
  }

  const formatPeriod = (period: number | null) => {
    if (!period) return "Unknown"
    if (period < 1) return `${(period * 24).toFixed(1)} hours`
    if (period < 365) return `${period.toFixed(1)} days`
    return `${(period / 365).toFixed(1)} years`
  }

  const formatRadius = (radius: number | null) => {
    if (!radius) return "Unknown"
    return `${radius.toFixed(2)} R⊕`
  }

  const formatMass = (mass: number | null) => {
    if (!mass) return "Unknown"
    return `${mass.toFixed(2)} M⊕`
  }

  const formatTemperature = (temp: number | null) => {
    if (!temp) return "Unknown"
    return `${temp.toFixed(0)} K`
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      Transit: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Radial Velocity": "bg-green-500/20 text-green-300 border-green-500/30",
      Microlensing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      "Direct Imaging": "bg-orange-500/20 text-orange-300 border-orange-500/30",
      Astrometry: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    }
    return colors[method] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="glow-effect">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2 text-accent" />
              NASA Exoplanet Archive
            </CardTitle>
            <CardDescription>Loading confirmed exoplanets...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="glow-effect">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load exoplanet data: {error}
          <Button variant="outline" size="sm" onClick={fetchExoplanets} className="ml-4 bg-transparent">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-accent" />
            NASA Exoplanet Archive
          </CardTitle>
          <CardDescription>Explore {exoplanets.length} confirmed exoplanets from NASA's database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by planet or star name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <Select value={discoveryMethod} onValueChange={setDiscoveryMethod}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Discovery method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All methods">All methods</SelectItem>
                {discoveryMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="glow-effect">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exoplanet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exoplanets.map((planet, index) => (
          <Card
            key={`${planet.name}-${index}`}
            className="glow-effect cursor-pointer hover:bg-card/80 transition-colors"
            onClick={() => setSelectedPlanet(planet)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg text-accent glow-text">{planet.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Star className="h-3 w-3 mr-1" />
                    {planet.hostStar}
                  </CardDescription>
                </div>
                <Badge className={getMethodColor(planet.discoveryMethod)} variant="outline">
                  {planet.discoveryMethod}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <Globe className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Distance:</span>
                </div>
                <span className="font-mono text-accent">{formatDistance(planet.distance)}</span>

                <div className="flex items-center">
                  <Orbit className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Period:</span>
                </div>
                <span className="font-mono text-accent">{formatPeriod(planet.orbitalPeriod)}</span>

                <div className="flex items-center">
                  <Ruler className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Radius:</span>
                </div>
                <span className="font-mono text-accent">{formatRadius(planet.radius)}</span>

                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">Discovered:</span>
                </div>
                <span className="font-mono text-accent">{planet.discoveryYear || "Unknown"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Planet Modal */}
      {selectedPlanet && (
        <Card className="glow-effect border-accent/50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-accent glow-text">{selectedPlanet.name}</CardTitle>
                <CardDescription className="flex items-center mt-2">
                  <Star className="h-4 w-4 mr-2" />
                  Orbiting {selectedPlanet.hostStar}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPlanet(null)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-accent">Planet Properties</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span className="font-mono">{formatRadius(selectedPlanet.radius)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mass:</span>
                    <span className="font-mono">{formatMass(selectedPlanet.mass)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Temperature:</span>
                    <span className="font-mono">{formatTemperature(selectedPlanet.equilibriumTemp)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-accent">Orbital Properties</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-mono">{formatPeriod(selectedPlanet.orbitalPeriod)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-mono">{formatDistance(selectedPlanet.distance)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-accent">Discovery</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <Badge className={getMethodColor(selectedPlanet.discoveryMethod)} variant="outline">
                      {selectedPlanet.discoveryMethod}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year:</span>
                    <span className="font-mono">{selectedPlanet.discoveryYear || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
