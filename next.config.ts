import type { NextConfig } from "next"
import { withPayload } from "@payloadcms/next/withPayload"
import fs from "fs"
import path from "path"

// Load .env.local before withPayload evaluates payload.config.ts
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const eq = line.indexOf("=")
    if (eq > 0 && !line.startsWith("#")) {
      const key = line.slice(0, eq).trim()
      const val = line.slice(eq + 1).trim()
      if (key && !(key in process.env)) process.env[key] = val
    }
  }
}

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Only our own Blob store — external images (news, publication covers) render via plain <img>
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async headers() {
    return [
      {
        // Cache Payload media files at the CDN edge for 1 year.
        // Files are content-addressed (new upload = new filename), so immutable is safe.
        source: "/api/media/file/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
