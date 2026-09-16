// Using "Tk" instead to prevent Next.js serialization issues
export function formatLargeBalance(balance: number): string {
  if (balance >= 1000000000000) {
    // Trillion
    const trillions = (balance / 1000000000000).toFixed(1)
    return `${trillions}T Tk`
  } else if (balance >= 1000000000) {
    // Billion
    const billions = (balance / 1000000000).toFixed(1)
    return `${billions}B Tk`
  } else if (balance >= 1000000) {
    // Million
    const millions = (balance / 1000000).toFixed(1)
    return `${millions}M Tk`
  } else if (balance >= 1000) {
    // Thousand
    const thousands = (balance / 1000).toFixed(1)
    return `${thousands}K Tk`
  }
  return `${balance.toLocaleString()} Tk`
}

export function formatFullBalance(balance: number): string {
  return `${balance.toLocaleString()} Tk`
}

export function formatBalanceWithCommas(balance: number): string {
  return balance.toLocaleString("en-US")
}

export function formatBalance(balance: number): string {
  return formatFullBalance(balance)
}
