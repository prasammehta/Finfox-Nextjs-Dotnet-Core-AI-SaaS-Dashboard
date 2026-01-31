/**
 * Generates a unique invoice number with format: NX{dd}{mm}{random3digits}
 * Example: NX1301457 (13 = day, 01 = month, 457 = random 3-digit number)
 */
export const generateInvoiceNumber = (): string => {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, '0')
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const randomDigits = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  
  return `NX${day}${month}${randomDigits}`
}
