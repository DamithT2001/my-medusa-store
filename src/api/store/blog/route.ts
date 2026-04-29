import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../modules/blog"
import BlogModuleService from "../../../modules/blog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const allPosts = await blogModuleService.listPosts()

  const posts = allPosts.filter((post) => post.status === "published")

  res.json({
    blogPosts: posts,
  })
}
