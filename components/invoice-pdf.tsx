'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'
import { Invoice, BUSINESS_INFO, formatCurrency, formatDate } from '@/lib/invoice'

// Register fonts (using default for now)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a365d', // Navy blue
  },
  logo: {
    width: 180,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a365d',
    fontFamily: 'Helvetica-Bold',
  },
  logoTagline: {
    fontSize: 8,
    color: '#059669', // Emerald green
    marginTop: 4,
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  invoiceTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a365d',
    fontFamily: 'Helvetica-Bold',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#4a5568',
    marginTop: 4,
  },
  invoiceStatus: {
    fontSize: 10,
    color: '#ffffff',
    backgroundColor: '#059669',
    padding: '4 8',
    borderRadius: 4,
    marginTop: 8,
    textAlign: 'center',
  },
  statusDraft: {
    backgroundColor: '#6b7280',
  },
  statusSent: {
    backgroundColor: '#3b82f6',
  },
  statusPaid: {
    backgroundColor: '#059669',
  },
  statusOverdue: {
    backgroundColor: '#ef4444',
  },
  statusCancelled: {
    backgroundColor: '#9ca3af',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBlock: {
    width: '45%',
  },
  infoBlockRight: {
    width: '45%',
    textAlign: 'right',
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    fontSize: 10,
    color: '#4a5568',
    marginBottom: 2,
    lineHeight: 1.4,
  },
  infoBold: {
    fontSize: 10,
    color: '#1a365d',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a365d',
    padding: 10,
    borderRadius: 4,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: '#f7fafc',
  },
  tableCell: {
    fontSize: 10,
    color: '#4a5568',
  },
  colDescription: {
    width: '45%',
  },
  colQuantity: {
    width: '15%',
    textAlign: 'center',
  },
  colPrice: {
    width: '20%',
    textAlign: 'right',
  },
  colTotal: {
    width: '20%',
    textAlign: 'right',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  totalsBlock: {
    width: 250,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#4a5568',
  },
  totalsValue: {
    fontSize: 10,
    color: '#1a365d',
    fontFamily: 'Helvetica-Bold',
  },
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#1a365d',
    borderRadius: 4,
    marginTop: 4,
  },
  totalsFinalLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  totalsFinalValue: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  notesText: {
    fontSize: 9,
    color: '#4a5568',
    lineHeight: 1.5,
  },
  paymentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e6fffa',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  termsSection: {
    marginTop: 20,
  },
  termsText: {
    fontSize: 8,
    color: '#718096',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#718096',
  },
  footerContact: {
    fontSize: 9,
    color: '#1a365d',
    marginTop: 4,
  },
})

interface InvoicePDFProps {
  invoice: Invoice
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'draft': return styles.statusDraft
      case 'sent': return styles.statusSent
      case 'paid': return styles.statusPaid
      case 'overdue': return styles.statusOverdue
      case 'cancelled': return styles.statusCancelled
      default: return styles.statusDraft
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{BUSINESS_INFO.name}</Text>
            <Text style={styles.logoTagline}>{BUSINESS_INFO.tagline}</Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceTitleText}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
            <View style={[styles.invoiceStatus, getStatusStyle(invoice.status)]}>
              <Text>{invoice.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Business and Client Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoTitle}>From</Text>
            <Text style={styles.infoBold}>{BUSINESS_INFO.name}</Text>
            <Text style={styles.infoText}>{BUSINESS_INFO.address}</Text>
            <Text style={styles.infoText}>{BUSINESS_INFO.city}, {BUSINESS_INFO.province} {BUSINESS_INFO.postalCode}</Text>
            <Text style={styles.infoText}>{BUSINESS_INFO.country}</Text>
            <Text style={styles.infoText}>Tel: {BUSINESS_INFO.phone}</Text>
            <Text style={styles.infoText}>Email: {BUSINESS_INFO.email}</Text>
          </View>
          <View style={styles.infoBlockRight}>
            <Text style={styles.infoTitle}>Bill To</Text>
            <Text style={styles.infoBold}>{invoice.client_name}</Text>
            {invoice.client_company && <Text style={styles.infoText}>{invoice.client_company}</Text>}
            {invoice.client_address && <Text style={styles.infoText}>{invoice.client_address}</Text>}
            {(invoice.client_city || invoice.client_province) && (
              <Text style={styles.infoText}>
                {[invoice.client_city, invoice.client_province, invoice.client_postal_code].filter(Boolean).join(', ')}
              </Text>
            )}
            {invoice.client_country && <Text style={styles.infoText}>{invoice.client_country}</Text>}
            {invoice.client_phone && <Text style={styles.infoText}>Tel: {invoice.client_phone}</Text>}
            {invoice.client_email && <Text style={styles.infoText}>Email: {invoice.client_email}</Text>}
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>Invoice Date: </Text>
              {formatDate(invoice.invoice_date)}
            </Text>
            {invoice.due_date && (
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Due Date: </Text>
                {formatDate(invoice.due_date)}
              </Text>
            )}
          </View>
          {invoice.order_id && (
            <View style={styles.infoBlockRight}>
              <Text style={styles.infoText}>
                <Text style={styles.infoBold}>Order Reference: </Text>
                {invoice.notes?.replace('Order #', '') || 'N/A'}
              </Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantity]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>
          {(invoice.items || []).map((item, index) => (
            <View key={item.id || index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
              <Text style={[styles.tableCell, styles.colDescription]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQuantity]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>{formatCurrency(item.unit_price)}</Text>
              <Text style={[styles.tableCell, styles.colTotal]}>{formatCurrency(item.total_price)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {(invoice.discount_amount || 0) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={styles.totalsValue}>-{formatCurrency(invoice.discount_amount || 0)}</Text>
              </View>
            )}
            {(invoice.shipping_amount || 0) > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Shipping</Text>
                <Text style={styles.totalsValue}>{formatCurrency(invoice.shipping_amount || 0)}</Text>
              </View>
            )}
            <View style={styles.totalsFinal}>
              <Text style={styles.totalsFinalLabel}>Total Due</Text>
              <Text style={styles.totalsFinalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Instructions */}
        {invoice.payment_instructions && invoice.status !== 'paid' && (
          <View style={styles.paymentSection}>
            <Text style={styles.notesTitle}>Payment Instructions</Text>
            <Text style={styles.notesText}>{invoice.payment_instructions}</Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && !invoice.notes.startsWith('Order #') && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {invoice.terms && (
          <View style={styles.termsSection}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerContact}>
            {BUSINESS_INFO.website} | {BUSINESS_INFO.phone} | {BUSINESS_INFO.email}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
