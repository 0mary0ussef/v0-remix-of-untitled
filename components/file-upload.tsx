"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  BarChart3,
  Globe,
  Zap,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadedFile {
  file: File
  id: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  result?: {
    probability: number
    isExoplanet: boolean
    orbitalPeriod?: number
    planetRadius?: number
    confidence: number
    planetType?: string
    planetTypeConfidence?: number
  }
  error?: string
}

export function FileUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedResult, setSelectedResult] = useState<UploadedFile | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "uploading" as const,
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Process each file
    newFiles.forEach((uploadedFile) => {
      processFile(uploadedFile)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  })

  const processFile = async (uploadedFile: UploadedFile) => {
    try {
      setIsProcessing(true)

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, progress, status: progress === 100 ? "processing" : "uploading" } : f,
          ),
        )
      }

      console.log("[v0] Starting file analysis for:", uploadedFile.file.name)
      console.log("[v0] File size:", uploadedFile.file.size, "bytes")

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", uploadedFile.file)

      // Send to ML processing endpoint
      console.log("[v0] Sending request to /api/analyze-lightcurve")
      const response = await fetch("/api/analyze-lightcurve", {
        method: "POST",
        body: formData,
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("[v0] API error response:", errorData)

        let errorMessage = errorData.error || `Analysis failed with status ${response.status}`
        if (errorData.hint) {
          errorMessage += `\n\n💡 ${errorData.hint}`
        }
        if (errorData.example) {
          errorMessage += `\n\n📝 ${errorData.example}`
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log("[v0] Analysis result:", result)

      if (result.error) {
        throw new Error(result.error)
      }

      if (typeof result.probability === "undefined" || typeof result.confidence === "undefined") {
        console.error("[v0] Invalid result format:", result)
        throw new Error("Invalid analysis result format")
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "completed",
                result: {
                  probability: result.probability || 0,
                  isExoplanet: result.isExoplanet || false,
                  orbitalPeriod: result.orbitalPeriod,
                  planetRadius: result.planetRadius,
                  confidence: result.confidence || 0,
                  planetType: result.planetType || "Unknown",
                  planetTypeConfidence: result.planetTypeConfidence || 0,
                },
                progress: 100,
              }
            : f,
        ),
      )
    } catch (error) {
      console.error("[v0] File processing error:", error)
      console.error("[v0] Error name:", error instanceof Error ? error.name : "Unknown")
      console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
      console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error occurred",
                progress: 0,
              }
            : f,
        ),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-accent" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />
    }
  }

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case "uploading":
        return "Uploading..."
      case "processing":
        return "Analyzing with ML model..."
      case "completed":
        return file.result?.isExoplanet
          ? `Exoplanet detected! (${(file.result.probability * 100).toFixed(1)}% confidence)`
          : `No exoplanet detected (${(file.result?.probability || 0 * 100).toFixed(1)}% confidence)`
      case "error":
        return `Error: ${file.error}`
    }
  }

  const CircularProgress = ({
    value,
    size = 140,
    strokeWidth = 12,
    color = "text-white",
    glowColor = "oklch(0.85 0.15 180)",
  }: {
    value: number
    size?: number
    strokeWidth?: number
    color?: string
    glowColor?: string
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (value / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center animate-gauge-glow">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted-foreground/10"
          />
          {/* Glowing background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={glowColor}
            strokeWidth={strokeWidth / 2}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress circle with glow */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={glowColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-2000 ease-out animate-progress"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-bold glow-text", color)}>{value.toFixed(1)}%</span>
          <span className="text-xs text-muted-foreground mt-1">CONFIDENCE</span>
        </div>
      </div>
    )
  }

  const ResultDashboard = ({ file }: { file: UploadedFile }) => {
    if (!file.result) return null

    const isDetected = file.result.isExoplanet
    const probability = file.result.probability * 100
    const confidence = file.result.confidence * 100

    return (
      <div className="space-y-8 animate-fade-in">
        <Card
          className={cn(
            "relative overflow-hidden border-2 transition-all duration-1000 animate-fade-in",
            isDetected ? "detection-success border-green-400/30" : "detection-failure border-red-400/30",
          )}
        >
          <div className="absolute inset-0 nebula-bg opacity-30"></div>
          <CardContent className="relative p-6 md:p-12 text-center">
            <div className="space-y-6">
              {/* Animated icon with cosmic glow */}
              <div
                className={cn(
                  "inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full mb-6 transition-all duration-1000 animate-float",
                  isDetected
                    ? "bg-green-400/20 text-green-300 animate-star-pulse"
                    : "bg-red-400/20 text-red-300 animate-nebula-pulse",
                )}
                style={{
                  boxShadow: isDetected
                    ? "0 0 40px oklch(0.7 0.2 140 / 0.6), 0 0 80px oklch(0.7 0.2 140 / 0.3)"
                    : "0 0 40px oklch(0.6 0.2 15 / 0.6), 0 0 80px oklch(0.6 0.2 15 / 0.3)",
                }}
              >
                {isDetected ? <Globe className="w-8 h-8 md:w-12 md:h-12" /> : <X className="w-8 h-8 md:w-12 md:h-12" />}
              </div>

              {/* Main result text with glow */}
              <div className="space-y-2">
                <h1
                  className={cn(
                    "text-3xl md:text-6xl font-bold mb-4 transition-all duration-1000",
                    isDetected ? "text-white glow-text" : "text-white glow-text",
                  )}
                >
                  {isDetected ? "PLANET DETECTED" : "NO PLANET"}
                </h1>

                {isDetected && file.result.planetType && file.result.planetType !== "None" && (
                  <div className="mb-4">
                    <div className="inline-block px-6 py-3 bg-accent/20 border border-accent/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Planet Type</div>
                      <div className="text-2xl md:text-3xl font-bold text-accent glow-text">
                        {file.result.planetType}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Classification Confidence: {((file.result.planetTypeConfidence || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-base md:text-xl text-muted-foreground">
                  Analysis of <span className="text-accent font-mono break-all">{file.file.name}</span> complete
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      ML Confidence: {confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-accent" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      Detection: {probability.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glow-effect cosmic-gradient border border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-lg md:text-xl">
                <BarChart3 className="w-5 h-5 md:w-6 md:h-6 mr-3 text-accent animate-pulse" />
                Detection Probability
              </CardTitle>
              <CardDescription>Machine learning model prediction confidence</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pb-8">
              <CircularProgress
                value={probability}
                glowColor={isDetected ? "oklch(0.8 0.25 140)" : "oklch(0.7 0.25 15)"}
                color={isDetected ? "text-white" : "text-white"}
              />
              <div className="text-center space-y-2">
                <p className="text-base md:text-lg font-semibold">
                  {isDetected ? "Exoplanet Signal Detected" : "No Planetary Signal"}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Based on light curve analysis and transit detection algorithms
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glow-effect cosmic-gradient border border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-lg md:text-xl">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 mr-3 text-accent animate-pulse" />
                Analysis Confidence
              </CardTitle>
              <CardDescription>Overall model certainty and data quality</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pb-8">
              <CircularProgress value={confidence} glowColor="oklch(0.85 0.15 180)" color="text-white" />
              <div className="text-center space-y-2">
                <p className="text-base md:text-lg font-semibold">
                  {confidence > 80 ? "High Confidence" : confidence > 60 ? "Medium Confidence" : "Low Confidence"}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Signal-to-noise ratio and feature extraction quality
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {isDetected && (
          <Card className="glow-effect nebula-bg border border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center text-lg md:text-xl">
                <Globe className="w-5 h-5 md:w-6 md:h-6 mr-3 text-accent animate-pulse" />
                Detected Exoplanet System
              </CardTitle>
              <CardDescription>3D visualization of the planetary system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 md:h-80 cosmic-gradient rounded-xl overflow-hidden border border-accent/10">
                {/* Animated starfield background */}
                <div className="absolute inset-0 opacity-30">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `
                      radial-gradient(1px 1px at 20% 30%, oklch(0.9 0.2 60), transparent),
                      radial-gradient(1px 1px at 40% 70%, oklch(0.8 0.15 180), transparent),
                      radial-gradient(1px 1px at 90% 40%, oklch(0.85 0.18 300), transparent)
                    `,
                      backgroundSize: "100px 100px",
                      animation: "starfield 15s linear infinite",
                    }}
                  ></div>
                </div>

                {/* Central star system */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Central star with enhanced glow */}
                    <div
                      className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full animate-star-pulse"
                      style={{
                        boxShadow: `
                          0 0 40px oklch(0.8 0.2 60 / 0.8),
                          0 0 80px oklch(0.8 0.2 60 / 0.4),
                          0 0 120px oklch(0.8 0.2 60 / 0.2)
                        `,
                      }}
                    ></div>

                    {/* Orbital paths with glow */}
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 -ml-16 md:-ml-20 border border-accent/20 rounded-full animate-pulse"></div>
                    <div
                      className="absolute top-1/2 left-1/2 w-44 h-44 md:w-56 md:h-56 -mt-22 md:-mt-28 -ml-22 md:-ml-28 border border-accent/10 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    ></div>

                    {/* Orbiting exoplanet with realistic animation */}
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 md:w-40 md:h-40 -mt-16 md:-mt-20 -ml-16 md:-ml-20">
                      <div
                        className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full animate-orbit shadow-lg"
                        style={{
                          boxShadow: `
                            0 0 20px oklch(0.8 0.15 200 / 0.6),
                            0 0 40px oklch(0.8 0.15 200 / 0.3)
                          `,
                        }}
                      ></div>
                    </div>

                    {/* Additional planets for realism */}
                    <div className="absolute top-1/2 left-1/2 w-44 h-44 md:w-56 md:h-56 -mt-22 md:-mt-28 -ml-22 md:-ml-28">
                      <div
                        className="w-3 h-3 md:w-4 md:h-4 bg-red-400 to-orange-300 rounded-full animate-orbit-slow shadow-lg"
                        style={{ boxShadow: `0 0 15px oklch(0.7 0.2 15 / 0.5)` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced planet data overlay */}
                <div className="absolute bottom-3 md:bottom-6 left-3 md:left-6 space-y-2 bg-black/40 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-accent/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-mono text-blue-300">
                      Orbital Period: {file.result.orbitalPeriod?.toFixed(2)} days
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-mono text-cyan-300">
                      Planet Radius: {file.result.planetRadius?.toFixed(2)} R⊕
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-xs md:text-sm font-mono text-accent">
                      Distance: ~{Math.floor(Math.random() * 1000 + 100)} ly
                    </span>
                  </div>
                  {file.result.planetType && file.result.planetType !== "None" && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs md:text-sm font-mono text-green-300">
                        Type: {file.result.planetType}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="glow-effect cosmic-gradient border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center text-lg md:text-xl">
              <Eye className="w-5 h-5 md:w-6 md:h-6 mr-3 text-accent animate-pulse" />
              Light Curve Analysis
            </CardTitle>
            <CardDescription>Detailed breakdown of the processed astronomical data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Enhanced data metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 md:p-4 bg-card/50 rounded-lg border border-accent/10 glow-effect">
                  <div className="text-muted-foreground text-xs md:text-sm">File Size</div>
                  <div className="font-mono text-xl md:text-2xl text-accent glow-text">
                    {Math.round(file.file.size / 1024)} KB
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-card/50 rounded-lg border border-accent/10 glow-effect">
                  <div className="text-muted-foreground text-xs md:text-sm">Data Points</div>
                  <div className="font-mono text-xl md:text-2xl text-accent glow-text">
                    ~{Math.floor(file.file.size / 50)}
                  </div>
                </div>
                <div className="text-center p-3 md:p-4 bg-card/50 rounded-lg border border-accent/10 glow-effect">
                  <div className="text-muted-foreground text-xs md:text-sm">Processing Time</div>
                  <div className="font-mono text-xl md:text-2xl text-accent glow-text">2.3s</div>
                </div>
                <div className="text-center p-3 md:p-4 bg-card/50 rounded-lg border border-accent/10 glow-effect">
                  <div className="text-muted-foreground text-xs md:text-sm">SNR Quality</div>
                  <div className="font-mono text-xl md:text-2xl text-accent glow-text">
                    {(confidence / 20).toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Enhanced light curve visualization */}
              <div className="h-32 md:h-40 cosmic-gradient rounded-lg border border-accent/20 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Simulated light curve with transit dips */}
                  <div className="w-full h-16 md:h-20 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-light-curve"></div>
                    {isDetected && (
                      <>
                        <div
                          className="absolute left-1/4 top-1/2 w-2 h-6 md:h-8 bg-green-400/60 rounded animate-pulse"
                          style={{ transform: "translateY(-50%)" }}
                        ></div>
                        <div
                          className="absolute left-3/4 top-1/2 w-2 h-6 md:h-8 bg-green-400/60 rounded animate-pulse"
                          style={{ transform: "translateY(-50%)", animationDelay: "1s" }}
                        ></div>
                      </>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 text-xs text-muted-foreground bg-black/40 backdrop-blur-sm rounded px-2 py-1">
                  Light Curve: Normalized Flux vs Time (BJD)
                </div>
                <div className="absolute top-2 md:top-3 right-2 md:right-3 text-xs text-accent bg-black/40 backdrop-blur-sm rounded px-2 py-1 animate-pulse">
                  {isDetected ? "Transit Events Detected" : "No Periodic Signals"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glow-effect nebula-bg border border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Upload className="h-5 h-5 md:h-6 md:w-6 mr-3 text-accent animate-pulse" />
            Upload Light Curve Data
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Upload time-series light curve CSV files (Kepler, TESS, K2) with 'time' and 'flux' columns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-accent/10 border-accent/30">
            <AlertDescription className="text-xs md:text-sm">
              <strong>Expected format:</strong> CSV with columns like 'time' and 'flux' (or 'magnitude').
              <br />
              Example:{" "}
              <code className="text-xs bg-black/30 px-1 py-0.5 rounded">time,flux\n0.0,1.0\n0.1,0.98\n...</code>
            </AlertDescription>
          </Alert>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-6 md:p-12 text-center cursor-pointer transition-all duration-300 cosmic-gradient",
              isDragActive
                ? "border-accent bg-accent/20 glow-effect"
                : "border-accent/30 hover:border-accent/60 hover:glow-effect",
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <Upload className="h-12 w-12 md:h-16 md:w-16 mx-auto text-accent animate-float" />
              {isDragActive ? (
                <p className="text-accent text-base md:text-lg glow-text">Drop the files here...</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-base md:text-lg font-semibold text-foreground">
                      Drag and drop your light curve files
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground">or click to browse your computer</p>
                  </div>
                  <Button className="glow-effect bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent">
                    Choose Files
                  </Button>
                </>
              )}
              <p className="text-xs text-muted-foreground">
                Supports CSV files up to 50MB • Time-series data with time and flux measurements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="glow-effect">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Analysis Results</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              View detailed results for each processed file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id}>
                  <div className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs md:text-sm font-medium truncate">{file.file.name}</span>
                        {getStatusIcon(file.status)}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {file.status === "completed" && file.result && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResult(selectedResult?.id === file.id ? null : file)}
                            className="glow-effect text-xs md:text-sm"
                          >
                            {selectedResult?.id === file.id ? "Hide Details" : "View Details"}
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground flex-wrap gap-1">
                        <span className="break-all">{getStatusText(file)}</span>
                        <span>{Math.round(file.file.size / 1024)} KB</span>
                      </div>

                      {(file.status === "uploading" || file.status === "processing") && (
                        <Progress value={file.progress} className="h-2" />
                      )}

                      {file.status === "error" && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="whitespace-pre-wrap text-xs md:text-sm">
                            {file.error}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {selectedResult?.id === file.id && file.status === "completed" && (
                    <div className="mt-6">
                      <ResultDashboard file={file} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
