import { put } from "@vercel/blob"

const items = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V42-hOrcFJJnzQiX7two59GAWOlpWx9zr8.jpg",
    key: "products/carpets/premium-3d-carpet-v42-black-gold-butterfly.jpg",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V1-kyLedacB9QdCNISjoBYnTWHQmM9joi.jpg",
    key: "products/carpets/premium-3d-carpet-v1-teal-grey-swirl.jpg",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V60-H2xl1VyQ7Y0PhbA3UgN7efXmPU0Bfv.jpg",
    key: "products/carpets/premium-3d-carpet-v60-charcoal-swirl.jpg",
  },
]

for (const it of items) {
  const res = await fetch(it.src)
  const buf = Buffer.from(await res.arrayBuffer())
  const blob = await put(it.key, buf, { access: "public", contentType: "image/jpeg", allowOverwrite: true })
  console.log(blob.url)
}
