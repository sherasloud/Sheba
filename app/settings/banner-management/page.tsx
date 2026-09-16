"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface CustomBanner {
  id: string
  title: string
  subtitle: string
  startDate: string
  endDate: string
  gradient: string
  link: string
  priority: number
}

export default function BannerManagement() {
  const [customBanners, setCustomBanners] = useState<CustomBanner[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    startDate: "",
    endDate: "",
    gradient: "from-blue-500 to-purple-600",
    link: "/cashback-offer",
    priority: 5,
  })

  useEffect(() => {
    const saved = localStorage.getItem("customBanners")
    if (saved) {
      setCustomBanners(JSON.parse(saved))
    }
  }, [])

  const saveCustomBanners = (banners: CustomBanner[]) => {
    setCustomBanners(banners)
    localStorage.setItem("customBanners", JSON.stringify(banners))
  }

  const createBanner = () => {
    if (!newBanner.title || !newBanner.subtitle || !newBanner.startDate || !newBanner.endDate) {
      alert("Please fill all fields")
      return
    }

    const banner: CustomBanner = {
      id: Date.now().toString(),
      ...newBanner,
    }

    saveCustomBanners([...customBanners, banner])
    setNewBanner({
      title: "",
      subtitle: "",
      startDate: "",
      endDate: "",
      gradient: "from-blue-500 to-purple-600",
      link: "/cashback-offer",
      priority: 5,
    })
    setShowCreateForm(false)
  }

  const deleteBanner = (id: string) => {
    if (confirm("Delete this banner?")) {
      saveCustomBanners(customBanners.filter((b) => b.id !== id))
    }
  }

  const gradientOptions = [
    { name: "Blue-Purple", value: "from-blue-500 to-purple-600" },
    { name: "Green-Blue", value: "from-green-500 to-blue-600" },
    { name: "Pink-Orange", value: "from-pink-500 to-orange-500" },
    { name: "Red-Pink", value: "from-red-500 to-pink-500" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="p-1">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Banner Management</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Create Banner Button */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full bg-[#29a9eb] text-white p-4 rounded-lg flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Create New Banner
        </button>

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800">Create New Banner</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newBanner.title}
                onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., Special Discount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={newBanner.subtitle}
                onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., Up to 50% off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newBanner.startDate}
                  onChange={(e) => setNewBanner({ ...newBanner, startDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newBanner.endDate}
                  onChange={(e) => setNewBanner({ ...newBanner, endDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Type</label>
              <select
                value={newBanner.gradient}
                onChange={(e) => setNewBanner({ ...newBanner, gradient: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {gradientOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={createBanner} className="flex-1 bg-green-600 text-white p-3 rounded-lg font-medium">
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-500 text-white p-3 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Custom Banners List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Custom Banners ({customBanners.length})</h3>

          {customBanners.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">No custom banners</div>
          ) : (
            customBanners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className={`bg-gradient-to-r ${banner.gradient} text-white p-4 rounded-lg mb-3`}>
                  <h4 className="font-bold text-lg">{banner.title}</h4>
                  <p className="text-sm opacity-90">{banner.subtitle}</p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    {banner.startDate} to {banner.endDate}
                  </span>
                  <button onClick={() => deleteBanner(banner.id)} className="text-red-600 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
