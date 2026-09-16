import { NextResponse } from "next/server"

// In a real application, you would fetch user data from a database.
// This is a mock implementation.
const mockUsers = [
  { id: "1", name: "Alice", phone: "01700000000" },
  { id: "2", name: "Bob", phone: "01800000000" },
]

export async function GET() {
  return NextResponse.json(mockUsers)
}

// The POST handler for user registration has been removed.
// If you need user creation functionality, it should be implemented
// securely, typically through a dedicated authentication service.
