"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Globe, Star, Loader2, AlertTriangle } from "lucide-react"
import * as THREE from "three"

interface Exoplanet {
  name: string
  hostStar: string
  distance: number | null
  radius: number | null
  equilibriumTemp: number | null
  discoveryMethod: string
  planetType: string
  habitabilityScore: number
}

function WebGLErrorFallback() {
  return (
    <Card className="glow-effect">
      <CardContent className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold mb-2">3D Visualization Unavailable</h3>
            <p className="text-muted-foreground">Your browser doesn't support WebGL or 3D graphics are disabled.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please try using a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function checkWebGLSupport(): boolean {
  try {
    if (typeof window === "undefined") return false
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch (e) {
    return false
  }
}

export function ExoplanetDistanceVisualizer() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const animationRef = useRef<number>()
  const earthMeshRef = useRef<THREE.Mesh>()
  const exoplanetMeshRef = useRef<THREE.Mesh>()
  const distanceLineRef = useRef<THREE.Line>()

  const [exoplanets, setExoplanets] = useState<Exoplanet[]>([])
  const [selectedPlanet, setSelectedPlanet] = useState<Exoplanet | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMethod, setFilterMethod] = useState("All")
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [renderError, setRenderError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [earthLabelPos, setEarthLabelPos] = useState({ x: 0, y: 0, visible: false })
  const [exoplanetLabelPos, setExoplanetLabelPos] = useState({ x: 0, y: 0, visible: false })

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setWebGLSupported(checkWebGLSupport())
    }
    fetchExoplanets()
  }, [])

  const fetchExoplanets = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/nasa-exoplanets?limit=200")
      const data = await response.json()
      const planetsWithDistance = data.exoplanets.filter((p: Exoplanet) => p.distance && p.distance > 0)
      setExoplanets(planetsWithDistance)
      if (planetsWithDistance.length > 0) {
        setSelectedPlanet(planetsWithDistance[0])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch exoplanets:", error)
    } finally {
      setLoading(false)
    }
  }

  const initializeScene = useCallback(() => {
    if (!mountRef.current || !selectedPlanet || !selectedPlanet.distance) return

    try {
      console.log("[v0] Initializing distance visualizer scene")

      // Create scene
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      sceneRef.current = scene

      // Calculate positions
      const scaledDistance = Math.log10(selectedPlanet.distance + 1) * 3
      const exoplanetPosition = new THREE.Vector3(scaledDistance, 0, 0)

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        60,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(scaledDistance / 2, 8, 12)
      camera.lookAt(scaledDistance / 2, 0, 0)
      cameraRef.current = camera

      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      })
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      rendererRef.current = renderer
      mountRef.current.appendChild(renderer.domElement)

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
      scene.add(ambientLight)

      const pointLight = new THREE.PointLight(0xffffff, 1.5)
      pointLight.position.set(10, 10, 10)
      scene.add(pointLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(-10, 10, 5)
      scene.add(directionalLight)

      // Add stars
      const starsGeometry = new THREE.BufferGeometry()
      const starsVertices = []
      for (let i = 0; i < 8000; i++) {
        const x = (Math.random() - 0.5) * 600
        const y = (Math.random() - 0.5) * 600
        const z = (Math.random() - 0.5) * 600
        starsVertices.push(x, y, z)
      }
      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
      const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
      const starField = new THREE.Points(starsGeometry, starsMaterial)
      scene.add(starField)

      const earthGeometry = new THREE.SphereGeometry(0.5, 64, 64)
      const textureLoader = new THREE.TextureLoader()

      // Load Earth texture
      const earthTexture = textureLoader.load(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kPsVskcwOCkk55d0vUoE8Mr5ILOZCR.png",
        () => {
          console.log("[v0] Earth texture loaded successfully")
        },
        undefined,
        (error) => {
          console.error("[v0] Error loading Earth texture:", error)
        },
      )

      const earthMaterial = new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.7,
        metalness: 0.1,
      })
      const earth = new THREE.Mesh(earthGeometry, earthMaterial)
      earth.position.set(0, 0, 0)
      scene.add(earth)
      earthMeshRef.current = earth

      // Create exoplanet
      const planetColor = getPlanetColor(selectedPlanet.equilibriumTemp)
      const planetRadius = selectedPlanet.radius ? Math.min(Math.max(selectedPlanet.radius * 0.15, 0.2), 1.5) : 0.4

      const exoplanetGeometry = new THREE.SphereGeometry(planetRadius, 32, 32)
      const exoplanetMaterial = new THREE.MeshStandardMaterial({
        color: planetColor,
        emissive: planetColor,
        emissiveIntensity: 0.4,
      })
      const exoplanet = new THREE.Mesh(exoplanetGeometry, exoplanetMaterial)
      exoplanet.position.copy(exoplanetPosition)
      scene.add(exoplanet)
      exoplanetMeshRef.current = exoplanet

      // Add planet light
      const planetLight = new THREE.PointLight(planetColor, 2, planetRadius * 3)
      exoplanet.add(planetLight)

      // Create distance line
      const linePoints = [new THREE.Vector3(0, 0, 0), exoplanetPosition]
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints)
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        linewidth: 2,
        transparent: true,
        opacity: 0.6,
      })
      const line = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(line)
      distanceLineRef.current = line

      // Add grid
      const gridHelper = new THREE.GridHelper(scaledDistance * 2, 20, 0x444444, 0x222222)
      gridHelper.position.set(scaledDistance / 2, -2, 0)
      scene.add(gridHelper)

      let isDragging = false
      let previousMousePosition = { x: 0, y: 0 }

      // Spherical coordinates for camera position
      const spherical = {
        radius: camera.position.distanceTo(new THREE.Vector3(scaledDistance / 2, 0, 0)),
        theta: Math.atan2(camera.position.x - scaledDistance / 2, camera.position.z),
        phi: Math.acos(camera.position.y / camera.position.distanceTo(new THREE.Vector3(scaledDistance / 2, 0, 0))),
      }

      renderer.domElement.addEventListener("mousedown", (e) => {
        isDragging = true
        previousMousePosition = { x: e.clientX, y: e.clientY }
      })

      renderer.domElement.addEventListener("mousemove", (e) => {
        if (isDragging && cameraRef.current) {
          const deltaX = e.clientX - previousMousePosition.x
          const deltaY = e.clientY - previousMousePosition.y

          const rotationSpeed = 0.005

          // Update spherical coordinates for full rotation
          spherical.theta -= deltaX * rotationSpeed
          spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + deltaY * rotationSpeed))

          // Convert spherical to Cartesian coordinates
          const target = new THREE.Vector3(scaledDistance / 2, 0, 0)
          camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
          camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi)
          camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)

          camera.lookAt(target)

          previousMousePosition = { x: e.clientX, y: e.clientY }
        }
      })

      renderer.domElement.addEventListener("mouseup", () => {
        isDragging = false
      })

      renderer.domElement.addEventListener("mouseleave", () => {
        isDragging = false
      })

      renderer.domElement.addEventListener("wheel", (e) => {
        e.preventDefault()
        if (cameraRef.current) {
          const target = new THREE.Vector3(scaledDistance / 2, 0, 0)

          // Update radius for zoom
          spherical.radius = Math.max(2, Math.min(50, spherical.radius + e.deltaY * 0.01))

          // Update camera position
          camera.position.x = target.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
          camera.position.y = target.y + spherical.radius * Math.cos(spherical.phi)
          camera.position.z = target.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)

          camera.lookAt(target)
        }
      })

      // Handle resize
      const handleResize = () => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(width, height)
      }
      window.addEventListener("resize", handleResize)

      // Start animation
      animate()

      console.log("[v0] Distance visualizer scene initialized successfully")
    } catch (error) {
      console.error("[v0] Failed to initialize distance visualizer:", error)
      setRenderError(true)
    }
  }, [selectedPlanet])

  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return

    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y += 0.001 // Slow rotation for realistic effect
    }

    if (exoplanetMeshRef.current) {
      exoplanetMeshRef.current.rotation.y += 0.001
    }

    if (earthMeshRef.current && mountRef.current) {
      const earthPos = earthMeshRef.current.position.clone()
      earthPos.y += 1
      earthPos.project(cameraRef.current)

      const x = (earthPos.x * 0.5 + 0.5) * mountRef.current.clientWidth
      const y = (earthPos.y * -0.5 + 0.5) * mountRef.current.clientHeight
      const visible = earthPos.z < 1

      setEarthLabelPos({ x, y, visible })
    }

    if (exoplanetMeshRef.current && mountRef.current) {
      const exoPos = exoplanetMeshRef.current.position.clone()
      exoPos.y += 2
      exoPos.project(cameraRef.current)

      const x = (exoPos.x * 0.5 + 0.5) * mountRef.current.clientWidth
      const y = (exoPos.y * -0.5 + 0.5) * mountRef.current.clientHeight
      const visible = exoPos.z < 1

      setExoplanetLabelPos({ x, y, visible })
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current)
    animationRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (!isMounted || !webGLSupported || !selectedPlanet) return

    // Cleanup previous scene
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (rendererRef.current && mountRef.current && rendererRef.current.domElement.parentNode) {
      mountRef.current.removeChild(rendererRef.current.domElement)
      rendererRef.current.dispose()
    }

    // Initialize new scene
    const timer = setTimeout(() => {
      initializeScene()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (rendererRef.current && mountRef.current && rendererRef.current.domElement.parentNode) {
        mountRef.current.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [selectedPlanet, isMounted, webGLSupported, initializeScene])

  const getPlanetColor = (temp: number | null) => {
    if (!temp) return 0x9333ea
    if (temp > 1000) return 0xef4444
    if (temp > 500) return 0xf97316
    if (temp > 200) return 0xeab308
    return 0x3b82f6
  }

  const filteredPlanets = exoplanets.filter((planet) => {
    const matchesSearch =
      planet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      planet.hostStar.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = filterMethod === "All" || planet.discoveryMethod === filterMethod
    return matchesSearch && matchesMethod
  })

  const discoveryMethods = ["All", ...Array.from(new Set(exoplanets.map((p) => p.discoveryMethod)))]

  const calculateTravelTime = (distance: number) => {
    const voyagerSpeed = 17
    const distanceKm = distance * 9.461e12
    const years = distanceKm / (voyagerSpeed * 1000) / (365.25 * 24 * 3600)
    return Math.round(years).toLocaleString()
  }

  if (!webGLSupported || renderError) {
    return (
      <div className="space-y-6">
        <Card className="glow-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-accent" />
              Exoplanet Distance Explorer
            </CardTitle>
            <CardDescription>3D visualization is not available in your browser</CardDescription>
          </CardHeader>
        </Card>
        <WebGLErrorFallback />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            Exoplanet Distance Explorer
          </CardTitle>
          <CardDescription>
            Select an exoplanet from NASA's database to visualize its distance from Earth in 3D. Drag to rotate in any
            direction, scroll to zoom.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by planet or star name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Discovery method" />
              </SelectTrigger>
              <SelectContent>
                {discoveryMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {filteredPlanets.slice(0, 30).map((planet) => (
                <Button
                  key={planet.name}
                  variant={selectedPlanet?.name === planet.name ? "default" : "outline"}
                  className="justify-start text-left h-auto py-3"
                  onClick={() => setSelectedPlanet(planet)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate text-sm">{planet.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{planet.hostStar}</div>
                    <div className="text-xs text-accent font-mono mt-1">{planet.distance?.toFixed(1)} ly</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3D Visualization */}
      <Card className="glow-effect">
        <CardContent className="p-0 relative">
          <div ref={mountRef} className="h-[500px] md:h-[600px] w-full bg-black rounded-lg overflow-hidden" />

          {earthLabelPos.visible && (
            <div
              className="absolute pointer-events-none transition-all duration-100"
              style={{
                left: `${earthLabelPos.x}px`,
                top: `${earthLabelPos.y}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-blue-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm border border-blue-400/50">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Earth
                </div>
              </div>
            </div>
          )}

          {exoplanetLabelPos.visible && selectedPlanet && (
            <div
              className="absolute pointer-events-none transition-all duration-100"
              style={{
                left: `${exoplanetLabelPos.x}px`,
                top: `${exoplanetLabelPos.y}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-purple-500/90 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm border border-purple-400/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="h-3.5 w-3.5" />
                  {selectedPlanet.name}
                </div>
                <div className="text-xs font-normal text-purple-100">
                  {selectedPlanet.distance?.toFixed(1)} light-years away
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
