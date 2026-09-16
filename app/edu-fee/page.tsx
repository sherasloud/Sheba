"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

const institutions = {
  schools: [
    {
      id: 0, // Assign a unique ID, 0 for now, assuming it will be handled or is a placeholder
      name: "Bangladesh Universal & Dreamers School",
      logo: "/images/educational-institution-logo.png", // Using a generic educational institution logo
    },
    {
      id: 1,
      name: "Dhanmondi Govt. Boys High School",
      logo: "/images/dhanmondi-govt-boys-school-logo.jpeg",
    },
    {
      id: 2,
      name: "Uttara Girls School",
      logo: "/images/uttara-girls-school-logo.jpeg",
    },
    {
      id: 3,
      name: "Holy Cross Girls School",
      logo: "/images/holy-cross-girls-school-logo.png",
    },
    {
      id: 4,
      name: "St. Joseph School",
      logo: "/images/st-joseph-school-logo.png",
    },
    {
      id: 5,
      name: "Viqarunnisa Noon School",
      logo: "/images/viqarunnisa-noon-school-logo.jpeg",
    },
    {
      id: 6,
      name: "Motijheel Model School",
      logo: "/images/motijheel-model-school-logo.png",
    },
    {
      id: 7,
      name: "Willes Little Flower School",
      logo: "/images/willes-little-flower-school-logo.jpeg",
    },
    {
      id: 8,
      name: "Maple Leaf International School",
      logo: "/images/maple-leaf-international-school-logo.png",
    },
    {
      id: 9,
      name: "Mastermind School",
      logo: "/images/mastermind-school-logo.jpeg",
    },
    {
      id: 10,
      name: "Sunnydale School",
      logo: "/images/sunnydale-school-logo.png",
    },
    {
      id: 11,
      name: "Scholastica School",
      logo: "/images/scholastica-school-logo.png",
    },
    {
      id: 12,
      name: "Udayan School",
      logo: "/images/udayan-school-logo.png",
    },
  ],
  colleges: [
    {
      id: 13,
      name: "Notre Dame College",
      logo: "/images/notre-dame-college-logo.avif",
    },
    {
      id: 14,
      name: "Dhaka College",
      logo: "/images/dhaka-college-logo.png",
    },
    {
      id: 15,
      name: "Government Science College",
      logo: "/images/government-science-college-logo.jpeg",
    },
    {
      id: 16,
      name: "Milestone College",
      logo: "/images/milestone-college-logo.jpeg",
    },
    {
      id: 17,
      name: "Rajuk Uttara Model College",
      logo: "/images/rajuk-uttara-model-college-logo.png",
    },
    {
      id: 18,
      name: "Dhaka Residential Model College",
      logo: "/images/dhaka-residential-model-college-logo.png",
    },
    {
      id: 19,
      name: "BAF Shaheen College",
      logo: "/images/baf-shaheen-college-logo.jpeg",
    },
    {
      id: 20,
      name: "Cambrian College",
      logo: "/images/cambrian-college-logo.png",
    },
    {
      id: 21,
      name: "Siddheswari Girls College",
      logo: "/images/siddheswari-girls-college-logo.jpeg",
    },
    {
      id: 22,
      name: "Pabna Girls Cadet College",
      logo: "/images/pabna-girls-cadet-college-logo.jpeg",
    },
  ],
  universities: [
    {
      id: 23,
      name: "BUET",
      logo: "/images/buet-logo.png",
    },
    {
      id: 24,
      name: "Dhaka University",
      logo: "/images/dhaka-university-official-logo.jpeg",
    },
    {
      id: 25,
      name: "RUET",
      logo: "/images/ruet-new-logo.png",
    },
    {
      id: 26,
      name: "CUET",
      logo: "/images/cuet-new-logo.jpeg",
    },
    {
      id: 27,
      name: "KUET",
      logo: "/images/kuet-logo.jpeg",
    },
    {
      id: 28,
      name: "DUET",
      logo: "/images/duet-official-logo.png",
    },
    {
      id: 29,
      name: "University of Rajshahi",
      logo: "/images/university-of-rajshahi-logo.png",
    },
    {
      id: 30,
      name: "Jahangirnagar University",
      logo: "/images/jahangirnagar-logo.webp",
    },
    {
      id: 31,
      name: "East West University",
      logo: "/images/east-west-university-logo.png",
    },
    {
      id: 32,
      name: "Daffodil International University",
      logo: "/images/daffodil-logo.png",
    },
    {
      id: 33,
      name: "Islamic University",
      logo: "/images/islamic-university-logo.jpeg",
    },
    {
      id: 34,
      name: "Northern University",
      logo: "/images/northern-university-logo.png",
    },
    {
      id: 35,
      name: "Barisal University",
      logo: "/images/barisal-university-logo.jpeg",
    },
  ],
}

export default function EduFeePage() {
  const [selectedCategory, setSelectedCategory] = useState("schools")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const filteredInstitutions = institutions[selectedCategory].filter((institution) =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInstitutionSelect = (institution) => {
    // Store institution data as JSON string
    localStorage.setItem(
      "selectedInstitution",
      JSON.stringify({
        name: institution.name,
        type: selectedCategory,
        logo: institution.logo,
      }),
    )
    router.push("/edu-fee/student-id")
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/home" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Education Fee</div>
      </div>

      {/* Category tabs */}
      <div className="flex bg-gray-100">
        {Object.keys(institutions).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`flex-1 py-3 px-4 text-center font-medium capitalize ${
              selectedCategory === category ? "bg-white text-[#29a9eb] border-b-2 border-[#29a9eb]" : "text-gray-600"
            }`}
          >
            {/* Corrected: Display "Universities" for the universities tab */}
            {category === "universities" ? "Universities" : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="p-4 bg-gray-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${selectedCategory}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29a9eb] focus:border-transparent"
          />
        </div>
      </div>

      {/* Institution list */}
      <div className="flex-1 overflow-y-auto">
        {filteredInstitutions.map((institution) => (
          <div
            key={institution.id}
            onClick={() => handleInstitutionSelect(institution)}
            className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
          >
            <div className="w-12 h-12 mr-4 flex-shrink-0">
              <Image
                src={institution.logo || "/placeholder.svg"}
                alt={institution.name}
                width={48}
                height={48}
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-800">{institution.name}</h3>
              <p className="text-sm text-gray-500 capitalize">
                {/* Keep singular for individual institution type display */}
                {selectedCategory === "universities" ? "university" : selectedCategory.slice(0, -1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
