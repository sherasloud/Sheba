import type { Metadata } from "next"
import PaymentGatewayScreen from "./payment-gateway-screen"

export const metadata: Metadata = {
  title: "Payment Gateway | Sheba",
  description: "Confirm or cancel your Sheba payment securely.",
}

export default function PaymentGatewayPage() {
  return <PaymentGatewayScreen />
}
