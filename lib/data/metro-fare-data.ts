// Dhaka Metro Rail Fare Chart Data (Based on DMTCL Official Rates)
// All prices in Bangladeshi Taka (BDT)

export interface MetroStation {
  id: string
  name: string
  nameBn: string
  order: number
}

export const metroStations: MetroStation[] = [
  { id: "uttara-north", name: "Uttara North", nameBn: "উত্তরা উত্তর", order: 1 },
  { id: "uttara-center", name: "Uttara Center", nameBn: "উত্তরা কেন্দ্র", order: 2 },
  { id: "uttara-south", name: "Uttara South", nameBn: "উত্তরা দক্ষিণ", order: 3 },
  { id: "pallabi", name: "Pallabi", nameBn: "পল্লবী", order: 4 },
  { id: "mirpur-11", name: "Mirpur-11", nameBn: "মিরপুর-১১", order: 5 },
  { id: "mirpur-10", name: "Mirpur-10", nameBn: "মিরপুর-১০", order: 6 },
  { id: "kazipara", name: "Kazipara", nameBn: "কাজীপাড়া", order: 7 },
  { id: "shewrapara", name: "Shewrapara", nameBn: "শেওড়াপাড়া", order: 8 },
  { id: "agargaon", name: "Agargaon", nameBn: "আগারগাঁও", order: 9 },
  { id: "bijoy-sarani", name: "Bijoy Sarani", nameBn: "বিজয় সরণি", order: 10 },
  { id: "farmgate", name: "Farmgate", nameBn: "ফার্মগেট", order: 11 },
  { id: "karwan-bazar", name: "Karwan Bazar", nameBn: "কারওয়ান বাজার", order: 12 },
  { id: "shahbagh", name: "Shahbagh", nameBn: "শাহবাগ", order: 13 },
  { id: "dhaka-university", name: "Dhaka University", nameBn: "ঢাকা বিশ্ববিদ্যালয়", order: 14 },
  { id: "secretariat", name: "Bangladesh Secretariat", nameBn: "সচিবালয়", order: 15 },
  { id: "motijheel", name: "Motijheel", nameBn: "মতিঝিল", order: 16 },
  { id: "kamalapur", name: "Kamalapur", nameBn: "কমলাপুর", order: 17 },
]

// Fare matrix based on the official DMTCL fare chart
// Row = From Station, Column = To Station
export const fareMatrix: number[][] = [
  // Uttara North
  [0, 20, 20, 30, 30, 40, 40, 50, 50, 60, 60, 70, 80, 80, 90, 90, 100],
  // Uttara Center
  [20, 0, 20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 70, 80, 90, 90, 100],
  // Uttara South
  [20, 20, 0, 20, 20, 30, 30, 40, 40, 50, 50, 60, 70, 70, 80, 90, 90],
  // Pallabi
  [30, 20, 20, 0, 20, 20, 20, 30, 30, 40, 40, 50, 60, 60, 70, 80, 80],
  // Mirpur-11
  [30, 30, 20, 20, 0, 20, 20, 20, 30, 40, 40, 50, 60, 60, 70, 70, 80],
  // Mirpur-10
  [40, 30, 30, 20, 20, 0, 20, 20, 20, 30, 30, 40, 50, 50, 60, 60, 70],
  // Kazipara
  [40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 40, 40, 50, 50, 60, 70],
  // Shewrapara
  [50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30, 40, 40, 50, 60],
  // Agargaon
  [50, 50, 40, 30, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30, 40, 40, 50],
  // Bijoy Sarani
  [60, 60, 50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30, 40, 50],
  // Farmgate
  [60, 60, 50, 40, 40, 30, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30, 40],
  // Karwan Bazar
  [70, 70, 60, 50, 50, 40, 40, 30, 20, 20, 20, 0, 20, 20, 20, 30, 30],
  // Shahbagh
  [80, 70, 70, 60, 60, 50, 40, 30, 30, 20, 20, 20, 0, 20, 20, 20, 20],
  // Dhaka University
  [80, 80, 70, 60, 60, 50, 50, 40, 30, 30, 20, 20, 20, 0, 20, 20, 20],
  // Secretariat
  [90, 90, 80, 70, 70, 60, 50, 40, 40, 30, 30, 20, 20, 20, 0, 20, 20],
  // Motijheel
  [90, 90, 90, 80, 70, 60, 60, 50, 40, 40, 30, 30, 20, 20, 20, 0, 20],
  // Kamalapur
  [100, 100, 90, 80, 80, 70, 70, 60, 50, 50, 40, 30, 20, 20, 20, 20, 0],
]

// Get fare between two stations
export function getFare(fromStationName: string, toStationName: string): number {
  const fromStation = metroStations.find((s) => s.name === fromStationName)
  const toStation = metroStations.find((s) => s.name === toStationName)

  if (!fromStation || !toStation) {
    return 30 // Default fare if stations not found
  }

  const fromIndex = fromStation.order - 1
  const toIndex = toStation.order - 1

  return fareMatrix[fromIndex][toIndex]
}

// Calculate distance-based fare (alternative method)
export function calculateFareByDistance(fromStationName: string, toStationName: string): number {
  const fromStation = metroStations.find((s) => s.name === fromStationName)
  const toStation = metroStations.find((s) => s.name === toStationName)

  if (!fromStation || !toStation) {
    return 30
  }

  const distance = Math.abs(fromStation.order - toStation.order)

  // DMTCL fare structure: Tk20 per station (approximately)
  if (distance === 0) return 0
  if (distance === 1) return 20
  if (distance <= 3) return 20 + (distance - 1) * 10
  if (distance <= 6) return 40 + (distance - 3) * 10
  if (distance <= 10) return 70 + (distance - 6) * 10
  return 100 // Maximum fare
}
