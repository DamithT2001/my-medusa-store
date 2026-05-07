import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOG_MODULE } from "../../../../modules/blog"
import BlogModuleService from "../../../../modules/blog/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const blogModuleService: BlogModuleService = req.scope.resolve(BLOG_MODULE)
  const post = await blogModuleService.retrievePost(id)

  if (post.status !== "published") {
    res.status(404).json({
      message: "Post not found.",
    })
    return
  }

  res.json({
    blogPost: post,
  })
}
