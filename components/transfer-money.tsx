"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TransferProps {
  currentPhone: string
  currentBalance: number
  onSuccess?: () => void
}

export default function TransferMoney({ currentPhone, currentBalance, onSuccess }: TransferProps) {
  const [receiverPhone, setReceiverPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleTransfer = async () => {
    setError("")
    setSuccess("")

    if (!receiverPhone || !amount || !pin) {
      setError("সব তথ্য দিন")
      return
    }

    if (parseInt(amount) <= 0) {
      setError("Amount ০ এর চেয়ে বেশি হতে হবে")
      return
    }

    if (parseInt(amount) > currentBalance) {
      setError("আপনার balance কম আছে")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderPhone: currentPhone,
          receiverPhone,
          amount: parseInt(amount),
          pin,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess("টাকা সফলভাবে পাঠানো হয়েছে!")
        setReceiverPhone("")
        setAmount("")
        setPin("")
        onSuccess?.()
      } else {
        setError(result.message || "Transfer ব্যর্থ হয়েছে")
      }
    } catch (err) {
      setError("কোনো error হয়েছে, আবার চেষ্টা করুন")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>টাকা পাঠান</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>প্রাপকের ফোন নম্বর</Label>
          <Input
            type="tel"
            placeholder="০১712345678"
            value={receiverPhone}
            onChange={(e) => setReceiverPhone(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label>পরিমাণ (টাকা)</Label>
          <Input
            type="number"
            placeholder="১০০"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <Label>আপনার PIN</Label>
          <Input
            type="password"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            disabled={loading}
            maxLength={6}
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}

        <Button
          onClick={handleTransfer}
          disabled={loading}
          className="w-full"
        >
          {loading ? "পাঠাচ্ছি..." : "টাকা পাঠান"}
        </Button>

        <div className="text-sm text-gray-500">
          বর্তমান ব্যালেন্স: {currentBalance.toLocaleString()} টাকা
        </div>
      </CardContent>
    </Card>
  )
}
