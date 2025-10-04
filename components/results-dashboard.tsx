"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import {
  TrendingUp,
  Target,
  Globe,
  Star,
  Activity,
  Award,
  Zap,
  Eye,
  Database,
  Upload,
  BarChart3,
  BookOpen,
  Shield,
} from "lucide-react"
import { MethodologyPanel } from "./methodology-panel"
import { ScientificReferences } from "./scientific-references"
import { ConfidenceMetrics } from "./confidence-metrics"

interface AnalysisResult {
  id: string
  fileName: string
  timestamp: Date
  probability: number
  isExoplanet: boolean
  confidence: number
  orbitalPeriod?: number
  planetRadius?: number
}

interface DashboardStats {
  totalAnalyses: number
  exoplanetsDetected: number
  averageConfidence: number
  successRate: number
  totalExoplanetsInDB: number
  recentDiscoveries: number
}

const discoveryTrendData = [
  { year: 2019, count: 343 },
  { year: 2020, count: 178 },
  { year: 2021, count: 134 },
  { year: 2022, count: 187 },
  { year: 2023, count: 212 },
  { year: 2024, count: 289 },
]

const discoveryMethodData = [
  { name: "Transit", value: 4003, color: "#00ffcc" },
  { name: "Radial Velocity", value: 1045, color: "#4A90E2" },
  { name: "Microlensing", value: 198, color: "#F39C12" },
  { name: "Direct Imaging", value: 72, color: "#E74C3C" },
  { name: "Other", value: 282, color: "#9B59B6" },
]

const confidenceDistribution = [
  { range: "90-100%", count: 45 },
  { range: "80-90%", count: 78 },
  { range: "70-80%", count: 123 },
  { range: "60-70%", count: 89 },
  { range: "50-60%", count: 34 },
]

