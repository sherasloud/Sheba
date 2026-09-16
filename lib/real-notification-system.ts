// Real-time notification system for Sheba app
export interface Notification {
  id: string
  type: "money_received" | "money_sent" | "recharge_success" | "bill_paid" | "system_alert" | "promo" | "security"
  title: string
  message: string
  amount?: number
  from?: string
  to?: string
  date: string
  time: string
  read: boolean
  priority: "high" | "medium" | "low"
  icon?: string
}

export class RealNotificationSystem {
  private static instance: RealNotificationSystem
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  static getInstance(): RealNotificationSystem {
    if (!RealNotificationSystem.instance) {
      RealNotificationSystem.instance = new RealNotificationSystem()
    }
    return RealNotificationSystem.instance
  }

  startRealTimeSync() {
    // Only load existing notifications, no fake generation
    this.loadStoredNotifications()
  }

  stopSync() {
    // No intervals to clear since we removed fake generation
  }

  private loadStoredNotifications() {
    const stored = localStorage.getItem("realNotifications")
    if (stored) {
      this.notifications = JSON.parse(stored)
      this.notifyListeners()
    }
  }

  private saveNotifications() {
    localStorage.setItem("realNotifications", JSON.stringify(this.notifications))
  }

  private getCurrentUser() {
    const userData = localStorage.getItem("userData")
    return userData ? JSON.parse(userData) : null
  }

  addNotification(notification: Notification) {
    // Avoid duplicates
    const exists = this.notifications.some(
      (n) =>
        n.type === notification.type &&
        n.message === notification.message &&
        Math.abs(
          new Date(n.date + " " + n.time).getTime() - new Date(notification.date + " " + notification.time).getTime(),
        ) < 60000,
    )

    if (!exists) {
      this.notifications.unshift(notification)

      // Keep only last 50 notifications
      if (this.notifications.length > 50) {
        this.notifications = this.notifications.slice(0, 50)
      }

      this.saveNotifications()
      this.notifyListeners()
      this.showBrowserNotification(notification)
    }
  }

  private showBrowserNotification(notification: Notification) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/images/droplet-logo.png",
        badge: "/images/droplet-logo.png",
      })
    }
  }

  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback)
    // Immediately call with current notifications
    callback(this.notifications)
  }

  unsubscribe(callback: (notifications: Notification[]) => void) {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.notifications))
  }

  markAsRead(id: string) {
    const notification = this.notifications.find((n) => n.id === id)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      this.notifyListeners()
    }
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.saveNotifications()
    this.notifyListeners()
  }

  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  // Trigger specific notifications for user actions
  triggerTransactionNotification(type: "sent" | "received", amount: number, phoneNumber: string) {
    const now = new Date()

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type: type === "sent" ? "money_sent" : "money_received",
      title: type === "sent" ? "Money Sent!" : "Money Received!",
      message:
        type === "sent"
          ? `You sent Tk ${amount.toLocaleString()} to ${phoneNumber}`
          : `You received Tk ${amount.toLocaleString()} from ${phoneNumber}`,
      amount,
      [type === "sent" ? "to" : "from"]: phoneNumber,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      priority: "high",
      icon: type === "sent" ? "📤" : "📥",
    }

    this.addNotification(notification)
  }

  // Trigger recharge notification
  triggerRechargeNotification(amount: number, operator: string) {
    const now = new Date()

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type: "recharge_success",
      title: "Recharge Successful",
      message: `Tk ${amount} recharge completed for ${operator}.`,
      amount,
      to: operator,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      priority: "medium",
      icon: "📱",
    }

    this.addNotification(notification)
  }

  // Trigger bill payment notification
  triggerBillPaymentNotification(amount: number, provider: string) {
    const now = new Date()

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type: "bill_paid",
      title: "Bill Payment Successful",
      message: `Tk ${amount} bill payment completed for ${provider}.`,
      amount,
      to: provider,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      priority: "medium",
      icon: "💡",
    }

    this.addNotification(notification)
  }

  // Trigger security notification
  triggerSecurityNotification(action: string, details: string) {
    const now = new Date()

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type: "security",
      title: "Security Update",
      message: `${action}: ${details}`,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      priority: "high",
      icon: "🔒",
    }

    this.addNotification(notification)
  }

  // Trigger cashout notification
  triggerCashoutNotification(amount: number, agent: string) {
    const now = new Date()

    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      type: "money_sent",
      title: "Cashout Successful",
      message: `Tk ${amount} cashout completed from ${agent}.`,
      amount,
      to: agent,
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      read: false,
      priority: "high",
      icon: "💰",
    }

    this.addNotification(notification)
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = []
    this.saveNotifications()
    this.notifyListeners()
  }
}

export const realNotificationSystem = RealNotificationSystem.getInstance()
