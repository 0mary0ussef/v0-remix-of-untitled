"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X, Sparkles, Globe, Calendar, Telescope } from "lucide-react"

interface ExoplanetNotification {
  id: string
  planetName: string
  hostStar: string
  discoveryDate: Date | string
  discoveryMethod: string
  distance: number
  radius: number
  isHabitable: boolean
  source: string
}

export function ExoplanetNotifications() {
  const [notifications, setNotifications] = useState<ExoplanetNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentDiscoveries = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/nasa-exoplanets/recent")

        if (!response.ok) {
          throw new Error("Failed to fetch recent discoveries")
        }

        const data = await response.json()

        // Convert discovery dates to Date objects
        const notificationsWithDates = data.notifications.map((n: any) => ({
          ...n,
          discoveryDate: new Date(n.discoveryDate),
        }))

        setNotifications(notificationsWithDates.slice(0, 10)) // Show top 10
        setUnreadCount(Math.min(notificationsWithDates.length, 10))
      } catch (error) {
        console.error("[v0] Failed to load recent discoveries:", error)
        // Keep empty state on error
        setNotifications([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentDiscoveries()

    // Refresh every 5 minutes
    const interval = setInterval(fetchRecentDiscoveries, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      Kepler: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      TESS: "bg-green-500/20 text-green-300 border-green-500/30",
      K2: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      JWST: "bg-accent/20 text-accent border-accent/30",
      Other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    }
    return colors[source] || colors.Other
  }

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - dateObj.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return dateObj.toLocaleDateString()
  }

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Notification Bell Button */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) markAllAsRead()
        }}
        className="relative h-14 w-14 rounded-full glow-effect bg-accent hover:bg-accent/80 shadow-lg"
        size="icon"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-white p-0 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-96 max-h-[600px] overflow-hidden glow-effect border-accent/50 animate-slide-in-right">
          <CardHeader className="border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-accent">
                  <Sparkles className="h-5 w-5 mr-2" />
                  New Discoveries
                </CardTitle>
                <CardDescription>Recent exoplanet detections from NASA missions</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading recent discoveries...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Telescope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No new discoveries yet</p>
                <p className="text-sm mt-2">Check back later for updates from NASA missions</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-accent/5 transition-colors relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                      onClick={() => clearNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between pr-8">
                        <div>
                          <h4 className="font-semibold text-accent glow-text">{notification.planetName}</h4>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Globe className="h-3 w-3 mr-1" />
                            Orbiting {notification.hostStar}
                          </p>
                        </div>
                        <Badge className={getSourceColor(notification.source)} variant="outline">
                          {notification.source}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(notification.discoveryDate)}
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-accent">
                            {notification.distance > 0 ? `${notification.distance.toFixed(1)} ly` : "Unknown"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {notification.discoveryMethod}
                        </Badge>
                        {notification.radius > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {notification.radius.toFixed(2)} R⊕
                          </Badge>
                        )}
                        {notification.isHabitable && (
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            Potentially Habitable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {notifications.length > 0 && (
            <div className="border-t border-border p-3 bg-card/80 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-accent hover:text-accent/80"
                onClick={() => setNotifications([])}
              >
                Clear All Notifications
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
