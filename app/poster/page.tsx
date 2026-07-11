import Image from "next/image"

export const metadata = {
  title: "Agri Hub SA — Bedding Poster",
  robots: { index: false, follow: false },
}

const products = [
  {
    name: "7pcs King Size Comforter Set",
    variant: "Molly Range",
    price: "735",
    img: "/poster/molly-green.jpg",
  },
  {
    name: "7pcs King Size Comforter Set",
    variant: "Molly Range",
    price: "735",
    img: "/poster/molly-pink.jpg",
  },
  {
    name: "1PLY Little Sheep Blanket",
    variant: "Luxury Mink",
    price: "795",
    img: "/poster/sheep-grey.jpg",
  },
  {
    name: "1PLY Little Sheep Blanket",
    variant: "Luxury Mink",
    price: "795",
    img: "/poster/sheep-blush.jpg",
  },
  {
    name: "Good Quality 1PLY Blanket",
    variant: "8 Colours",
    price: "540",
    img: "/poster/blanket-navy.jpg",
  },
  {
    name: "3pcs Corduroy Mattress Protector",
    variant: "6 Colours",
    price: "350",
    img: "/poster/protector-charcoal.jpg",
  },
]

export default function PosterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-200 p-6">
      <div
        id="poster"
        className="relative flex flex-col overflow-hidden bg-[#f7f5ef]"
        style={{ width: 1080, height: 1350 }}
      >
        {/* Header */}
        <header className="flex flex-col items-center bg-[#2f5117] px-12 pb-6 pt-8 text-center">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white">
              <Image
                src="/agri-hub-logo.png"
                alt="Agri Hub SA logo"
                width={80}
                height={80}
                className="h-full w-full object-contain"
              />
            </div>
            <span className="text-5xl font-extrabold tracking-tight text-white">AGRI HUB SA</span>
          </div>
          <h1 className="mt-6 text-6xl font-black leading-none text-white text-balance">
            WINTER BEDDING SALE
          </h1>
          <p className="mt-4 text-2xl font-medium text-[#d7e8c4] text-pretty">
            Premium blankets, comforter sets &amp; mattress protectors — delivered nationwide
          </p>
        </header>

        {/* Accent strip */}
        <div className="flex items-center justify-center bg-[#e0a800] py-3">
          <p className="text-2xl font-extrabold uppercase tracking-widest text-[#2f5117]">
            Quality You Can Feel • Prices You&apos;ll Love
          </p>
        </div>

        {/* Product grid */}
        <section className="grid flex-1 grid-cols-3 gap-5 px-10 py-5">
          {products.map((p, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-black/5"
            >
              <div className="relative aspect-[5/4] w-full overflow-hidden">
                <Image src={p.img || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="360px" />
                <span className="absolute right-3 top-3 rounded-full bg-[#2f5117] px-4 py-1.5 text-xl font-extrabold text-white shadow">
                  R{p.price}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between px-4 py-4">
                <p className="text-xl font-bold leading-tight text-neutral-900 text-pretty">{p.name}</p>
                <p className="mt-1 text-lg font-medium text-[#2f5117]">{p.variant}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Footer contact band */}
        <footer className="bg-[#2f5117] px-12 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-black">Shop Online Today</p>
              <p className="mt-1 text-4xl font-extrabold text-[#e0a800]">agrihubsa.co.za</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-3">
                <svg className="h-9 w-9 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <p className="text-3xl font-extrabold">079 109 9490</p>
              </div>
              <p className="mt-1 text-2xl font-semibold text-[#d7e8c4]">Call / WhatsApp • 083 306 1529</p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  )
}
