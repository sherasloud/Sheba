"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react"
import Link from "next/link"

export default function AutoSavePage() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [roundUpAmount, setRoundUpAmount] = useState(250)
  const [monthlyTarget, setMonthlyTarget] = useState(1000)

  useEffect(() => {
    const autoSaveSettings = localStorage.getItem("autoSaveSettings")
    if (autoSaveSettings) {
      const settings = JSON.parse(autoSaveSettings)
      setIsEnabled(settings.enabled || false)
      setRoundUpAmount(settings.roundUpAmount || 250)
      setMonthlyTarget(settings.monthlyTarget || 1000)
    }
  }, [])

  const handleToggle = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)

    const settings = {
      enabled: newEnabled,
      roundUpAmount,
      monthlyTarget,
    }
    localStorage.setItem("autoSaveSettings", JSON.stringify(settings))

    if (newEnabled) {
      alert("Auto-Save enabled! Round-up will start from your next transaction.")
    } else {
      alert("Auto-Save disabled.")
    }
  }

  const handleMonthlyTargetChange = (target: number) => {
    setMonthlyTarget(target)
    const settings = {
      enabled: isEnabled,
      roundUpAmount,
      monthlyTarget: target,
    }
    localStorage.setItem("autoSaveSettings", JSON.stringify(settings))
  }

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/savings" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Auto-Save</div>
      </div>

      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-2">Auto-Save Settings</h1>
        <p className="text-gray-600 mb-6">Automatically save money from your transactions</p>

        {/* Round-up Toggle */}
        <div className="border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Round-up Savings</h3>
              <p className="text-sm text-gray-600">Round up transactions to nearest Tk10</p>
            </div>
            <button onClick={handleToggle}>
              {isEnabled ? (
                <ToggleRight className="text-[#29a9eb]" size={32} />
              ) : (
                <ToggleLeft className="text-gray-400" size={32} />
              )}
            </button>
          </div>

          {isEnabled && (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-700">
                ✓ Auto-Save is active
                <br />
                Current round-up savings: Tk{roundUpAmount}
              </div>
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-blue-800 mb-3">How Round-up Works</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex justify-between">
              <span>Transaction: Tk47</span>
              <span>Round-up: Tk3</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction: Tk123</span>
              <span>Round-up: Tk7</span>
            </div>
            <div className="flex justify-between">
              <span>Transaction: Tk85</span>
              <span>Round-up: Tk5</span>
            </div>
          </div>
        </div>

        {/* Monthly Target */}
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Monthly Savings Target</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[500, 1000, 2000].map((target) => (
              <button
                key={target}
                onClick={() => handleMonthlyTargetChange(target)}
                className={`p-3 rounded-lg border text-center ${
                  monthlyTarget === target ? "bg-[#29a9eb] text-white border-[#29a9eb]" : "border-gray-300"
                }`}
              >
                Tk{target}
              </button>
            ))}
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm">
              Current target: Tk{monthlyTarget}/month
              <br />
              Daily target: Tk{Math.round(monthlyTarget / 30)}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">This Month's Progress</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Round-up Savings</span>
              <span className="font-medium">Tk{roundUpAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Target Progress</span>
              <span className="font-medium">{((roundUpAmount / monthlyTarget) * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full"
                style={{ width: `${Math.min((roundUpAmount / monthlyTarget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
