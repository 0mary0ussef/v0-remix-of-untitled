import { NextResponse } from "next/server"

// NASA Exoplanet Archive TAP service endpoint
const NASA_TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

interface NASAExoplanetRow {
  pl_name: string
  hostname: string
  sy_dist: number | null
  pl_orbper: number | null
  pl_rade: number | null
  discoverymethod: string
  disc_year: number | null
}

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()
    const lastYear = currentYear - 1

    const adqlQuery = `
      SELECT TOP 50
        pl_name, 
        hostname, 
        sy_dist, 
        pl_orbper, 
        pl_rade, 
        discoverymethod, 
        disc_year
      FROM ps
      WHERE default_flag = 1 
        AND disc_year >= ${lastYear}
      ORDER BY disc_year DESC, pl_name ASC
    `

    const params = new URLSearchParams({
      query: adqlQuery,
      format: "json",
    })

    const response = await fetch(`${NASA_TAP_URL}?${params}`, {
      headers: {
        Accept: "application/json",
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] NASA API Error Response:", errorText)
      throw new Error(`NASA API returned ${response.status}`)
    }

    const data = await response.json()

    // Transform to notification format
    const notifications = data.map((row: NASAExoplanetRow) => ({
      id: row.pl_name,
      planetName: row.pl_name,
      hostStar: row.hostname,
      discoveryDate: row.disc_year ? `${row.disc_year}-01-01` : new Date().toISOString(),
      discoveryMethod: row.discoverymethod,
      distance: row.sy_dist || 0,
      radius: row.pl_rade || 0,
      isHabitable: row.pl_rade ? row.pl_rade >= 0.5 && row.pl_rade <= 2.0 : false,
      source: row.discoverymethod?.includes("Transit") ? "TESS" : "Other",
    }))

    return NextResponse.json({
      notifications,
      total: notifications.length,
    })
  } catch (error) {
    console.error("[v0] NASA Recent API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch recent discoveries",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
