import { NextResponse } from 'next/server'

const ekPayBillProviders = [
  { id: "desco-postpaid", name: "DESCO POSTPAID", fullName: "Dhaka Electric Supply Company", category: "Electricity", number: "DESCO_POSTPAID", source: "EkPay", enabled: false },
  { id: "desco-prepaid", name: "DESCO PREPAID", fullName: "Dhaka Electric Supply Company", category: "Electricity", number: "DESCO_PREPAID", source: "EkPay", enabled: false },
  { id: "west-zone-postpaid", name: "WEST ZONE POSTPAID", fullName: "West Zone Power Distribution Company", category: "Electricity", number: "WZPDCL_POSTPAID", source: "EkPay", enabled: false },
  { id: "nesco-postpaid", name: "NESCO POSTPAID", fullName: "Northern Electricity Supply Company", category: "Electricity", number: "NESCO_POSTPAID", source: "EkPay", enabled: false },
  { id: "nesco-prepaid", name: "NESCO PREPAID", fullName: "Northern Electricity Supply Company", category: "Electricity", number: "NESCO_PREPAID", source: "EkPay", enabled: false },
  { id: "reb-postpaid", name: "REB POSTPAID", fullName: "Rural Electrification Board / Palli Bidyut", category: "Electricity", number: "REB_POSTPAID", source: "EkPay", enabled: false },
  { id: "dwasa", name: "DHAKA WASA", fullName: "Dhaka Water Supply and Sewerage Authority", category: "Water", number: "DWASA", source: "EkPay", enabled: false, icon: "/images/wasa-logo.jpg", isImage: true },
  { id: "khulnawasa", name: "KHULNA WASA", fullName: "Khulna Water Supply and Sewerage Authority", category: "Water", number: "KHLWASA", source: "EkPay", enabled: false, icon: "/images/khulna-wasa.jpg", isImage: true },
  { id: "rajshahiwasa", name: "RAJSHAHI WASA", fullName: "Rajshahi Water Supply and Sewerage Authority", category: "Water", number: "RJWASA", source: "EkPay", enabled: false, icon: "/images/wasa-logo.jpg", isImage: true },
  { id: "titas", name: "Titas Gas", fullName: "Titas Gas Transmission and Distribution Company", category: "Gas", number: "TITAS", source: "EkPay", enabled: false },
  { id: "jalalabadgas", name: "Jalalabad Gas", fullName: "Jalalabad Gas Transmission and Distribution System", category: "Gas", number: "JALALABAD_GAS", source: "EkPay", enabled: false },
  { id: "bgdcl", name: "Bakhrabad Gas", fullName: "Bakhrabad Gas Distribution Company", category: "Gas", number: "BGDCL", source: "EkPay", enabled: false },
]

let billProvidersStore: any[] = []

export async function GET() {
  try {
    return NextResponse.json({ providers: [...ekPayBillProviders, ...billProvidersStore], success: true })
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
