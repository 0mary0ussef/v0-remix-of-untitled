import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// NASA Exoplanet Archive TAP service endpoint
const NASA_TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

interface NASAExoplanetRow {
  pl_name: string
  hostname: string
  sy_dist: number | null
  pl_orbper: number | null
  pl_rade: number | null
  pl_bmasse: number | null
  discoverymethod: string
  disc_year: number | null
  pl_eqt: number | null
  st_teff: number | null
  st_rad: number | null
  st_mass: number | null
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "100")
    const search = searchParams.get("search") || ""
    const method = searchParams.get("method") || ""

    const whereConditions = ["default_flag = 1"]

    // Add search filter if provided (escape single quotes to prevent SQL injection)
    if (search) {
      const escapedSearch = search.replace(/'/g, "''")
      whereConditions.push(`(pl_name LIKE '%${escapedSearch}%' OR hostname LIKE '%${escapedSearch}%')`)
    }

    // Add discovery method filter if provided
    if (method && method !== "All methods") {
      const escapedMethod = method.replace(/'/g, "''")
      whereConditions.push(`discoverymethod = '${escapedMethod}'`)
    }

    // Build ADQL query for NASA Exoplanet Archive
    const adqlQuery = `
      SELECT TOP ${limit}
        pl_name, 
        hostname, 
        sy_dist, 
        pl_orbper, 
        pl_rade, 
        pl_bmasse, 
        discoverymethod, 
        disc_year,
        pl_eqt,
        st_teff,
        st_rad,
        st_mass
      FROM ps
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY disc_year DESC, pl_name ASC
    `

    // Make request to NASA TAP service
    const params = new URLSearchParams({
      query: adqlQuery,
      format: "json",
    })

    const response = await fetch(`${NASA_TAP_URL}?${params}`, {
      headers: {
        Accept: "application/json",
      },
      // Cache for 1 hour to reduce API calls
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] NASA API Error Response:", errorText)
      throw new Error(`NASA API returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform NASA data to our format
    const exoplanets = data.map((row: NASAExoplanetRow) => ({
      name: row.pl_name,
      hostStar: row.hostname,
      distance: row.sy_dist, // in light years
      orbitalPeriod: row.pl_orbper, // in days
      radius: row.pl_rade, // in Earth radii
      mass: row.pl_bmasse, // in Earth masses
      discoveryMethod: row.discoverymethod,
      discoveryYear: row.disc_year,
      equilibriumTemp: row.pl_eqt, // in Kelvin
      stellarTemp: row.st_teff, // in Kelvin
      stellarRadius: row.st_rad, // in Solar radii
      stellarMass: row.st_mass, // in Solar masses
    }))

    // Get statistics
    const statistics = {
      total: exoplanets.length,
      recentDiscoveries: exoplanets.filter(
        (p: any) => p.discoveryYear && p.discoveryYear >= new Date().getFullYear() - 1,
      ).length,
    }

    return NextResponse.json({
      exoplanets,
      total: exoplanets.length,
      query: search || "all",
      statistics,
    })
  } catch (error) {
    console.error("[v0] NASA API Error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch exoplanet data from NASA",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
