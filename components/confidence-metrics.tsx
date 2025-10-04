"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ConfidenceMetricsProps {
  analysisResults: {
    confidence: number
    snr: number
    periodConfidence: number
    transitDepth: number
    duration: number
    period: number
    method: string
  }
}

export function ConfidenceMetrics({ analysisResults }: ConfidenceMetricsProps) {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { level: "Very High", color: "text-green-600", icon: CheckCircle }
    if (confidence >= 0.7) return { level: "High", color: "text-blue-600", icon: TrendingUp }
    if (confidence >= 0.5) return { level: "Moderate", color: "text-yellow-600", icon: Info }
    return { level: "Low", color: "text-red-600", icon: AlertTriangle }
  }

  const confidenceInfo = getConfidenceLevel(analysisResults.confidence)
  const Icon = confidenceInfo.icon

  const getSignificanceLevel = (snr: number) => {
    if (snr >= 10) return "Highly Significant (>10σ)"
    if (snr >= 7.1) return "Significant (>7.1σ)"
    if (snr >= 5) return "Marginal (>5σ)"
    return "Below Threshold (<5σ)"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${confidenceInfo.color}`} />
          Detection Confidence
        </CardTitle>
        <CardDescription>Statistical confidence and reliability metrics for the detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Confidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Confidence</span>
            <div className="flex items-center gap-2">
              <Badge className={confidenceInfo.color} variant="outline">
                {confidenceInfo.level}
              </Badge>
              <span className="text-sm font-mono">{(analysisResults.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
          <Progress value={analysisResults.confidence * 100} className="h-2" />
        </div>

        {/* Signal-to-Noise Ratio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Signal-to-Noise Ratio</span>
            <div className="flex items-center gap-2">
              <Badge variant={analysisResults.snr >= 7.1 ? "default" : "secondary"}>
                {getSignificanceLevel(analysisResults.snr)}
              </Badge>
              <span className="text-sm font-mono">{analysisResults.snr.toFixed(1)}σ</span>
            </div>
          </div>
          <Progress value={Math.min(100, (analysisResults.snr / 15) * 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            NASA standard requires SNR ≥ 7.1σ for planet candidate classification
          </p>
        </div>

        {/* Period Confidence */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Period Determination</span>
            <div className="flex items-center gap-2">
              <Badge variant={analysisResults.periodConfidence >= 0.8 ? "default" : "secondary"}>
                {analysisResults.periodConfidence >= 0.8 ? "Reliable" : "Uncertain"}
              </Badge>
              <span className="text-sm font-mono">{(analysisResults.periodConfidence * 100).toFixed(1)}%</span>
            </div>
          </div>
          <Progress value={analysisResults.periodConfidence * 100} className="h-2" />
        </div>

        {/* Detection Parameters */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Transit Parameters</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Period:</span>
                <span className="font-mono">{analysisResults.period.toFixed(3)} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Depth:</span>
                <span className="font-mono">{(analysisResults.transitDepth * 100).toFixed(3)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-mono">{analysisResults.duration.toFixed(2)} hours</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Quality Indicators</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span>{analysisResults.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">False Positive Rate:</span>
                <span className="font-mono">&lt;{((1 - analysisResults.confidence) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validation:</span>
                <span className={analysisResults.snr >= 7.1 ? "text-green-600" : "text-yellow-600"}>
                  {analysisResults.snr >= 7.1 ? "Passed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-1">Interpretation</h4>
          <p className="text-xs text-muted-foreground">
            {analysisResults.confidence >= 0.9
              ? "This detection meets all criteria for a confirmed exoplanet candidate with very high statistical significance."
              : analysisResults.confidence >= 0.7
                ? "This detection shows strong evidence for a planetary transit but may require additional validation."
                : analysisResults.confidence >= 0.5
                  ? "This detection shows moderate evidence for a transit-like signal but requires careful follow-up analysis."
                  : "This detection is below the threshold for reliable planet candidate classification and likely represents noise or systematic effects."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
