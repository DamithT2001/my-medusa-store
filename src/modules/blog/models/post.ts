import { model } from "@medusajs/framework/utils"

const Post = model.define("post", {
  id: model.id().primaryKey(),
  title: model.text(),
  excerpt: model.text(),
  slug: model.text(),
  content: model.text(),
  image: model.text(),
  thumbnail: model.text(),
  author: model.text(),
  category: model.text(),
  date: model.text(),
  status: model.enum(["draft", "published"]),
})

export default Post