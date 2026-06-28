import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer"

export interface CatalogueFamily {
  // The base/range name with the colour or design variant stripped off.
  name: string
  // Lowest price in the range (families almost always share one price).
  price: number
  // True when the range spans more than one price point, so the price is shown
  // as "from R...".
  priceFrom: boolean
  // Representative image for the whole range.
  imageDataUri: string | null
  // Short description of the representative product.
  description: string | null
  // Every available colour / design in the range, in catalogue order.
  variants: string[]
}

export interface CatalogueSeriesGroup {
  title: string
  families: CatalogueFamily[]
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
    gap: 20,
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
  seriesTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  seriesCount: { fontSize: 8, color: GREEN, fontFamily: "Helvetica-Bold" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    paddingTop: 10,
    gap: 12,
  },
  // Horizontal "range" card: representative image on the left, range details
  // and the full colour list on the right. Two cards per row.
  card: {
    width: "48%",
    flexDirection: "row",
    border: `1pt solid #e2e8f0`,
    borderRadius: 8,
    overflow: "hidden",
  },
  cardImageWrap: {
    width: 96,
    height: 96,
    backgroundColor: LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  cardImage: { width: 96, height: 96, objectFit: "cover" },
  noImage: { fontSize: 8, color: "#94a3b8" },
  cardBody: { flex: 1, padding: 10 },
  cardName: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4, gap: 4 },
  priceFromLabel: { fontSize: 7, color: GREY },
  price: { fontSize: 13, fontFamily: "Helvetica-Bold", color: GREEN },
  variantHeading: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: GREY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 2,
  },
  variantList: { fontSize: 8, color: "#334155", lineHeight: 1.4 },
  singleNote: { fontSize: 8, color: GREY, marginTop: 6 },

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

export function BeddingCatalogueFour({
  groups,
  business,
  banking,
  logoDataUri,
  generatedDate,
}: {
  groups: CatalogueSeriesGroup[]
  business: CatalogueBusinessInfo
  banking: CatalogueBankingInfo
  logoDataUri: string | null
  generatedDate: string
}) {
  const totalRanges = groups.reduce((sum, g) => sum + g.families.length, 0)
  const totalProducts = groups.reduce(
    (sum, g) => sum + g.families.reduce((s, f) => s + f.variants.length, 0),
    0,
  )

  return (
    <Document title={`${business.name} - Bedding Catalogue 4`} author={business.name}>
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
          <Text style={styles.title}>Bedding Catalogue</Text>
          <Text style={styles.subtitle}>
            Edition 4 - Condensed Range Guide: One Design Per Range With All Available Colours
          </Text>
        </View>

        <View style={styles.metaBar}>
          <Text>{totalRanges} Ranges</Text>
          <Text style={styles.metaStrong}>{totalProducts} Designs &amp; Colours</Text>
          <Text style={styles.metaStrong}>FREE Delivery Nationwide</Text>
          <Text>Updated {generatedDate}</Text>
        </View>

        {groups.map((group, gi) => (
          <View key={gi}>
            <View style={styles.seriesHeader} wrap={false}>
              <Text style={styles.seriesTitle}>{group.title}</Text>
              <Text style={styles.seriesCount}>
                {group.families.length} {group.families.length === 1 ? "range" : "ranges"}
              </Text>
            </View>
            <View style={styles.grid}>
              {group.families.map((f, i) => (
                <View style={styles.card} key={i} wrap={false}>
                  <View style={styles.cardImageWrap}>
                    {f.imageDataUri ? (
                      <Image style={styles.cardImage} src={f.imageDataUri} />
                    ) : (
                      <Text style={styles.noImage}>No image</Text>
                    )}
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName}>{f.name}</Text>
                    <View style={styles.priceRow}>
                      {f.priceFrom ? <Text style={styles.priceFromLabel}>from</Text> : null}
                      <Text style={styles.price}>{formatCurrency(f.price)}</Text>
                    </View>
                    {f.variants.length > 1 ? (
                      <>
                        <Text style={styles.variantHeading}>
                          Available Colours / Designs ({f.variants.length})
                        </Text>
                        <Text style={styles.variantList}>{f.variants.join("  •  ")}</Text>
                      </>
                    ) : (
                      <Text style={styles.singleNote}>
                        {f.description ?? "Single design"}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
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
