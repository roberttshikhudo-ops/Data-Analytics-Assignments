import { put } from "@vercel/blob"

const images = [
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V73-rm3GrguOhIClRse8Ie2kzcP4Y6Aw83.jpg",
    path: "products/carpets/premium-3d-carpet-v73-red-cream-circles.jpg",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V70-Ma3gmA18NHGzVVDQfZik0Mh3AjxhMd.jpg",
    path: "products/carpets/premium-3d-carpet-v70-grey-block.jpg",
  },
]

for (const img of images) {
  const res = await fetch(img.url)
  const buf = Buffer.from(await res.arrayBuffer())
  const blob = await put(img.path, buf, { access: "public", contentType: "image/jpeg", allowOverwrite: true })
  console.log(blob.url)
}
