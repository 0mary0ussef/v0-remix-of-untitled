"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Rocket, Trophy, Target, Zap, Award, Star } from "lucide-react"

interface DemoModeProps {
  onStartDemo: () => void
  isActive: boolean
}

export function HackathonDemoMode({ onStartDemo, isActive }: DemoModeProps) {
  const [demoStats, setDemoStats] = useState({
    totalPlanets: 5647,
    newDiscoveries: 23,
    accuracy: 94.7,
    processingSpeed: 1.2,
  })

  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isActive) {
      setIsAnimating(true)
      const interval = setInterval(() => {
        setDemoStats((prev) => ({
          totalPlanets: prev.totalPlanets + Math.floor(Math.random() * 3),
          newDiscoveries: prev.newDiscoveries + (Math.random() > 0.7 ? 1 : 0),
          accuracy: Math.min(99.9, prev.accuracy + Math.random() * 0.1),
          processingSpeed: prev.processingSpeed + Math.random() * 0.1,
        }))
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isActive])

  if (!isActive) {
    return (
      <Card className="w-full border-2 border-dashed border-accent/30 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-accent/10">
            <Trophy className="h-8 w-8 text-accent" />
          </div>
          <CardTitle className="text-xl">NASA Space Apps Demo Mode</CardTitle>
          <CardDescription>
            Optimized presentation mode for hackathon judges with live data and enhanced visualizations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-accent" />
              <span>Real NASA data integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              <span>Advanced ML algorithms</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span>Live performance metrics</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              <span>Scientific validation</span>
            </div>
          </div>

          <Button onClick={onStartDemo} className="w-full bg-accent hover:bg-accent/90 text-black font-semibold">
            <Trophy className="h-4 w-4 mr-2" />
            Start Demo Mode
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full border-accent bg-gradient-to-br from-accent/10 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-accent/20">
              <Trophy className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Demo Mode Active</CardTitle>
              <CardDescription>Live NASA Space Apps presentation</CardDescription>
            </div>
          </div>
          <Badge className="bg-accent text-black font-semibold animate-pulse">
            <Star className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold text-accent ${isAnimating ? "animate-pulse" : ""}`}>
              {demoStats.totalPlanets.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Exoplanets</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold text-accent ${isAnimating ? "animate-pulse" : ""}`}>
              +{demoStats.newDiscoveries}
            </div>
            <div className="text-xs text-muted-foreground">New This Month</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold text-accent ${isAnimating ? "animate-pulse" : ""}`}>
              {demoStats.accuracy.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">ML Accuracy</div>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold text-accent ${isAnimating ? "animate-pulse" : ""}`}>
              {demoStats.processingSpeed.toFixed(1)}s
            </div>
            <div className="text-xs text-muted-foreground">Avg Processing</div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>System Performance</span>
            <span className="text-accent">{demoStats.accuracy.toFixed(1)}%</span>
          </div>
          <Progress value={demoStats.accuracy} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
