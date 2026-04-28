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
  author?: string
  category?: string
  date?: string
  status?: "draft" | "published"
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "post"

const normalizePostInput = (input: BlogPostInput) => {
  const title = (input.title ?? "").trim()

  return {
    title,
    excerpt: (input.excerpt ?? "").trim(),
    slug: (input.slug ?? "").trim() || slugify(title || "post"),
    content: input.content ?? "",
    image: input.image ?? "",
    thumbnail: input.thumbnail ?? "",
    author: input.author ?? "",
    category: input.category ?? "",
    date: input.date ?? new Date().toISOString().slice(0, 10),
    status: input.status ?? "draft",
  }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const posts = await blogModuleService.listPosts()

  res.json({
    posts,
  })
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const payload = normalizePostInput(req.body as BlogPostInput)

  if (!payload.title) {
    res.status(400).json({
      message: "Title is required.",
    })

    return
  }

  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await blogModuleService.createPosts(payload)

  res.status(201).json({
    post,
  })
}