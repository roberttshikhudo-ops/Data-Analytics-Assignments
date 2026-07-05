import { readdir, stat, rename, unlink } from "node:fs/promises"
import { join, extname } from "node:path"
import sharp from "sharp"

const ROOT = "public"
const MAX_DIM = 1400 // cap longest edge; product/category art never needs more
const MIN_BYTES = 250 * 1024 // only touch files larger than 250 KB
const JPEG_Q = 82
const PNG_Q = 80

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

function human(b) {
  return (b / 1024 / 1024).toFixed(2) + "MB"
}

const files = (await walk(ROOT)).filter((f) => /\.(png|jpe?g)$/i.test(f))

let before = 0
let after = 0
let changed = 0

for (const file of files) {
  const s = await stat(file)
  if (s.size < MIN_BYTES) {
    before += s.size
    after += s.size
    continue
  }

  const ext = extname(file).toLowerCase()
  const isPng = ext === ".png"
  const tmp = file + ".tmp"

  try {
    let pipeline = sharp(file).rotate().resize({
      width: MAX_DIM,
      height: MAX_DIM,
      fit: "inside",
      withoutEnlargement: true,
    })

    if (isPng) {
      // Keep transparency-capable PNG format; palette quantization shrinks photos hugely.
      pipeline = pipeline.png({ palette: true, quality: PNG_Q, effort: 8, compressionLevel: 9 })
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true })
    }

    await pipeline.toFile(tmp)

    const ns = await stat(tmp)
    if (ns.size < s.size) {
      await rename(tmp, file)
      before += s.size
      after += ns.size
      changed++
      console.log(`${human(s.size)} -> ${human(ns.size)}  ${file}`)
    } else {
      await unlink(tmp)
      before += s.size
      after += s.size
    }
  } catch (err) {
    console.error(`skip ${file}: ${err.message}`)
    try {
      await unlink(tmp)
    } catch {}
    before += s.size
    after += s.size
  }
}

console.log(
  `\nDone. Re-encoded ${changed} files. Total ${human(before)} -> ${human(after)} ` +
    `(saved ${human(before - after)}, ${((1 - after / before) * 100).toFixed(1)}%).`,
)
