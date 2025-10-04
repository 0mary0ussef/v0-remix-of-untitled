"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, ExternalLink, FileText, Telescope, Satellite, Rocket } from "lucide-react"

export function NASADatasetsInfo() {
  const datasets = [
    {
      id: "kepler",
      name: "Kepler Objects of Interest (KOI)",
      icon: Telescope,
      description: "NASA's Kepler mission discovered thousands of exoplanet candidates using the transit method.",
      classificationColumn: "Disposition Using Kepler Data",
      stats: {
        total: "4,696 KOIs",
        confirmed: "2,662 planets",
        candidates: "2,034 candidates",
      },
      url: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative",
      color: "blue",
      mission: "Kepler Space Telescope (2009-2018)",
    },
    {
      id: "tess",
      name: "TESS Objects of Interest (TOI)",
      icon: Satellite,
      description:
        "TESS (Transiting Exoplanet Survey Satellite) surveys the entire sky for planets around nearby stars.",
      classificationColumn: "TFOPWG Disposition",
      stats: {
        total: "7,000+ TOIs",
        confirmed: "400+ planets",
        candidates: "6,600+ candidates",
      },
      url: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI",
      color: "green",
      mission: "TESS Mission (2018-Present)",
    },
    {
      id: "k2",
      name: "K2 Planets and Candidates",
      icon: Rocket,
      description: "K2 extended Kepler's mission, discovering planets in different regions of the sky.",
      classificationColumn: "Archive Disposition",
      stats: {
        total: "1,000+ K2 objects",
        confirmed: "500+ planets",
        candidates: "500+ candidates",
      },
      url: "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=k2candidates",
      color: "purple",
      mission: "K2 Mission (2014-2018)",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      green: "bg-green-500/20 text-green-300 border-green-500/30",
      purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <div className="space-y-6">
      <Card className="glow-effect border-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Database className="h-6 w-6 mr-3 text-accent" />
            NASA Exoplanet Detection Datasets
          </CardTitle>
          <CardDescription className="text-base">
            Official NASA datasets used in this project for exoplanet detection and classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="kepler" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {datasets.map((dataset) => (
                <TabsTrigger key={dataset.id} value={dataset.id} className="flex items-center gap-2">
                  <dataset.icon className="h-4 w-4" />
                  {dataset.id.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>

            {datasets.map((dataset) => (
              <TabsContent key={dataset.id} value={dataset.id} className="space-y-4 mt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-accent glow-text">{dataset.name}</h3>
                    <p className="text-muted-foreground">{dataset.description}</p>
                    <Badge className={getColorClasses(dataset.color)} variant="outline">
                      {dataset.mission}
                    </Badge>
                  </div>
                  <dataset.icon className="h-12 w-12 text-accent opacity-50" />
                </div>

                <Card className="bg-card/50 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Classification Column
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <code className="text-accent font-mono text-sm bg-background/50 px-3 py-2 rounded block">
                      {dataset.classificationColumn}
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      This column is used for classification labels in our machine learning pipeline
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-card/30 border-accent/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-accent">{dataset.stats.total}</div>
                      <div className="text-xs text-muted-foreground mt-1">Total Objects</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/30 border-accent/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{dataset.stats.confirmed}</div>
                      <div className="text-xs text-muted-foreground mt-1">Confirmed</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/30 border-accent/10">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{dataset.stats.candidates}</div>
                      <div className="text-xs text-muted-foreground mt-1">Candidates</div>
                    </CardContent>
                  </Card>
                </div>

                <Button className="w-full glow-effect bg-transparent" variant="outline" asChild>
                  <a href={dataset.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View {dataset.id.toUpperCase()} Dataset on NASA Archive
                  </a>
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card className="glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-accent" />
            Research & Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
            <div>
              <h4 className="font-medium">Exoplanet Detection Using Machine Learning</h4>
              <p className="text-xs text-muted-foreground">Best practices in preprocessing & classification</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a href="https://arxiv.org/abs/1806.03944" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
            <div>
              <h4 className="font-medium">Ensemble-Based Machine Learning Algorithms</h4>
              <p className="text-xs text-muted-foreground">Ensemble techniques for higher accuracy</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a
                href="https://iopscience.iop.org/article/10.3847/1538-3881/aae778"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
            <div>
              <h4 className="font-medium">James Webb Space Telescope (JWST)</h4>
              <p className="text-xs text-muted-foreground">Latest exoplanet observations & discoveries</p>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a href="https://webb.nasa.gov/content/science/planets.html" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NASA Disclaimer */}
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-yellow-400">⚠️ NASA Disclaimer:</strong> NASA does not endorse any non-U.S.
            Government entity and is not responsible for information contained on non-U.S. Government websites. For
            non-U.S. Government websites, participants must comply with any data use parameters of that specific
            website.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
