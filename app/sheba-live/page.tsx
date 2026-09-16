"use client"

import type React from "react"
import { ArrowLeft, Send, Bot, User, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ShebaLivePage() {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Assalamu Alaikum! Ami Sheba Live. Apnake kivabe help korte pari?\n\nSheba app er shob features somporke ami apnake bolte pari!",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const input = formData.get("message") as string

    if (!input.trim() || isLoading) return

    console.log("[v0] Sheba Live: Sending message:", input)

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    }
    setMessages((prev) => [...prev, userMessage])
    e.currentTarget.reset()
    setIsLoading(true)

    try {
      console.log("[v0] Sheba Live: Making fetch request...")

      const response = await fetch("/api/sheba-live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      console.log("[v0] Sheba Live: Fetch response received, status:", response.status)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Sheba Live: Response data received")

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
        }
        setMessages((prev) => [...prev, assistantMessage])
        console.log("[v0] Sheba Live: Message added to history")
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error("[v0] Sheba Live: Error sending message:", err)
      setError("Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleQuickAction = (message: string) => {
    if (isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    fetch("/api/sheba-live", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.response) {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.response,
          }
          setMessages((prev) => [...prev, assistantMessage])
        }
      })
      .catch((err) => {
        console.error("[v0] Sheba Live: Error:", err)
        setError("Failed to send message. Please try again.")
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <div className="flex flex-col h-screen max-w-sm mx-auto bg-white">
      {/* Header */}
      <div className="bg-[#3498DB] text-white px-4 py-3 flex items-center space-x-3 shadow-md">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center space-x-2 flex-1">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sheba Live</h1>
            <p className="text-xs text-white/80">Always here to help</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-600 hover:text-red-700 mt-1 underline">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user" ? "bg-[#3498DB]" : "bg-gray-300"
                }`}
              >
                {message.role === "user" ? <User size={18} className="text-white" /> : <Bot size={18} />}
              </div>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.role === "user"
                    ? "bg-[#3498DB] text-white rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-300">
                <Bot size={18} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white text-gray-800 rounded-tl-none shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {messages.length === 1 && !isLoading && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <button
              onClick={() => handleQuickAction("Recharge kivabe korbo?")}
              className="px-4 py-2 bg-white text-[#3498DB] rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow border border-[#3498DB]"
            >
              Recharge
            </button>
            <button
              onClick={() => handleQuickAction("Money kivabe pathabo?")}
              className="px-4 py-2 bg-white text-[#3498DB] rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow border border-[#3498DB]"
            >
              Send Money
            </button>
            <button
              onClick={() => handleQuickAction("Balance kothay dekhbo?")}
              className="px-4 py-2 bg-white text-[#3498DB] rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow border border-[#3498DB]"
            >
              Balance
            </button>
            <button
              onClick={() => handleQuickAction("Help")}
              className="px-4 py-2 bg-white text-[#3498DB] rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow border border-[#3498DB]"
            >
              All Features
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 safe-area-bottom">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <input
            ref={inputRef}
            name="message"
            type="text"
            placeholder="Sheba somporke kichu jante chan?"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3498DB] focus:border-transparent text-sm"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-12 h-12 bg-[#3498DB] text-white rounded-full flex items-center justify-center hover:bg-[#2980B9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
