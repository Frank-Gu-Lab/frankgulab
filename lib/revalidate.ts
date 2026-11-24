import { revalidatePath } from "next/cache"

export function revalidateSite(slug?: string) {
  try {
    revalidatePath("/")
    if (slug) {
      revalidatePath("/blog")
      revalidatePath(`/blog/${slug}`)
    }
  } catch {
    // no-op outside of a Next.js request context (e.g. during build)
  }
}
