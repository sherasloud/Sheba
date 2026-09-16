// Phone number masking utility for privacy
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 4) return phone

  // Format: 01XXX***XXX (show first 5 digits, mask middle, show last 3)
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 5)}***${cleaned.slice(-3)}`
  }

  // Fallback: show first 3 and last 2
  return `${cleaned.slice(0, 3)}***${cleaned.slice(-2)}`
}

export function getDisplayName(transaction: any): string {
  // For received money, show sender name or "Sheba User"
  if (transaction.type === "Money Received" || transaction.type === "Receive Money" || transaction.type === "Receive") {
    return transaction.senderName || transaction.from || "Sheba User"
  }

  // For sent money, show recipient name
  if (transaction.type === "Send Money") {
    return transaction.recipientName || transaction.to || "Sheba User"
  }

  // For other transactions
  return transaction.storeName || transaction.operator || "Sheba"
}

export function getDisplayPhone(transaction: any): string {
  // For received money, mask sender phone
  if (transaction.type === "Money Received" || transaction.type === "Receive Money" || transaction.type === "Receive") {
    return maskPhoneNumber(transaction.from || transaction.sender || "")
  }

  // For sent money, mask recipient phone
  if (transaction.type === "Send Money") {
    return maskPhoneNumber(transaction.to || transaction.recipient || "")
  }

  return ""
}
