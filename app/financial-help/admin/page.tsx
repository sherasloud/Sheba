"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Search } from "lucide-react"
import Link from "next/link"
import VerificationRequired from "@/components/verification-required"

type RequestStatus = "pending" | "approved" | "rejected"

interface FinancialRequest {
  id: string
  phone: string
  reason: string
  amount: string
  status: RequestStatus
  date: string
}

export default function FinancialHelpAdminPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [requests, setRequests] = useState<FinancialRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<FinancialRequest[]>([])
  const [filter, setFilter] = useState<RequestStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Check if user is admin
    const phone = localStorage.getItem("phone")
    setIsAdmin(phone === "01930314459")

    // Load requests from localStorage
    const storedRequests = localStorage.getItem("financialHelpRequests")
    if (storedRequests) {
      const parsedRequests = JSON.parse(storedRequests)
      setRequests(parsedRequests)
      setFilteredRequests(parsedRequests)
    }
  }, [])

  useEffect(() => {
    // Apply filters
    let result = [...requests]

    // Filter by status
    if (filter !== "all") {
      result = result.filter((req) => req.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        (req) => req.phone.includes(searchTerm) || req.reason.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRequests(result)
  }, [filter, searchTerm, requests])

  const handleApprove = (id: string) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status: "approved" as RequestStatus } : req,
    )
    setRequests(updatedRequests)
    localStorage.setItem("financialHelpRequests", JSON.stringify(updatedRequests))
  }

  const handleReject = (id: string) => {
    const updatedRequests = requests.map((req) =>
      req.id === id ? { ...req, status: "rejected" as RequestStatus } : req,
    )
    setRequests(updatedRequests)
    localStorage.setItem("financialHelpRequests", JSON.stringify(updatedRequests))
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return <VerificationRequired title="Admin Access" message="You don't have permission to access this page." />
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Financial Help Admin</div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full border rounded-md p-2 text-sm"
            />
          </div>
        </div>

        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              filter === "all" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            All Requests
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              filter === "pending" ? "bg-yellow-500 text-white" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              filter === "approved" ? "bg-green-500 text-white" : "bg-green-100 text-green-800"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              filter === "rejected" ? "bg-red-500 text-white" : "bg-red-100 text-red-800"
            }`}
          >
            Rejected
          </button>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No requests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter !== "all"
                ? `No ${filter} requests match your criteria.`
                : "There are no financial help requests yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{request.phone}</p>
                    <p className="text-xs text-gray-500">{new Date(request.date).toLocaleString()}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      request.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded mb-2">
                  <p className="text-sm">{request.reason}</p>
                </div>

                <p className="text-sm font-medium mb-3">Amount: Tk{request.amount}</p>

                {request.status === "pending" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-500 text-white py-1 px-3 rounded text-xs flex items-center"
                    >
                      <CheckCircle size={12} className="mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="bg-red-500 text-white py-1 px-3 rounded text-xs flex items-center"
                    >
                      <XCircle size={12} className="mr-1" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
