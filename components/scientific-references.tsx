"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, BookOpen, Users, Award } from "lucide-react"

export function ScientificReferences() {
  const references = [
    {
      title: "A box-fitting algorithm in the search for periodic transits",
      authors: "Kovács, G., Zucker, S., & Mazeh, T.",
      journal: "Astronomy & Astrophysics",
      year: "2002",
      doi: "10.1051/0004-6361:20020452",
      url: "https://doi.org/10.1051/0004-6361:20020452",
      description: "Foundational BLS algorithm for transit detection",
      category: "Algorithm",
    },
    {
      title: "Transiting Exoplanet Survey Satellite (TESS)",
      authors: "Ricker, G. R., et al.",
      journal: "Journal of Astronomical Telescopes",
      year: "2015",
      doi: "10.1117/1.JATIS.1.1.014003",
      url: "https://doi.org/10.1117/1.JATIS.1.1.014003",
      description: "TESS mission overview and methodology",
      category: "Mission",
    },
    {
      title: "The NASA Exoplanet Archive: Data and Tools",
      authors: "Akeson, R. L., et al.",
      journal: "Publications of the Astronomical Society",
      year: "2013",
      doi: "10.1086/672273",
      url: "https://doi.org/10.1086/672273",
      description: "NASA Exoplanet Archive data standards",
      category: "Data",
    },
    {
      title: "Planetary Candidates Observed by Kepler",
      authors: "Borucki, W. J., et al.",
      journal: "The Astrophysical Journal",
      year: "2011",
      doi: "10.1088/0004-637X/736/1/19",
      url: "https://doi.org/10.1088/0004-637X/736/1/19",
      description: "Kepler mission exoplanet discoveries",
      category: "Discovery",
    },
    {
      title: "A Framework for Prioritizing the TESS Planetary Candidates",
      authors: "Guerrero, N. M., et al.",
      journal: "The Astrophysical Journal Supplement",
      year: "2021",
      doi: "10.3847/1538-4365/ac0365",
      url: "https://doi.org/10.3847/1538-4365/ac0365",
      description: "TESS candidate validation procedures",
      category: "Validation",
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Algorithm":
        return "bg-blue-100 text-blue-800"
      case "Mission":
        return "bg-green-100 text-green-800"
      case "Data":
        return "bg-purple-100 text-purple-800"
      case "Discovery":
        return "bg-orange-100 text-orange-800"
      case "Validation":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Scientific References
        </CardTitle>
        <CardDescription>Peer-reviewed research and methodologies underlying our detection algorithms</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {references.map((ref, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h4 className="font-medium text-sm leading-tight">{ref.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{ref.authors}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Award className="h-3 w-3" />
                    <span>
                      {ref.journal} ({ref.year})
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(ref.category)} variant="secondary">
                    {ref.category}
                  </Badge>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-accent" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{ref.description}</p>
              <div className="text-xs text-muted-foreground">
                DOI:{" "}
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:text-accent transition-colors"
                >
                  {ref.doi}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">Data Attribution</h4>
          <p className="text-xs text-muted-foreground">
            This research has made use of the{" "}
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              NASA Exoplanet Archive
            </a>
            , which is operated by the California Institute of Technology, under contract with the National Aeronautics
            and Space Administration under the Exoplanet Exploration Program.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
