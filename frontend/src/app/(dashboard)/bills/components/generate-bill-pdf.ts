import { BillDT } from "@/types/datatable-schema"
import { toast } from "sonner"
import { getAssetUrl } from "@/services/http"

interface BillCompany {
  billCompanyId: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  gstin?: string | null
  pan?: string | null
  accountName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  logoUrl?: string | null
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const generateBillPDF = (bill: BillDT, billCompanies: BillCompany[]): void => {
  const selectedIssuer = billCompanies.find(c => c.billCompanyId === bill.billFromId)
  const selectedCompany = billCompanies.find(c => c.billCompanyId === bill.billToId)
  const logoUrl = selectedIssuer?.logoUrl ? getAssetUrl(selectedIssuer.logoUrl) : null

  const billItemsArray = Array.isArray(bill.billItems) 
    ? bill.billItems.map(item => typeof item === 'string' ? JSON.parse(item) : item)
    : []

  const subtotal = billItemsArray.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.rate || 0)), 0)
  const gstAmount = (subtotal * (bill.gstRate || 0)) / 100
  const tdsAmount = (subtotal * (bill.tdsPercent || 0)) / 100
  const totalAmount = subtotal + gstAmount - tdsAmount

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${bill.invoiceNumber}</title>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; }
        .page-wrapper { position: relative; min-height: calc(100vh - 40px); padding-bottom: 100px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding: 20px; background-size: contain; background-repeat: no-repeat; background-position: left center; min-height: 120px; }
        .left-accent { width: 30px; height: 110px; background: linear-gradient(180deg,#ff8c42,#d86b2a); border-radius: 2px; box-shadow: 0 1px 0 rgba(0,0,0,0.06); margin-right: 16px; }
        .logo { display: flex; align-items: center; gap: 15px; }
        .company-name { font-size: 32px; font-weight: bold; color: #333; }
        .contact { text-align: right; font-size: 14px; color: #333; }
        .contact div { margin: 5px 0; }
        .divider { border-top: 2px solid #333; margin: 20px 0; }
        .invoice-header { display: flex; justify-content: space-between; margin: 20px 0; font-size: 14px; }
        .invoice-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .invoice-meta { display: flex; gap: 30px; }
        .meta-label { color: #666; font-size: 12px; font-weight: bold; }
        .meta-value { color: #333; font-weight: 500; }
        .info-section { display: flex; justify-content: space-between; margin: 30px 0; gap: 40px; }
        .info-group { flex: 1; }
        .section-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 10px; }
        .info-row { display: flex; flex-direction: column; margin: 8px 0; font-size: 13px; }
        .info-label { color: #666; font-weight: bold; margin-bottom: 2px; }
        .info-value { color: #333; }
        .services-table { margin: 30px 0; }
        .services-table table { width: 100%; border-collapse: collapse; }
        .services-table th { background: #1a1a1a; color: white; padding: 12px; text-align: left; font-weight: 500; }
        .services-table td { padding: 12px; border: 1px solid #ddd; vertical-align: middle; }
        .services-table .amount { text-align: right; }
        .summary-section { display: flex; justify-content: flex-end; margin: 30px 0; }
        .summary { width: 400px; }
        .summary-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #ddd; }
        .summary-row.total { font-weight: bold; font-size: 16px; background: #f5f5f5; padding: 12px; margin-top: 10px; border: 2px solid #333; }
        .bank-section { margin-top: 40px; font-size: 13px; }
        .bank-label { font-weight: bold; color: #333; margin-bottom: 8px; }
        .bank-detail { margin: 5px 0; color: #333; }
        .footer-note { text-align: center; font-size: 12px; color: #666; }
        .terms-section { margin-top: 40px; }
        .terms-title { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px; }
        .terms-item { font-size: 13px; color: #333; margin: 5px 0; margin-left: 20px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: -1; opacity: 0.1; pointer-events: none; }
          .watermark img { width: 600px; height: 600px; object-fit: contain; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
     <div class="watermark">
          <img src="${logoUrl}" alt="Watermark" />
        </div>
      <div class="page-wrapper">
      <div class="header">
        <div style="display:flex;align-items:center;">
          <div class="left-accent"></div>
          <div class="logo">
            <div class="company-name">${selectedIssuer?.name || 'Company'}</div>
          </div>
        </div>
        <div class="contact">
          <div>${selectedIssuer?.email || ''}</div>
          <div>${selectedIssuer?.phone || ''}</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="invoice-header">
        <div class="invoice-title">Invoice</div>
        <div class="invoice-meta">
          <div class="meta-item">
            <div class="meta-label">Date</div>
            <div class="meta-value">${formatDate(bill.issueDate)}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Invoice No</div>
            <div class="meta-value">${bill.invoiceNumber}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-group">
          <div class="section-title">INVOICE FROM :</div>
          <div class="info-row">
            <span class="info-value" style="font-weight: bold; margin-bottom: 8px;">${selectedIssuer?.name || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-value">${selectedIssuer?.address || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">GSTIN</span>
            <span class="info-value">${selectedIssuer?.gstin || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">PAN</span>
            <span class="info-value">${selectedIssuer?.pan || 'N/A'}</span>
          </div>
        </div>
        <div class="info-group">
          <div class="section-title">INVOICE TO :</div>
          <div class="info-row">
            <span class="info-value" style="font-weight: bold; margin-bottom: 8px;">${selectedCompany?.name || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-value">${selectedCompany?.address || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">GSTIN</span>
            <span class="info-value">${selectedCompany?.gstin || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">PAN</span>
            <span class="info-value">${selectedCompany?.pan || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="services-table">
        <table>
          <thead>
            <tr>
              <th>Services</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th class="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${billItemsArray.map((item: any) => `
            <tr>
              <td>${item.description || ''}</td>
              <td>${item.quantity || 0}</td>
              <td>₹ ${parseFloat(item.rate || 0).toFixed(2)}</td>
              <td class="amount">₹ ${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="divider"></div>

      <div class="summary-section">
        <div class="summary">
          <div class="summary-row">
            <span>Sub-total :</span>
            <span>₹ ${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div class="summary-row">
            <span>${bill.gstRate}% GST :</span>
            <span>₹ ${gstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          ${bill.tdsPercent > 0 ? `
          <div class="summary-row">
            <span>TDS (${bill.tdsPercent}%) :</span>
            <span>- ₹ ${tdsAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          ` : ''}
          <div class="summary-row total">
            <span>Amount To Be Paid :</span>
            <span>₹ ${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="bank-section">
        <div class="bank-label">BANK DETAIL:</div>
        ${selectedIssuer?.accountName ? `<div class="bank-detail">ACC NAME: ${selectedIssuer.accountName}</div>` : ''}
        ${selectedIssuer?.accountNumber ? `<div class="bank-detail">ACC NO: ${selectedIssuer.accountNumber}</div>` : ''}
        ${selectedIssuer?.ifscCode ? `<div class="bank-detail">IFSC CODE: ${selectedIssuer.ifscCode}</div>` : ''}
      </div>

      <div class="divider"></div>

      <div class="terms-section">
        <div class="terms-title">Terms and Condition</div>
        <div class="terms-item">1. Please quote invoice number when remitting funds.</div>
        <div class="terms-item">2. This is computer generated invoice. No authorised signatory is required.</div>
        <div class="terms-item">3. Subject to Surat, Gujarat jurisdiction.</div>
      </div>

      <div class="footer-note">
        This is a computer generated invoice
      </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    } else {
      toast.error('Please allow pop-ups to generate the invoice')
    }
  } catch (error) {
    console.error('Error generating invoice:', error)
    toast.error('Error generating invoice. Please check your browser settings.')
  }
}
