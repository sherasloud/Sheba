"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function DonatePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [visibleCount, setVisibleCount] = useState(15)
  const [charities, setCharities] = useState<Array<{ id: number; name: string; number?: string }>>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load charities from database
  useEffect(() => {
    loadCharities()
  }, [])

  const loadCharities = async () => {
    try {
      const response = await fetch('/api/donation-recipients')
      if (response.ok) {
        const data = await response.json()
        setCharities(data.recipients || [])
      }
    } catch (error) {
      console.error("[v0] Failed to load charities:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to get logo for charity - using real charity logos
  const getCharityLogo = (charityName: string) => {
    // Major organizations with real logos from Facebook/official sources
    const logoMap: { [key: string]: string } = {
      "UNICEF Bangladesh": "/images/unicef-bangladesh-logo.png",
      "SOS Children's Villages": "/images/charity-logos/sos-childrens-villages-official-logo.png",
      "Save The Children": "/images/charity-logos/save-the-children-official-logo.png",
      "Oxfam Bangladesh": "/images/charity-logos/oxfam-real-logo.jpeg",
      "World Vision Bangladesh": "/images/charity-logos/world-vision-official-logo.jpeg",
      "ActionAid Bangladesh": "/images/charity-logos/actionaid-real-logo.jpeg",
      "Islamic Relief Bangladesh": "/images/charity-logos/islamic-relief-real-logo.jpeg",
      "Plan International Bangladesh": "/images/charity-logos/plan-international-real-logo.jpeg",
      "Grameen Foundation": "/images/charity-logos/grameen-foundation-real-logo.jpeg",
      "CARE Bangladesh": "/images/charity-logos/care-official-logo.png",
      "Concern Worldwide": "/images/charity-logos/concern-worldwide-official-logo.jpeg",
      "Jaago Foundation": "/images/jaago-foundation-logo.jpeg",
      "Bidyanondo Foundation": "/images/charity-logos/bidyanondo-foundation-official-logo.jpeg",
      "Friendship NGO": "/images/charity-logos/friendship-ngo-official-logo.jpeg",
      "WaterAid Bangladesh": "/images/charity-logos/wateraid-real-logo.jpeg",
      "Bangladesh Red Crescent Society": "/images/charity-logos/bangladesh-red-crescent-official-logo.jpeg",
      "Caritas Bangladesh": "/images/charity-logos/caritas-bangladesh-official-logo.jpeg",
      "Médecins Sans Frontières (MSF)": "/images/charity-logos/msf-real-logo.jpeg",
      "Doctors Without Borders": "/images/charity-logos/msf-real-logo.jpeg",
      "Habitat for Humanity Bangladesh": "/images/charity-logos/habitat-for-humanity-bangladesh-official-logo.jpeg",
      "Teach for Bangladesh": "/images/charity-logos/teach-for-bangladesh-official-logo.jpeg",
    }

    // Return real logo if available
    if (logoMap[charityName]) {
      return logoMap[charityName]
    }

    // For organizations without specific logos, create better placeholders
    const getLogoColor = (name: string) => {
      if (name.includes("Children") || name.includes("Child") || name.includes("Shishu")) return "e74c3c"
      if (name.includes("Women") || name.includes("Nari") || name.includes("Mahila")) return "e91e63"
      if (name.includes("Health") || name.includes("Medical") || name.includes("Hospital") || name.includes("Swasthya"))
        return "1abc9c"
      if (
        name.includes("Education") ||
        name.includes("School") ||
        name.includes("University") ||
        name.includes("Shikkha")
      )
        return "3498db"
      if (
        name.includes("Environment") ||
        name.includes("Green") ||
        name.includes("Climate") ||
        name.includes("Poribesh")
      )
        return "27ae60"
      if (
        name.includes("Development") ||
        name.includes("Rural") ||
        name.includes("Community") ||
        name.includes("Unnayan")
      )
        return "f39c12"
      if (name.includes("Relief") || name.includes("Emergency") || name.includes("Disaster")) return "9b59b6"
      if (name.includes("International") || name.includes("World")) return "2980b9"
      if (name.includes("Foundation") || name.includes("Trust")) return "34495e"
      if (name.includes("Welfare") || name.includes("Kallyan")) return "16a085"
      return "29a9eb"
    }

    // Generate professional initials
    const words = charityName
      .split(" ")
      .filter((word) => !["for", "of", "and", "the", "in", "Bangladesh", "International"].includes(word))

    const initials = words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase()

    const color = getLogoColor(charityName)

    return `https://via.placeholder.com/40x40/${color}/ffffff?text=${initials}`
  }



  // Filter charities based on search query
  const filteredCharities = charities.filter((charity) =>
    charity.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Load more charities
  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 15, filteredCharities.length))
  }

  // Handle donate button click with proper functionality
  const handleDonate = (charityName: string) => {
    // Find the charity object to get the number
    const charity = charities.find(c => c.name === charityName)
    
    // Build the payload we actually need later
    const payload = {
      name: charityName,
      logo: getCharityLogo(charityName),
      number: charity?.number || "",
    }

    localStorage.setItem("selectedCharity", JSON.stringify(payload))

    // Navigate (no full reload)
    router.push(`/donate/amount?charity=${encodeURIComponent(charityName)}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
        <p className="mt-4 text-gray-600">Loading donation recipients...</p>
      </div>
    )
  }

  if (charities.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="bg-[#29a9eb] p-4 text-white">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl font-bold">Donate</h1>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No donation recipients available yet. Please contact admin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#29a9eb] p-4 text-white">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold">Donate</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search organizations..."
            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>

        {/* Charity list - with real logos */}
        <div className="space-y-2">
          {filteredCharities.slice(0, visibleCount).map((charity) => (
            <div key={charity.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Charity Logo - Real Official Logos */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    <Image
                      src={getCharityLogo(charity.name) || "/placeholder.svg"}
                      alt={`${charity.name} logo`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        const initials = charity.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()
                        target.src = `https://via.placeholder.com/48x48/29a9eb/ffffff?text=${initials}`
                      }}
                    />
                  </div>
                  {/* Charity Name */}
                  <div>
                    <h3 className="font-medium text-gray-800">{charity.name}</h3>
                    <p className="text-xs text-gray-500">✓ Verified Organization</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDonate(charity.name)}
                  className="bg-[#29a9eb] hover:bg-[#2196d3] text-white py-2 px-5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load more button - only show if there are more to load */}
        {visibleCount < filteredCharities.length && (
          <div className="mt-6 text-center">
            <button onClick={loadMore} className="bg-[#29a9eb] text-white font-medium py-3 px-6 rounded-lg w-full">
              Load More Organizations (15 more)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
