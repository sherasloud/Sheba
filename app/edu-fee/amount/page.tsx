"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EduFeeAmountPage() {
  const router = useRouter()
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null)
  const [studentId, setStudentId] = useState("")
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    const rawInstitution = localStorage.getItem("selectedInstitution")
    const id = localStorage.getItem("studentId")

    if (!rawInstitution || !id) {
      router.push("/edu-fee")
      return
    }

    try {
      const institution = JSON.parse(rawInstitution)
      setSelectedInstitution(institution)
      setStudentId(id)

      // Set preset amount based on institution type
      let presetAmount = 2500 // Default for schools
      if (institution.type === "colleges") {
        presetAmount = 3500
      } else if (institution.type === "universities") {
        presetAmount = 5000
      }
      setAmount(presetAmount)
      localStorage.setItem("eduFeeAmount", presetAmount.toString())
    } catch (error) {
      console.error("Error parsing institution data:", error)
      router.push("/edu-fee")
    }
  }, [router])

  const handleContinue = () => {
    router.push("/edu-fee/pin")
  }

  if (!selectedInstitution) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="bg-[#29a9eb] text-white p-4 flex items-center">
          <button onClick={() => router.push("/edu-fee/student-id")} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <div className="text-xl font-medium">Fee Amount</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#29a9eb]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <button onClick={() => router.push("/edu-fee/student-id")} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-medium">Fee Amount</div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        {/* Institution Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 mr-4">
              <img
                src={selectedInstitution.logo || "/placeholder.svg"}
                alt={selectedInstitution.name}
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800">{selectedInstitution.name}</h2>
              <p className="text-sm text-gray-600 capitalize">
                {selectedInstitution.type === "schools"
                  ? "School"
                  : selectedInstitution.type === "colleges"
                    ? "College"
                    : "University"}
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Student ID:</strong> {studentId}
            </p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fee Amount</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#29a9eb] mb-2">Tk{amount.toLocaleString()}</div>
            <p className="text-gray-600">
              {selectedInstitution.type === "schools"
                ? "School"
                : selectedInstitution.type === "colleges"
                  ? "College"
                  : "University"}{" "}
              Fee
            </p>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full bg-[#29a9eb] text-white py-4 rounded-lg font-medium text-lg hover:bg-[#2196d3] transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}