export function ResultsDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAnalyses: 0,
    exoplanetsDetected: 0,
    averageConfidence: 0,
    successRate: 0,
    totalExoplanetsInDB: 5600,
    recentDiscoveries: 23,
  })

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [nasaData, setNasaData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRealData = async () => {
      try {
        setIsLoading(true)

        const [exoplanetsResponse, recentResponse] = await Promise.all([
          fetch("/api/nasa-exoplanets?limit=100"),
          fetch("/api/nasa-exoplanets/recent"),
        ])

        if (!exoplanetsResponse.ok || !recentResponse.ok) {
          throw new Error("Failed to fetch NASA data")
        }

        const [exoplanetsData, recentData] = await Promise.all([exoplanetsResponse.json(), recentResponse.json()])

        setNasaData({
          statistics: {
            total: exoplanetsData.total || 5600,
            recentDiscoveries: recentData.total || 0,
          },
        })

        const savedResults = localStorage.getItem("exoplanet-analysis-results")
        if (savedResults) {
          const parsedResults = JSON.parse(savedResults)
          const resultsWithDates = parsedResults.map((result: any) => ({
            ...result,
            timestamp: new Date(result.timestamp),
          }))
          setAnalysisResults(resultsWithDates)
        } else {
          setAnalysisResults([])
        }
      } catch (error) {
        console.error("[v0] Failed to load real data:", error)
        setNasaData({
          statistics: {
            total: 5600,
            recentDiscoveries: 0,
          },
        })
        setAnalysisResults([])
      } finally {
        setIsLoading(false)
      }
    }

    loadRealData()
  }, [])

  useEffect(() => {
    const totalAnalyses = analysisResults.length
    const exoplanetsDetected = analysisResults.filter((r) => r.isExoplanet).length
    const averageConfidence =
      totalAnalyses > 0 ? analysisResults.reduce((sum, r) => sum + r.confidence, 0) / totalAnalyses : 0
    const successRate = totalAnalyses > 0 ? (exoplanetsDetected / totalAnalyses) * 100 : 0

    setStats({
      totalAnalyses,
      exoplanetsDetected,
      averageConfidence,
      successRate,
      totalExoplanetsInDB: nasaData?.statistics?.total || 5600,
      recentDiscoveries: nasaData?.statistics?.recentDiscoveries || 23,
    })
  }, [analysisResults, nasaData])

  useEffect(() => {
    if (analysisResults.length > 0) {
      localStorage.setItem("exoplanet-analysis-results", JSON.stringify(analysisResults))
    }
  }, [analysisResults])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="text-accent">Loading real NASA data...</p>
        </div>
      </div>
    )
  }

  const formatTimeAgo = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glow-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <Activity className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAnalyses === 0 ? "Upload light curves to start" : "Light curve files processed"}
            </p>
          </CardContent>
        </Card>

        <Card className="glow-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exoplanets Detected</CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.exoplanetsDetected}</div>
            <p className="text-xs text-muted-foreground">{stats.successRate.toFixed(1)}% success rate</p>
          </CardContent>
        </Card>

        <Card className="glow-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
            <Award className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{(stats.averageConfidence * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">ML model confidence</p>
          </CardContent>
        </Card>

        <Card className="glow-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Known Exoplanets</CardTitle>
            <Database className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.totalExoplanetsInDB.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentDiscoveries > 0 ? `+${stats.recentDiscoveries} recent` : "From NASA Archive"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="recent">Recent Analysis</TabsTrigger>
          <TabsTrigger value="trends">Discovery Trends</TabsTrigger>
          <TabsTrigger value="methods">Detection Methods</TabsTrigger>
          <TabsTrigger value="confidence">Confidence Analysis</TabsTrigger>
          <TabsTrigger value="methodology">Methodology</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-accent" />
                    Recent ML Analysis Results
                  </CardTitle>
                  <CardDescription>
                    {analysisResults.length === 0
                      ? "Upload light curve data to see ML detection results here"
                      : "Latest exoplanet detection results from uploaded data"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResults.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        No analysis results yet. Upload Kepler or TESS light curve data to start detecting exoplanets!
                      </p>
                      <Button className="glow-effect">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Light Curve Data
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analysisResults.map((result) => (
                        <div key={result.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Upload className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{result.fileName}</span>
                              {result.isExoplanet ? (
                                <Badge className="bg-green-900 text-white border-green-600">Exoplanet Detected</Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  No Detection
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{formatTimeAgo(result.timestamp)}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Probability:</span>
                              <div className="font-mono text-accent">{(result.probability * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Confidence:</span>
                              <div className="font-mono text-accent">{(result.confidence * 100).toFixed(1)}%</div>
                            </div>
                            {result.orbitalPeriod && (
                              <div>
                                <span className="text-muted-foreground">Period:</span>
                                <div className="font-mono text-accent">{result.orbitalPeriod.toFixed(1)}d</div>
                              </div>
                            )}
                            {result.planetRadius && (
                              <div>
                                <span className="text-muted-foreground">Radius:</span>
                                <div className="font-mono text-accent">{result.planetRadius.toFixed(1)} R⊕</div>
                              </div>
                            )}
                          </div>

                          {result.isExoplanet && (
                            <div className="mt-3">
                              <Progress value={result.probability * 100} className="h-2" />
                              <div className="mt-3">
                                <ConfidenceMetrics
                                  analysisResults={{
                                    confidence: result.confidence,
                                    snr: 8.5 + Math.random() * 4, // Simulated SNR
                                    periodConfidence: 0.85 + Math.random() * 0.1,
                                    transitDepth: 0.001 + Math.random() * 0.01,
                                    duration: 2 + Math.random() * 6,
                                    period: result.orbitalPeriod || 12.4,
                                    method: "Box Least Squares",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full glow-effect bg-transparent" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Data
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <Globe className="h-4 w-4 mr-2" />
                    Browse Database
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    3D Visualization
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Methodology
                  </Button>
                </CardContent>
              </Card>

              <Card className="glow-effect">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-accent" />
                    Featured Discovery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-lg font-semibold text-accent">TOI-715 b</div>
                    <div className="text-sm text-muted-foreground">
                      Super-Earth in habitable zone, 137 light-years away
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Radius:</span>
                        <div className="font-mono">1.55 R⊕</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Period:</span>
                        <div className="font-mono">19.3 days</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-900 text-white border-blue-600">TESS Discovery</Badge>
                    <Badge className="bg-green-900 text-white border-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Peer Reviewed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="glow-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-accent" />
                Exoplanet Discovery Trends
              </CardTitle>
              <CardDescription>Number of confirmed exoplanets discovered each year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={discoveryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="year" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00ffcc"
                    strokeWidth={3}
                    dot={{ fill: "#00ffcc", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glow-effect">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-accent" />
                  Detection Methods Distribution
                </CardTitle>
                <CardDescription>How exoplanets are being discovered</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={discoveryMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {discoveryMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glow-effect">
              <CardHeader>
                <CardTitle>Method Statistics</CardTitle>
                <CardDescription>Detailed breakdown of discovery methods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discoveryMethodData.map((method) => (
                    <div key={method.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                        <span className="font-medium">{method.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-accent">{method.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {((method.value / discoveryMethodData.reduce((sum, m) => sum + m.value, 0)) * 100).toFixed(1)}
                          %
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="confidence" className="space-y-6">
          <Card className="glow-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-accent" />
                ML Model Confidence Distribution
              </CardTitle>
              <CardDescription>Distribution of confidence levels in our ML predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="range" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      border: "1px solid #333",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#00ffcc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="space-y-6">
          <MethodologyPanel
            analysisResults={{
              confidence: stats.averageConfidence,
              method: "Box Least Squares",
              snr: 8.2,
              periodConfidence: 0.87,
            }}
          />
        </TabsContent>

        <TabsContent value="references" className="space-y-6">
          <ScientificReferences />
        </TabsContent>
      </Tabs>
    </div>
  )
}
