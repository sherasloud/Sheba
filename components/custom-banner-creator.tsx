"use client"

import type React from "react"

import { useState } from "react"
import { AdvancedPromoBannerManager } from "@/lib/advanced-promo-system"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, Eye } from "lucide-react"

interface CustomBannerCreatorProps {
  onClose: () => void
  onBannerCreated: () => void
}

export function CustomBannerCreator({ onClose, onBannerCreated }: CustomBannerCreatorProps) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    link: "/",
    bgColor: "from-blue-500 to-cyan-600",
    textColor: "text-white",
    startDate: "",
    endDate: "",
    priority: 5,
    type: "custom",
  })

  const [previewMode, setPreviewMode] = useState(false)

  const bgColorOptions = [
    { value: "from-blue-500 to-cyan-600", label: "Blue Ocean", preview: "bg-gradient-to-r from-blue-500 to-cyan-600" },
    {
      value: "from-green-500 to-emerald-600",
      label: "Green Forest",
      preview: "bg-gradient-to-r from-green-500 to-emerald-600",
    },
    {
      value: "from-purple-500 to-pink-600",
      label: "Purple Sunset",
      preview: "bg-gradient-to-r from-purple-500 to-pink-600",
    },
    {
      value: "from-orange-500 to-red-600",
      label: "Fire Orange",
      preview: "bg-gradient-to-r from-orange-500 to-red-600",
    },
    {
      value: "from-indigo-500 to-blue-600",
      label: "Deep Blue",
      preview: "bg-gradient-to-r from-indigo-500 to-blue-600",
    },
    {
      value: "from-yellow-500 to-orange-600",
      label: "Golden Sun",
      preview: "bg-gradient-to-r from-yellow-500 to-orange-600",
    },
    { value: "from-teal-500 to-green-600", label: "Teal Wave", preview: "bg-gradient-to-r from-teal-500 to-green-600" },
    { value: "from-pink-500 to-rose-600", label: "Pink Rose", preview: "bg-gradient-to-r from-pink-500 to-rose-600" },
  ]

  const linkOptions = [
    { value: "/send-money", label: "Send Money" },
    { value: "/recharge", label: "Recharge" },
    { value: "/cashout", label: "Cashout" },
    { value: "/payment", label: "Payment" },
    { value: "/bill", label: "Bill Payment" },
    { value: "/edu-fee", label: "Education Fee" },
    { value: "/air-tickets", label: "Air Tickets" },
    { value: "/savings", label: "Savings" },
    { value: "/donate", label: "Donate" },
    { value: "/remittance", label: "Remittance" },
    { value: "/cashback-offer", label: "Cashback Offer" },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.startDate || !formData.endDate) {
      alert("Please fill in all required fields")
      return
    }

    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (endDate <= startDate) {
      alert("End date must be after start date")
      return
    }

    const bannerId = AdvancedPromoBannerManager.addCustomBanner({
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      link: formData.link,
      alt: `${formData.title} promotional banner`,
      bgColor: formData.bgColor,
      textColor: formData.textColor,
      startDate: formData.startDate,
      endDate: formData.endDate,
      priority: formData.priority,
      type: formData.type,
      isActive: false,
      createdBy: "admin",
    })

    alert(
      `✅ Custom banner created successfully!\nID: ${bannerId}\nWill be active from ${AdvancedPromoBannerManager.formatDate(formData.startDate)} to ${AdvancedPromoBannerManager.formatDate(formData.endDate)}`,
    )
    onBannerCreated()
    onClose()
  }

  const renderPreview = () => (
    <div
      className={`w-full h-32 bg-gradient-to-r ${formData.bgColor} rounded-xl flex items-center justify-center ${formData.textColor} relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      <div className="relative z-10 text-center">
        <div className="text-xl font-bold mb-1">{formData.title || "Your Title Here"}</div>
        {formData.subtitle && <div className="text-sm font-semibold">{formData.subtitle}</div>}
      </div>
      {/* Decorative elements */}
      <div className="absolute top-2 left-2 text-yellow-300 text-lg">✨</div>
      <div className="absolute bottom-2 right-2 text-yellow-300 text-lg">🎁</div>
      <div className="absolute top-2 right-2 text-yellow-300 text-lg">⭐</div>
      <div className="absolute bottom-2 left-2 text-yellow-300 text-lg">🛍️</div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">🎨 Create Custom Banner</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Preview</label>
              <Button type="button" variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
                <Eye size={14} className="mr-1" />
                {previewMode ? "Hide" : "Show"}
              </Button>
            </div>
            {previewMode && renderPreview()}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium text-red-500">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 🎉 Special Offer!"
                required
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="text-sm font-medium">Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., Get 50% off today!"
              />
            </div>

            {/* Background Color */}
            <div>
              <label className="text-sm font-medium">Background Color</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {bgColorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, bgColor: option.value })}
                    className={`p-2 rounded-md border text-xs ${
                      formData.bgColor === option.value ? "border-blue-500 border-2" : "border-gray-300"
                    }`}
                  >
                    <div className={`w-full h-6 rounded ${option.preview} mb-1`}></div>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Link Destination */}
            <div>
              <label className="text-sm font-medium">Link Destination</label>
              <select
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              >
                {linkOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium text-red-500">Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-red-500">End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                  required
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-sm font-medium">Priority (1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Higher priority banners show first when multiple are active</p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              <Plus size={16} className="mr-2" />
              Create Banner
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
