import { put } from '@vercel/blob'

const IMAGES = [
  { colour: 'Coral',  src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-h9aROBC9QTXZBlsXyTwKdnLPvKdwIX.png' },
  { colour: 'Camel',  src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vIWgzd6BdlmKESeBqdMmAZX7zvbBND.png' },
  { colour: 'Grey',   src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aAaFwjLAbEenuXLrS8xut4NTkvKwt4.png' },
  { colour: 'Purple', src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-gLJ8mijbleOh11CuZH22Uu1IA1z8oF.png' },
  { colour: 'Blue',   src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Pz9M8whksb1Yuo9S8t5RUXLKltlzvz.png' },
  { colour: 'Red',    src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EuBKSEuB8TmEXa7UVBqUU8BPG7jWpb.png' },
  { colour: 'Teal',   src: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9eRE93vZieJR2iSeOKpIjKzra00w3E.png' },
]

const out = []
for (const img of IMAGES) {
  const res = await fetch(img.src)
  if (!res.ok) throw new Error(`fetch failed ${res.status} for ${img.colour}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const key = `products/bedding/9pcs-comforter-carpet-combo-${img.colour.toLowerCase()}.png`
  const blob = await put(key, buf, { access: 'public', contentType: 'image/png', allowOverwrite: true })
  out.push({ colour: img.colour, url: blob.url })
  console.log(img.colour, '->', blob.url)
}
console.log('JSON_START' + JSON.stringify(out) + 'JSON_END')
