import { NextResponse } from 'next/server'

const sohojXPayBillProviders = [
  { id: "sohoj-desco-postpaid", name: "DESCO POSTPAID", fullName: "Dhaka Electric Supply Company", category: "Electricity", number: "DESCO_POSTPAID", source: "SohojXPay", enabled: true, icon: "/images/desco-logo-updated.jpeg", isImage: true },
  { id: "sohoj-desco-prepaid", name: "DESCO PREPAID", fullName: "Dhaka Electric Supply Company", category: "Electricity", number: "DESCO_PREPAID", source: "SohojXPay", enabled: true, icon: "/images/desco-logo-updated.jpeg", isImage: true },
  { id: "sohoj-west-zone-postpaid", name: "WEST ZONE POSTPAID", fullName: "West Zone Power Distribution Company", category: "Electricity", number: "WZPDCL_POSTPAID", source: "SohojXPay", enabled: true },
  { id: "sohoj-nesco-postpaid", name: "NESCO POSTPAID", fullName: "Northern Electricity Supply Company", category: "Electricity", number: "NESCO_POSTPAID", source: "SohojXPay", enabled: true, icon: "/images/nesco-logo.jpeg", isImage: true },
  { id: "sohoj-nesco-prepaid", name: "NESCO PREPAID", fullName: "Northern Electricity Supply Company", category: "Electricity", number: "NESCO_PREPAID", source: "SohojXPay", enabled: true, icon: "/images/nesco-logo.jpeg", isImage: true },
  { id: "sohoj-reb-postpaid", name: "REB POSTPAID", fullName: "Rural Electrification Board / Palli Bidyut", category: "Electricity", number: "REB_POSTPAID", source: "SohojXPay", enabled: true },
  { id: "sohoj-dhaka-wasa", name: "DHAKA WASA", fullName: "Dhaka Water Supply and Sewerage Authority", category: "Water", number: "DWASA", source: "SohojXPay", enabled: true, icon: "/images/wasa-logo.jpg", isImage: true },
  { id: "sohoj-rajshahi-wasa", name: "RAJSHAHI WASA", fullName: "Rajshahi Water Supply and Sewerage Authority", category: "Water", number: "RJWASA", source: "SohojXPay", enabled: true, icon: "/images/rajshahi-wasa-logo.jpeg", isImage: true },
  { id: "sohoj-chattogram-wasa", name: "CHATTOGRAM WASA", fullName: "Chattogram Water Supply and Sewerage Authority", category: "Water", number: "CTGWASA", source: "SohojXPay", enabled: true, icon: "/images/chattogram-wasa-logo.jpeg", isImage: true },
  { id: "sohoj-titas", name: "TITAS GAS", fullName: "Titas Gas Transmission and Distribution Company", category: "Gas", number: "TITAS", source: "SohojXPay", enabled: true, icon: "/images/titas-gas-logo.jpeg", isImage: true },
  { id: "sohoj-jalalabad", name: "JALALABAD GAS", fullName: "Jalalabad Gas Transmission and Distribution System", category: "Gas", number: "JALALABAD_GAS", source: "SohojXPay", enabled: true, icon: "/images/jalalabad-gas-logo.jpeg", isImage: true },
  { id: "sohoj-bakhrabad", name: "BAKHRABAD GAS", fullName: "Bakhrabad Gas Distribution Company", category: "Gas", number: "BGDCL", source: "SohojXPay", enabled: true, icon: "/images/bakhrabad-gas-logo.jpeg", isImage: true },
]


let billProvidersStore: any[] = []

export async function GET() {
  try {
    return NextResponse.json({ providers: [...sohojXPayBillProviders, ...billProvidersStore], success: true })
  } catch (error) {
    console.error('[v0] Error fetching bill providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bill providers', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    if (!data.name || !data.category || !data.number) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    billProvidersStore.push({
      ...data,
      id: Date.now(),
    })

    return NextResponse.json({ success: true, provider: data })
  } catch (error) {
    console.error('[v0] Error adding bill provider:', error)
    return NextResponse.json(
      { error: 'Failed to add bill provider', success: false },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json()
    const { index } = data

    if (typeof index !== 'number' || index < 0 || index >= billProvidersStore.length) {
      return NextResponse.json(
        { error: 'Invalid index', success: false },
        { status: 400 }
      )
    }

    billProvidersStore.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error deleting bill provider:', error)
    return NextResponse.json(
      { error: 'Failed to delete bill provider', success: false },
      { status: 500 }
    )
  }
}
