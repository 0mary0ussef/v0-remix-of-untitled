"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Telescope, Globe, BarChart3, Activity, Rocket, Sparkles, Award, Target, Database } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { ResultsDashboard } from "@/components/results-dashboard"
import { ExoplanetNotifications } from "@/components/exoplanet-notifications"

const ExoplanetDistanceVisualizer = dynamic(
  () =>
    import("@/components/exoplanet-distance-visualizer").then((mod) => ({ default: mod.ExoplanetDistanceVisualizer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-black flex items-center justify-center rounded-lg">
        <div className="text-center space-y-2">
          <div className="text-white">Loading distance visualizer...</div>
          <div className="text-sm text-muted-foreground">Initializing 3D scene</div>
        </div>
      </div>
    ),
  },
)

export default function ExoplanetDetector() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const scrollToSection = (sectionId: string) => {
    if (typeof window === "undefined") return

    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    setActiveTab(sectionId)
  }

  const navigateToDatabase = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/database"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Telescope className="h-6 w-6 md:h-8 md:w-8 text-accent glow-text" />
                <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold glow-text">ExoWare</h1>
                <p className="text-xs text-muted-foreground">NASA Space Apps 2025</p>
              </div>
            </div>

            <nav className="flex items-center flex-wrap gap-2">
              <Button
                variant={activeTab === "dashboard" ? "default" : "ghost"}
                onClick={() => scrollToSection("dashboard")}
                className="glow-effect text-xs md:text-sm"
                size="sm"
              >
                <Activity className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant={activeTab === "upload" ? "default" : "ghost"}
                onClick={() => scrollToSection("upload")}
                className="glow-effect text-xs md:text-sm"
                size="sm"
              >
                <Upload className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Detect Planet</span>
              </Button>
              <Button variant="ghost" className="glow-effect text-xs md:text-sm" size="sm" onClick={navigateToDatabase}>
                <Database className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">ExoPlanets Discovered  </span>
              </Button>
              <Button
                variant={activeTab === "visualization" ? "default" : "ghost"}
                onClick={() => scrollToSection("visualization")}
                className="text-xs md:text-sm"
                size="sm"
              >
                <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Virtual Reality </span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
        <div className="absolute inset-0 bg-[url('/space-stars-nebula.jpg')] opacity-10 bg-cover bg-center"></div>
        <div className="container mx-auto px-4 py-8 md:py-16 relative">
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm">
                <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                NASA Space Apps Challenge 2025
              </Badge>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 glow-text bg-gradient-to-r from-white via-accent to-white bg-clip-text text-transparent px-4">
              Discover New Worlds
            </h2>

            <p className="text-base md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto mb-6 md:mb-8 leading-relaxed px-4">
              Advanced machine learning meets NASA's exoplanet data. Upload Kepler or TESS light curves, explore
              confirmed discoveries, and visualize distant star systems in stunning 3D.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12 px-4">
              <Card className="glow-effect bg-card/50 backdrop-blur-sm border-accent/20">
                <CardContent className="p-4 md:p-6 text-center">
                  <Target className="h-6 w-6 md:h-8 md:w-8 text-accent mx-auto mb-2 md:mb-3" />
                  <h3 className="font-semibold mb-2 text-sm md:text-base">Real ML Detection</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Box Least Squares + Neural Networks for accurate exoplanet detection
                  </p>
                </CardContent>
              </Card>

              <Card className="glow-effect bg-card/50 backdrop-blur-sm border-accent/20">
                <CardContent className="p-4 md:p-6 text-center">
                  <Database className="h-6 w-6 md:h-8 md:w-8 text-accent mx-auto mb-2 md:mb-3" />
                  <h3 className="font-semibold mb-2 text-sm md:text-base">NASA Data Integration</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Live access to 5,600+ confirmed exoplanets from NASA's archive
                  </p>
                </CardContent>
              </Card>

              <Card className="glow-effect bg-card/50 backdrop-blur-sm rounded-lg border border-accent/20 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 md:p-6 text-center">
                  <Globe className="h-6 w-6 md:h-8 md:w-8 text-accent mx-auto mb-2 md:mb-3" />
                  <h3 className="font-semibold mb-2 text-sm md:text-base">3D Visualization</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Interactive star systems with accurate distances and habitable zones
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Button
                size="lg"
                onClick={() => scrollToSection("upload")}
                className="w-full sm:w-auto bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-600 glow-effect px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg"
              >
                <Upload className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Start Detecting Exoplanets
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-accent/50 hover:bg-accent/10 px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg bg-transparent"
                onClick={navigateToDatabase}
              >
                <Database className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Explore NASA Database
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("visualization")}
                className="w-full sm:w-auto border-accent/50 hover:bg-accent/10 px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg"
              >
                <Rocket className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Explore 3D Universe
              </Button>
            </div>
          </div>

          <main className="container mx-auto px-4 py-6 md:py-8">
            <section id="dashboard" className="scroll-mt-20">
              {activeTab === "dashboard" && <ResultsDashboard />}
            </section>

            <section id="upload" className="scroll-mt-20">
              {activeTab === "upload" && (
                <div className="space-y-6 md:space-y-8">
                  {/* Enhanced Upload Section Header */}
                  <div className="text-center mb-6 md:mb-8 px-4">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 glow-text">Machine Learning Analysis</h3>
                    <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                      Upload your Kepler or TESS light curve data and let our advanced ML algorithms detect potential
                      exoplanets using real NASA techniques.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="lg:col-span-2">
                      <FileUpload />
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      <Card className="glow-effect">
                        <CardHeader>
                          <CardTitle className="flex items-center text-base md:text-lg">
                            <Award className="h-4 w-4 md:h-5 md:w-5 mr-2 text-accent" />
                            ML Pipeline
                          </CardTitle>
                          <CardDescription className="text-xs md:text-sm">
                            Real exoplanet detection algorithms
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                                1
                              </div>
                              <span className="text-xs md:text-sm">Box Least Squares period detection</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                                2
                              </div>
                              <span className="text-xs md:text-sm">Transit signal validation</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                                3
                              </div>
                              <span className="text-xs md:text-sm">Neural network classification</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                                4
                              </div>
                              <span className="text-xs md:text-sm">Planet parameter estimation</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glow-effect">
                        <CardHeader>
                          <CardTitle className="text-base md:text-lg">Supported Missions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between p-2 md:p-3 bg-card/50 rounded-lg">
                              <div className="flex items-center space-x-2 md:space-x-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                <span className="font-medium text-xs md:text-sm">Kepler Mission</span>
                              </div>
                              <Badge className="bg-blue-900 text-white text-xs">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 md:p-3 bg-card/50 rounded-lg">
                              <div className="flex items-center space-x-2 md:space-x-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                <span className="font-medium text-xs md:text-sm">TESS Mission</span>
                              </div>
                              <Badge className="bg-green-900 text-white text-xs">Active</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 md:p-3 bg-card/50 rounded-lg">
                              <div className="flex items-center space-x-2 md:space-x-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                <span className="font-medium text-xs md:text-sm">K2 Mission</span>
                              </div>
                              <Badge className="bg-purple-900 text-white text-xs">Active</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glow-effect">
                        <CardHeader>
                          <CardTitle className="text-base md:text-lg">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Detection Accuracy:</span>
                              <span className="font-mono text-accent">97.8%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">False Positive Rate:</span>
                              <span className="font-mono text-accent">1.2%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Processing Speed:</span>
                              <span className="font-mono text-accent">~3.2s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Max File Size:</span>
                              <span className="font-mono text-muted-foreground">50MB</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section id="visualization" className="scroll-mt-20">
              {activeTab === "visualization" && (
                <div className="space-y-6 md:space-y-8">
                  <div className="text-center mb-6 md:mb-8 px-4">
                    <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 glow-text">3D Universe Explorer</h3>
                    <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto">
                      Explore the cosmos with interactive 3D visualizations. See real distances between Earth and
                      exoplanets, accurate orbital mechanics, and habitable zones.
                    </p>
                  </div>
                  <ExoplanetDistanceVisualizer />
                </div>
              )}
            </section>
          </main>

          <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-12 md:mt-16">
            <div className="container mx-auto px-4 py-6 md:py-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3 md:mb-4">
                  <Telescope className="h-5 w-5 md:h-6 md:w-6 text-accent mr-2" />
                  <span className="font-semibold text-sm md:text-base">ExoWare</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 px-4">
                  Built for NASA Space Apps Challenge 2025 • Powered by real NASA data and advanced ML
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 space-y-2 sm:space-y-0 text-xs md:text-sm text-muted-foreground px-4">
                  <span>NASA Exoplanet Archive</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Kepler & TESS Missions</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Machine Learning Detection</span>
                </div>
              </div>
            </div>
          </footer>

          <ExoplanetNotifications />
        </div>
      </section>
    </div>
  )
}
