import { model } from "@medusajs/framework/utils"

const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  excerpt: model.text(),
  slug: model.text(),
  content: model.text(),
  image: model.text(),
  thumbnail: model.text(),
  tags: model.json().nullable(),
  author: model.text(),
  category: model.text(),
  published_at: model.dateTime().nullable(),
  status: model.enum(["draft", "published"]),
})

export default Post