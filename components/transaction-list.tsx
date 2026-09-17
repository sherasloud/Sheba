"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: string
  type: 'sent' | 'received'
  amount: number
  otherPhone: string
  status: string
  description: string
  date: string
  time: string
}

interface TransactionListProps {
  phoneNumber: string
}

export default function TransactionList({ phoneNumber }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [phoneNumber])

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transaction-history?phone=${phoneNumber}`)
      const result = await response.json()

      if (result.success) {
        setTransactions(result.transactions || [])
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-4">লোড হচ্ছে...</div>
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-500 text-center">কোনো লেনদেন নেই</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>লেনদেনের ইতিহাস</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="font-medium">
                  {txn.type === 'sent' ? '📤 পাঠানো' : '📥 পাওয়া'}
                </div>
                <div className="text-sm text-gray-500">
                  {txn.type === 'sent' ? 'To: ' : 'From: '}{txn.otherPhone}
                </div>
                <div className="text-xs text-gray-400">
                  {txn.date} {txn.time}
                </div>
              </div>

              <div className="text-right">
                <div className={`font-bold ${txn.type === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                  {txn.type === 'sent' ? '-' : '+'}ট{txn.amount.toLocaleString()}
                </div>
                <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'}>
                  {txn.status === 'completed' ? 'সম্পন্ন' : txn.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
