import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { authenticate } from "@medusajs/framework/http"
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

const normalizeTags = (tags?: string[] | string | null) => {
  if (!tags) {
    return []
  }

  const rawTags = Array.isArray(tags) ? tags : tags.split(",")

  return Array.from(
    new Set(
      rawTags
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  )
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post"

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
    ...(input.published_at !== undefined ? { published_at: input.published_at } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await blogModuleService.retrievePost(id)

  res.json({
    post,
  })
}

export async function PATCH(req: MedusaRequest, res: MedusaResponse) {
  await authenticate(req, res)

  const { id } = req.params
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const currentPost = await blogModuleService.retrievePost(id)
  const updates = normalizePostInput(req.body as BlogPostInput, currentPost.slug)
  const nextTitle = updates.title ?? currentPost.title
  const nextSlug = updates.slug ?? currentPost.slug
  const nextAuthor = updates.author ?? currentPost.author

  if (!nextTitle || !nextSlug || !nextAuthor) {
    res.status(400).json({
      message: "Title, slug, and author are required.",
    })

    return
  }

  const post = await blogModuleService.updatePosts({
    id,
    ...updates,
  })

  res.json({
    post,
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await authenticate(req, res)

  const { id } = req.params
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)

  await blogModuleService.deletePosts(id)

  res.json({
    id,
  })
}