import { NextResponse } from 'next/server'

const ekPayBillProviders = [
  { id: "desco", name: "DESCO", fullName: "Dhaka Electric Supply Company", category: "Electricity", number: "DESCO", source: "EkPay", enabled: false },
  { id: "dpdc", name: "DPDC", fullName: "Dhaka Power Distribution Company", category: "Electricity", number: "DPDC", source: "EkPay", enabled: false },
  { id: "nesco", name: "NESCO", fullName: "Northern Electricity Supply Company", category: "Electricity", number: "NESCO", source: "EkPay", enabled: false },
  { id: "wzpdcl", name: "WZPDCL", fullName: "West Zone Power Distribution Company", category: "Electricity", number: "WZPDCL", source: "EkPay", enabled: false },
  { id: "reb", name: "REB/PBS", fullName: "Rural Electrification Board / Palli Bidyut", category: "Electricity", number: "REB", source: "EkPay", enabled: false },
  { id: "dwasa", name: "ঢাকা WASA", fullName: "Dhaka Water Supply and Sewerage Authority", category: "Water", number: "DWASA", source: "EkPay", enabled: false },
  { id: "ctgwasa", name: "চট্টগ্রাম WASA", fullName: "Chattogram Water Supply and Sewerage Authority", category: "Water", number: "CTGWASA", source: "EkPay", enabled: false },
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
