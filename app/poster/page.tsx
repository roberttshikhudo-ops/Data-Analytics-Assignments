export const metadata = {
  title: "Agri Hub SA — Bedding Poster",
  robots: { index: false, follow: false },
}

const GREEN = "#2f5117"
const NAVY = "#12324f"
const GOLD = "#c8a24a"

type Product = {
  name: string
  price: number
  img: string
  tag: string
}

const products: Product[] = [
  { name: "Moffy 003 — 7pcs Super King", price: 545, img: "/products/home-living/moffy-003.jpg", tag: "Comforter Set" },
  { name: "MOMO-002 Super King Quilt Set", price: 550, img: "/poster2/2-momo.webp", tag: "Quilt Set" },
  { name: "RARA-006 Super King Quilt Set", price: 495, img: "/poster2/3-rara.webp", tag: "Quilt Set" },
  { name: "5pcs Flower Reversible Comforter P5", price: 495, img: "/poster2/4-flower.webp", tag: "Comforter" },
  { name: "5pcs Generic Reversible — Grey", price: 295, img: "/poster2/5-generic-grey.jpg", tag: "Comforter" },
  { name: "5pcs Corduroy Comforter 001 — Charcoal", price: 450, img: "/poster2/6-corduroy.webp", tag: "Comforter" },
  { name: "5pcs Geometric Comforter — Coffee Brown", price: 435, img: "/poster2/7-geometric.jpg", tag: "Comforter" },
  { name: "9pcs Comforter Set — Coral", price: 530, img: "/products/comforter-9pcs/img-03.png", tag: "Comforter Set" },
  { name: "Gen. Throw Fleece — Grey (180 x 200cm)", price: 195, img: "/products/throw-fleece/grey.png", tag: "Throw & Fleece" },
]

export default function PosterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-200 p-6">
      <div
        id="poster"
        className="flex flex-col overflow-hidden bg-white font-sans"
        style={{ width: 1080, height: 1600 }}
      >
        {/* ===== Header ===== */}
        <header className="flex items-center gap-6 px-12 pb-7 pt-9" style={{ backgroundColor: GREEN }}>
          <div className="flex h-[104px] w-[104px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/agri-hub-logo.png" alt="Agri Hub SA logo" className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 text-white">
            <h1 className="text-[46px] font-extrabold leading-none tracking-tight">AGRI HUB SA</h1>
            <p className="mt-2 text-[19px] leading-snug text-white/85">
              Your Agricultural, Hardware &amp; Lifestyle Innovation Partner
            </p>
          </div>
          <div className="shrink-0 rounded-lg px-5 py-3 text-center" style={{ backgroundColor: GOLD }}>
            <p className="text-[15px] font-bold uppercase leading-tight tracking-wide" style={{ color: GREEN }}>
              Shop Online
            </p>
            <p className="text-[13px] font-semibold leading-tight" style={{ color: GREEN }}>
              agrihubsa.co.za
            </p>
          </div>
        </header>

        {/* ===== Hero band ===== */}
        <section className="flex items-center justify-between px-12 py-5" style={{ backgroundColor: NAVY }}>
          <div className="text-white">
            <h2 className="text-[40px] font-extrabold leading-none">Premium Bedding Range</h2>
            <p className="mt-2 text-[20px] font-medium text-white/85">
              Order online &bull; We deliver{" "}
              <span className="font-bold" style={{ color: GOLD }}>
                nationwide
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[15px] font-semibold uppercase tracking-widest text-white/70">Delivery</p>
            <p className="text-[30px] font-extrabold leading-tight" style={{ color: GOLD }}>
              Across SA
            </p>
          </div>
        </section>

        {/* ===== Category strip ===== */}
        <section className="px-12 py-4 text-center" style={{ backgroundColor: "#f3f0e7" }}>
          <p className="text-[19px] font-semibold" style={{ color: GREEN }}>
            Comforters &nbsp;&bull;&nbsp; Quilt Sets &nbsp;&bull;&nbsp; Throws &amp; Fleece &nbsp;&bull;&nbsp; Blankets
            <span className="font-normal text-neutral-600"> — available in a range of colours</span>
          </p>
        </section>

        {/* ===== Product grid ===== */}
        <section className="grid flex-1 grid-cols-3 gap-6 px-10 py-7">
          {products.map((p) => (
            <article
              key={p.name}
              className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
            >
              <div className="relative h-[268px] w-full overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.img || "/placeholder.svg"} alt={p.name} className="h-full w-full object-cover" />
                <span
                  className="absolute left-0 top-3 rounded-r-md px-3 py-1 text-[12px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: GREEN }}
                >
                  {p.tag}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between px-4 py-3">
                <h3 className="text-[17px] font-semibold leading-tight text-neutral-800">{p.name}</h3>
                <p className="mt-2 text-[28px] font-extrabold leading-none" style={{ color: GREEN }}>
                  R{p.price}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* ===== Footer: To Order, Contact Us Today ===== */}
        <footer className="px-12 pb-8 pt-6 text-white" style={{ backgroundColor: GREEN }}>
          <p className="text-center text-[32px] font-extrabold tracking-wide">To Order, Contact Us Today</p>
          <p className="mt-1 text-center text-[17px] text-white/80">
            Shop securely online or message us — delivered to your door anywhere in South Africa.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-4 text-[17px]">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
                Call / WhatsApp
              </span>
              <span className="font-semibold">083 306 1529</span>
              <span className="font-semibold">060 839 1874</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
                Online
              </span>
              <span className="font-semibold">www.agrihubsa.co.za</span>
              <span className="font-semibold">robert.tshikhudo@gmail.com</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-bold uppercase tracking-wider" style={{ color: GOLD }}>
                Visit Us
              </span>
              <span className="font-semibold leading-snug">The Parks, Riversands, Midrand, Johannesburg, SA</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
