import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"

export interface ThrowsCatalogueProduct {
  name: string
  price: number
  compareAtPrice: number | null
  description: string | null
  imageDataUri: string | null
}

export interface ThrowsCatalogueSeriesGroup {
  title: string
  subtitle?: string
  products: ThrowsCatalogueProduct[]
}

export interface ThrowsCatalogueBusinessInfo {
  name: string
  tagline: string
  phone: string
  altPhone: string
  email: string
  website: string
  address: string
}

export interface ThrowsCatalogueBankingInfo {
  bank: string
  accountName: string
  accountNumber: string
  branchCode: string
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
    paddingTop: 58,
    paddingBottom: 78,
  },
  // Fixed header repeated on every page: a logo in the top-left and top-right.
  pageHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#ffffff",
  },
  cornerLogo: { width: 40, height: 40, objectFit: "contain" },
  headerCenter: { alignItems: "center", justifyContent: "center" },
  headerBrand: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY },
  headerTag: { fontSize: 7, color: GREEN, marginTop: 1 },

  cover: {
    backgroundColor: NAVY,
    color: "#ffffff",
    paddingVertical: 24,
    paddingHorizontal: 40,
    textAlign: "center",
    marginBottom: 4,
  },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  tagline: { fontSize: 9, color: "#9ae6c4", marginTop: 4 },
  title: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 14,
  },
  subtitle: { fontSize: 10, color: "#cbd5e0", marginTop: 6 },
  metaBar: {
    backgroundColor: GREEN,
    color: "#ffffff",
    flexDirection: "row",
    justifyContent: "center",
    fontSize: 9,
    paddingVertical: 8,
    gap: 22,
  },
  metaStrong: { fontFamily: "Helvetica-Bold" },

  seriesHeader: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 2,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  seriesTitleWrap: { flexDirection: "column" },
  seriesTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  seriesSubtitle: { fontSize: 8, color: GREY, marginTop: 2 },
  seriesCount: { fontSize: 8, color: GREEN, fontFamily: "Helvetica-Bold" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingTop: 10,
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
  compare: { fontSize: 8, color: "#94a3b8", textDecoration: "line-through" },

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
  deliveryHighlight: { fontSize: 10, color: GREEN, fontFamily: "Helvetica-Bold", marginBottom: 4 },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: NAVY,
    color: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    textAlign: "center",
  },
  footerCta: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  footerContact: { fontSize: 8, color: "#cbd5e0", marginTop: 4 },
})

function formatCurrency(amount: number): string {
  return `R${Number(amount).toFixed(2)}`
}

export function ThrowsCatalogue({
  groups,
  business,
  banking,
  logoDataUri,
  generatedDate,
}: {
  groups: ThrowsCatalogueSeriesGroup[]
  business: ThrowsCatalogueBusinessInfo
  banking: ThrowsCatalogueBankingInfo
  logoDataUri: string | null
  generatedDate: string
}) {
  const totalProducts = groups.reduce((sum, g) => sum + g.products.length, 0)

  return (
    <Document title={`${business.name} - Throws and Fleece Catalogue`} author={business.name}>
      <Page size="A4" style={styles.page}>
        {/* Repeated on every page: logo in top-left and top-right corners. */}
        <View style={styles.pageHeader} fixed>
          {logoDataUri ? <Image style={styles.cornerLogo} src={logoDataUri} /> : <View />}
          <View style={styles.headerCenter}>
            <Text style={styles.headerBrand}>{business.name}</Text>
            <Text style={styles.headerTag}>FREE Nationwide Delivery</Text>
          </View>
          {logoDataUri ? <Image style={styles.cornerLogo} src={logoDataUri} /> : <View />}
        </View>

        <View style={styles.cover}>
          <Text style={styles.brand}>{business.name}</Text>
          <Text style={styles.tagline}>{business.tagline}</Text>
          <Text style={styles.title}>Throws and Fleece</Text>
          <Text style={styles.subtitle}>
            Cosy Faux-Fur, Fleece and Corduroy Throws for Every Home
          </Text>
        </View>

        <View style={styles.metaBar}>
          <Text>{totalProducts} Products</Text>
          <Text style={styles.metaStrong}>FREE Delivery Nationwide</Text>
          <Text>Updated {generatedDate}</Text>
          <Text>Prices in ZAR</Text>
        </View>

        {groups.map((group, gi) => (
          <View key={gi}>
            <View style={styles.seriesHeader} wrap={false}>
              <View style={styles.seriesTitleWrap}>
                <Text style={styles.seriesTitle}>{group.title}</Text>
                {group.subtitle ? <Text style={styles.seriesSubtitle}>{group.subtitle}</Text> : null}
              </View>
              <Text style={styles.seriesCount}>
                {group.products.length} {group.products.length === 1 ? "design" : "designs"}
              </Text>
            </View>
            <View style={styles.grid}>
              {group.products.map((p, i) => {
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
          </View>
        ))}

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
            <Text style={styles.deliveryHighlight}>FREE delivery nationwide across South Africa</Text>
            <Text style={styles.infoLine}>
              No minimum order - we deliver to your door anywhere in South Africa at no extra cost.
            </Text>
            <Text style={styles.infoLine}>Contact us to confirm delivery timelines to your area.</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerCta}>To Order, Contact Us Today</Text>
          <Text style={styles.footerContact}>
            Tel/WhatsApp: {business.phone} / {business.altPhone}  |  Email: {business.email}
          </Text>
          <Text style={styles.footerContact}>Web: {business.website}</Text>
          <Text style={styles.footerContact}>{business.address}</Text>
        </View>
      </Page>
    </Document>
  )
}
