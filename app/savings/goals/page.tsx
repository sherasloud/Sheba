"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Target, Plus } from "lucide-react"
import Link from "next/link"

interface SavingsGoal {
  id: number
  name: string
  targetAmount: number
  currentAmount: number
  deadline: string
  created: string
}

export default function SavingsGoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])

  useEffect(() => {
    const savedGoals = localStorage.getItem("savingsGoals")
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    } else {
      // Default goal
      const defaultGoals = [
        {
          id: 1,
          name: "Emergency Fund",
          targetAmount: 20000,
          currentAmount: 5000,
          deadline: "2024-12-31",
          created: new Date().toISOString(),
        },
      ]
      setGoals(defaultGoals)
      localStorage.setItem("savingsGoals", JSON.stringify(defaultGoals))
    }
  }, [])

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="flex flex-col h-screen bg-white max-w-sm mx-auto">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/savings" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Savings Goals</div>
      </div>

      <div className="p-6 flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Goals</h1>
          <Link href="/savings/goals/create" className="bg-[#29a9eb] text-white p-2 rounded-lg">
            <Plus size={20} />
          </Link>
        </div>

        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="text-[#29a9eb]" size={20} />
                <h3 className="font-semibold">{goal.name}</h3>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{getProgress(goal.currentAmount, goal.targetAmount).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${getProgress(goal.currentAmount, goal.targetAmount)}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Current: Tk{goal.currentAmount.toLocaleString()}</span>
                <span>Target: Tk{goal.targetAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>Remaining: Tk{(goal.targetAmount - goal.currentAmount).toLocaleString()}</span>
                <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/savings/goals/contribute?id=${goal.id}`}
                  className="flex-1 bg-[#29a9eb] text-white py-2 rounded text-center text-sm"
                >
                  Contribute
                </Link>
                <Link
                  href={`/savings/goals/edit?id=${goal.id}`}
                  className="flex-1 border border-[#29a9eb] text-[#29a9eb] py-2 rounded text-center text-sm"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto text-gray-400 mb-4" size={48} />
            <div className="text-gray-400 mb-4">No savings goals yet</div>
            <Link href="/savings/goals/create" className="bg-[#29a9eb] text-white py-2 px-4 rounded-lg">
              Create Your First Goal
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
