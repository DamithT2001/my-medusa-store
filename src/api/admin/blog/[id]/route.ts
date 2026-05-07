import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

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

const normalizePostInput = (input: BlogPostInput, currentSlug?: string) => {
  const title = input.title?.trim()

  return {
    ...(title ? { title } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt.trim() } : {}),
    slug: input.slug?.trim() || (title ? slugify(title) : currentSlug),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.image !== undefined ? { image: input.image } : {}),
    ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail } : {}),
    ...(input.tags !== undefined ? { tags: normalizeTags(input.tags) } : {}),
    ...(input.author !== undefined ? { author: input.author } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.published_at !== undefined ? { published_at: new Date(input.published_at) } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await service.retrievePost(req.params.id)

  res.json({ post })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  const current = await service.retrievePost(req.params.id)
  const updates = normalizePostInput(req.body as BlogPostInput, current.slug)

  const nextTitle = updates.title ?? current.title
  const nextSlug = updates.slug ?? current.slug
  const nextAuthor = updates.author ?? current.author

  if (!nextTitle || !nextSlug || !nextAuthor) {
    return res.status(400).json({
      message: "Title, slug, and author are required",
    })
  }

  const post = await service.updatePosts({
    id: req.params.id,
    ...updates,
  })

  res.json({ post })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const service: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  await service.deletePosts(req.params.id)

  res.json({ id: req.params.id })
}