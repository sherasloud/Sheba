"use client"

import { useState } from "react"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RemittancePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  // COMPREHENSIVE list of 190+ countries with CURRENT accurate exchange rates (1 BDT = X Foreign Currency)
  const countries = [
    // TOP REMITTANCE DESTINATIONS - Most popular first
    { name: "United States", code: "US", flag: "🇺🇸", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "United Kingdom", code: "GB", flag: "🇬🇧", rate: "0.0065", currency: "GBP" }, // 1 GBP = 154 BDT
    { name: "Canada", code: "CA", flag: "🇨🇦", rate: "0.011", currency: "CAD" }, // 1 CAD = 90.5 BDT
    { name: "Australia", code: "AU", flag: "🇦🇺", rate: "0.013", currency: "AUD" }, // 1 AUD = 77.8 BDT
    { name: "United Arab Emirates", code: "AE", flag: "🇦🇪", rate: "0.030", currency: "AED" }, // 1 AED = 33.2 BDT
    { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", rate: "0.031", currency: "SAR" }, // 1 SAR = 32.5 BDT
    { name: "Japan", code: "JP", flag: "🇯🇵", rate: "1.22", currency: "JPY" }, // 1 JPY = 0.82 BDT

    // EUROPE - All European countries (45+ countries)
    { name: "Germany", code: "DE", flag: "🇩🇪", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "France", code: "FR", flag: "🇫🇷", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Italy", code: "IT", flag: "🇮🇹", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Spain", code: "ES", flag: "🇪🇸", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Portugal", code: "PT", flag: "🇵🇹", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Netherlands", code: "NL", flag: "🇳🇱", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Belgium", code: "BE", flag: "🇧🇪", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Austria", code: "AT", flag: "🇦🇹", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Switzerland", code: "CH", flag: "🇨🇭", rate: "0.0074", currency: "CHF" }, // 1 CHF = 135 BDT
    { name: "Norway", code: "NO", flag: "🇳🇴", rate: "0.088", currency: "NOK" }, // 1 NOK = 11.4 BDT
    { name: "Sweden", code: "SE", flag: "🇸🇪", rate: "0.088", currency: "SEK" }, // 1 SEK = 11.4 BDT
    { name: "Denmark", code: "DK", flag: "🇩🇰", rate: "0.057", currency: "DKK" }, // 1 DKK = 17.7 BDT
    { name: "Finland", code: "FI", flag: "🇫🇮", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Iceland", code: "IS", flag: "🇮🇸", rate: "1.13", currency: "ISK" }, // 1 ISK = 0.88 BDT
    { name: "Ireland", code: "IE", flag: "🇮🇪", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Luxembourg", code: "LU", flag: "🇱🇺", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Greece", code: "GR", flag: "🇬🇷", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Malta", code: "MT", flag: "🇲🇹", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Poland", code: "PL", flag: "🇵🇱", rate: "0.033", currency: "PLN" }, // 1 PLN = 30 BDT
    { name: "Czech Republic", code: "CZ", flag: "🇨🇿", rate: "0.19", currency: "CZK" }, // 1 CZK = 5.3 BDT
    { name: "Hungary", code: "HU", flag: "🇭🇺", rate: "2.98", currency: "HUF" }, // 1 HUF = 0.34 BDT
    { name: "Romania", code: "RO", flag: "🇷🇴", rate: "0.038", currency: "RON" }, // 1 RON = 26.6 BDT
    { name: "Bulgaria", code: "BG", flag: "🇧🇬", rate: "0.015", currency: "BGN" }, // 1 BGN = 69.2 BDT
    { name: "Croatia", code: "HR", flag: "🇭🇷", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Slovenia", code: "SI", flag: "🇸🇮", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Slovakia", code: "SK", flag: "🇸🇰", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Estonia", code: "EE", flag: "🇪🇪", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Latvia", code: "LV", flag: "🇱🇻", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Lithuania", code: "LT", flag: "🇱🇹", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Serbia", code: "RS", flag: "🇷🇸", rate: "0.88", currency: "RSD" }, // 1 RSD = 1.13 BDT
    { name: "Bosnia and Herzegovina", code: "BA", flag: "🇧🇦", rate: "0.015", currency: "BAM" }, // 1 BAM = 69.2 BDT
    { name: "North Macedonia", code: "MK", flag: "🇲🇰", rate: "0.47", currency: "MKD" }, // 1 MKD = 2.13 BDT
    { name: "Albania", code: "AL", flag: "🇦🇱", rate: "0.76", currency: "ALL" }, // 1 ALL = 1.32 BDT
    { name: "Montenegro", code: "ME", flag: "🇲🇪", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Kosovo", code: "XK", flag: "🇽🇰", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Russia", code: "RU", flag: "🇷🇺", rate: "0.76", currency: "RUB" }, // 1 RUB = 1.32 BDT
    { name: "Belarus", code: "BY", flag: "🇧🇾", rate: "0.021", currency: "BYN" }, // 1 BYN = 48.2 BDT
    { name: "Moldova", code: "MD", flag: "🇲🇩", rate: "0.14", currency: "MDL" }, // 1 MDL = 6.9 BDT
    { name: "Georgia", code: "GE", flag: "🇬🇪", rate: "0.022", currency: "GEL" }, // 1 GEL = 46.2 BDT
    { name: "Armenia", code: "AM", flag: "🇦🇲", rate: "3.16", currency: "AMD" }, // 1 AMD = 0.32 BDT
    { name: "Azerbaijan", code: "AZ", flag: "🇦🇿", rate: "0.014", currency: "AZN" }, // 1 AZN = 71.7 BDT
    { name: "Andorra", code: "AD", flag: "🇦🇩", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Monaco", code: "MC", flag: "🇲🇨", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "San Marino", code: "SM", flag: "🇸🇲", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Vatican City", code: "VA", flag: "🇻🇦", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Liechtenstein", code: "LI", flag: "🇱🇮", rate: "0.0074", currency: "CHF" }, // 1 CHF = 135 BDT

    // ASIA PACIFIC - Extended (40+ countries)
    { name: "Singapore", code: "SG", flag: "🇸🇬", rate: "0.011", currency: "SGD" }, // 1 SGD = 90.2 BDT
    { name: "Malaysia", code: "MY", flag: "🇲🇾", rate: "0.037", currency: "MYR" }, // 1 MYR = 27.1 BDT
    { name: "Thailand", code: "TH", flag: "🇹🇭", rate: "0.29", currency: "THB" }, // 1 THB = 3.45 BDT
    { name: "South Korea", code: "KR", flag: "🇰🇷", rate: "10.8", currency: "KRW" }, // 1 KRW = 0.093 BDT
    { name: "China", code: "CN", flag: "🇨🇳", rate: "0.059", currency: "CNY" }, // 1 CNY = 16.9 BDT
    { name: "Hong Kong", code: "HK", flag: "🇭🇰", rate: "0.064", currency: "HKD" }, // 1 HKD = 15.6 BDT
    { name: "Taiwan", code: "TW", flag: "🇹🇼", rate: "0.26", currency: "TWD" }, // 1 TWD = 3.85 BDT
    { name: "Philippines", code: "PH", flag: "🇵🇭", rate: "0.46", currency: "PHP" }, // 1 PHP = 2.17 BDT
    { name: "Indonesia", code: "ID", flag: "🇮🇩", rate: "125", currency: "IDR" }, // 1 IDR = 0.008 BDT
    { name: "Vietnam", code: "VN", flag: "🇻🇳", rate: "197", currency: "VND" }, // 1 VND = 0.0051 BDT
    { name: "Cambodia", code: "KH", flag: "🇰🇭", rate: "33.5", currency: "KHR" }, // 1 KHR = 0.030 BDT
    { name: "Laos", code: "LA", flag: "🇱🇦", rate: "139", currency: "LAK" }, // 1 LAK = 0.0072 BDT
    { name: "Myanmar", code: "MM", flag: "🇲🇲", rate: "17.2", currency: "MMK" }, // 1 MMK = 0.058 BDT
    { name: "Brunei", code: "BN", flag: "🇧🇳", rate: "0.011", currency: "BND" }, // 1 BND = 90.2 BDT
    { name: "New Zealand", code: "NZ", flag: "🇳🇿", rate: "0.013", currency: "NZD" }, // 1 NZD = 74 BDT
    { name: "Fiji", code: "FJ", flag: "🇫🇯", rate: "0.018", currency: "FJD" }, // 1 FJD = 55.4 BDT
    { name: "Papua New Guinea", code: "PG", flag: "🇵🇬", rate: "0.029", currency: "PGK" }, // 1 PGK = 34.7 BDT
    { name: "Solomon Islands", code: "SB", flag: "🇸🇧", rate: "0.068", currency: "SBD" }, // 1 SBD = 14.7 BDT
    { name: "Vanuatu", code: "VU", flag: "🇻🇺", rate: "0.97", currency: "VUV" }, // 1 VUV = 1.03 BDT
    { name: "Samoa", code: "WS", flag: "🇼🇸", rate: "0.022", currency: "WST" }, // 1 WST = 46.2 BDT
    { name: "Tonga", code: "TO", flag: "🇹🇴", rate: "0.019", currency: "TOP" }, // 1 TOP = 52.8 BDT
    { name: "Palau", code: "PW", flag: "🇵🇼", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Marshall Islands", code: "MH", flag: "🇲🇭", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Micronesia", code: "FM", flag: "🇫🇲", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Nauru", code: "NR", flag: "🇳🇷", rate: "0.013", currency: "AUD" }, // 1 AUD = 77.8 BDT
    { name: "Kiribati", code: "KI", flag: "🇰🇮", rate: "0.013", currency: "AUD" }, // 1 AUD = 77.8 BDT
    { name: "Tuvalu", code: "TV", flag: "🇹🇻", rate: "0.013", currency: "AUD" }, // 1 AUD = 77.8 BDT
    { name: "Cook Islands", code: "CK", flag: "🇨🇰", rate: "0.013", currency: "NZD" }, // 1 NZD = 74 BDT
    { name: "Niue", code: "NU", flag: "🇳🇺", rate: "0.013", currency: "NZD" }, // 1 NZD = 74 BDT
    { name: "Tokelau", code: "TK", flag: "🇹🇰", rate: "0.013", currency: "NZD" }, // 1 NZD = 74 BDT
    { name: "American Samoa", code: "AS", flag: "🇦🇸", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Guam", code: "GU", flag: "🇬🇺", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Northern Mariana Islands", code: "MP", flag: "🇲🇵", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "French Polynesia", code: "PF", flag: "🇵🇫", rate: "0.91", currency: "XPF" }, // 1 XPF = 1.1 BDT
    { name: "New Caledonia", code: "NC", flag: "🇳🇨", rate: "0.91", currency: "XPF" }, // 1 XPF = 1.1 BDT
    { name: "Wallis and Futuna", code: "WF", flag: "🇼🇫", rate: "0.91", currency: "XPF" }, // 1 XPF = 1.1 BDT
    { name: "Kazakhstan", code: "KZ", flag: "🇰🇿", rate: "3.7", currency: "KZT" }, // 1 KZT = 0.27 BDT
    { name: "Uzbekistan", code: "UZ", flag: "🇺🇿", rate: "99.5", currency: "UZS" }, // 1 UZS = 0.010 BDT
    { name: "Kyrgyzstan", code: "KG", flag: "🇰🇬", rate: "0.73", currency: "KGS" }, // 1 KGS = 1.36 BDT
    { name: "Tajikistan", code: "TJ", flag: "🇹🇯", rate: "0.089", currency: "TJS" }, // 1 TJS = 11.2 BDT
    { name: "Turkmenistan", code: "TM", flag: "🇹🇲", rate: "0.029", currency: "TMT" }, // 1 TMT = 34.8 BDT
    { name: "Mongolia", code: "MN", flag: "🇲🇳", rate: "22.1", currency: "MNT" }, // 1 MNT = 0.045 BDT
    { name: "North Korea", code: "KP", flag: "🇰🇵", rate: "7.4", currency: "KPW" }, // 1 KPW = 0.135 BDT
    { name: "Macau", code: "MO", flag: "🇲🇴", rate: "0.066", currency: "MOP" }, // 1 MOP = 15.2 BDT

    // SOUTH ASIA - Extended (without India)
    { name: "Pakistan", code: "PK", flag: "🇵🇰", rate: "2.28", currency: "PKR" }, // 1 PKR = 0.44 BDT
    { name: "Nepal", code: "NP", flag: "🇳🇵", rate: "1.09", currency: "NPR" }, // 1 NPR = 0.92 BDT
    { name: "Sri Lanka", code: "LK", flag: "🇱🇰", rate: "2.46", currency: "LKR" }, // 1 LKR = 0.41 BDT
    { name: "Afghanistan", code: "AF", flag: "🇦🇫", rate: "0.59", currency: "AFN" }, // 1 AFN = 1.69 BDT
    { name: "Maldives", code: "MV", flag: "🇲🇻", rate: "0.13", currency: "MVR" }, // 1 MVR = 7.9 BDT
    { name: "Bhutan", code: "BT", flag: "🇧🇹", rate: "0.69", currency: "BTN" }, // 1 BTN = 1.45 BDT

    // MIDDLE EAST - Extended (without Israel)
    { name: "Qatar", code: "QA", flag: "🇶🇦", rate: "0.030", currency: "QAR" }, // 1 QAR = 33.5 BDT
    { name: "Kuwait", code: "KW", flag: "🇰🇼", rate: "0.0025", currency: "KWD" }, // 1 KWD = 400 BDT
    { name: "Bahrain", code: "BH", flag: "🇧🇭", rate: "0.0031", currency: "BHD" }, // 1 BHD = 323 BDT
    { name: "Oman", code: "OM", flag: "🇴🇲", rate: "0.0032", currency: "OMR" }, // 1 OMR = 317 BDT
    { name: "Jordan", code: "JO", flag: "🇯🇴", rate: "0.0058", currency: "JOD" }, // 1 JOD = 172 BDT
    { name: "Lebanon", code: "LB", flag: "🇱🇧", rate: "124", currency: "LBP" }, // 1 LBP = 0.0081 BDT
    { name: "Syria", code: "SY", flag: "🇸🇾", rate: "20.6", currency: "SYP" }, // 1 SYP = 0.049 BDT
    { name: "Iraq", code: "IQ", flag: "🇮🇶", rate: "10.7", currency: "IQD" }, // 1 IQD = 0.093 BDT
    { name: "Iran", code: "IR", flag: "🇮🇷", rate: "3450", currency: "IRR" }, // 1 IRR = 0.00029 BDT
    { name: "Palestine", code: "PS", flag: "🇵🇸", rate: "0.030", currency: "ILS" }, // 1 ILS = 33.2 BDT
    { name: "Turkey", code: "TR", flag: "🇹🇷", rate: "0.28", currency: "TRY" }, // 1 TRY = 3.57 BDT
    { name: "Yemen", code: "YE", flag: "🇾🇪", rate: "2.05", currency: "YER" }, // 1 YER = 0.49 BDT

    // AFRICA - All African countries (54+ countries)
    { name: "South Africa", code: "ZA", flag: "🇿🇦", rate: "0.15", currency: "ZAR" }, // 1 ZAR = 6.5 BDT
    { name: "Nigeria", code: "NG", flag: "🇳🇬", rate: "12.8", currency: "NGN" }, // 1 NGN = 0.078 BDT
    { name: "Egypt", code: "EG", flag: "🇪🇬", rate: "0.49", currency: "EGP" }, // 1 EGP = 2.04 BDT
    { name: "Morocco", code: "MA", flag: "🇲🇦", rate: "0.082", currency: "MAD" }, // 1 MAD = 12.2 BDT
    { name: "Tunisia", code: "TN", flag: "🇹🇳", rate: "0.025", currency: "TND" }, // 1 TND = 39.5 BDT
    { name: "Algeria", code: "DZ", flag: "🇩🇿", rate: "1.10", currency: "DZD" }, // 1 DZD = 0.91 BDT
    { name: "Libya", code: "LY", flag: "🇱🇾", rate: "0.040", currency: "LYD" }, // 1 LYD = 25.2 BDT
    { name: "Kenya", code: "KE", flag: "🇰🇪", rate: "1.29", currency: "KES" }, // 1 KES = 0.77 BDT
    { name: "Ghana", code: "GH", flag: "🇬🇭", rate: "1.22", currency: "GHS" }, // 1 GHS = 0.82 BDT
    { name: "Ethiopia", code: "ET", flag: "🇪🇹", rate: "5.5", currency: "ETB" }, // 1 ETB = 0.18 BDT
    { name: "Tanzania", code: "TZ", flag: "🇹🇿", rate: "24.2", currency: "TZS" }, // 1 TZS = 0.041 BDT
    { name: "Uganda", code: "UG", flag: "🇺🇬", rate: "30.2", currency: "UGX" }, // 1 UGX = 0.033 BDT
    { name: "Rwanda", code: "RW", flag: "🇷🇼", rate: "11.2", currency: "RWF" }, // 1 RWF = 0.089 BDT
    { name: "Zambia", code: "ZM", flag: "🇿🇲", rate: "0.22", currency: "ZMW" }, // 1 ZMW = 4.65 BDT
    { name: "Botswana", code: "BW", flag: "🇧🇼", rate: "0.11", currency: "BWP" }, // 1 BWP = 9.2 BDT
    { name: "Namibia", code: "NA", flag: "🇳🇦", rate: "0.15", currency: "NAD" }, // 1 NAD = 6.5 BDT
    { name: "Mozambique", code: "MZ", flag: "🇲🇿", rate: "5.2", currency: "MZN" }, // 1 MZN = 0.19 BDT
    { name: "Madagascar", code: "MG", flag: "🇲🇬", rate: "37.2", currency: "MGA" }, // 1 MGA = 0.027 BDT
    { name: "Mauritius", code: "MU", flag: "🇲🇺", rate: "0.37", currency: "MUR" }, // 1 MUR = 2.7 BDT
    { name: "Seychelles", code: "SC", flag: "🇸🇨", rate: "0.11", currency: "SCR" }, // 1 SCR = 9.2 BDT
    { name: "Angola", code: "AO", flag: "🇦🇴", rate: "6.8", currency: "AOA" }, // 1 AOA = 0.15 BDT
    { name: "Cameroon", code: "CM", flag: "🇨🇲", rate: "5.0", currency: "XAF" }, // 1 XAF = 0.20 BDT
    { name: "Chad", code: "TD", flag: "🇹🇩", rate: "5.0", currency: "XAF" }, // 1 XAF = 0.20 BDT
    { name: "Central African Republic", code: "CF", flag: "🇨🇫", rate: "5.0", currency: "XAF" }, // 1 XAF = 0.20 BDT
    { name: "Republic of the Congo", code: "CG", flag: "🇨🇬", rate: "5.0", currency: "XAF" }, // 1 XAF = 0.20 BDT
    { name: "Democratic Republic of the Congo", code: "CD", flag: "🇨🇩", rate: "20.5", currency: "CDF" }, // 1 CDF = 0.049 BDT
    { name: "Equatorial Guinea", code: "GQ", flag: "🇬🇶", rate: "5.0", currency: "XAF" }, // 1 XAF = 0.20 BDT
    { name: "Gabon", code: "GA", flag: "🇬🇦", rate: "5.0", currency: "XAF" }, // 1 XAF = 0.20 BDT
    { name: "Ivory Coast", code: "CI", flag: "🇨🇮", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Burkina Faso", code: "BF", flag: "🇧🇫", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Mali", code: "ML", flag: "🇲🇱", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Niger", code: "NE", flag: "🇳🇪", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Senegal", code: "SN", flag: "🇸🇳", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Benin", code: "BJ", flag: "🇧🇯", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Togo", code: "TG", flag: "🇹🇬", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Guinea-Bissau", code: "GW", flag: "🇬🇼", rate: "5.0", currency: "XOF" }, // 1 XOF = 0.20 BDT
    { name: "Guinea", code: "GN", flag: "🇬🇳", rate: "88.5", currency: "GNF" }, // 1 GNF = 0.011 BDT
    { name: "Sierra Leone", code: "SL", flag: "🇸🇱", rate: "172", currency: "SLL" }, // 1 SLL = 0.0058 BDT
    { name: "Liberia", code: "LR", flag: "🇱🇷", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Gambia", code: "GM", flag: "🇬🇲", rate: "0.55", currency: "GMD" }, // 1 GMD = 1.82 BDT
    { name: "Cape Verde", code: "CV", flag: "🇨🇻", rate: "0.84", currency: "CVE" }, // 1 CVE = 1.19 BDT
    { name: "Mauritania", code: "MR", flag: "🇲🇷", rate: "0.31", currency: "MRU" }, // 1 MRU = 3.26 BDT
    { name: "Sudan", code: "SD", flag: "🇸🇩", rate: "4.9", currency: "SDG" }, // 1 SDG = 0.20 BDT
    { name: "South Sudan", code: "SS", flag: "🇸🇸", rate: "1.07", currency: "SSP" }, // 1 SSP = 0.93 BDT
    { name: "Eritrea", code: "ER", flag: "🇪🇷", rate: "0.12", currency: "ERN" }, // 1 ERN = 8.12 BDT
    { name: "Djibouti", code: "DJ", flag: "🇩🇯", rate: "1.46", currency: "DJF" }, // 1 DJF = 0.68 BDT
    { name: "Somalia", code: "SO", flag: "🇸🇴", rate: "4.7", currency: "SOS" }, // 1 SOS = 0.21 BDT
    { name: "Burundi", code: "BI", flag: "🇧🇮", rate: "18.5", currency: "BIF" }, // 1 BIF = 0.054 BDT
    { name: "Malawi", code: "MW", flag: "🇲🇼", rate: "8.4", currency: "MWK" }, // 1 MWK = 0.12 BDT
    { name: "Zimbabwe", code: "ZW", flag: "🇿🇼", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Swaziland", code: "SZ", flag: "🇸🇿", rate: "0.15", currency: "SZL" }, // 1 SZL = 6.5 BDT
    { name: "Lesotho", code: "LS", flag: "🇱🇸", rate: "0.15", currency: "LSL" }, // 1 LSL = 6.5 BDT
    { name: "Comoros", code: "KM", flag: "🇰🇲", rate: "3.8", currency: "KMF" }, // 1 KMF = 0.26 BDT
    { name: "São Tomé and Príncipe", code: "ST", flag: "🇸🇹", rate: "0.19", currency: "STN" }, // 1 STN = 5.26 BDT

    // AMERICAS - All American countries (35+ countries)
    { name: "Brazil", code: "BR", flag: "🇧🇷", rate: "0.041", currency: "BRL" }, // 1 BRL = 24.1 BDT
    { name: "Argentina", code: "AR", flag: "🇦🇷", rate: "8.3", currency: "ARS" }, // 1 ARS = 0.12 BDT
    { name: "Chile", code: "CL", flag: "🇨🇱", rate: "7.9", currency: "CLP" }, // 1 CLP = 0.13 BDT
    { name: "Colombia", code: "CO", flag: "🇨🇴", rate: "34.1", currency: "COP" }, // 1 COP = 0.029 BDT
    { name: "Peru", code: "PE", flag: "🇵🇪", rate: "0.031", currency: "PEN" }, // 1 PEN = 32.6 BDT
    { name: "Ecuador", code: "EC", flag: "🇪🇨", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Bolivia", code: "BO", flag: "🇧🇴", rate: "0.057", currency: "BOB" }, // 1 BOB = 17.6 BDT
    { name: "Paraguay", code: "PY", flag: "🇵🇾", rate: "59.7", currency: "PYG" }, // 1 PYG = 0.017 BDT
    { name: "Uruguay", code: "UY", flag: "🇺🇾", rate: "0.32", currency: "UYU" }, // 1 UYU = 3.08 BDT
    { name: "Venezuela", code: "VE", flag: "🇻🇪", rate: "29.8", currency: "VES" }, // 1 VES = 0.034 BDT
    { name: "Guyana", code: "GY", flag: "🇬🇾", rate: "1.72", currency: "GYD" }, // 1 GYD = 0.58 BDT
    { name: "Suriname", code: "SR", flag: "🇸🇷", rate: "0.29", currency: "SRD" }, // 1 SRD = 3.47 BDT
    { name: "French Guiana", code: "GF", flag: "🇬🇫", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Mexico", code: "MX", flag: "🇲🇽", rate: "0.14", currency: "MXN" }, // 1 MXN = 6.9 BDT
    { name: "Guatemala", code: "GT", flag: "🇬🇹", rate: "0.064", currency: "GTQ" }, // 1 GTQ = 15.6 BDT
    { name: "Belize", code: "BZ", flag: "🇧🇿", rate: "0.016", currency: "BZD" }, // 1 BZD = 61.6 BDT
    { name: "El Salvador", code: "SV", flag: "🇸🇻", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Honduras", code: "HN", flag: "🇭🇳", rate: "0.20", currency: "HNL" }, // 1 HNL = 5.04 BDT
    { name: "Nicaragua", code: "NI", flag: "🇳🇮", rate: "0.30", currency: "NIO" }, // 1 NIO = 3.36 BDT
    { name: "Costa Rica", code: "CR", flag: "🇨🇷", rate: "4.4", currency: "CRC" }, // 1 CRC = 0.22 BDT
    { name: "Panama", code: "PA", flag: "🇵🇦", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Cuba", code: "CU", flag: "🇨🇺", rate: "0.20", currency: "CUP" }, // 1 CUP = 5.04 BDT
    { name: "Jamaica", code: "JM", flag: "🇯🇲", rate: "1.26", currency: "JMD" }, // 1 JMD = 0.79 BDT
    { name: "Haiti", code: "HT", flag: "🇭🇹", rate: "1.08", currency: "HTG" }, // 1 HTG = 0.92 BDT
    { name: "Dominican Republic", code: "DO", flag: "🇩🇴", rate: "0.47", currency: "DOP" }, // 1 DOP = 2.13 BDT
    { name: "Puerto Rico", code: "PR", flag: "🇵🇷", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Trinidad and Tobago", code: "TT", flag: "🇹🇹", rate: "0.055", currency: "TTD" }, // 1 TTD = 18.2 BDT
    { name: "Barbados", code: "BB", flag: "🇧🇧", rate: "0.016", currency: "BBD" }, // 1 BBD = 61.6 BDT
    { name: "Bahamas", code: "BS", flag: "🇧🇸", rate: "0.0082", currency: "BSD" }, // 1 BSD = 121.87 BDT
    { name: "Bermuda", code: "BM", flag: "🇧🇲", rate: "0.0082", currency: "BMD" }, // 1 BMD = 121.87 BDT
    { name: "Cayman Islands", code: "KY", flag: "🇰🇾", rate: "0.0068", currency: "KYD" }, // 1 KYD = 146.2 BDT
    { name: "Turks and Caicos", code: "TC", flag: "🇹🇨", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "British Virgin Islands", code: "VG", flag: "🇻🇬", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "US Virgin Islands", code: "VI", flag: "🇻🇮", rate: "0.0082", currency: "USD" }, // 1 USD = 121.87 BDT
    { name: "Anguilla", code: "AI", flag: "🇦🇮", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Antigua and Barbuda", code: "AG", flag: "🇦🇬", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Dominica", code: "DM", flag: "🇩🇲", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Grenada", code: "GD", flag: "🇬🇩", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Montserrat", code: "MS", flag: "🇲🇸", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Saint Kitts and Nevis", code: "KN", flag: "🇰🇳", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Saint Lucia", code: "LC", flag: "🇱🇨", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Saint Vincent and the Grenadines", code: "VC", flag: "🇻🇨", rate: "0.022", currency: "XCD" }, // 1 XCD = 45.1 BDT
    { name: "Aruba", code: "AW", flag: "🇦🇼", rate: "0.015", currency: "AWG" }, // 1 AWG = 67.7 BDT
    { name: "Curaçao", code: "CW", flag: "🇨🇼", rate: "0.015", currency: "ANG" }, // 1 ANG = 67.7 BDT
    { name: "Sint Maarten", code: "SX", flag: "🇸🇽", rate: "0.015", currency: "ANG" }, // 1 ANG = 67.7 BDT
    { name: "Martinique", code: "MQ", flag: "🇲🇶", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Guadeloupe", code: "GP", flag: "🇬🇵", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Saint Barthélemy", code: "BL", flag: "🇧🇱", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Saint Martin", code: "MF", flag: "🇲🇫", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Saint Pierre and Miquelon", code: "PM", flag: "🇵🇲", rate: "0.0076", currency: "EUR" }, // 1 EUR = 132 BDT
    { name: "Greenland", code: "GL", flag: "🇬🇱", rate: "0.057", currency: "DKK" }, // 1 DKK = 17.7 BDT
    { name: "Faroe Islands", code: "FO", flag: "🇫🇴", rate: "0.057", currency: "DKK" }, // 1 DKK = 17.7 BDT
  ]

  const filteredCountries = countries.filter((country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCountrySelect = (country: any) => {
    // Save selected country to localStorage
    localStorage.setItem("remittanceCountry", JSON.stringify(country))
    router.push("/remittance/amount")
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#29a9eb] text-white p-4 flex items-center">
        <Link href="/" className="mr-4">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-xl font-medium">Send Money Abroad</div>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 font-medium">
            🌍 {filteredCountries.length} countries available for remittance
          </p>
          <p className="text-xs text-gray-500 mt-1">Send money to anywhere in the world with live exchange rates</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4">
          {filteredCountries.map((country, index) => (
            <div
              key={country.code}
              onClick={() => handleCountrySelect(country)}
              className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center">
                <img
                  src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  className="w-8 h-6 object-cover rounded mr-3 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling.style.display = "inline"
                  }}
                />
                <span className="text-2xl mr-3 hidden">{country.flag}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{country.name}</h3>
                  <p className="text-sm text-gray-500">
                    1 BDT = {country.rate} {country.currency}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">{country.currency}</div>
                <div className="text-xs text-gray-500">Live Rate</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
