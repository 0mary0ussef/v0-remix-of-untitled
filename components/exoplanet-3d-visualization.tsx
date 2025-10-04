"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import * as THREE from "three"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Info, Loader2, AlertTriangle } from "lucide-react"

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
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch (e) {
    return false
  }
}

interface ExoplanetData {
  name: string
  hostStar: string
  distance: number
  orbitalPeriod: number
  radius: number
  mass: number
  discoveryMethod: string
  discoveryYear: number
  equilibriumTemp: number
}

export function Exoplanet3DVisualization() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const animationRef = useRef<number>()
  const planetMeshRef = useRef<THREE.Mesh>()
  const starMeshRef = useRef<THREE.Mesh>()
  const orbitLineRef = useRef<THREE.Line>()

  const [exoplanets, setExoplanets] = useState<ExoplanetData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlanet, setSelectedPlanet] = useState<ExoplanetData | null>(null)
  const [isAnimating, setIsAnimating] = useState(true)
  const [animationSpeed, setAnimationSpeed] = useState([1])
  const [showOrbits, setShowOrbits] = useState(true)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [renderError, setRenderError] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const timeRef = useRef(0)
  const [starLabelPos, setStarLabelPos] = useState({ x: 0, y: 0, visible: false })
  const [planetLabelPos, setPlanetLabelPos] = useState({ x: 0, y: 0, visible: false })

  useEffect(() => {
    setIsMounted(true)
    if (typeof window !== "undefined") {
      setWebGLSupported(checkWebGLSupport())
    }
  }, [])

  useEffect(() => {
    const fetchExoplanets = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/nasa-exoplanets?limit=50")
        const data = await response.json()

        const validPlanets = data.exoplanets
          .filter(
            (p: any) =>
              p.distance &&
              p.orbitalPeriod &&
              p.radius &&
              p.mass &&
              p.equilibriumTemp &&
              p.distance > 0 &&
              p.orbitalPeriod > 0 &&
              p.radius > 0,
          )
          .map((p: any) => ({
            name: p.name,
            hostStar: p.hostStar,
            distance: p.distance,
            orbitalPeriod: p.orbitalPeriod,
            radius: p.radius,
            mass: p.mass || 1.0,
            discoveryMethod: p.discoveryMethod,
            discoveryYear: p.discoveryYear || 2020,
            equilibriumTemp: p.equilibriumTemp,
          }))

        setExoplanets(validPlanets)
        if (validPlanets.length > 0) {
          setSelectedPlanet(validPlanets[0])
        }
      } catch (error) {
        console.error("[v0] Failed to fetch exoplanets for 3D visualization:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isMounted) {
      fetchExoplanets()
    }
  }, [isMounted])

  const initializeScene = useCallback(() => {
    if (!mountRef.current || !selectedPlanet) return

    try {
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)
      sceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        60,
        mountRef.current.clientWidth / mountRef.current.clientHeight,
        0.1,
        1000,
      )
      camera.position.set(8, 5, 8)
      camera.lookAt(0, 0, 0)
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      })
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      rendererRef.current = renderer
      mountRef.current.appendChild(renderer.domElement)

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
      scene.add(ambientLight)

      const pointLight = new THREE.PointLight(0xffffff, 1)
      pointLight.position.set(10, 10, 10)
      scene.add(pointLight)

      const starsGeometry = new THREE.BufferGeometry()
      const starsVertices = []
      for (let i = 0; i < 5000; i++) {
        const x = (Math.random() - 0.5) * 200
        const y = (Math.random() - 0.5) * 200
        const z = (Math.random() - 0.5) * 200
        starsVertices.push(x, y, z)
      }
      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3))
      const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 })
      const starField = new THREE.Points(starsGeometry, starsMaterial)
      scene.add(starField)

      const starGeometry = new THREE.SphereGeometry(0.5, 32, 32)
      const starMaterial = new THREE.MeshStandardMaterial({
        color: 0xfdb813,
        emissive: 0xfdb813,
        emissiveIntensity: 0.5,
      })
      const star = new THREE.Mesh(starGeometry, starMaterial)
      scene.add(star)
      starMeshRef.current = star

      const starLight = new THREE.PointLight(0xfdb813, 2)
      star.add(starLight)

      const orbitalDistance = Math.max(3, selectedPlanet.orbitalPeriod * 0.1)
      const planetRadius = Math.max(0.1, selectedPlanet.radius * 0.2)
      const planetColor = getPlanetColor(selectedPlanet.equilibriumTemp)

      const planetGeometry = new THREE.SphereGeometry(planetRadius, 32, 32)
      const planetMaterial = new THREE.MeshStandardMaterial({
        color: planetColor,
        emissive: planetColor,
        emissiveIntensity: 0,
      })
      const planet = new THREE.Mesh(planetGeometry, planetMaterial)
      planet.position.set(orbitalDistance, 0, 0)
      scene.add(planet)
      planetMeshRef.current = planet

      if (showOrbits) {
        const orbitPoints = []
        for (let i = 0; i <= 64; i++) {
          const angle = (i / 64) * Math.PI * 2
          orbitPoints.push(new THREE.Vector3(Math.cos(angle) * orbitalDistance, 0, Math.sin(angle) * orbitalDistance))
        }
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints)
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 })
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial)
        scene.add(orbitLine)
        orbitLineRef.current = orbitLine
      }

      let isDragging = false
      let previousMousePosition = { x: 0, y: 0 }

      renderer.domElement.addEventListener("mousedown", () => {
        isDragging = true
      })

      renderer.domElement.addEventListener("mousemove", (e) => {
        if (isDragging && cameraRef.current) {
          const deltaX = e.clientX - previousMousePosition.x
          const deltaY = e.clientY - previousMousePosition.y

          const rotationSpeed = 0.005
          camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX * rotationSpeed)

          const axis = new THREE.Vector3(1, 0, 0)
          camera.position.applyAxisAngle(axis, -deltaY * rotationSpeed)
          camera.lookAt(0, 0, 0)
        }
        previousMousePosition = { x: e.clientX, y: e.clientY }
      })

      renderer.domElement.addEventListener("mouseup", () => {
        isDragging = false
      })

      renderer.domElement.addEventListener("wheel", (e) => {
        e.preventDefault()
        if (cameraRef.current) {
          const zoomSpeed = 0.1
          const direction = camera.position.clone().normalize()
          camera.position.addScaledVector(direction, e.deltaY * zoomSpeed * 0.01)
        }
      })

      const handleResize = () => {
        if (!mountRef.current || !cameraRef.current || !rendererRef.current) return
        const width = mountRef.current.clientWidth
        const height = mountRef.current.clientHeight
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(width, height)
      }
      window.addEventListener("resize", handleResize)

      animate()
    } catch (error) {
      console.error("[v0] Failed to initialize scene:", error)
      setRenderError(true)
    }
  }, [selectedPlanet, showOrbits])

  const animate = useCallback(() => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current) return

    if (isAnimating && planetMeshRef.current && selectedPlanet) {
      timeRef.current += 0.01 * animationSpeed[0]
      const orbitalDistance = Math.max(3, selectedPlanet.orbitalPeriod * 0.1)
      const angle = (timeRef.current / selectedPlanet.orbitalPeriod) * Math.PI * 2

      planetMeshRef.current.position.x = Math.cos(angle) * orbitalDistance
      planetMeshRef.current.position.z = Math.sin(angle) * orbitalDistance
      planetMeshRef.current.rotation.y += 0.01
    }

    if (starMeshRef.current) {
      starMeshRef.current.rotation.y += 0.005
    }

    if (starMeshRef.current && mountRef.current) {
      const starPos = starMeshRef.current.position.clone()
      starPos.y += 1.5
      starPos.project(cameraRef.current)

      const x = (starPos.x * 0.5 + 0.5) * mountRef.current.clientWidth
      const y = (starPos.y * -0.5 + 0.5) * mountRef.current.clientHeight
      const visible = starPos.z < 1

      setStarLabelPos({ x, y, visible })
    }

    if (planetMeshRef.current && mountRef.current && selectedPlanet) {
      const planetPos = planetMeshRef.current.position.clone()
      planetPos.y += 1
      planetPos.project(cameraRef.current)

      const x = (planetPos.x * 0.5 + 0.5) * mountRef.current.clientWidth
      const y = (planetPos.y * -0.5 + 0.5) * mountRef.current.clientHeight
      const visible = planetPos.z < 1

      setPlanetLabelPos({ x, y, visible })
    }

    rendererRef.current.render(sceneRef.current, cameraRef.current)
    animationRef.current = requestAnimationFrame(animate)
  }, [isAnimating, animationSpeed, selectedPlanet])

  useEffect(() => {
    if (!isMounted || !webGLSupported || !selectedPlanet) return

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    if (rendererRef.current && mountRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement)
      rendererRef.current.dispose()
    }

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

  const getPlanetColor = (temp: number) => {
    if (temp > 800) return "#FF4444"
    if (temp > 400) return "#FFA500"
    if (temp > 200) return "#4444FF"
    return "#8888FF"
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      Transit: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      "Radial Velocity": "bg-green-500/20 text-green-300 border-green-500/30",
      Microlensing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    }
    return colors[method] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  if (!webGLSupported || renderError) {
    return <WebGLErrorFallback />
  }

  if (loading) {
    return (
      <Card className="glow-effect">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
            <p className="text-accent">Loading real NASA exoplanet data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (exoplanets.length === 0) {
    return (
      <Card className="glow-effect">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <Info className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No exoplanets with complete data available for 3D visualization.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedPlanet) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-accent" />
            3D Exoplanet System Visualization
          </CardTitle>
          <CardDescription>
            Explore {exoplanets.length} real exoplanet systems from NASA's database in three dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Select
              value={selectedPlanet.name}
              onValueChange={(value) => {
                const planet = exoplanets.find((p) => p.name === value)
                if (planet) setSelectedPlanet(planet)
              }}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select system" />
              </SelectTrigger>
              <SelectContent>
                {exoplanets.map((planet) => (
                  <SelectItem key={planet.name} value={planet.name}>
                    {planet.hostStar} ({planet.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAnimating(!isAnimating)} className="glow-effect">
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm" onClick={() => setShowOrbits(!showOrbits)} className="glow-effect">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Speed:</span>
              <Slider
                value={animationSpeed}
                onValueChange={setAnimationSpeed}
                max={3}
                min={0.1}
                step={0.1}
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3D Visualization */}
      <Card className="glow-effect">
        <CardContent className="p-0 relative">
          <div ref={mountRef} className="w-full h-[600px] bg-black rounded-lg overflow-hidden" />

          {starLabelPos.visible && selectedPlanet && (
            <div
              className="absolute pointer-events-none transition-all duration-100"
              style={{
                left: `${starLabelPos.x}px`,
                top: `${starLabelPos.y}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-yellow-500/90 text-black px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm border border-yellow-400/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">⭐</span>
                  {selectedPlanet.hostStar}
                </div>
              </div>
            </div>
          )}

          {planetLabelPos.visible && selectedPlanet && (
            <div
              className="absolute pointer-events-none transition-all duration-100"
              style={{
                left: `${planetLabelPos.x}px`,
                top: `${planetLabelPos.y}px`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-blue-500/90 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm border border-blue-400/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">🪐</span>
                  {selectedPlanet.name}
                </div>
                <div className="text-xs font-normal text-blue-100">Radius: {selectedPlanet.radius.toFixed(2)} R⊕</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planet Information */}
      <Card className="glow-effect">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl text-accent glow-text">{selectedPlanet.name}</CardTitle>
              <CardDescription className="mt-2">
                Orbiting {selectedPlanet.hostStar} • {selectedPlanet.distance.toFixed(1)} light-years away
              </CardDescription>
            </div>
            <Badge className={getMethodColor(selectedPlanet.discoveryMethod)} variant="outline">
              {selectedPlanet.discoveryMethod}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-accent">Physical Properties</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Radius:</span>
                  <span className="font-mono">{selectedPlanet.radius.toFixed(2)} R⊕</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mass:</span>
                  <span className="font-mono">{selectedPlanet.mass.toFixed(2)} M⊕</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Temperature:</span>
                  <span className="font-mono">{selectedPlanet.equilibriumTemp.toFixed(0)} K</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-accent">Orbital Properties</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-mono">{selectedPlanet.orbitalPeriod.toFixed(1)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-mono">{selectedPlanet.distance.toFixed(1)} ly</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-accent">Discovery</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year:</span>
                  <span className="font-mono">{selectedPlanet.discoveryYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-mono text-xs">{selectedPlanet.discoveryMethod}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-accent">Habitability</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="font-mono">
                    {selectedPlanet.equilibriumTemp > 273 && selectedPlanet.equilibriumTemp < 373
                      ? "Habitable"
                      : selectedPlanet.equilibriumTemp > 373
                        ? "Too Hot"
                        : "Too Cold"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Earth-like:</span>
                  <span className="font-mono">
                    {selectedPlanet.radius > 0.5 && selectedPlanet.radius < 2.0 ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
