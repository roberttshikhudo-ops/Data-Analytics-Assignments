import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"

export interface CatalogueProduct {
  name: string
  price: number
  compareAtPrice: number | null
  description: string | null
  imageDataUri: string | null
}

export interface CatalogueBusinessInfo {
  name: string
  tagline: string
  phone: string
  altPhone: string
  email: string
  website: string
  address: string
}

export interface CatalogueBankingInfo {
  bank: string
  accountName: string
  accountNumber: string
  branchCode: string
}

export interface CatalogueDeliveryInfo {
  standardFee: string
  freeThreshold: string
}

const NAVY = "#1a365d"
const GREEN = "#059669"
const GREY = "#64748b"
const LIGHT = "#f1f5f9"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a202c",
    paddingBottom: 70,
  },
  cover: {
    backgroundColor: NAVY,
    color: "#ffffff",
    paddingVertical: 28,
    paddingHorizontal: 40,
    textAlign: "center",
  },
  logo: { width: 70, height: 70, objectFit: "contain", marginBottom: 10, alignSelf: "center" },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  tagline: { fontSize: 9, color: "#9ae6c4", marginTop: 4 },
  title: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 16,
  },
  subtitle: { fontSize: 10, color: "#cbd5e0", marginTop: 6 },
  metaBar: {
    backgroundColor: GREEN,
    color: "#ffffff",
    flexDirection: "row",
    justifyContent: "center",
    fontSize: 9,
    paddingVertical: 8,
    gap: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 14,
  },
  card: {
    width: "31%",
    border: `1pt solid #e2e8f0`,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardImageWrap: {
    width: "100%",
    height: 120,
    backgroundColor: LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: "100%", height: 120, objectFit: "cover" },
  noImage: { fontSize: 8, color: "#94a3b8" },
  cardBody: { padding: 10 },
  cardName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  cardDesc: { fontSize: 8, color: GREY, marginTop: 3 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 6, gap: 6 },
  price: { fontSize: 13, fontFamily: "Helvetica-Bold", color: GREEN },
  compare: {
    fontSize: 8,
    color: "#94a3b8",
    textDecoration: "line-through",
  },
  infoPanel: {
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
    border: `1pt solid #e2e8f0`,
  },
  infoCol: { flex: 1, padding: 14 },
  infoColDivider: { borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  infoHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoLine: { fontSize: 9, color: "#1a202c", marginBottom: 3 },
  infoLabel: { fontFamily: "Helvetica-Bold", color: GREY },
  deliveryHighlight: { fontSize: 9, color: GREEN, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NAVY,
    color: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 40,
    textAlign: "center",
  },
  footerCta: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  footerContact: { fontSize: 8, color: "#cbd5e0", marginTop: 4 },
})

function formatCurrency(amount: number): string {
  return `R${Number(amount).toFixed(2)}`
}

export function BeddingCatalogue({
  products,
  business,
  banking,
  delivery,
  logoDataUri,
  generatedDate,
}: {
  products: CatalogueProduct[]
  business: CatalogueBusinessInfo
  banking: CatalogueBankingInfo
  delivery: CatalogueDeliveryInfo
  logoDataUri: string | null
  generatedDate: string
}) {
  return (
    <Document title={`${business.name} - Bedding Catalogue`} author={business.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover} fixed={false}>
          {logoDataUri ? <Image style={styles.logo} src={logoDataUri} /> : null}
          <Text style={styles.brand}>{business.name}</Text>
          <Text style={styles.tagline}>{business.tagline}</Text>
          <Text style={styles.title}>Bedding Catalogue</Text>
          <Text style={styles.subtitle}>Comforters - Bedspreads - Blankets and More</Text>
        </View>

        <View style={styles.metaBar}>
          <Text>{products.length} Products</Text>
          <Text>Updated {generatedDate}</Text>
          <Text>Prices in ZAR</Text>
        </View>

        <View style={styles.grid}>
          {products.map((p, i) => {
            const hasDiscount = p.compareAtPrice && p.compareAtPrice > p.price
            return (
              <View style={styles.card} key={i} wrap={false}>
                <View style={styles.cardImageWrap}>
                  {p.imageDataUri ? (
                    <Image style={styles.cardImage} src={p.imageDataUri} />
                  ) : (
                    <Text style={styles.noImage}>No image</Text>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardName}>{p.name}</Text>
                  {p.description ? <Text style={styles.cardDesc}>{p.description}</Text> : null}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{formatCurrency(p.price)}</Text>
                    {hasDiscount ? (
                      <Text style={styles.compare}>{formatCurrency(p.compareAtPrice as number)}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        <View style={styles.infoPanel} wrap={false}>
          <View style={[styles.infoCol, styles.infoColDivider]}>
            <Text style={styles.infoHeading}>Banking Details</Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Bank: </Text>
              {banking.bank}
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Account Name: </Text>
              {banking.accountName}
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Account Number: </Text>
              {banking.accountNumber}
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Branch Code: </Text>
              {banking.branchCode}
            </Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Reference: </Text>
              Your name / order number
            </Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoHeading}>Delivery</Text>
            <Text style={styles.deliveryHighlight}>FREE delivery on orders over {delivery.freeThreshold}</Text>
            <Text style={styles.infoLine}>
              <Text style={styles.infoLabel}>Standard delivery: </Text>
              {delivery.standardFee}
            </Text>
            <Text style={styles.infoLine}>
              Nationwide delivery across South Africa. Contact us to confirm delivery to your area.
            </Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerCta}>To Order, Contact Us Today</Text>
          <Text style={styles.footerContact}>
            Tel: {business.phone} / {business.altPhone}  |  Email: {business.email}
          </Text>
          <Text style={styles.footerContact}>Web: {business.website}</Text>
          <Text style={styles.footerContact}>{business.address}</Text>
        </View>
      </Page>
    </Document>
  )
}
