import { MedusaService } from "@medusajs/framework/utils"
import Post from "./models/post"

const normalizeTags = (tags?: string[] | string | null) => {
  if (!tags) {
    return []
  }

  const rawTags = Array.isArray(tags) ? tags : tags.split(",")
  const normalizedTags = rawTags
    .map((tag) => tag.trim())
    .filter(Boolean)

  return Array.from(new Set(normalizedTags))
}

class BlogModuleService extends MedusaService({
  Post,
}) {
  protected normalizePostPayload<T extends { tags?: string[] | string | null }>(payload: T) {
    return {
      ...payload,
      tags: normalizeTags(payload.tags),
    }
  }

  async createPosts(data: Parameters<typeof super.createPosts>[0]) {
    return super.createPosts(this.normalizePostPayload(data))
  }

  async updatePosts(data: Parameters<typeof super.updatePosts>[0]) {
    return super.updatePosts(this.normalizePostPayload(data))
  }
}

export default BlogModuleService