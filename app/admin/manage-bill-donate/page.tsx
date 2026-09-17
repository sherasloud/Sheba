"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ManageBillDonate() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"bill" | "donate" | "education">("bill")
  const [billProviders, setBillProviders] = useState<any[]>([])
  const [donationRecipients, setDonationRecipients] = useState<any[]>([])
  const [institutions, setInstitutions] = useState<any[]>([])
  const [showBillForm, setShowBillForm] = useState(false)
  const [showDonateForm, setShowDonateForm] = useState(false)
  const [showEduForm, setShowEduForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [billFormData, setBillFormData] = useState({
    name: "",
    fullName: "",
    category: "",
    number: "",
    icon: "",
  })

  const [donateFormData, setDonateFormData] = useState({
    name: "",
    number: "",
  })

  const [eduFormData, setEduFormData] = useState({
    name: "",
    type: "schools",
    logo: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const billRes = await fetch("/api/bill-providers")
      if (billRes.ok) {
        const billData = await billRes.json()
        setBillProviders(billData.providers || [])
      }

      const donateRes = await fetch("/api/donation-recipients")
      if (donateRes.ok) {
        const donateData = await donateRes.json()
        setDonationRecipients(donateData.recipients || [])
      }

      // Database থেকে সব institutions fetch করছি
      const eduRes = await fetch("/api/institutions/all")
      let allInstitutions: any[] = []
      if (eduRes.ok) {
        const eduData = await eduRes.json()
        if (eduData.institutions) {
          // Type wise সব institutions flatten করছি
          allInstitutions = [
            ...eduData.institutions.schools || [],
            ...eduData.institutions.colleges || [],
            ...eduData.institutions.universities || [],
          ]
          console.log("[v0] Database থেকে loaded institutions:", allInstitutions)
        }
      }
      
      setInstitutions(allInstitutions)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
    }
  }

  const handleAddBillProvider = async () => {
    if (!billFormData.name || !billFormData.category || !billFormData.number) {
      alert("সব ক্ষেত্র পূরণ করুন: প্রদানকারীর নাম, বিভাগ এবং গ্রাহক সেবা নম্বর")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/bill-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billFormData),
      })

      if (response.ok) {
        setBillFormData({ name: "", fullName: "", category: "", number: "", icon: "" })
        setShowBillForm(false)
        loadData()
      }
    } catch (error) {
      console.error("[v0] Error adding bill provider:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDonationRecipient = async () => {
    if (!donateFormData.name || !donateFormData.number) {
      alert("সব ক্ষেত্র পূরণ করুন: সংস্থার নাম এবং যোগাযোগ নম্বর")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/donation-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donateFormData),
      })

      if (response.ok) {
        setDonateFormData({ name: "", number: "" })
        setShowDonateForm(false)
        loadData()
      }
    } catch (error) {
      console.error("[v0] Error adding donation recipient:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEducationInstitution = async () => {
    if (!eduFormData.name || !eduFormData.type) {
      alert("অনুগ্রহ করে সব ফিল্ড পূরণ করুন")
      return
    }

    setLoading(true)
    try {
      // Type কে সঠিক format এ convert করছি
      const typeMap: Record<string, string> = {
        'schools': 'school',
        'colleges': 'college',
        'universities': 'university'
      }
      const institutionType = typeMap[eduFormData.type] || eduFormData.type

      console.log("[v0] Institution add করছি:", { name: eduFormData.name, type: institutionType })

      // Database এ save করছি
      const dbResponse = await fetch("/api/institution/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eduFormData.name,
          type: institutionType,
          managerPhone: "admin",
        }),
      })

      const dbData = await dbResponse.json()
      
      if (dbResponse.ok && dbData.institution) {
        console.log("[v0] Database এ institution save হয়েছে:", dbData.institution)
        setEduFormData({ name: "", type: "schools", logo: "" })
        setShowEduForm(false)
        loadData()
        alert("প্রতিষ্ঠান সফলভাবে যোগ করা হয়েছে!")
      } else {
        console.error("[v0] Database save ব্যর্থ:", dbData)
        alert("প্রতিষ্ঠান যোগ করতে ব্যর্থ: " + (dbData.error || "Unknown error"))
      }
    } catch (error) {
      console.error("[v0] Error adding education institution:", error)
      alert("প্রতিষ্ঠান যোগ করতে ব্যর্থ")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBillProvider = async (index: number) => {
    if (confirm("Are you sure you want to delete this bill provider?")) {
      try {
        await fetch("/api/bill-providers", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
        })
        loadData()
      } catch (error) {
        console.error("[v0] Error deleting bill provider:", error)
      }
    }
  }

  const handleDeleteDonationRecipient = async (index: number) => {
    if (confirm("Are you sure you want to delete this donation recipient?")) {
      try {
        await fetch("/api/donation-recipients", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index }),
        })
        loadData()
      } catch (error) {
        console.error("[v0] Error deleting donation recipient:", error)
      }
    }
  }

  const handleDeleteEducationInstitution = async (index: number) => {
    if (confirm("আপনি কি এই প্রতিষ্ঠানটি মুছতে চান?")) {
      try {
        // Delete from localStorage
        const existing = localStorage.getItem('adminInstitutions') || '[]'
        const institutions = JSON.parse(existing)
        institutions.splice(index, 1)
        localStorage.setItem('adminInstitutions', JSON.stringify(institutions))
        
        loadData()
      } catch (error) {
        console.error("[v0] Error deleting institution:", error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Manage Bill & Donation</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex flex-wrap">
          <button
            onClick={() => setActiveTab("bill")}
            className={`flex-1 min-w-max py-4 px-2 text-center font-medium ${
              activeTab === "bill" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Bill Providers
          </button>
          <button
            onClick={() => setActiveTab("donate")}
            className={`flex-1 min-w-max py-4 px-2 text-center font-medium ${
              activeTab === "donate" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Donations
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`flex-1 min-w-max py-4 px-2 text-center font-medium ${
              activeTab === "education" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
            }`}
          >
            Institutions
          </button>
          <Link href="/admin/manage-students" className="flex-1 min-w-max py-4 px-2 text-center font-medium text-gray-600 hover:text-blue-600">
            Students
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Bill Providers Tab */}
        {activeTab === "bill" && (
          <div>
          <button
            onClick={() => setShowBillForm(!showBillForm)}
            className="mb-4 w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <Plus size={20} /> বিল প্রদানকারী যোগ করুন
          </button>

            {showBillForm && (
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300 mb-4">
                <h3 className="font-bold text-orange-900 mb-4">বিল প্রদানকারী যোগ করুন</h3>
                
                <label className="block text-sm font-semibold text-gray-700 mb-2">প্রদানকারীর নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: DESCO, Titas Gas"
                  value={billFormData.fullName}
                  onChange={(e) => setBillFormData({ ...billFormData, fullName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 font-semibold"
                />

                <label className="block text-sm font-semibold text-gray-700 mb-2">বিভাগ নির্বাচন করুন</label>
                <select
                  value={billFormData.category}
                  onChange={(e) => setBillFormData({ ...billFormData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 font-semibold"
                >
                  <option value="">--- নির্বাচন করুন ---</option>
                  <option value="electricity">বিদ্যুৎ</option>
                  <option value="water">পানি</option>
                  <option value="gas">গ্যাস</option>
                  <option value="internet">ইন্টারনেট ও টিভি</option>
                  <option value="mobile">মোবাইল</option>
                </select>

                <label className="block text-sm font-semibold text-orange-900 mb-2 bg-orange-100 p-2 rounded">🔑 প্রদানকারীর নম্বর (এটি দিয়ে Dashboard এ Access হবে)</label>
                <input
                  type="tel"
                  placeholder="যেমন: 09666123456"
                  value={billFormData.number}
                  onChange={(e) => setBillFormData({ ...billFormData, number: e.target.value })}
                  className="w-full p-3 border-2 border-orange-500 rounded-lg mb-4 font-bold text-lg bg-white"
                  required
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddBillProvider}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? "যোগ করছি..." : "যোগ করুন"}
                  </button>
                  <button
                    onClick={() => setShowBillForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {billProviders.map((provider, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-sm text-gray-600">{provider.fullName || provider.category}</p>
                    <p className="text-sm text-blue-600">📞 {provider.number}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteBillProvider(index)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donation Recipients Tab */}
        {activeTab === "donate" && (
          <div>
            <button
              onClick={() => setShowDonateForm(!showDonateForm)}
              className="mb-4 w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} /> দান সংস্থা যোগ করুন
            </button>

            {showDonateForm && (
              <div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-300 mb-4">
                <h3 className="font-bold text-pink-900 mb-4">দান সংস্থা যোগ করুন</h3>
                
                <label className="block text-sm font-semibold text-gray-700 mb-2">সংস্থার নাম</label>
                <input
                  type="text"
                  placeholder="যেমন: SOS Children Village"
                  value={donateFormData.name}
                  onChange={(e) => setDonateFormData({ ...donateFormData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-4 font-semibold"
                  required
                />

                <label className="block text-sm font-semibold text-pink-900 mb-2 bg-pink-100 p-2 rounded">💰 সংস্থার যোগাযোগ নম্বর / অ্যাকাউন্ট (এটি দিয়ে Donate করা হবে)</label>
                <input
                  type="tel"
                  placeholder="যেমন: 01234567890"
                  value={donateFormData.number}
                  onChange={(e) => setDonateFormData({ ...donateFormData, number: e.target.value })}
                  className="w-full p-3 border-2 border-pink-500 rounded-lg mb-4 font-bold text-lg bg-white"
                  required
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddDonationRecipient}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? "যোগ করছি..." : "যোগ করুন"}
                  </button>
                  <button
                    onClick={() => setShowDonateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {donationRecipients.map((recipient, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{recipient.name}</h3>
                    <p className="text-sm text-blue-600">📞 {recipient.number}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDonationRecipient(index)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education Institutions Tab */}
        {activeTab === "education" && (
          <div>
            <button
              onClick={() => setShowEduForm(!showEduForm)}
              className="mb-4 w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} /> Add Education Institution
            </button>

            {showEduForm && (
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={eduFormData.name}
                  onChange={(e) => setEduFormData({ ...eduFormData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                />
                <select
                  value={eduFormData.type}
                  onChange={(e) => setEduFormData({ ...eduFormData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                >
                  <option value="schools">School</option>
                  <option value="colleges">College</option>
                  <option value="universities">University</option>
                </select>
                <input
                  type="text"
                  placeholder="Logo URL (optional)"
                  value={eduFormData.logo}
                  onChange={(e) => setEduFormData({ ...eduFormData, logo: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddEducationInstitution}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => setShowEduForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {institutions.map((institution, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{institution.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{institution.type}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEducationInstitution(index)}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {((activeTab === "bill" && billProviders.length === 0) ||
          (activeTab === "donate" && donationRecipients.length === 0) ||
          (activeTab === "education" && institutions.length === 0)) && !showBillForm && !showDonateForm && !showEduForm && (
          <div className="text-center py-10">
            <p className="text-gray-600">No items yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}
