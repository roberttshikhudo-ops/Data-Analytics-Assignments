/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Product cards intentionally use quality 60 for lighter catalogue pages.
    // Next.js 16 requires every requested quality to be explicitly allowed.
    qualities: [60, 75],
    // Serve modern, smaller formats. Next.js will pick AVIF/WebP when supported.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 31 days to avoid re-optimizing on every request.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Allow optimization of the external image hosts used by product data.
    remotePatterns: [
      // All Vercel Blob stores (product images are uploaded here).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.agrinet.co.za" },
      { protocol: "https", hostname: "www.curapharm.co.za" },
      { protocol: "https", hostname: "forthefarmer.co.za" },
      { protocol: "https", hostname: "bkbonline.co.za" },
      { protocol: "https", hostname: "cutters.co.za" },
      { protocol: "https", hostname: "www.hinterland.co.za" },
      { protocol: "https", hostname: "qghainbmqtxvgrkrfbkk.supabase.co" },
      { protocol: "https", hostname: "diyshop.co.za" },
      { protocol: "https", hostname: "halsteds.co.zw" },
    ],
  },
}

export default nextConfig
