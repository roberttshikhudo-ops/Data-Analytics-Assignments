import { put } from "@vercel/blob"

const items = [
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V66-C2QOUmBxR5ZlKo9qSgLTTIU4iX9ddC.jpg",
    path: "products/carpets/premium-3d-carpet-v66-black-grey-block.jpg",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CARPET%20V68-zFKn3jEDhl4nwpfALg66jhStUSY4mM.jpg",
    path: "products/carpets/premium-3d-carpet-v68-turquoise-block.jpg",
  },
]

for (const item of items) {
  const res = await fetch(item.url)
  const buf = Buffer.from(await res.arrayBuffer())
  const blob = await put(item.path, buf, { access: "public", contentType: "image/jpeg", allowOverwrite: true })
  console.log(blob.url)
}
