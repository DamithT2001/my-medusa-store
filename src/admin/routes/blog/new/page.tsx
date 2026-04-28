import { Container, Heading } from "@medusajs/ui"
import { useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import BlogForm, { BlogPostFormValues } from "../blog-form"
import { sdk } from "../../../lib/sdk"

type BlogPostResponse = {
  post: { id: string }
}

const BlogCreatePage = () => {
  const navigate = useNavigate()

  const createMutation = useMutation({
    mutationFn: (values: BlogPostFormValues) =>
      sdk.client.fetch<BlogPostResponse>("/admin/blog", {
        method: "POST",
        body: values,
      }),
    onSuccess: async () => {
      await navigate("/blog")
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ui-border-base px-6 py-4">
        <div>
          <Heading level="h2">Create Blog Post</Heading>
          <p className="text-sm text-ui-fg-subtle pt-2">Draft a new article and publish it when ready.</p>
        </div>

        <Link to="/blog" className="text-sm font-medium text-ui-fg-interactive">
          Back to blog
        </Link>
      </div>

      <BlogForm
        submitLabel="Create post"
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values)
        }}
        isSubmitting={createMutation.isPending}
      />
    </Container>
  )
}

export default BlogCreatePage