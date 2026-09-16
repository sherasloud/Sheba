"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Edit2, MoveUp, MoveDown } from "lucide-react"

interface EditableBanner {
  id: string
  image: string
  link: string
  alt: string
  priority: number
  isActive: boolean
}

const DEFAULT_BANNERS: EditableBanner[] = [
  {
    id: "add-money-cloud-new-banner",
    image: "/images/add-money-cloud-banner-new.png",
    link: "/add-money",
    alt: "Add Money Banner",
    priority: 4,
    isActive: true,
  },
  {
    id: "send-money-updated",
    image: "/images/sheba-send-money-banner-updated.jpeg",
    link: "/send-money",
    alt: "Send Money Banner",
    priority: 3,
    isActive: true,
  },
  {
    id: "cashout-beach",
    image: "/images/sheba-cashout-banner-beach.jpeg",
    link: "/cashout",
    alt: "Cashout Banner",
    priority: 2,
    isActive: true,
  },
  {
    id: "add-money-bangla",
    image: "/images/add-money-banner-bangla.png",
    link: "/add-money",
    alt: "Add Money Banner",
    priority: 1,
    isActive: true,
  },
]

export default function EditableBannersPage() {
  const [banners, setBanners] = useState<EditableBanner[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<EditableBanner | null>(null)
  const [formData, setFormData] = useState({
    image: "",
    link: "/",
    alt: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("editableBanners")
    if (saved) {
      setBanners(JSON.parse(saved))
    } else {
      setBanners(DEFAULT_BANNERS)
      localStorage.setItem("editableBanners", JSON.stringify(DEFAULT_BANNERS))
    }
  }, [])

  const saveBanners = (newBanners: EditableBanner[]) => {
    setBanners(newBanners)
    localStorage.setItem("editableBanners", JSON.stringify(newBanners))
  }

  const createBanner = () => {
    if (!formData.image || !formData.link || !formData.alt) {
      alert("Please fill all fields")
      return
    }

    const newBanner: EditableBanner = {
      id: `banner-${Date.now()}`,
      image: formData.image,
      link: formData.link,
      alt: formData.alt,
      priority: banners.length + 1,
      isActive: true,
    }

    saveBanners([...banners, newBanner])
    setFormData({ image: "", link: "/", alt: "" })
    setShowCreateForm(false)
  }

  const updateBanner = () => {
    if (!editingBanner || !formData.image || !formData.link || !formData.alt) {
      alert("Please fill all fields")
      return
    }

    const updatedBanners = banners.map((b) =>
      b.id === editingBanner.id ? { ...b, image: formData.image, link: formData.link, alt: formData.alt } : b,
    )

    saveBanners(updatedBanners)
    setEditingBanner(null)
    setFormData({ image: "", link: "/", alt: "" })
  }

  const deleteBanner = (id: string) => {
    if (confirm("Delete this banner?")) {
      saveBanners(banners.filter((b) => b.id !== id))
    }
  }

  const toggleBanner = (id: string) => {
    const updatedBanners = banners.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    saveBanners(updatedBanners)
  }

  const moveBanner = (id: string, direction: "up" | "down") => {
    const index = banners.findIndex((b) => b.id === id)
    if (index === -1) return

    const newBanners = [...banners]
    if (direction === "up" && index > 0) {
      ;[newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]]
    } else if (direction === "down" && index < banners.length - 1) {
      ;[newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]]
    }

    // Update priorities
    newBanners.forEach((banner, idx) => {
      banner.priority = newBanners.length - idx
    })

    saveBanners(newBanners)
  }

  const startEdit = (banner: EditableBanner) => {
    setEditingBanner(banner)
    setFormData({
      image: banner.image,
      link: banner.link,
      alt: banner.alt,
    })
    setShowCreateForm(false)
  }

  const linkOptions = [
    { value: "/send-money", label: "Send Money" },
    { value: "/recharge", label: "Recharge" },
    { value: "/cashout", label: "Cashout" },
    { value: "/add-money", label: "Add Money" },
    { value: "/payment", label: "Payment" },
    { value: "/bill", label: "Bill Payment" },
    { value: "/edu-fee", label: "Education Fee" },
    { value: "/air-tickets", label: "Air Tickets" },
    { value: "/savings", label: "Savings" },
    { value: "/donate", label: "Donate" },
    { value: "/remittance", label: "Remittance" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#29a9eb] text-white p-4">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="p-1">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-semibold">Editable Banners</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm)
            setEditingBanner(null)
            setFormData({ image: "", link: "/", alt: "" })
          }}
          className="w-full bg-[#29a9eb] text-white p-4 rounded-lg flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add New Banner
        </button>

        {(showCreateForm || editingBanner) && (
          <div className="bg-white rounded-lg p-4 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800">{editingBanner ? "Edit Banner" : "Create New Banner"}</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image Path <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="/images/your-banner.png"
              />
              <p className="text-xs text-gray-500 mt-1">Upload image to /public/images/ folder first</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Destination <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                {linkOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Banner description"
              />
            </div>

            {formData.image && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt={formData.alt}
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=128&width=400"
                  }}
                />
              </div>
            )}

            <div className="flex gap-2">
              {editingBanner ? (
                <>
                  <button onClick={updateBanner} className="flex-1 bg-green-600 text-white p-3 rounded-lg font-medium">
                    Update Banner
                  </button>
                  <button
                    onClick={() => {
                      setEditingBanner(null)
                      setFormData({ image: "", link: "/", alt: "" })
                    }}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={createBanner} className="flex-1 bg-green-600 text-white p-3 rounded-lg font-medium">
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setFormData({ image: "", link: "/", alt: "" })
                    }}
                    className="flex-1 bg-gray-500 text-white p-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800">Banners ({banners.filter((b) => b.isActive).length} active)</h3>

          {banners.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center text-gray-500">No banners yet. Create one!</div>
          ) : (
            banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`bg-white rounded-lg p-4 shadow-sm ${!banner.isActive ? "opacity-50" : ""}`}
              >
                <img
                  src={banner.image || "/placeholder.svg"}
                  alt={banner.alt}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=128&width=400"
                  }}
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{banner.alt}</p>
                      <p className="text-sm text-gray-600">Links to: {banner.link}</p>
                      <p className="text-xs text-gray-500">Priority: {banner.priority}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveBanner(banner.id, "up")}
                        disabled={index === 0}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <MoveUp size={16} />
                      </button>
                      <button
                        onClick={() => moveBanner(banner.id, "down")}
                        disabled={index === banners.length - 1}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        <MoveDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleBanner(banner.id)}
                      className={`flex-1 p-2 rounded font-medium text-sm ${
                        banner.isActive ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {banner.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => startEdit(banner)}
                      className="flex-1 bg-blue-100 text-blue-700 p-2 rounded font-medium text-sm flex items-center justify-center gap-1"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteBanner(banner.id)}
                      className="flex-1 bg-red-100 text-red-700 p-2 rounded font-medium text-sm flex items-center justify-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
