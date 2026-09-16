"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RechargeStats {
  totalRecharges: number
  totalAmount: number
  totalCommission: number
  totalProfit: number
  successRate: number
}

export default function RechargeDashboard() {
  const [stats, setStats] = useState<RechargeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/recharge/production?action=stats")
      const result = await response.json()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4">Loading dashboard...</div>
  }

  if (!stats) {
    return <div className="p-4">Failed to load dashboard</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Recharge Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Recharges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecharges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tk {stats.totalAmount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Tk {stats.totalCommission.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Revenue:</span>
              <span className="font-bold">Tk {stats.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Commission Earned:</span>
              <span className="font-bold text-green-600">Tk {stats.totalCommission.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Net Profit:</span>
              <span className="font-bold text-blue-600">Tk {stats.totalProfit.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
