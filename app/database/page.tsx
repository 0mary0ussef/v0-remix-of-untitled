"use client"

import { ExoplanetDatabase } from "@/components/exoplanet-database"
import { NASADatasetsInfo } from "@/components/nasa-datasets-info"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Database, Telescope, FileText } from "lucide-react"
import Link from "next/link"

export default function DatabasePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Telescope className="h-8 w-8 text-accent glow-text" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold glow-text">ExoWare</h1>
                  <p className="text-xs text-muted-foreground">NASA Space Apps 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Database className="h-12 w-12 text-accent mr-4" />
              <h2 className="text-4xl font-bold glow-text">NASA Exoplanet Archive</h2>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore over 5,600 confirmed exoplanets with real-time data from NASA's Exoplanet Archive. Access official
              datasets from Kepler, TESS, and K2 missions.
            </p>
          </div>

          <Tabs defaultValue="explore" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="explore" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Explore Database
              </TabsTrigger>
              <TabsTrigger value="datasets" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                NASA Datasets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="explore" className="mt-8">
              <ExoplanetDatabase />
            </TabsContent>

            <TabsContent value="datasets" className="mt-8">
              <NASADatasetsInfo />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Telescope className="h-6 w-6 text-accent mr-2" />
              <span className="font-semibold">ExoWare</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Built for NASA Space Apps Challenge 2024 • Powered by real NASA data and advanced ML
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <span>NASA Exoplanet Archive</span>
              <span>•</span>
              <span>Kepler & TESS Missions</span>
              <span>•</span>
              <span>Machine Learning Detection</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
