import { put } from "@vercel/blob"

const src =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG-20260721-WA0074%20%282%29-9xQvnIggaT6y48HVMy83DCYJnuilPc.jpg"
const dest = "products/carpets/premium-3d-carpet-v61-blue-maroon.jpg"

const res = await fetch(src)
if (!res.ok) throw new Error(`fetch failed ${res.status}`)
const buf = Buffer.from(await res.arrayBuffer())
const { url } = await put(dest, buf, {
  access: "public",
  contentType: "image/jpeg",
  allowOverwrite: true,
  token: process.env.BLOB_READ_WRITE_TOKEN,
})
console.log(url)
