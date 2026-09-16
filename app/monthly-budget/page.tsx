"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import Link from "next/link"

// Define types for our budget data
type BudgetCategory = {
  id: string
  name: string
  budgeted: number
  spent: number
  color: string
}

type Transaction = {
  id: string
  categoryId: string
  amount: number
  description: string
  date: string
}

export default function MonthlyBudgetPage() {

  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState("")
  const [totalBudgeted, setTotalBudgeted] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [error, setError] = useState("")

  // Colors for budget categories
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ]

  // Budget management functions
  const addCategory = () => {
    if (!newCategory || !newAmount) {
      setError("Please fill in all fields")
      return
    }
    const newCat: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategory,
      budgeted: Number(newAmount),
      spent: 0,
      color: colors[categories.length % colors.length],
    }
    setCategories([...categories, newCat])
    setNewCategory("")
    setNewAmount("")
    setShowAddCategory(false)
    setError("")
  }

  const updateCategory = (id: string) => {
    if (!editName || !editAmount) {
      setError("Please fill in all fields")
      return
    }
    setCategories(
      categories.map((cat) =>
        cat.id === id
          ? { ...cat, name: editName, budgeted: Number(editAmount) }
          : cat
      )
    )
    setEditingCategory(null)
    setError("")
  }

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id))
  }

  const getCategoryTransactions = (categoryId: string): Transaction[] => {
    return transactions.filter((t) => t.categoryId === categoryId)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const deleteTransaction = (transaction: Transaction) => {
    setTransactions(transactions.filter((t) => t.id !== transaction.id))
    // Update the category's spent amount
    setCategories(
      categories.map((cat) =>
        cat.id === transaction.categoryId
          ? { ...cat, spent: Math.max(0, cat.spent - transaction.amount) }
          : cat
      )
    )
  }

  useEffect(() => {
    // Set current month
    const date = new Date()
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    setCurrentMonth(`${monthNames[date.getMonth()]} ${date.getFullYear()}`)

    // Load saved budget data
    const savedCategories = localStorage.getItem("budgetCategories")
    const savedTransactions = localStorage.getItem("budgetTransactions")

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      // Default categories if none exist
      const defaultCategories: BudgetCategory[] = [
        { id: "1", name: "Food", budgeted: 5000, spent: 3500, color: "bg-green-500" },
        { id: "2", name: "Transport", budgeted: 3000, spent: 2200, color: "bg-yellow-500" },
        { id: "3", name: "Entertainment", budgeted: 2000, spent: 2500, color: "bg-red-500" },
        { id: "4", name: "Utilities", budgeted: 2000, spent: 1550, color: "bg-blue-500" },
      ]
      setCategories(defaultCategories)
      localStorage.setItem("budgetCategories", JSON.stringify(defaultCategories))
    }

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  // Calculate totals whenever categories change
  useEffect(() => {
    const budgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0)
    const spent = categories.reduce((sum, cat) => sum + cat.spent, 0)

    setTotalBudgeted(budgeted)
    setTotalSpent(spent)

    // Save to localStorage
    localStorage.setItem("budgetCategories", JSON.stringify(categories))
  }, [categories])

  // Save transactions whenever they change
  useEffect(() => {
    localStorage.setItem("budgetTransactions", JSON.stringify(transactions))
  }, [transactions])

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-lg font-medium">Monthly Budget</div>
      </div>

      <div className="p-4 pb-20 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">{currentMonth}</h2>

          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium text-blue-800 mb-2 text-sm">Total Budget</h3>
            <div className="text-xl font-bold">Tk{totalBudgeted.toLocaleString()}</div>
            <div className="flex justify-between mt-1 text-xs">
              {totalSpent > 0 && <span>Tk{totalSpent.toLocaleString()} spent</span>}
              {totalBudgeted > totalSpent && (
                <span>Tk{Math.max(0, totalBudgeted - totalSpent).toLocaleString()} left</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-sm">Categories</h3>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="text-[#29a9eb] flex items-center text-xs"
            >
              {showAddCategory ? <X size={14} /> : <Plus size={14} />}
              <span className="ml-1">{showAddCategory ? "Cancel" : "Add"}</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-2 rounded-md mb-3 flex items-center text-xs">
              <AlertCircle size={14} className="mr-2" />
              {error}
            </div>
          )}

          {showAddCategory && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="mb-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Category name"
                />
              </div>
              <div className="mb-2">
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                  placeholder="Budget amount"
                />
              </div>
              <button onClick={addCategory} className="bg-[#29a9eb] text-white py-2 px-4 rounded-md text-xs w-full">
                Add Category
              </button>
            </div>
          )}

          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="border p-3 rounded-lg">
                {editingCategory === category.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    />
                    <div className="flex">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="flex-1 p-2 border rounded-l-md text-sm"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => updateCategory(category.id)}
                        className="bg-green-500 text-white p-2 rounded-r-md"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <div className="flex items-center">
                        {category.spent > 0 || category.budgeted > 0 ? (
                          <span className="text-xs">
                            {category.spent > 0 && `Tk${category.spent.toLocaleString()}`}
                            {category.spent > 0 && category.budgeted > 0 && " / "}
                            {category.budgeted > 0 && `Tk${category.budgeted.toLocaleString()}`}
                          </span>
                        ) : null}
                        <div className="flex ml-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category.id)
                              setEditName(category.name)
                              setEditAmount(category.budgeted.toString())
                            }}
                            className="text-gray-500 p-1"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => deleteCategory(category.id)} className="text-red-500 p-1">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      {getCategoryTransactions(category.id).length > 0 && (
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                          className="text-xs text-gray-600 flex items-center"
                        >
                          {expandedCategory === category.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          <span className="ml-1">{getCategoryTransactions(category.id).length} transactions</span>
                        </button>
                      )}

                      {expandedCategory === category.id && (
                        <div className="mt-2 space-y-1">
                          {getCategoryTransactions(category.id).length > 0 &&
                            getCategoryTransactions(category.id).map((transaction) => (
                              <div
                                key={transaction.id}
                                className="flex justify-between items-center bg-gray-50 p-2 rounded text-xs"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="truncate">{transaction.description}</div>
                                  <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                                </div>
                                <div className="flex items-center ml-2">
                                  <span className="font-medium">Tk{transaction.amount.toLocaleString()}</span>
                                  <button onClick={() => deleteTransaction(transaction)} className="ml-1 text-red-500">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
