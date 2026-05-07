import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

type BlogPostInput = {
  title?: string
  excerpt?: string
  slug?: string
  content?: string
  image?: string
  thumbnail?: string
  tags?: string[] | string | null
  author?: string
  category?: string
  published_at?: string
  status?: "draft" | "published"
}

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "post"

const normalizeTags = (tags?: string[] | string | null) => {
  if (!tags) return null

  const raw = Array.isArray(tags) ? tags : tags.split(",")
  const cleaned = Array.from(new Set(raw.map(t => t.trim()).filter(Boolean)))

  return cleaned.reduce((acc, tag) => {
    acc[tag] = true
    return acc
  }, {} as Record<string, boolean>)
}

const normalizePostInput = (input: BlogPostInput) => {
  const title = (input.title ?? "").trim()

  return {
    title,
    excerpt: (input.excerpt ?? "").trim(),
    slug: input.slug?.trim() || slugify(title),
    content: input.content ?? "",
    image: input.image ?? "",
    thumbnail: input.thumbnail ?? "",
    tags: normalizeTags(input.tags),
    author: input.author ?? "",
    category: input.category ?? "",
    published_at: input.published_at ? new Date(input.published_at) : new Date(),
    status: input.status ?? "draft",
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const posts = await service.listPosts()

  res.json({ posts })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  const payload = normalizePostInput(req.body as BlogPostInput)

  if (!payload.title || !payload.slug || !payload.author) {
    return res.status(400).json({
      message: "Title, slug, and author are required",
    })
  }

  const post = await service.createPosts(payload)

  res.status(201).json({ post })
}